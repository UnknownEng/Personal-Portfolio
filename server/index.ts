import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { dataStore } from './store';
import { requireAuth, comparePassword, hashPassword, generateToken, AuthenticatedRequest } from './auth';
import { MediaFile, PortfolioData } from '../src/types/portfolio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads folder
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for secure uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
    ];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP, GIF, SVG, and PDF files are allowed'));
    }
  },
});

// --- AUTHENTICATION ROUTES ---

// GET /api/auth/status (Checks if administrator account has been initialized)
app.get('/api/auth/status', (_req: Request, res: Response): void => {
  const hasAdmin = dataStore.hasAdmin();
  res.json({
    initialized: hasAdmin,
    allowDevFallback: process.env.ALLOW_DEV_FALLBACK === 'true',
  });
});

// POST /api/auth/setup-admin (First-Run Administrator Account Creation)
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

  if (username.trim().length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email address format.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  const newAdmin = dataStore.createAdmin(username, email, password);
  const token = generateToken({
    id: newAdmin.id,
    username: newAdmin.username,
    email: newAdmin.email,
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

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response): void => {
  if (!dataStore.hasAdmin()) {
    res.status(400).json({
      error: 'Administrator account not set up yet. Please complete First-Run Setup.',
      setupRequired: true,
    });
    return;
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username/email and password are required' });
    return;
  }

  const admin = dataStore.getAdmin()!;
  const matchesIdentifier =
    admin.username.toLowerCase() === username.toLowerCase() ||
    admin.email.toLowerCase() === username.toLowerCase();

  if (!matchesIdentifier || !comparePassword(password, admin.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials. Please verify your username and password.' });
    return;
  }

  const token = generateToken({
    id: admin.id,
    username: admin.username,
    email: admin.email,
  });

  res.json({
    token,
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    },
  });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (_req: AuthenticatedRequest, res: Response): void => {
  const admin = dataStore.getAdmin();
  if (!admin) {
    res.status(404).json({ error: 'No admin configured' });
    return;
  }

  res.json({
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    },
  });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long' });
    return;
  }

  const admin = dataStore.getAdmin();
  if (!admin || !comparePassword(currentPassword, admin.passwordHash)) {
    res.status(400).json({ error: 'Current password does not match' });
    return;
  }

  dataStore.updateAdmin({
    passwordHash: hashPassword(newPassword),
  });

  res.json({ success: true, message: 'Password updated successfully' });
});

// --- PORTFOLIO DATA ROUTES ---

// Helper to filter public view (hides drafts, internal messages)
function filterPublicPortfolio(data: PortfolioData): any {
  const { contactMessages, ...rest } = data;
  return {
    ...rest,
    projects: (data.projects || []).filter(p => p.status === 'published'),
    research: (data.research || []).filter(r => r.status === 'published'),
    gallery: (data.gallery || []).filter(g => g.status === 'published'),
    experience: (data.experience || []).filter(e => e.status === 'published'),
    education: (data.education || []).filter(e => e.status === 'published'),
    certifications: (data.certifications || []).filter(c => c.status === 'published'),
    achievements: (data.achievements || []).filter(a => a.status === 'published'),
    leadership: (data.leadership || []).filter(l => l.status === 'published'),
    skills: (data.skills || []).filter(s => s.enabled),
    navigation: (data.navigation || []).filter(n => n.enabled),
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

// PUT /api/portfolio/:section (Single section update)
app.put('/api/portfolio/:section', requireAuth, (req: Request, res: Response): void => {
  const { section } = req.params;
  const portfolio = dataStore.getPortfolio();

  if (!(section in portfolio)) {
    res.status(400).json({ error: `Invalid section: ${section}` });
    return;
  }

  const updated = dataStore.updateSection(section as keyof PortfolioData, req.body);
  res.json(updated);
});

// POST /api/portfolio/reset (Reset to initial verified CV dataset)
app.post('/api/portfolio/reset', requireAuth, (_req: Request, res: Response): void => {
  const resetData = dataStore.resetToDefaults();
  res.json({ success: true, portfolio: resetData });
});

// --- CONTACT INQUIRY ROUTES ---

// POST /api/contact (Public inquiry form with strict sanitization and validation)
app.post('/api/contact', (req: Request, res: Response): void => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }

  // Length limit validation
  if (String(name).trim().length > 100) {
    res.status(400).json({ error: 'Name cannot exceed 100 characters.' });
    return;
  }
  if (String(email).trim().length > 120) {
    res.status(400).json({ error: 'Email cannot exceed 120 characters.' });
    return;
  }
  if (String(subject || '').trim().length > 150) {
    res.status(400).json({ error: 'Subject cannot exceed 150 characters.' });
    return;
  }
  if (String(message).trim().length > 3000) {
    res.status(400).json({ error: 'Message cannot exceed 3000 characters.' });
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    res.status(400).json({ error: 'Invalid email address format.' });
    return;
  }

  const newMsg = dataStore.addContactMessage({
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().slice(0, 120),
    subject: String(subject || 'Engineering Portfolio Inquiry').trim().slice(0, 150),
    message: String(message).trim().slice(0, 3000),
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

// --- MEDIA UPLOAD ROUTES ---

// POST /api/upload
app.post('/api/upload', requireAuth, upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded or invalid file format.' });
    return;
  }

  const mediaItem: MediaFile = {
    id: `media-${Date.now()}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
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
    res.sendFile(cvPath);
  } else {
    res.status(404).send('CV.pdf not found');
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

app.listen(PORT, () => {
  console.log(`[Mansoor Portfolio Backend] API Server listening on port ${PORT}`);
  console.log(`[Mansoor Portfolio Backend] Storage file: ${path.resolve(__dirname, '../data/portfolio.json')}`);
});
