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
import { requireAuth, comparePassword, hashPassword, generateToken, AuthenticatedRequest, setAdminVerifier } from './auth.ts';
import { MediaFile, PortfolioData } from '../src/types/portfolio.ts';

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

// Body parser with strict payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prototype Pollution Defense: Recursively strip dangerous keys from request bodies
function sanitizePrototypes(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizePrototypes);
  }
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = sanitizePrototypes(obj[key]);
  }
  return clean;
}

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePrototypes(req.body);
  }
  next();
});

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
    res.send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /uploads/\n\nSitemap: https://personal-portfolio-swart-sigma-44.vercel.app/sitemap.xml\n");
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

// Input sanitization helper for contact form & text inputs
function sanitizeInput(str: any): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\0/g, '') // Strip null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .trim();
}

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

function isDangerousUrl(urlStr: any): boolean {
  if (typeof urlStr !== 'string') return false;
  let decoded = urlStr;
  try {
    decoded = decodeURIComponent(urlStr);
  } catch {
    // Treat malformed URI encoding with strict suspicion
  }
  const stripped = decoded.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:', 'blob:'];
  return dangerousProtocols.some((proto) => stripped.startsWith(proto));
}

// --- 7. AUTHENTICATION ROUTES ---

// GET /api/auth/status
app.get('/api/auth/status', (_req: Request, res: Response): void => {
  const hasAdmin = dataStore.hasAdmin();
  res.json({
    initialized: hasAdmin,
    allowDevFallback: process.env.ALLOW_DEV_FALLBACK === 'true',
  });
});

// POST /api/auth/setup-admin
app.post('/api/auth/setup-admin', setupAdminLimiter, (req: Request, res: Response): void => {
  if (dataStore.hasAdmin()) {
    res.status(400).json({ error: 'Administrator account is already initialized.' });
    return;
  }

  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  if (String(username).trim().length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    res.status(400).json({ error: 'Invalid email address format.' });
    return;
  }

  if (String(password).length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  const newAdmin = dataStore.createAdmin(
    sanitizeInput(username),
    String(email).trim().toLowerCase(),
    password
  );

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
    res.status(400).json({
      error: 'Administrator account not set up yet. Please complete First-Run Setup.',
      setupRequired: true,
    });
    return;
  }

  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const admin = dataStore.getAdmin();
  if (!admin) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const matchesUsername =
    admin.username.toLowerCase() === String(username).trim().toLowerCase() ||
    admin.email.toLowerCase() === String(username).trim().toLowerCase();

  if (!matchesUsername || !comparePassword(String(password), admin.passwordHash)) {
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
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword !== confirmNewPassword) {
    res.status(400).json({ error: 'New passwords do not match' });
    return;
  }

  if (String(newPassword).length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long' });
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

// PUT /api/portfolio (Full update)
app.put('/api/portfolio', requireAuth, adminApiLimiter, (req: Request, res: Response): void => {
  const updated = dataStore.savePortfolio(req.body);
  res.json(updated);
});

// PUT /api/portfolio/:section (Single section update with strict type and schema enforcement)
app.put('/api/portfolio/:section', requireAuth, adminApiLimiter, (req: Request, res: Response): void => {
  const { section } = req.params;

  if (!VALID_SECTIONS.has(section)) {
    res.status(400).json({ error: `Invalid or disallowed section key: ${section}` });
    return;
  }

  // Strict Type & Schema Validation (Reject non-arrays for array sections, non-objects for object sections)
  if (ARRAY_SECTIONS.has(section)) {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        error: `Invalid payload for section "${section}". Expected an Array of items, received ${req.body === null ? 'null' : typeof req.body}.`,
      });
      return;
    }

    // Backend defense-in-depth: check for dangerous URL schemes in array items
    for (const item of req.body) {
      if (item && typeof item === 'object') {
        const urlFields = ['url', 'link', 'liveDemoUrl', 'githubUrl', 'documentationUrl', 'credentialUrl', 'externalUrl', 'mediaUrl'];
        for (const field of urlFields) {
          if (field in item && isDangerousUrl(item[field])) {
            res.status(400).json({
              error: `Security violation: Field "${field}" contains a disallowed URL scheme (e.g. javascript:, data:, vbscript:).`,
            });
            return;
          }
        }
      }
    }
  } else if (OBJECT_SECTIONS.has(section)) {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      res.status(400).json({
        error: `Invalid payload for section "${section}". Expected a JSON Object, received ${Array.isArray(req.body) ? 'Array' : req.body === null ? 'null' : typeof req.body}.`,
      });
      return;
    }
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
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }

  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = String(email).trim().toLowerCase();
  const sanitizedSubject = sanitizeInput(subject || 'Engineering Portfolio Inquiry');
  const sanitizedMessage = sanitizeInput(message);

  if (sanitizedName.length > 100) {
    res.status(400).json({ error: 'Name cannot exceed 100 characters.' });
    return;
  }
  if (sanitizedEmail.length > 120) {
    res.status(400).json({ error: 'Email cannot exceed 120 characters.' });
    return;
  }
  if (sanitizedSubject.length > 150) {
    res.status(400).json({ error: 'Subject cannot exceed 150 characters.' });
    return;
  }
  if (sanitizedMessage.length > 3000) {
    res.status(400).json({ error: 'Message cannot exceed 3000 characters.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    res.status(400).json({ error: 'Invalid email address format.' });
    return;
  }

  const newMsg = dataStore.addContactMessage({
    name: sanitizedName,
    email: sanitizedEmail,
    subject: sanitizedSubject,
    message: sanitizedMessage,
  });

  res.json({ success: true, message: 'Message dispatched successfully!', item: newMsg });
});

// GET /api/contact-messages
app.get('/api/contact-messages', requireAuth, adminApiLimiter, (_req: Request, res: Response): void => {
  const data = dataStore.getPortfolio();
  res.json(data.contactMessages || []);
});

// PATCH /api/contact-messages/:id/read
app.patch('/api/contact-messages/:id/read', requireAuth, adminApiLimiter, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { read } = req.body;
  const success = dataStore.markContactMessageRead(id, read !== undefined ? Boolean(read) : true);
  res.json({ success });
});

