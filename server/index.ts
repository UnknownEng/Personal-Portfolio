import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { dataStore, UPLOADS_DIR } from './store.ts';
import { renderServerSide } from './ssr.ts';
import { requireAuth, comparePassword, hashPassword, generateToken, AuthenticatedRequest, setAdminVerifier } from './auth.ts';
import { MediaFile, PortfolioData } from '../src/types/portfolio.ts';
import {
  IS_PRODUCTION,
  IS_VERCEL,
  EMAIL_RE,
  SsrfError,
  assertFetchableUrl,
  cleanText,
  findDangerousUrl,
  isDangerousUrl,
  safeEqual,
  safeFetchText,
  stripPrototypeKeys,
} from './security.ts';

// Register admin verifier for immediate session revocation upon password updates
setAdminVerifier(() => dataStore.getAdmin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Trust reverse proxy (e.g. Vercel edge / load balancers) for accurate client IP resolution in rate limiting
app.set('trust proxy', 1);

// --- 1. ENTERPRISE HTTP SECURITY HEADERS (OWASP & SCANNERS) ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://images.unsplash.com",
        "https://drive.google.com",
        "https://*.googleusercontent.com",
        "https://*.microlink.io",
        "https://image.thum.io",
        "https://*.gstatic.com",
        "https://www.google.com",
        "https:",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: { policy: 'credentialless' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// Restrictive Permissions-Policy header disabling unused browser capabilities
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), gyroscope=(), accelerometer=(), magnetometer=(), display-capture=(), midi=(), sync-xhr=()'
  );
  next();
});

// --- 2. CORS ACCESS CONTROL (STRICT ORIGIN ALLOWLIST) ---
const DEFAULT_ALLOWED_ORIGINS = [
  'https://personal-portfolio-swart-sigma-44.vercel.app',
  'http://localhost:5173',
  'http://localhost:5001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5001',
];

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
const allowedOrigins: string[] = allowedOriginsEnv
  ? allowedOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS;

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Explicit origin check against allowlist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const corsErr = new Error(`CORS blocked: Origin ${origin} is not allowed.`);
    (corsErr as any).status = 403;
    return callback(corsErr);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

// Body parsing. Public endpoints get a small limit; the authenticated CMS save routes
// parse their own (larger) bodies *after* the auth check, so anonymous clients can
// never make the server buffer megabytes of JSON.
const smallJson = express.json({ limit: '64kb', strict: true });
const largeJson = express.json({ limit: '5mb', strict: true });
const isCmsSave = (req: Request) => req.method === 'PUT' && req.path.startsWith('/api/portfolio');

app.use((req: Request, res: Response, next: NextFunction) => (isCmsSave(req) ? next() : smallJson(req, res, next)));

// Prototype-pollution defence: strip __proto__ / constructor / prototype keys from any parsed body
function stripProto(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = stripPrototypeKeys(req.body);
  }
  next();
}
app.use(stripProto);

// --- 3. RATE LIMITING (BRUTE-FORCE & DOS SAFEGUARDS) ---
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: { error: 'Too many requests. Please slow down.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 login attempts
  skipSuccessfulRequests: true, // Do not penalize successful logins
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes before retrying.' },
});

const setupAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: { error: 'Too many administrative setup attempts. Please wait 15 minutes before retrying.' },
});

const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 password change attempts
  skipSuccessfulRequests: true, // Do not penalize successful password updates
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: { error: 'Too many password update attempts. Please wait 15 minutes before retrying.' },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6, // 6 submissions per 15 min per IP
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: { error: 'Inquiry rate limit exceeded. Please wait a few minutes before submitting another message.' },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 uploads per 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: { error: 'Asset upload rate limit exceeded. Please wait a few minutes.' },
});

const adminApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: { error: 'Administrative API rate limit reached. Please wait.' },
});

const linkPreviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120, // 120 link preview requests per 15 min per IP
  standardHeaders: 'draft-7',
  legacyHeaders: true,
  message: { error: 'Link preview rate limit exceeded. Please wait a moment.' },
});

