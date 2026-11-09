/**
 * Shared security helpers for the API server.
 * There is no SQL database (content lives in a JSON file), so the injection
 * surface is HTML/script injection, URL-scheme injection, JSON shape/type
 * injection, prototype pollution and server-side request forgery (SSRF).
 */
import crypto from 'crypto';
import dns from 'dns';
import http from 'http';
import https from 'https';
import net from 'net';

export const IS_VERCEL = process.env.VERCEL === '1';
export const IS_PRODUCTION = IS_VERCEL || process.env.NODE_ENV === 'production';

/* ------------------------------------------------------------------ */
/* Text & HTML                                                         */
/* ------------------------------------------------------------------ */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

/** Escape any value for safe interpolation into HTML text or a quoted attribute. */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"'`]/g, (c) => HTML_ESCAPES[c]);
}

/** Plain-text cleanup for user-submitted fields: strings only, no control chars, no markup, length-capped. */
export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // keep \t \n \r
    .replace(/<[^>]*>/g, '')
    .trim();
  if (cleaned.length > maxLength) return null;
  return cleaned;
}

export const EMAIL_RE = /^[^\s@<>"'`]{1,64}@[^\s@<>"'`]{1,190}\.[a-z]{2,24}$/i;

/** Constant-time string comparison (for setup tokens etc.). */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    crypto.timingSafeEqual(ab, ab); // keep timing roughly constant
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

/* ------------------------------------------------------------------ */
/* URL scheme validation                                               */
/* ------------------------------------------------------------------ */

const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:', 'blob:'];

export function isDangerousUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  let decoded = value;
  // Decode repeatedly to defeat double-encoding (e.g. javascript%253A)
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  // Also decode HTML entities commonly used to smuggle schemes (&#106;avascript:)
  decoded = decoded.replace(/&#x?([0-9a-f]+);?/gi, (_m, n: string) => {
    const code = /^[0-9]+$/.test(n) ? parseInt(n, 10) : parseInt(n, 16);
    return Number.isFinite(code) && code < 0x110000 ? String.fromCodePoint(code) : '';
  });
  const stripped = decoded.replace(/[\u0000- \u007F-\u009F]/g, '').toLowerCase();
  return DANGEROUS_SCHEMES.some((scheme) => stripped.startsWith(scheme));
}

const URL_KEY_RE = /(url|link|href|src|image|logo|favicon|avatar|photo|media)s?$/i;

/**
 * Walk any JSON payload and return the path of the first string that sits under a
 * URL-like key (or inside an array under one) and uses a dangerous scheme.
 */