// DELETE /api/contact-messages/:id
app.delete('/api/contact-messages/:id', requireAuth, adminApiLimiter, (req: Request, res: Response): void => {
  const { id } = req.params;
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

function isPrivateOrLocalHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();

  // Block localhost, link-local, loopback, special internal suffixes
  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower === '0.0.0.0' ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower === '[::1]' ||
    lower === '169.254.169.254'
  ) {
    return true;
  }

  // Check IPv4 patterns: 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x, 169.254.x.x
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipv4Regex);
  if (match) {
    const a = parseInt(match[1], 10);
    const b = parseInt(match[2], 10);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }

  return false;
}

// GET /api/link-preview?url=<targetUrl>
app.get('/api/link-preview', linkPreviewLimiter, async (req: Request, res: Response): Promise<void> => {
  const targetUrl = req.query.url;

  if (!targetUrl || typeof targetUrl !== 'string') {
    res.status(400).json({ error: 'Query parameter "url" is required.' });
    return;
  }

  const trimmed = targetUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    res.status(400).json({ error: 'Invalid URL format.' });
    return;
  }

  // Enforce HTTP / HTTPS protocol only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    res.status(400).json({ error: 'Only HTTP and HTTPS protocols are supported for website previews.' });
    return;
  }

  // Enforce SSRF protection
  if (isPrivateOrLocalHost(parsed.hostname)) {
    res.status(403).json({ error: 'Access to private or local network addresses is prohibited.' });
    return;
  }

  const cleanUrl = parsed.href;
  const now = Date.now();

  // Check cache
  const cached = linkPreviewCache.get(cleanUrl);
  if (cached && cached.expiresAt > now) {
    res.json({ success: true, ...cached.data });
    return;
  }

  const domain = parsed.hostname;
  const defaultScreenshot = `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(cleanUrl)}`;
  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  let title = domain;
  let description = '';
  let image = defaultScreenshot;
  let screenshot = defaultScreenshot;
  let favicon = defaultFavicon;

  // 1. Attempt: Microlink API for high-resolution screenshot and verified metadata
  try {
    const microRes = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true`,
      {
        signal: AbortSignal.timeout(3500),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (compatible; PortfolioBot/1.0)',
        },
      }
    );

    if (microRes.ok) {
      const json: any = await microRes.json();
      if (json.status === 'success' && json.data) {
        if (json.data.title) title = json.data.title.trim();
        if (json.data.description) description = json.data.description.trim();
        if (json.data.screenshot?.url) screenshot = json.data.screenshot.url;
        if (json.data.image?.url) image = json.data.image.url;
        else if (screenshot) image = screenshot;
        if (json.data.logo?.url) favicon = json.data.logo.url;
      }
    }
  } catch {
    // Microlink timed out or network error; proceed to fallback
  }

  // 2. Fallback: If title or description missing, attempt direct fetch with HTML parse
  if (title === domain || !description) {
    try {
      const pageRes = await fetch(cleanUrl, {
        signal: AbortSignal.timeout(3500),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      if (pageRes.ok) {
        const text = await pageRes.text();

        // Title
        const ogTitle = text.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
          || text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
          || text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
        if (ogTitle && title === domain) title = ogTitle.trim();

        // Description
        const ogDesc = text.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
          || text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
          || text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1];
        if (ogDesc && !description) description = ogDesc.trim();

        // Image
        const ogImg = text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
          || text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
        if (ogImg && image === defaultScreenshot) {
          try {
            image = new URL(ogImg, cleanUrl).href;
          } catch {
            // Keep default
          }
        }
      }
    } catch {
      // Direct fetch timed out or blocked
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

  // Cache for 15 minutes
  linkPreviewCache.set(cleanUrl, {
    data: resultData,
    expiresAt: now + 15 * 60 * 1000,
  });

  // Limit cache size to 250 entries
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
  const { id } = req.params;
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

// Serve frontend dist in production
const DIST_DIR = path.resolve(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
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