// Apply general limiter to all API endpoints
app.use('/api/', generalApiLimiter);

// --- 4. RFC 9116 SECURITY.TXT & CRAWLER POLICIES ---
const SECURITY_TXT_CONTENT = `Contact: mailto:ahmedmansoorrind1210@gmail.com
Expires: 2027-10-06T00:00:00.000Z
Preferred-Languages: en
Canonical: https://personal-portfolio-swart-sigma-44.vercel.app/.well-known/security.txt
Policy: https://github.com/UnknownEng/Personal-Portfolio
`;

app.get(['/.well-known/security.txt', '/security.txt'], (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(SECURITY_TXT_CONTENT);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  const robotsPath = path.resolve(__dirname, '../public/robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.sendFile(robotsPath);
  } else {
    res.send("User-agent: Googlebot\nAllow: /\nDisallow: /api/\n\nUser-agent: Googlebot-Image\nAllow: /\nAllow: /uploads/\n\nUser-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://personal-portfolio-swart-sigma-44.vercel.app/sitemap.xml\n");
  }
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.sendFile(sitemapPath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

// --- 5. SECURE STATIC FILE SERVING & UPLOADS ---
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve bundled uploads in production environment if present
const BUNDLED_UPLOADS = path.resolve(__dirname, '../uploads');
if (process.env.VERCEL === '1' && fs.existsSync(BUNDLED_UPLOADS)) {
  app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.includes('..') || req.path.includes('\0')) {
      res.status(400).json({ error: 'Path traversal disallowed' });
      return;
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox; base-uri 'none'");
    next();
  }, express.static(BUNDLED_UPLOADS, { dotfiles: 'ignore', index: false }));
}

// Serve runtime uploads with strict sandbox and execution prevention headers
app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.includes('..') || req.path.includes('\0')) {
    res.status(400).json({ error: 'Path traversal disallowed' });
    return;
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox; base-uri 'none'");
  next();
}, express.static(UPLOADS_DIR, { dotfiles: 'ignore', index: false }));

// --- 6. HIGH-SECURITY FILE UPLOAD VALIDATION & MAGIC BYTE SIGNATURES ---
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
]);

const MIME_EXTENSION_MAP: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
};

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.sh', '.bash', '.php', '.phtml', '.php3', '.php4', '.php5',
  '.js', '.mjs', '.cjs', '.ts', '.html', '.htm', '.xhtml', '.svg',
  '.xml', '.py', '.pl', '.cgi', '.bat', '.cmd', '.ps1', '.vbs',
  '.jar', '.war', '.bin', '.dll', '.so', '.com', '.scr', '.msi',
  '.jsp', '.asp', '.aspx', '.htaccess', '.env',
]);

