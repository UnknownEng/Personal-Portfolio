# Architecture

## Overview

```
Browser ──► Vercel
             ├── static files (dist/): public site, CV.pdf, robots.txt, sitemap.xml
             ├── /<ADMIN_PATH>/  admin CMS page (only when ADMIN_PATH is set at build time)
             └── /api/*, /uploads/*  ──► api/index.ts ──► Express app (server/index.ts)
                                                            └── JSON store (data/portfolio.json → /tmp on Vercel)
```

Every other path is rewritten to `index.html`, where the client shows the 404 page.

## Frontend

- **Two entries** built by Vite: `index.html` → `src/main.tsx` → `App.tsx` (public site) and `admin.html` → `src/admin-main.tsx` → `AdminApp.tsx` (CMS). They share no entry chunk, so the public bundle contains no admin screens or login code.
- **State:** `PortfolioContext` loads content from `GET /api/portfolio`. `authCore.ts` holds the shared signed-out auth state; the real `AuthProvider` (login, setup, password change) is only used by the admin.
- **Styling:** public site uses `src/styles/site.css` (see DESIGN.md); the admin uses Tailwind v4 and `src/index.css`.

## Backend

- Express 5 with Helmet (CSP, HSTS, frame denial), CORS allow-list, per-route rate limits, 64 KB body limit for public routes and 5 MB only after auth for CMS saves.
- **Data:** a JSON file written atomically. On Vercel the filesystem is per-instance and temporary, so runtime edits and contact messages are not durable there; content changes ship through git.
- **Auth:** bcrypt (cost 12) + HS256 JWT with a token version for revocation. In production the admin comes from `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`; online first-run setup is disabled.
- **Validation:** CMS saves are checked for shape, unknown keys are dropped, and any URL-like field using `javascript:`, `data:` and similar schemes is rejected (including encoded forms). Contact form fields are type- and length-checked, with a honeypot.
- **Uploads:** extension, MIME type and magic bytes must agree; SVG and double extensions are refused; files are served with a sandboxing CSP.
- **Link preview:** admin-only; fetches go through `safeFetchText`, which re-checks every redirect and refuses to connect to private or local addresses.
- **SSR (self-hosted only):** `server/ssr.ts` renders escaped, published-only HTML for crawlers before React takes over.

## Build

`npm run build` = `tsc` → `vite build` → `scripts/place-admin.mjs` (moves the admin to `dist/<ADMIN_PATH>/` or removes it) → copies `uploads/`.

## Tests

`npm run test:security` starts throwaway servers on a temporary copy of the data and runs 105 attack checks against them.
