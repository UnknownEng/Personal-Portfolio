import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secure secret management: checks environment variable first, falls back to persistent generated secret
function getJwtSecret(): string {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 16) {
    return process.env.JWT_SECRET.trim();
  }

  const secretFile = process.env.VERCEL === '1'
    ? '/tmp/portfolio-data/.jwt_secret'
    : path.resolve(__dirname, '../data/.jwt_secret');

  try {
    if (fs.existsSync(secretFile)) {
      const stored = fs.readFileSync(secretFile, 'utf-8').trim();
      if (stored.length >= 32) return stored;
    }
    const generated = crypto.randomBytes(32).toString('hex');
    const secretDir = path.dirname(secretFile);
    if (!fs.existsSync(secretDir)) {
      fs.mkdirSync(secretDir, { recursive: true });
    }
    fs.writeFileSync(secretFile, generated, { mode: 0o600 });
    return generated;
  } catch {
    // If persistent storage is unwriteable, generate and retain a high-entropy secret in process memory
    if (!(globalThis as any).__runtimeJwtSecret) {
      (globalThis as any).__runtimeJwtSecret = crypto.randomBytes(32).toString('hex');
    }
    return (globalThis as any).__runtimeJwtSecret;
  }
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    tokenVersion?: number;
  };
}

let adminVerifier: (() => any) | null = null;
export function setAdminVerifier(fn: () => any): void {
  adminVerifier = fn;
}

export function hashPassword(plainText: string): string {
  const salt = bcrypt.genSaltSync(12); // Enterprise-grade work factor
  return bcrypt.hashSync(plainText, salt);
}

export function comparePassword(plainText: string, hash: string): boolean {
  return bcrypt.compareSync(plainText, hash);
}

export function generateToken(payload: { id: string; username: string; email: string; tokenVersion?: number }): string {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization token.' });
    return;
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Authorization token is required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as { id: string; username: string; email: string; tokenVersion?: number };

    if (adminVerifier) {
      const admin = adminVerifier();
      if (!admin || admin.id !== decoded.id) {
        res.status(401).json({ error: 'Unauthorized: Admin user not found or invalid.' });
        return;
      }
      const currentVersion = admin.tokenVersion || 1;
      const tokenVersion = decoded.tokenVersion || 1;
      if (currentVersion !== tokenVersion) {
        res.status(401).json({ error: 'Session revoked: Password was changed. Please log in again.' });
        return;
      }
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Session expired. Please log in again.' });
      return;
    }
    res.status(401).json({ error: 'Unauthorized: Invalid token signature or format.' });
    return;
  }
}