function validateMagicBytes(filePath: string, ext: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) return false;

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        // JPEG starts with FF D8 FF
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      case '.png':
        // PNG starts with 89 50 4E 47 0D 0A 1A 0A
        return (
          buffer[0] === 0x89 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x4e &&
          buffer[3] === 0x47 &&
          buffer[4] === 0x0d &&
          buffer[5] === 0x0a &&
          buffer[6] === 0x1a &&
          buffer[7] === 0x0a
        );
      case '.gif':
        // GIF starts with GIF87a or GIF89a
        return (
          buffer[0] === 0x47 &&
          buffer[1] === 0x49 &&
          buffer[2] === 0x46 &&
          buffer[3] === 0x38 &&
          (buffer[4] === 0x37 || buffer[4] === 0x39) &&
          buffer[5] === 0x61
        );
      case '.webp':
        // WebP starts with RIFF (bytes 0-3) and WEBP (bytes 8-11)
        return (
          buffer[0] === 0x52 &&
          buffer[1] === 0x49 &&
          buffer[2] === 0x46 &&
          buffer[3] === 0x46 &&
          bytesRead >= 12 &&
          buffer[8] === 0x57 &&
          buffer[9] === 0x45 &&
          buffer[10] === 0x42 &&
          buffer[11] === 0x50
        );
      case '.pdf':
        // PDF starts with %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
        return (
          buffer[0] === 0x25 &&
          buffer[1] === 0x50 &&
          buffer[2] === 0x44 &&
          buffer[3] === 0x46 &&
          buffer[4] === 0x2d
        );
      default:
        return false;
    }
  } catch {
    return false;
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.bin';
    // Sanitize base name removing non-alphanumeric chars
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Strict 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.originalname.includes('\0')) {
      return cb(new Error('Disallowed file: Null bytes in filename are prohibited.'));
    }

    const lowerName = file.originalname.toLowerCase();
    // Check for double extension or embedded executable extension
    const parts = lowerName.split('.');
    for (let i = 1; i < parts.length; i++) {
      if (DANGEROUS_EXTENSIONS.has('.' + parts[i])) {
        return cb(new Error(`Disallowed file: Prohibited extension ".${parts[i]}" detected in filename.`));
      }
    }

    const ext = path.extname(lowerName);
    if (ext === '.svg' || file.mimetype === 'image/svg+xml') {
      return cb(new Error('Disallowed file format: SVG uploads are disabled for security reasons. Please upload PNG, JPG, WebP, GIF, or PDF.'));
    }
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`Disallowed file extension "${ext}". Allowed: .jpg, .jpeg, .png, .webp, .gif, .pdf.`));
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`Disallowed MIME type "${file.mimetype}". Allowed: image/jpeg, image/png, image/webp, image/gif, application/pdf.`));
    }
    const expectedExts = MIME_EXTENSION_MAP[file.mimetype];
    if (!expectedExts || !expectedExts.includes(ext)) {
      return cb(new Error(`MIME type "${file.mimetype}" does not match file extension "${ext}".`));
    }
    cb(null, true);
  },
});

// Whitelist of valid portfolio sections to prevent injection / prototype pollution
const VALID_SECTIONS = new Set([
  'siteSettings', 'theme', 'seo', 'sectionVisibility', 'navigation',
  'hero', 'about', 'skills', 'projects', 'research', 'gallery',
  'experience', 'education', 'certifications', 'achievements',
  'leadership', 'socialLinks', 'contact', 'media', 'showcase'
]);

const ARRAY_SECTIONS = new Set([
  'navigation', 'skills', 'projects', 'research', 'gallery',
  'experience', 'education', 'certifications', 'achievements',
  'leadership', 'socialLinks', 'media', 'showcase'
]);

const OBJECT_SECTIONS = new Set([
  'siteSettings', 'theme', 'seo', 'sectionVisibility',
  'hero', 'about', 'contact'
]);

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores bytes beyond 72

/**
 * First-run setup is only open on a local dev machine. In production it needs
 * ADMIN_SETUP_TOKEN, and on Vercel it is disabled entirely, because the per-instance
 * /tmp filesystem would let anyone re-run setup on a fresh instance.
 */
function setupMode(): 'open' | 'token' | 'disabled' {
  if (dataStore.isEnvAdmin()) return 'disabled';
  if (IS_VERCEL) return 'disabled';
  if (IS_PRODUCTION) return process.env.ADMIN_SETUP_TOKEN ? 'token' : 'disabled';
  return 'open';
}

// --- 7. AUTHENTICATION ROUTES ---

// GET /api/auth/status
app.get('/api/auth/status', (_req: Request, res: Response): void => {
  const hasAdmin = dataStore.hasAdmin();
  const mode = setupMode();
  res.json({
    initialized: hasAdmin || mode === 'disabled',
    setupAllowed: !hasAdmin && mode !== 'disabled',
    setupRequiresToken: mode === 'token',
    allowDevFallback: false,
  });
});