export function findDangerousUrl(payload: unknown, pathSoFar = '$', underUrlKey = false, depth = 0): string | null {
  if (depth > 12) return null;
  if (typeof payload === 'string') {
    return underUrlKey && isDangerousUrl(payload) ? pathSoFar : null;
  }
  if (Array.isArray(payload)) {
    for (let i = 0; i < payload.length; i++) {
      const hit = findDangerousUrl(payload[i], `${pathSoFar}[${i}]`, underUrlKey, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (payload && typeof payload === 'object') {
    for (const [key, val] of Object.entries(payload)) {
      const hit = findDangerousUrl(val, `${pathSoFar}.${key}`, URL_KEY_RE.test(key), depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

/** Recursively drop keys that could pollute Object.prototype. */
export function stripPrototypeKeys<T>(obj: T, depth = 0): T {
  if (depth > 32 || obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((v) => stripPrototypeKeys(v, depth + 1)) as unknown as T;
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    clean[key] = stripPrototypeKeys((obj as Record<string, unknown>)[key], depth + 1);
  }
  return clean as T;
}

/* ------------------------------------------------------------------ */
/* SSRF-safe outbound fetch                                            */
/* ------------------------------------------------------------------ */

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

const PRIVATE_V4: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

/** True only for globally routable unicast addresses. */
export function isPublicIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) {
    const n = ipv4ToInt(ip);
    return !PRIVATE_V4.some(([base, bits]) => {
      const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
      return (n & mask) === (ipv4ToInt(base) & mask);
    });
  }
  if (family === 6) {
    const lower = ip.toLowerCase();
    // IPv4-mapped / translated forms: judge the embedded IPv4
    const mapped = lower.match(/^(?:::ffff:|::ffff:0:|64:ff9b::)(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicIp(mapped[1]);
    if (lower.startsWith('::ffff:')) return false; // hex-form mapped addresses
    if (lower === '::' || lower === '::1') return false;
    const first = parseInt(lower.split(':')[0] || '0', 16);
    if ((first & 0xfe00) === 0xfc00) return false; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return false; // fe80::/10 link local
    if ((first & 0xff00) === 0xff00) return false; // ff00::/8 multicast
    if (lower.startsWith('2001:db8')) return false; // documentation
    return true;
  }
  return false;
}

export class SsrfError extends Error {}

/** Validate a user-supplied URL for outbound fetching (scheme, port, literal IPs). */
export function assertFetchableUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new SsrfError('Invalid URL format.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SsrfError('Only HTTP and HTTPS URLs are allowed.');
  }
  if (parsed.username || parsed.password) {
    throw new SsrfError('URLs with embedded credentials are not allowed.');
  }
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    throw new SsrfError('Only the default web ports are allowed.');
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && !isPublicIp(host)) {
    throw new SsrfError('Access to private or local network addresses is prohibited.');
  }
  if (/^(localhost|.*\.localhost|.*\.local|.*\.internal|metadata\.google\.internal)$/i.test(host)) {
    throw new SsrfError('Access to private or local network addresses is prohibited.');
  }
  return parsed;
}

/** DNS lookup that refuses to connect to non-public addresses (defeats DNS rebinding). */
function guardedLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void
): void {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, '', 0);
    const list = addresses as dns.LookupAddress[];
    if (!list.length || list.some((a) => !isPublicIp(a.address))) {
      return callback(new SsrfError(`Blocked non-public address for ${hostname}`) as NodeJS.ErrnoException, '', 0);
    }
    if (options.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}

/**
 * Fetch an HTML page with SSRF protection: every hop (including redirects) is
 * re-validated, the socket only connects to public IPs, the body is size-capped
 * and the whole request is time-boxed.
 */
export function safeFetchText(
  rawUrl: string,
  { maxBytes = 512 * 1024, timeoutMs = 4000, maxRedirects = 3 } = {}
): Promise<{ url: string; status: number; contentType: string; body: string }> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const go = (current: string, redirectsLeft: number) => {
      let target: URL;
      try {
        target = assertFetchableUrl(current);
      } catch (e) {
        return reject(e);
      }
      const lib = target.protocol === 'https:' ? https : http;
      const remaining = timeoutMs - (Date.now() - started);
      if (remaining <= 0) return reject(new SsrfError('Timed out'));
      const req = lib.request(
        target,
        {
          method: 'GET',
          lookup: guardedLookup as unknown as net.LookupFunction,
          timeout: remaining,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PortfolioLinkPreview/1.0)',
            Accept: 'text/html,application/xhtml+xml',
          },
        },
        (res) => {
          const status = res.statusCode || 0;
          if (status >= 300 && status < 400 && res.headers.location) {
            res.resume();
            if (redirectsLeft <= 0) return reject(new SsrfError('Too many redirects'));
            let next: string;
            try {
              next = new URL(res.headers.location, target).href;
            } catch {
              return reject(new SsrfError('Bad redirect'));
            }
            return go(next, redirectsLeft - 1);
          }
          const contentType = String(res.headers['content-type'] || '');
          if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
            res.resume();
            return resolve({ url: target.href, status, contentType, body: '' });
          }
          let size = 0;
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => {
            size += chunk.length;
            if (size > maxBytes) {
              res.destroy();
              return;
            }
            chunks.push(chunk);
          });
          res.on('close', () =>
            resolve({ url: target.href, status, contentType, body: Buffer.concat(chunks).toString('utf8') })
          );
          res.on('error', reject);
        }
      );
      req.on('timeout', () => req.destroy(new SsrfError('Timed out')));
      req.on('error', reject);
      req.end();
    };
    go(rawUrl, maxRedirects);
  });
}
