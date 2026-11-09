/**
 * Post-build step: publish the admin CMS only at a secret path.
 *
 * Vite builds the admin as dist/admin.html. This moves it to dist/<ADMIN_PATH>/index.html,
 * so it is served at https://<site>/<ADMIN_PATH>/ and nowhere else. ADMIN_PATH lives in
 * the hosting environment (Vercel env vars), never in the repo, and the public bundle never
 * references it. If ADMIN_PATH is missing or weak, the admin is simply not published.
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const built = path.join(dist, 'admin.html');
const slug = (process.env.ADMIN_PATH || '').trim().replace(/^\/+|\/+$/g, '');

if (!fs.existsSync(built)) {
  console.log('[place-admin] no dist/admin.html found; nothing to do');
  process.exit(0);
}

if (!/^[a-z0-9][a-z0-9-]{11,63}$/.test(slug) || /admin|login|cms|dashboard|panel/.test(slug)) {
  fs.rmSync(built);
  console.log('[place-admin] ADMIN_PATH not set (or guessable): admin panel NOT published in this build.');
  console.log('[place-admin] Set ADMIN_PATH to 12-64 random lowercase letters/digits/dashes to publish it.');
  process.exit(0);
}

const target = path.join(dist, slug);
fs.mkdirSync(target, { recursive: true });
fs.renameSync(built, path.join(target, 'index.html'));
console.log('[place-admin] admin panel published at the secret path (value hidden).');