// POST /api/auth/setup-admin
app.post('/api/auth/setup-admin', setupAdminLimiter, (req: Request, res: Response): void => {
  if (dataStore.hasAdmin()) {
    res.status(400).json({ error: 'Administrator account is already initialized.' });
    return;
  }

  const mode = setupMode();
  if (mode === 'disabled') {
    res.status(403).json({
      error:
        'Online setup is disabled in production. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH in the hosting environment instead.',
    });
    return;
  }
  if (mode === 'token') {
    const provided = typeof req.body?.setupToken === 'string' ? req.body.setupToken : '';
    if (!provided || !safeEqual(provided, String(process.env.ADMIN_SETUP_TOKEN))) {
      res.status(403).json({ error: 'Invalid setup token.' });
      return;
    }
  }

  const { username, email, password, confirmPassword } = req.body ?? {};

  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Username, email, and password are required.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  const cleanUsername = cleanText(username, 40);
  if (!cleanUsername || !/^[a-zA-Z0-9_.-]{3,40}$/.test(cleanUsername)) {
    res.status(400).json({ error: 'Username must be 3-40 characters: letters, numbers, dot, dash or underscore.' });
    return;
  }

  if (!EMAIL_RE.test(email.trim())) {
    res.status(400).json({ error: 'Invalid email address format.' });
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    res.status(400).json({ error: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters long.` });
    return;
  }

  const newAdmin = dataStore.createAdmin(cleanUsername, email.trim().toLowerCase(), password);

  const token = generateToken({
    id: newAdmin.id,
    username: newAdmin.username,
    email: newAdmin.email,
    tokenVersion: newAdmin.tokenVersion || 1,
  });

  res.json({
    success: true,
    token,
    user: {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
    },
  });
});

// POST /api/auth/login (with brute-force rate limiting)
app.post('/api/auth/login', loginLimiter, (req: Request, res: Response): void => {
  if (!dataStore.hasAdmin()) {
    const mode = setupMode();
    res.status(400).json({
      error:
        mode === 'disabled'
          ? 'No administrator is configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH in the hosting environment.'
          : 'Administrator account not set up yet. Please complete First-Run Setup.',
      setupRequired: mode !== 'disabled',
    });
    return;
  }

  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }
  if (username.length > 200 || password.length > MAX_PASSWORD_LENGTH * 4) {
    res.status(401).json({ error: 'Invalid credentials. Access denied.' });
    return;
  }

  const admin = dataStore.getAdmin();
  if (!admin) {
    res.status(401).json({ error: 'Invalid credentials. Access denied.' });
    return;
  }

  const id = username.trim().toLowerCase();
  const matchesUsername = admin.username.toLowerCase() === id || (!!admin.email && admin.email.toLowerCase() === id);
  // Always run the bcrypt comparison so response time does not reveal whether the username exists.
  const passwordOk = comparePassword(password, admin.passwordHash);

  if (!matchesUsername || !passwordOk) {
    res.status(401).json({ error: 'Invalid credentials. Access denied.' });
    return;
  }

  const token = generateToken({
    id: admin.id,
    username: admin.username,
    email: admin.email,
    tokenVersion: admin.tokenVersion || 1,
  });

  res.json({
    success: true,
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    },
  });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const admin = dataStore.getAdmin();
  if (!admin) {
    res.status(404).json({ error: 'Admin record not found' });
    return;
  }

  const userObj = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
  };

  res.json({
    success: true,
    user: userObj,
    id: admin.id,
    username: admin.username,
    email: admin.email,
  });
});

// POST /api/auth/change-password (with brute-force limiter & automatic session invalidation)
app.post('/api/auth/change-password', requireAuth, changePasswordLimiter, (req: AuthenticatedRequest, res: Response): void => {
  if (dataStore.isEnvAdmin()) {
    res.status(400).json({
      error: 'This admin is configured by environment variables. Generate a new hash with `npm run hash-password` and update ADMIN_PASSWORD_HASH in your hosting settings.',
    });
    return;
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body ?? {};

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword !== confirmNewPassword) {
    res.status(400).json({ error: 'New passwords do not match' });
    return;
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
    res.status(400).json({ error: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters long` });
    return;
  }

  const admin = dataStore.getAdmin();
  if (!admin || !comparePassword(String(currentPassword), admin.passwordHash)) {
    res.status(400).json({ error: 'Current password does not match' });
    return;
  }

  const nextVersion = (admin.tokenVersion || 1) + 1;
  dataStore.updateAdmin({
    passwordHash: hashPassword(String(newPassword)),
    tokenVersion: nextVersion,
  });

  const newToken = generateToken({
    id: admin.id,
    username: admin.username,
    email: admin.email,
    tokenVersion: nextVersion,
  });

  res.json({
    success: true,
    message: 'Password updated successfully. Other active sessions revoked.',
    token: newToken,
  });
});

