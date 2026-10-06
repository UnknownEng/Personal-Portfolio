import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { dataStore } from './store.ts';
import { requireAuth, comparePassword, hashPassword, generateToken, AuthenticatedRequest, setAdminVerifier } from './auth.ts';
import { MediaFile, PortfolioData } from '../src/types/portfolio.ts';

// Register admin verifier for immediate session revocation upon password updates
setAdminVerifier(() => dataStore.getAdmin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// --- 1. ENTERPRISE HTTP SECURITY HEADERS (OWASP) ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// --- 2. CORS ACCESS CONTROL (STRICT ORIGIN ALLOWLIST) ---
const DEFAULT_ALLOWED_ORIGINS = [
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
    return callback(new Error(`CORS blocked: Origin ${origin} is not allowed.`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parser with strict limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 3. RATE LIMITING (BRUTE-FORCE & DOS SAFEGUARDS) ---
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 login attempts
  skipSuccessfulRequests: true, // Do not penalize successful logins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes before retrying.' },
});

const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 password change attempts
  skipSuccessfulRequests: true, // Do not penalize successful password updates
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password update attempts. Please wait 15 minutes before retrying.' },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6, // 6 submissions per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Inquiry rate limit exceeded. Please wait a few minutes before submitting another message.' },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 uploads per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Asset upload rate limit exceeded. Please wait a few minutes.' },
});

// Apply general limiter to all API endpoints
app.use('/api/', generalApiLimiter);

// --- 4. SECURE STATIC FILE SERVING ---
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploads with security headers preventing script execution
app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  next();
}, express.static(UPLOADS_DIR));

// --- 5. HIGH-SECURITY FILE UPLOAD VALIDATION ---
// SVG uploads are explicitly disabled to permanently prevent Stored SVG XSS (SMIL/active script execution).
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

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Sanitize base name removing non-alphanumeric chars
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Strict 10MB limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.svg' || file.mimetype === 'image/svg+xml') {
      return cb(new Error('Disallowed file format: SVG uploads are disabled for security reasons. Please upload PNG, JPG, WebP, or GIF.'));
    }
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`Disallowed file extension "${ext}". Allowed: .jpg, .png, .webp, .gif, .pdf.`));
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`Disallowed MIME type "${file.mimetype}". Allowed: image/jpeg, image/png, image/webp, image/gif, application/pdf.`));
    }
    cb(null, true);
  },
});

// Input sanitization helper for contact form
function sanitizeInput(str: any): string {
  if (typeof str !== 'string') return '';
  return str
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
  const stripped = urlStr.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();
  return (
    stripped.startsWith('javascript:') ||
    stripped.startsWith('data:') ||
    stripped.startsWith('vbscript:') ||
    stripped.startsWith('file:')
  );
}

// --- 6. AUTHENTICATION ROUTES ---

// GET /api/auth/status
app.get('/api/auth/status', (_req: Request, res: Response): void => {
  const hasAdmin = dataStore.hasAdmin();
  res.json({
    initialized: hasAdmin,
    allowDevFallback: process.env.ALLOW_DEV_FALLBACK === 'true',
  });
});

// POST /api/auth/setup-admin
app.post('/api/auth/setup-admin', (req: Request, res: Response): void => {
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

// --- 7. PORTFOLIO DATA ROUTES ---

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
app.get('/api/portfolio/admin', requireAuth, (_req: Request, res: Response): void => {
  const data = dataStore.getPortfolio();
  res.json(data);
});

// PUT /api/portfolio (Full update)
app.put('/api/portfolio', requireAuth, (req: Request, res: Response): void => {
  const updated = dataStore.savePortfolio(req.body);
  res.json(updated);
});

// PUT /api/portfolio/:section (Single section update with strict type and schema enforcement)
app.put('/api/portfolio/:section', requireAuth, (req: Request, res: Response): void => {
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
app.post('/api/portfolio/reset', requireAuth, (_req: Request, res: Response): void => {
  const resetData = dataStore.resetToDefaults();
  res.json({ success: true, portfolio: resetData });
});

// --- 8. CONTACT INQUIRY ROUTES ---

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
app.get('/api/contact-messages', requireAuth, (_req: Request, res: Response): void => {
  const data = dataStore.getPortfolio();
  res.json(data.contactMessages || []);
});

// PATCH /api/contact-messages/:id/read
app.patch('/api/contact-messages/:id/read', requireAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { read } = req.body;
  const success = dataStore.markContactMessageRead(id, read !== undefined ? Boolean(read) : true);
  res.json({ success });
});

// DELETE /api/contact-messages/:id
app.delete('/api/contact-messages/:id', requireAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  const success = dataStore.deleteContactMessage(id);
  res.json({ success });
});

// --- 9. SECURE MEDIA UPLOAD ROUTES ---

// POST /api/upload (Authenticated + Rate-limited + MIME & Ext verified + SVG malware scan)
app.post('/api/upload', requireAuth, uploadLimiter, upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded or invalid file format.' });
    return;
  }

  // SVG uploads are permanently disabled
  const ext = path.extname(req.file.filename).toLowerCase();
  if (req.file.mimetype === 'image/svg+xml' || ext === '.svg') {
    const fullPath = path.join(UPLOADS_DIR, req.file.filename);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    res.status(400).json({
      error: 'Security alert: SVG uploads are disabled for security reasons. Please upload PNG, JPG, WebP, or GIF.',
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
app.delete('/api/media/:id', requireAuth, (req: Request, res: Response): void => {
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
    res.sendFile(cvPath);
  } else {
    res.status(404).send('CV.pdf not found');
  }
});

// --- 10. CENTRALIZED ERROR-HANDLING MIDDLEWARE ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size exceeds maximum allowed 10MB limit.' });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }
  if (err) {
    console.error('[Backend Security / Server Error]:', err.message);
    res.status(400).json({ error: err.message || 'Bad Request' });
    return;
  }
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
