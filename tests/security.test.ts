/**
 * Attack-style security tests for the API server.
 *   npm run test:security
 * Spins up throwaway server instances against a temporary copy of the data,
 * fires injection / auth-bypass / SSRF / upload payloads at them and checks
 * every one is rejected. Never touches data/ or uploads/.
 */
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isPublicIp, isDangerousUrl, escapeHtml, safeFetchText } from '../server/security.ts';
import { renderServerSide } from '../server/ssr.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push(`${name} ${detail}`);
    console.log(`  ✗ ${name} ${detail}`);
  }
}

async function startServer(port: number, env: Record<string, string>): Promise<{ proc: ChildProcess; dir: string }> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-sec-'));
  fs.mkdirSync(path.join(dir, 'data'));
  fs.mkdirSync(path.join(dir, 'uploads'));
  fs.copyFileSync(path.join(ROOT, 'data/portfolio.json'), path.join(dir, 'data/portfolio.json'));
  const proc = spawn(process.execPath, [path.join(ROOT, 'node_modules/tsx/dist/cli.mjs'), path.join(ROOT, 'server/index.ts')], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(port),
      PORTFOLIO_DATA_DIR: path.join(dir, 'data'),
      PORTFOLIO_UPLOADS_DIR: path.join(dir, 'uploads'),
      JWT_SECRET: 'test-secret-'.padEnd(48, 'x'),
      ADMIN_USERNAME: '',
      ADMIN_PASSWORD_HASH: '',
      VERCEL: '',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${base}/api/auth/status`);
      if (r.ok) return { proc, dir };
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  proc.kill();
  throw new Error(`server on ${port} did not start`);
}

const stop = ({ proc, dir }: { proc: ChildProcess; dir: string }) => {
  proc.kill();
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* windows may hold the dir briefly */
  }
};

async function api(base: string, method: string, p: string, body?: unknown, token?: string, raw?: string, headers: Record<string, string> = {}) {
  const res = await fetch(base + p, {
    method,
    headers: {
      ...(body !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  let json: any = null;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json, headers: res.headers };
}

async function main() {
  /* ---------------- Unit checks (no server) ---------------- */
  console.log('\nUnit: IP / URL / HTML helpers');
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '0.0.0.0', '100.64.0.1', '::1', '::', 'fe80::1', 'fd00::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1']) {
    check(`private address blocked: ${ip}`, !isPublicIp(ip));
  }
  for (const ip of ['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111']) check(`public address allowed: ${ip}`, isPublicIp(ip));
  for (const u of ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'javascript%3Aalert(1)', 'javascript%253Aalert(1)', '&#106;avascript:alert(1)', 'data:text/html,<script>', 'vbscript:x']) {
    check(`dangerous URL detected: ${JSON.stringify(u)}`, isDangerousUrl(u));
  }
  for (const u of ['https://github.com/x', 'mailto:a@b.co', '/uploads/a.webp']) check(`safe URL allowed: ${u}`, !isDangerousUrl(u));
  check('escapeHtml neutralises markup', escapeHtml('<img src=x onerror="alert(1)">') === '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');

  console.log('\nUnit: server-side rendering escapes CMS content and hides drafts');
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/portfolio.json'), 'utf8'));
  data.hero.name = '<script>alert("xss")</script>';
  data.hero.shortIntroduction = '"><img src=x onerror=alert(1)>';
  data.projects = [
    { ...data.projects[0], id: 'p1', title: 'Public <b>project</b>', status: 'published', liveDemoUrl: 'javascript:alert(1)' },
    { ...data.projects[0], id: 'p2', title: 'SECRET DRAFT PROJECT', status: 'draft' },
  ];
  const html = renderServerSide(data);
  check('no raw <script> from CMS', !html.includes('<script>alert'));
  check('no raw <img onerror> from CMS', !/<img[^>]*onerror/i.test(html));
  check('escaped title present', html.includes('Public &lt;b&gt;project&lt;/b&gt;'));
  check('javascript: link dropped', !/href="javascript:/i.test(html));
  check('draft project not rendered', !html.includes('SECRET DRAFT PROJECT'));

  console.log('\nUnit: outbound fetch refuses hostnames that resolve to private IPs (DNS rebinding)');
  for (const u of ['http://localhost/', 'http://127.0.0.1:5001/api/portfolio', 'http://localtest.me/', 'http://169.254.169.254/latest/meta-data/']) {
    let blocked = false;
    try {
      await safeFetchText(u, { timeoutMs: 3000 });
    } catch {
      blocked = true;
    }
    check(`blocked: ${u}`, blocked);
  }

  /* ---------------- Dev-mode server ---------------- */
  console.log('\nServer (local dev mode)');
  const dev = await startServer(5911, { NODE_ENV: 'development' });
  const B = 'http://127.0.0.1:5911';
  try {
    // Security headers
    const h = (await api(B, 'GET', '/api/portfolio')).headers;
    check('CSP header set', !!h.get('content-security-policy'));
    check('X-Frame-Options DENY', h.get('x-frame-options') === 'DENY');
    check('nosniff header', h.get('x-content-type-options') === 'nosniff');
    check('HSTS header', !!h.get('strict-transport-security'));
    check('no X-Powered-By', !h.get('x-powered-by'));

    // Public data leakage
    const pub = (await api(B, 'GET', '/api/portfolio')).json;
    check('public API hides contact messages', pub.contactMessages === undefined);
    check('public API hides media registry', pub.media === undefined);

    // CORS
    const cors = await api(B, 'GET', '/api/portfolio', undefined, undefined, undefined, { Origin: 'https://evil.example' });
    check('foreign origin rejected by CORS', cors.status === 403);

    // Setup weak password / injection in username
    let r = await api(B, 'POST', '/api/auth/setup-admin', { username: 'admin', email: 'a@b.co', password: 'short', confirmPassword: 'short' });
    check('weak password rejected at setup', r.status === 400);
    r = await api(B, 'POST', '/api/auth/setup-admin', { username: '<script>', email: 'a@b.co', password: 'a-very-long-pass-123', confirmPassword: 'a-very-long-pass-123' });
    check('markup in username rejected', r.status === 400);
    r = await api(B, 'POST', '/api/auth/setup-admin', { username: { $ne: null }, email: 'a@b.co', password: 'a-very-long-pass-123', confirmPassword: 'a-very-long-pass-123' });
    check('object (NoSQL-style) username rejected', r.status === 400);

    r = await api(B, 'POST', '/api/auth/setup-admin', { username: 'tester', email: 'tester@example.com', password: 'correct-horse-battery', confirmPassword: 'correct-horse-battery' });
    check('legit first-run setup works in dev', r.status === 200 && !!r.json.token);
    const token: string = r.json.token;
    r = await api(B, 'POST', '/api/auth/setup-admin', { username: 'attacker', email: 'x@example.com', password: 'attacker-password-1', confirmPassword: 'attacker-password-1' });
    check('second setup (takeover) refused', r.status === 400);

    // Login
    r = await api(B, 'POST', '/api/auth/login', { username: 'tester', password: 'wrong-password-123' });
    check('wrong password -> 401', r.status === 401);
    r = await api(B, 'POST', '/api/auth/login', { username: { $gt: '' }, password: { $gt: '' } });
    check('operator-injection login rejected', r.status === 400);
    r = await api(B, 'POST', '/api/auth/login', { username: "tester' OR '1'='1", password: "' OR '1'='1" });
    check('SQL-injection-style login rejected', r.status === 401);
    r = await api(B, 'POST', '/api/auth/login', { username: 'tester', password: 'correct-horse-battery' });
    check('correct login works', r.status === 200 && !!r.json.token);

    // Token forgery
    const forgedNone = Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url') + '.' + Buffer.from('{"id":"x","username":"tester"}').toString('base64url') + '.';
    check('alg=none token rejected', (await api(B, 'GET', '/api/portfolio/admin', undefined, forgedNone)).status === 401);
    const wrongKey = jwt.sign({ id: 'x', username: 'tester', email: '' }, 'not-the-secret');
    check('token signed with wrong key rejected', (await api(B, 'GET', '/api/portfolio/admin', undefined, wrongKey)).status === 401);
    check('no token -> 401 on admin data', (await api(B, 'GET', '/api/portfolio/admin')).status === 401);
    check('no token -> 401 on contact messages', (await api(B, 'GET', '/api/contact-messages')).status === 401);
    check('no token -> 401 on CMS save', (await api(B, 'PUT', '/api/portfolio/hero', { name: 'pwned' })).status === 401);
    check('no token -> 401 on reset', (await api(B, 'POST', '/api/portfolio/reset')).status === 401);

    // Contact form
    r = await api(B, 'POST', '/api/contact', { name: '<script>alert(1)</script>Eve', email: 'eve@example.com', message: '<img src=x onerror=alert(1)>hi' });
    check('contact accepts and does not echo data', r.status === 200 && r.json.item === undefined);
    const msgs = (await api(B, 'GET', '/api/contact-messages', undefined, token)).json;
    const stored = msgs.find((m: any) => m.email === 'eve@example.com');
    check('stored contact message has no markup', stored && !/[<>]/.test(stored.name + stored.message), JSON.stringify(stored));
    r = await api(B, 'POST', '/api/contact', { name: ['a'], email: 'a@b.co', message: { x: 1 } });
    check('non-string contact fields rejected', r.status === 400);
    r = await api(B, 'POST', '/api/contact', { name: 'A', email: 'not-an-email', message: 'hi' });
    check('invalid email rejected', r.status === 400);
    r = await api(B, 'POST', '/api/contact', { name: 'A', email: 'a@b.co', message: 'x'.repeat(3001) });
    check('oversized message rejected', r.status === 400);
    r = await api(B, 'POST', '/api/contact', undefined, undefined, '{"name": "a", ');
    check('malformed JSON -> 400 (not 500)', r.status === 400);
    r = await api(B, 'POST', '/api/contact', undefined, undefined, JSON.stringify({ name: 'a', email: 'a@b.co', message: 'y'.repeat(70_000) }));
    check('64kb+ public body -> 413', r.status === 413);
    r = await api(B, 'POST', '/api/contact', { name: 'Bot', email: 'bot@spam.co', message: 'buy now', website: 'http://spam' });
    const afterBot = (await api(B, 'GET', '/api/contact-messages', undefined, token)).json;
    check('honeypot submission silently dropped', r.status === 200 && !afterBot.some((m: any) => m.email === 'bot@spam.co'));

    // CMS write validation
    const hero = pub.hero;
    r = await api(B, 'PUT', '/api/portfolio/hero', { ...hero, secondaryButtonLink: 'javascript:alert(document.cookie)' }, token);
    check('javascript: URL in hero rejected', r.status === 400);
    r = await api(B, 'PUT', '/api/portfolio/projects', [{ id: 'p', title: 't', galleryImages: ['data:text/html,<script>alert(1)</script>'] }], token);
    check('data: URL nested in array rejected', r.status === 400);
    r = await api(B, 'PUT', '/api/portfolio/socialLinks', [{ id: 's', url: 'java%2573cript:alert(1)' }], token);
    check('double-encoded javascript: rejected', r.status === 400);
    r = await api(B, 'PUT', '/api/portfolio/socialLinks', [{ id: 's', url: '&#x6A;avascript:alert(1)' }], token);
    check('entity-encoded javascript: rejected', r.status === 400);
    r = await api(B, 'PUT', '/api/portfolio/projects', { not: 'an array' }, token);
    check('wrong section type rejected', r.status === 400);
    r = await api(B, 'PUT', '/api/portfolio/__proto__', { polluted: true }, token);
    check('__proto__ section rejected', r.status === 400);
    r = await api(B, 'PUT', '/api/portfolio/constructor', {}, token);
    check('constructor section rejected', r.status === 400);
    r = await api(B, 'PUT', '/api/portfolio/hero', undefined, token, `{"__proto__":{"isAdmin":true},"name":"Mansoor Ahmed Rind","title":"x"}`);
    const heroAfter = (await api(B, 'GET', '/api/portfolio/admin', undefined, token)).json.hero;
    check('__proto__ key stripped from saved data', r.status === 200 && !Object.prototype.hasOwnProperty.call(heroAfter, '__proto__') && (heroAfter as any).isAdmin === undefined);
    r = await api(B, 'PUT', '/api/portfolio', { hero: heroAfter, evilKey: 'x', adminOverride: { role: 'root' } }, token);
    const full = (await api(B, 'GET', '/api/portfolio/admin', undefined, token)).json;
    check('full save drops unknown keys (mass assignment)', r.status === 200 && full.evilKey === undefined && full.adminOverride === undefined);

    // Link preview SSRF
    check('link-preview needs login', (await api(B, 'GET', '/api/link-preview?url=https://example.com')).status === 401);
    for (const u of [
      'http://127.0.0.1:5911/api/contact-messages',
      'http://localhost:5911/',
      'http://[::1]/',
      'http://[::ffff:127.0.0.1]/',
      'http://169.254.169.254/latest/meta-data/',
      'http://2130706433/',
      'http://0x7f.0.0.1/',
      'http://10.0.0.1/',
      'http://user:pass@example.com/',
      'http://example.com:22/',
      'file:///etc/passwd',
      'gopher://127.0.0.1:6379/_FLUSHALL',
    ]) {
      const s = (await api(B, 'GET', `/api/link-preview?url=${encodeURIComponent(u)}`, undefined, token)).status;
      check(`SSRF blocked: ${u}`, s === 403 || s === 400, `(status ${s})`);
    }

    // Uploads
    const up = async (name: string, type: string, bytes: Buffer) => {
      const fd = new FormData();
      fd.append('file', new Blob([bytes], { type }), name);
      const res = await fetch(B + '/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      return res.status;
    };
    const pngBytes = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
    check('upload without login refused', (await fetch(B + '/api/upload', { method: 'POST' })).status === 401);
    check('HTML disguised as .png refused (magic bytes)', (await up('x.png', 'image/png', Buffer.from('<html><script>alert(1)</script>'))) === 400);
    check('SVG upload refused', (await up('x.svg', 'image/svg+xml', Buffer.from('<svg onload="alert(1)"/>'))) === 400);
    check('double extension .php.png refused', (await up('shell.php.png', 'image/png', pngBytes)) === 400);
    check('MIME/extension mismatch refused', (await up('x.png', 'application/pdf', pngBytes)) === 400);
    check('real PNG accepted', (await up('ok.png', 'image/png', pngBytes)) === 200);

    // Path traversal on static uploads
    for (const p of ['/uploads/..%2f..%2fdata%2fportfolio.json', '/uploads/%2e%2e/%2e%2e/package.json', '/uploads/../server/index.ts']) {
      const res = await fetch(B + p);
      const body = await res.text();
      check(`traversal blocked: ${p}`, res.status >= 400 && !body.includes('"contactMessages"') && !body.includes('"dependencies"'), `(status ${res.status})`);
    }
  } finally {
    stop(dev);
  }

  /* ---------------- Production-mode server, no admin configured ---------------- */
  console.log('\nServer (production mode, no admin configured — the live-site situation)');
  const prod = await startServer(5912, { NODE_ENV: 'production', ALLOW_DEV_FALLBACK: 'true' });
  const P = 'http://127.0.0.1:5912';
  try {
    const st = (await api(P, 'GET', '/api/auth/status')).json;
    check('status reports setup NOT allowed', st.setupAllowed === false);
    const r = await api(P, 'POST', '/api/auth/setup-admin', { username: 'attacker', email: 'x@example.com', password: 'attacker-password-1', confirmPassword: 'attacker-password-1' });
    check('anonymous admin takeover refused (403)', r.status === 403);
    const dflt = await api(P, 'POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
    check('ALLOW_DEV_FALLBACK ignored in production (no admin/admin123)', dflt.status !== 200);
  } finally {
    stop(prod);
  }

  /* ---------------- Production-mode server with env admin ---------------- */
  console.log('\nServer (production mode, admin from environment variables)');
  const hash = bcrypt.hashSync('env-admin-password-42', 10);
  const envSrv = await startServer(5913, { NODE_ENV: 'production', ADMIN_USERNAME: 'mansoor', ADMIN_PASSWORD_HASH: hash });
  const E = 'http://127.0.0.1:5913';
  try {
    const ok = await api(E, 'POST', '/api/auth/login', { username: 'mansoor', password: 'env-admin-password-42' });
    check('env admin can log in', ok.status === 200 && !!ok.json.token);
    const bad = await api(E, 'POST', '/api/auth/login', { username: 'mansoor', password: 'nope-nope-nope' });
    check('env admin wrong password -> 401', bad.status === 401);
    const setup = await api(E, 'POST', '/api/auth/setup-admin', { username: 'attacker', email: 'x@example.com', password: 'attacker-password-1', confirmPassword: 'attacker-password-1' });
    check('setup refused when env admin exists', setup.status === 400 || setup.status === 403);
  } finally {
    stop(envSrv);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) {
    console.log('\nFailures:\n - ' + failures.join('\n - '));
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