// --- 8. PORTFOLIO DATA ROUTES ---

// Helper to filter public view (strictly hides drafts, internal messages, and internal media registry)
function filterPublicPortfolio(data: PortfolioData): any {
  const { contactMessages, media, ...rest } = data;
  return {
    ...rest,
    projects: (data.projects || []).filter((p) => p.status === 'published'),
    research: (data.research || []).filter((r) => r.status === 'published'),
    gallery: (data.gallery || []).filter((g) => g.status === 'published'),
    experience: (data.experience || []).filter((e) => e.status === 'published'),
    education: (data.education || []).filter((e) => e.status === 'published'),
    certifications: (data.certifications || []).filter((c) => c.status === 'published'),
    achievements: (data.achievements || []).filter((a) => a.status === 'published'),
    leadership: (data.leadership || []).filter((l) => l.status === 'published'),
    skills: (data.skills || []).filter((s) => s.enabled),
    navigation: (data.navigation || []).filter((n) => n.enabled),
  };
}

// GET /api/portfolio (Public view)
app.get('/api/portfolio', (_req: Request, res: Response): void => {
  const data = dataStore.getPortfolio();
  res.json(filterPublicPortfolio(data));
});

// GET /api/portfolio/admin (Full view with drafts)
app.get('/api/portfolio/admin', requireAuth, adminApiLimiter, (_req: Request, res: Response): void => {
  const data = dataStore.getPortfolio();
  res.json(data);
});

/** Returns an error message if a section value has the wrong shape or carries a dangerous URL. */
function validateSection(section: string, value: unknown): string | null {
  if (ARRAY_SECTIONS.has(section)) {
    if (!Array.isArray(value)) return `Section "${section}" must be an array.`;
    if (value.length > 2000) return `Section "${section}" has too many items.`;
    if (value.some((item) => item === null || typeof item !== 'object' || Array.isArray(item))) {
      return `Every item in "${section}" must be an object.`;
    }
  } else if (OBJECT_SECTIONS.has(section)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return `Section "${section}" must be an object.`;
  }
  const badPath = findDangerousUrl(value, section);
  if (badPath) {
    return `Security violation: "${badPath}" uses a disallowed URL scheme (javascript:, data:, vbscript:, file:, blob:).`;
  }
  return null;
}

// PUT /api/portfolio (Full update) — only known sections are accepted, each one validated
app.put('/api/portfolio', requireAuth, adminApiLimiter, largeJson, stripProto, (req: Request, res: Response): void => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'Expected a JSON object.' });
    return;
  }
  const allowed = new Set([...VALID_SECTIONS, 'contactMessages']);
  const clean: Partial<PortfolioData> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!allowed.has(key)) continue; // silently drop unknown keys (mass-assignment guard)
    if (key === 'contactMessages') {
      if (!Array.isArray(value)) {
        res.status(400).json({ error: 'contactMessages must be an array.' });
        return;
      }
    } else {
      const err = validateSection(key, value);
      if (err) {
        res.status(400).json({ error: err });
        return;
      }
    }
    (clean as Record<string, unknown>)[key] = value;
  }
  const updated = dataStore.savePortfolio(clean as PortfolioData);
  res.json(updated);
});

// PUT /api/portfolio/:section (Single section update with strict type and schema enforcement)
app.put('/api/portfolio/:section', requireAuth, adminApiLimiter, largeJson, stripProto, (req: Request, res: Response): void => {
  const section = String(req.params.section);

  if (!VALID_SECTIONS.has(section)) {
    res.status(400).json({ error: 'Invalid or disallowed section key.' });
    return;
  }

  const err = validateSection(section, req.body);
  if (err) {
    res.status(400).json({ error: err });
    return;
  }

  const updated = dataStore.updateSection(section as keyof PortfolioData, req.body);
  res.json(updated);
});

