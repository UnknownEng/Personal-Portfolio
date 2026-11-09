# Mansoor Ahmed Rind — Portfolio

Personal portfolio of Mansoor Ahmed Rind (UAV autonomy and robotics, NUST), with a private CMS for editing content.

Live: https://personal-portfolio-swart-sigma-44.vercel.app

## Stack

- **Frontend:** React 19, TypeScript, Vite, plain CSS design system (`src/styles/site.css`), Tailwind v4 for the admin
- **Backend:** Express 5 API with a JSON file store (`data/portfolio.json`), JWT auth, bcrypt, Helmet, rate limiting
- **Hosting:** Vercel (static site + serverless API in `api/index.ts`)

## Run locally

```bash
npm install
npm run dev
```

- Site: http://localhost:5173
- Admin: http://localhost:5173/admin.html (first visit shows a local-only setup form)
- API: http://localhost:5001

Production build and self-hosted server:

```bash
npm run build
npm start
```

## Editing content

Content lives in `data/portfolio.json`. Edit it through the local admin (or by hand), then commit and push; Vercel redeploys in about a minute. Edits made in the admin on Vercel are not permanent, because Vercel's filesystem is temporary.

After large content changes, refresh the bundled fallback copy in `src/data/initialData.ts` so the admin's "reset to defaults" matches.

## Admin panel in production

The admin is a separate page (`admin.html`) that the public site never links to or bundles. It is published only at a secret path:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PATH` | Secret URL segment (12–64 lowercase letters, digits or dashes; must not contain words like "admin"). The admin is served at `/<ADMIN_PATH>/`. Unset means no admin is published. `/admin` is always a 404. |
| `ADMIN_USERNAME` | Admin login name |
| `ADMIN_PASSWORD_HASH` | bcrypt hash from `npm run hash-password` |
| `JWT_SECRET` | Long random string for signing sessions |
| `ADMIN_TOKEN_VERSION` | Optional; bump to sign out every session |

Set them in Vercel → Settings → Environment Variables, then redeploy. Online first-run setup is disabled in production. See `.env.example` for all options.

## Security

- `npm run test:security` runs 105 attack-style checks: admin takeover, injection (HTML/script, URL schemes, NoSQL-style operators), prototype pollution, mass assignment, token forgery, SSRF (including DNS rebinding), malicious uploads and path traversal.
- No SQL database is used, so SQL injection does not apply.
- Server-rendered HTML escapes all CMS content; uploads are checked by extension, MIME type and magic bytes; the link-preview fetcher requires login and blocks private networks.

## Project layout

```text
admin.html                 Admin page entry (moved to the secret path at build time)
index.html                 Public site entry
api/index.ts               Vercel serverless entry for the API
data/portfolio.json        Site content
public/                    CV.pdf, robots.txt, sitemap.xml, favicon
scripts/
  hash-password.ts         Generates ADMIN_PASSWORD_HASH
  place-admin.mjs          Publishes the admin at ADMIN_PATH after the build
server/
  index.ts                 Express app: API routes, security headers, uploads
  auth.ts                  JWT + bcrypt
  security.ts              Escaping, URL checks, SSRF-safe fetch
  ssr.ts                   Server-rendered HTML for crawlers (self-hosted)
  store.ts                 JSON store, env-based admin
src/
  App.tsx                  Public site
  AdminApp.tsx             Admin CMS
  components/public/       Site sections (Hero, Selected work, Experience, ...)
  components/admin/        CMS editors
  styles/site.css          Public design system
tests/security.test.ts     Security test suite
uploads/                   Images (project illustrations in uploads/projects)
```
