import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PortfolioData, ContactMessage, MediaFile } from '../src/types/portfolio.ts';
import { initialPortfolioData } from '../src/data/initialData.ts';
import { AdminUser } from './types.ts';
import { hashPassword } from './auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vercel serverless functions cannot use the deployment directory as
// persistent writable storage. Use /tmp at runtime on Vercel.
// Local development continues to use the project's data/ and uploads/ directories.
const PROJECT_DATA_DIR = path.resolve(__dirname, '../data');

const STORAGE_ROOT = process.env.VERCEL === '1'
  ? '/tmp/portfolio-data'
  : PROJECT_DATA_DIR;

const DATA_DIR = STORAGE_ROOT;
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// On Vercel, data/portfolio.json is bundled with the deployment and is the
// initial source of truth. Runtime writes still go to /tmp.
const BUNDLED_PORTFOLIO_FILE = path.join(PROJECT_DATA_DIR, 'portfolio.json');

const UPLOADS_DIR = process.env.VERCEL === '1'
  ? '/tmp/portfolio-uploads'
  : path.resolve(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function atomicWriteJson(filePath: string, data: any): void {
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

export class DataStore {
  private portfolio: PortfolioData;
  private admin: AdminUser | null;

  constructor() {
    this.portfolio = this.loadPortfolio();
    this.admin = this.loadAdmin();
  }

  private loadPortfolio(): PortfolioData {
    try {
      if (fs.existsSync(PORTFOLIO_FILE)) {
        const raw = fs.readFileSync(PORTFOLIO_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...initialPortfolioData,
          ...parsed,
          contactMessages: parsed.contactMessages || [],
          media: parsed.media || [],
          research: parsed.research || initialPortfolioData.research || [],
          projects: parsed.projects || initialPortfolioData.projects || [],
          skills: parsed.skills || initialPortfolioData.skills || [],
        };
      }
    } catch (e) {
      console.error('Error loading portfolio.json, seeding initial data:', e);
    }

    // On Vercel, seed writable /tmp storage from the portfolio.json bundled
    // with the deployment before falling back to initialPortfolioData.
    if (
      process.env.VERCEL === '1' &&
      fs.existsSync(BUNDLED_PORTFOLIO_FILE)
    ) {
      try {
        const bundledRaw = fs.readFileSync(BUNDLED_PORTFOLIO_FILE, 'utf-8');
        const bundledData = JSON.parse(bundledRaw) as PortfolioData;

        const seededData: PortfolioData = {
          ...initialPortfolioData,
          ...bundledData,
          contactMessages: bundledData.contactMessages || [],
          media: bundledData.media || [],
          research: bundledData.research || initialPortfolioData.research || [],
          projects: bundledData.projects || initialPortfolioData.projects || [],
          skills: bundledData.skills || initialPortfolioData.skills || [],
        };

        atomicWriteJson(PORTFOLIO_FILE, seededData);
        return seededData;
      } catch (e) {
        console.error('Error loading bundled portfolio.json:', e);
      }
    }

    // Final fallback for a genuinely missing/corrupt portfolio file.
    atomicWriteJson(PORTFOLIO_FILE, initialPortfolioData);
    return JSON.parse(JSON.stringify(initialPortfolioData));
  }

  private loadAdmin(): AdminUser | null {
    try {
      if (fs.existsSync(ADMIN_FILE)) {
        const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.passwordHash) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading admin.json:', e);
    }

    // If explicit dev fallback is requested via environment variable
    if (process.env.ALLOW_DEV_FALLBACK === 'true') {
      console.warn('[SECURITY WARNING] ALLOW_DEV_FALLBACK is enabled. Setting up development fallback credentials.');
      const devAdmin: AdminUser = {
        id: 'admin-dev',
        username: 'admin',
        email: 'admin@mansoor.eng',
        passwordHash: hashPassword('admin123'),
        createdAt: new Date().toISOString(),
        tokenVersion: 1,
      };
      atomicWriteJson(ADMIN_FILE, devAdmin);
      return devAdmin;
    }

    // By default, no admin is pre-configured until first-run setup is completed
    return null;
  }

  public hasAdmin(): boolean {
    return this.admin !== null && !!this.admin.passwordHash;
  }

  public getAdmin(): AdminUser | null {
    try {
      if (fs.existsSync(ADMIN_FILE)) {
        const raw = fs.readFileSync(ADMIN_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.passwordHash) {
          this.admin = parsed;
        }
      }
    } catch (e) {
      console.error('Error reloading admin.json:', e);
    }
    return this.admin;
  }

  public createAdmin(username: string, email: string, passwordPlain: string): AdminUser {
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(passwordPlain),
      createdAt: new Date().toISOString(),
      tokenVersion: 1,
    };

    atomicWriteJson(ADMIN_FILE, newAdmin);
    this.admin = newAdmin;
    return newAdmin;
  }

  public getPortfolio(): PortfolioData {
    return this.portfolio;
  }

  public savePortfolio(data: PortfolioData): PortfolioData {
    this.portfolio = {
      ...this.portfolio,
      ...data,
      contactMessages: data.contactMessages || this.portfolio.contactMessages || [],
      media: data.media || this.portfolio.media || [],
      research: data.research || this.portfolio.research || [],
      projects: data.projects || this.portfolio.projects || [],
      siteSettings: {
        ...this.portfolio.siteSettings,
        ...(data.siteSettings || {}),
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    };
    atomicWriteJson(PORTFOLIO_FILE, this.portfolio);
    return this.portfolio;
  }

  public updateSection<K extends keyof PortfolioData>(section: K, value: PortfolioData[K]): PortfolioData {
    this.portfolio[section] = value;
    if (this.portfolio.siteSettings) {
      this.portfolio.siteSettings.lastUpdated = new Date().toISOString().split('T')[0];
    }
    atomicWriteJson(PORTFOLIO_FILE, this.portfolio);
    return this.portfolio;
  }

  public updateAdmin(updates: Partial<AdminUser>): AdminUser {
    if (!this.admin) {
      throw new Error('Cannot update non-existent admin');
    }
    this.admin = {
      ...this.admin,
      ...updates,
    };
    atomicWriteJson(ADMIN_FILE, this.admin);
    return this.admin;
  }

  public addContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): ContactMessage {
    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      ...message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    if (!Array.isArray(this.portfolio.contactMessages)) {
      this.portfolio.contactMessages = [];
    }
    this.portfolio.contactMessages.unshift(newMessage);
    atomicWriteJson(PORTFOLIO_FILE, this.portfolio);
    return newMessage;
  }

  public deleteContactMessage(id: string): boolean {
    if (!Array.isArray(this.portfolio.contactMessages)) {
      this.portfolio.contactMessages = [];
      return false;
    }
    const prevLen = this.portfolio.contactMessages.length;
    this.portfolio.contactMessages = this.portfolio.contactMessages.filter(m => m.id !== id);
    if (this.portfolio.contactMessages.length !== prevLen) {
      atomicWriteJson(PORTFOLIO_FILE, this.portfolio);
      return true;
    }
    return false;
  }

  public markContactMessageRead(id: string, read: boolean): boolean {
    if (!Array.isArray(this.portfolio.contactMessages)) {
      this.portfolio.contactMessages = [];
      return false;
    }
    const msg = this.portfolio.contactMessages.find(m => m.id === id);
    if (msg) {
      msg.read = read;
      atomicWriteJson(PORTFOLIO_FILE, this.portfolio);
      return true;
    }
    return false;
  }

  public addMedia(media: MediaFile): MediaFile {
    if (!Array.isArray(this.portfolio.media)) {
      this.portfolio.media = [];
    }
    this.portfolio.media.unshift(media);
    atomicWriteJson(PORTFOLIO_FILE, this.portfolio);
    return media;
  }

  public deleteMedia(id: string): boolean {
    if (!Array.isArray(this.portfolio.media)) {
      this.portfolio.media = [];
      return false;
    }
    const item = this.portfolio.media.find(m => m.id === id);
    if (item) {
      this.portfolio.media = this.portfolio.media.filter(m => m.id !== id);
      atomicWriteJson(PORTFOLIO_FILE, this.portfolio);
      // Remove file from disk securely, strictly preventing path traversal
      const safeFilename = path.basename(item.filename);
      const filePath = path.join(UPLOADS_DIR, safeFilename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Error removing media file:', e);
        }
      }
      return true;
    }
    return false;
  }

  public resetToDefaults(): PortfolioData {
    // 1. Create automatic backup of current data before resetting
    try {
      const backupPath = path.join(BACKUPS_DIR, `portfolio.backup.${Date.now()}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(this.portfolio, null, 2), 'utf-8');
      console.log(`[Backup] Automated backup created at: ${backupPath}`);
    } catch (e) {
      console.error('Failed to write backup before reset:', e);
    }

    // 2. Overwrite with pristine CV dataset
    this.portfolio = JSON.parse(JSON.stringify(initialPortfolioData));
    atomicWriteJson(PORTFOLIO_FILE, this.portfolio);
    return this.portfolio;
  }
}

export const dataStore = new DataStore();