// POST /api/portfolio/reset
app.post('/api/portfolio/reset', requireAuth, adminApiLimiter, (_req: Request, res: Response): void => {
  const resetData = dataStore.resetToDefaults();
  res.json({ success: true, portfolio: resetData });
});

// --- 9. CONTACT INQUIRY ROUTES ---

// POST /api/contact (Public inquiry form with rate limit & HTML sanitization)
app.post('/api/contact', contactLimiter, (req: Request, res: Response): void => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};

  // Honeypot: real visitors never see or fill the "website" field; bots usually do.
  // Pretend success so the bot learns nothing, but store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    res.json({ success: true, message: 'Message received.' });
    return;
  }

  const name = cleanText(body.name, 100);
  const email = cleanText(body.email, 254)?.toLowerCase() ?? null;
  const subject = body.subject === undefined || body.subject === '' ? 'Portfolio enquiry' : cleanText(body.subject, 150);
  const message = cleanText(body.message, 3000);

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email and message are required (text only, within length limits).' });
    return;
  }
  if (subject === null) {
    res.status(400).json({ error: 'Subject must be text of at most 150 characters.' });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Invalid email address format.' });
    return;
  }

  dataStore.addContactMessage({ name, email, subject, message });

  // Do not echo stored data back to an anonymous caller.
  res.json({ success: true, message: 'Message received.' });
});

// GET /api/contact-messages
app.get('/api/contact-messages', requireAuth, adminApiLimiter, (_req: Request, res: Response): void => {
  const data = dataStore.getPortfolio();
  res.json(data.contactMessages || []);
});

// PATCH /api/contact-messages/:id/read
app.patch('/api/contact-messages/:id/read', requireAuth, adminApiLimiter, (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const read = req.body && typeof req.body === 'object' ? req.body.read : undefined;
  const success = dataStore.markContactMessageRead(id, read !== undefined ? Boolean(read) : true);
  res.json({ success });
});

// DELETE /api/contact-messages/:id
app.delete('/api/contact-messages/:id', requireAuth, adminApiLimiter, (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const success = dataStore.deleteContactMessage(id);
  res.json({ success });
});

// --- 10. REAL-TIME WEBSITE LINK PREVIEW (SSRF PROTECTED & CACHED) ---

interface LinkPreviewResult {
  url: string;
  domain: string;
  title: string;
  description: string;
  image: string;
  screenshot: string;
  favicon: string;
}

// In-memory cache with 15-minute TTL to reduce latency and redundant external network calls
const linkPreviewCache = new Map<string, { data: LinkPreviewResult; expiresAt: number }>();

/** Pull an attribute value out of the first matching <meta> tag (plain-text result). */
function metaContent(html: string, attr: 'property' | 'name', key: string): string | undefined {
  const k = key.replace(/[^a-z:_-]/gi, ''); // keys are fixed literals; keep only safe chars
  return (
    html.match(new RegExp(`<meta[^>]{0,400}?${attr}=["']${k}["'][^>]{0,400}?content=["']([^"'<>]{1,500})["']`, 'i'))?.[1] ||
    html.match(new RegExp(`<meta[^>]{0,400}?content=["']([^"'<>]{1,500})["'][^>]{0,400}?${attr}=["']${k}["']`, 'i'))?.[1]
  );
}

const plain = (s: string | undefined, max: number) =>
  (s || '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);

const httpUrlOrEmpty = (u: string | undefined) => {
  if (!u) return '';
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
};

// GET /api/link-preview?url=<targetUrl>
// Admin-only: an unauthenticated URL fetcher is an open proxy / SSRF primitive.
app.get('/api/link-preview', requireAuth, linkPreviewLimiter, async (req: Request, res: Response): Promise<void> => {
  const targetUrl = req.query.url;

  if (!targetUrl || typeof targetUrl !== 'string' || targetUrl.length > 2048) {
    res.status(400).json({ error: 'Query parameter "url" is required.' });
    return;
  }

  let parsed: URL;
  try {
    parsed = assertFetchableUrl(targetUrl.trim());
  } catch (e) {
    res.status(e instanceof SsrfError ? 403 : 400).json({ error: (e as Error).message });
    return;
  }

  const cleanUrl = parsed.href;
  const now = Date.now();

  const cached = linkPreviewCache.get(cleanUrl);
  if (cached && cached.expiresAt > now) {
    res.json({ success: true, ...cached.data });
    return;
  }

  const domain = parsed.hostname;
  const defaultScreenshot = `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(cleanUrl)}`;
  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

  let title = domain;
  let description = '';
  let image = defaultScreenshot;
  let screenshot = defaultScreenshot;
  let favicon = defaultFavicon;

  // 1. Microlink (third-party service fetches the page, not this server)
  try {
    const microRes = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true`, {
      signal: AbortSignal.timeout(3500),
      headers: { Accept: 'application/json', 'User-Agent': 'PortfolioLinkPreview/1.0' },
    });
    if (microRes.ok) {
      const json: any = await microRes.json();
      if (json?.status === 'success' && json.data) {
        if (typeof json.data.title === 'string') title = plain(json.data.title, 200) || title;
        if (typeof json.data.description === 'string') description = plain(json.data.description, 400);
        screenshot = httpUrlOrEmpty(json.data.screenshot?.url) || screenshot;
        image = httpUrlOrEmpty(json.data.image?.url) || screenshot;
        favicon = httpUrlOrEmpty(json.data.logo?.url) || favicon;
      }
    }
  } catch {
    // fall through to direct fetch
  }

  // 2. Direct fetch, SSRF-guarded on every hop, size-capped and time-boxed
  if (title === domain || !description) {
    try {
      const page = await safeFetchText(cleanUrl, { maxBytes: 512 * 1024, timeoutMs: 3500, maxRedirects: 3 });
      const html = page.body;
      if (html) {
        const t = metaContent(html, 'property', 'og:title') || html.match(/<title[^>]*>([^<]{1,300})<\/title>/i)?.[1];
        if (t && title === domain) title = plain(t, 200);
        const d = metaContent(html, 'property', 'og:description') || metaContent(html, 'name', 'description');
        if (d && !description) description = plain(d, 400);
        const img = metaContent(html, 'property', 'og:image');
        if (img && image === defaultScreenshot) {
          try {
            image = httpUrlOrEmpty(new URL(img, page.url).href) || image;
          } catch {
            /* keep default */
          }
        }
      }
    } catch {
      // blocked, timed out or unreachable
    }
  }

  const resultData: LinkPreviewResult = {
    url: cleanUrl,
    domain,
    title,
    description: description || `Live website and interactive platform at ${domain}`,
    image,
    screenshot,
    favicon,
  };

  linkPreviewCache.set(cleanUrl, { data: resultData, expiresAt: now + 15 * 60 * 1000 });
  if (linkPreviewCache.size > 250) {
    const firstKey = linkPreviewCache.keys().next().value;
    if (firstKey) linkPreviewCache.delete(firstKey);
  }

  res.json({ success: true, ...resultData });
});

// --- 11. SECURE MEDIA UPLOAD ROUTES ---

// POST /api/upload (Authenticated + Rate-limited + MIME & Ext verified + Magic Byte signature checked)
app.post('/api/upload', requireAuth, uploadLimiter, upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded or invalid file format.' });
    return;
  }

  const ext = path.extname(req.file.filename).toLowerCase();
  const fullPath = path.join(UPLOADS_DIR, req.file.filename);

  // SVG uploads are permanently disabled to prevent stored SVG scripting
  if (req.file.mimetype === 'image/svg+xml' || ext === '.svg') {
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    res.status(400).json({
      error: 'Security alert: SVG uploads are disabled for security reasons. Please upload PNG, JPG, WebP, GIF, or PDF.',
    });
    return;
  }

  // Deep Magic Bytes Inspection
  if (!validateMagicBytes(fullPath, ext)) {
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    res.status(400).json({
      error: `Security violation: File header magic bytes do not match declared extension "${ext}".`,
    });
    return;
  }

  const mediaItem: MediaFile = {
    id: `media-${Date.now()}`,
    filename: req.file.filename,
    originalName: path.basename(req.file.originalname),
    mimeType: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
    uploadedAt: new Date().toISOString(),
  };

  dataStore.addMedia(mediaItem);
  res.json({ success: true, media: mediaItem });
});

// DELETE /api/media/:id
app.delete('/api/media/:id', requireAuth, adminApiLimiter, (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const success = dataStore.deleteMedia(id);
  res.json({ success });
});

// Serve CV.pdf directly
app.get('/CV.pdf', (_req: Request, res: Response) => {
  const cvPath = path.resolve(__dirname, '../CV.pdf');
  if (fs.existsSync(cvPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Mansoor_Ahmed_Rind_CV.pdf"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(cvPath);
  } else {
    res.status(404).send('CV.pdf not found');
  }
});

// --- 11. CENTRALIZED ERROR-HANDLING MIDDLEWARE ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size exceeds maximum allowed 10MB limit.' });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  // Body-parser errors: malformed JSON or oversized payloads are client errors, not 500s
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Malformed JSON body.' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body too large.' });
    return;
  }

  // CORS errors
  if (err.message && err.message.startsWith('CORS blocked:')) {
    res.status(403).json({ error: err.message });
    return;
  }

  // Handled operational / validation errors
  if (err.message && (
    err.message.startsWith('Disallowed file') ||
    err.message.startsWith('Security alert') ||
    err.message.startsWith('Security violation') ||
    err.message.startsWith('MIME type')
  )) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Production safety: Never expose stack traces, internal paths, or unhandled exceptions
  console.error('[Internal Server Error]:', err?.message || err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

// Serve frontend dist in production with Server-Side Rendering (SSR) & true 404s
const DIST_DIR = path.resolve(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  // The admin CMS is published only at the secret ADMIN_PATH (see scripts/place-admin.mjs).
  // Its folder must never be reachable through plain static serving under another name.
  const ADMIN_SLUG = (process.env.ADMIN_PATH || '').trim().replace(/^\/+|\/+$/g, '');
  app.use(express.static(DIST_DIR, { index: false }));
  app.use((req: Request, res: Response) => {
    const p = req.path;
    const isPublicValid = p === '/' || p === '/index.html' || p === '/CV.pdf';
    const indexPath = path.join(DIST_DIR, 'index.html');

    if (ADMIN_SLUG && (p === `/${ADMIN_SLUG}` || p === `/${ADMIN_SLUG}/`)) {
      const adminIndex = path.join(DIST_DIR, ADMIN_SLUG, 'index.html');
      if (fs.existsSync(adminIndex)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        res.setHeader('Cache-Control', 'no-store');
        res.sendFile(adminIndex);
        return;
      }
    }

    if (!fs.existsSync(indexPath)) {
      res.status(404).send('Not Found');
      return;
    }

    let html = fs.readFileSync(indexPath, 'utf-8');

    // Everything else, /admin included, is a genuine 404.
    if (!isPublicValid) {
      // Emit true HTTP 404 status code for search engines and crawlers (Fix 8 & SEO 12)
      res.status(404);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
      return;
    }

    if (isPublicValid) {
      // Server-Side Render (SSR) the full semantic component tree into <div id="root">
      try {
        const ssrContent = renderServerSide(dataStore.getPortfolio());
        html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);
      } catch (err) {
        console.error('[SSR Error]:', err);
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });
}

// Vercel serverless compatibility:
// - On Vercel, the platform invokes the exported Express app.
// - Locally, keep the existing standalone Express server.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`[Mansoor Portfolio Backend] Secure API Server listening on port ${PORT}`);
    console.log(`[Mansoor Portfolio Backend] Storage file: ${path.resolve(__dirname, '../data/portfolio.json')}`);
  });
}

export default app;
