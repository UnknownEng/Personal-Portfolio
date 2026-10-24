# Technical Architecture — Antigracity

## 1. System Overview
Antigracity is designed as a hybrid full-stack web application combining a lightning-fast React 19 client with an Express-based Node.js backend capable of server-side rendering (SSR), API delivery, secure data persistence, and fine-grained HTTP cache control.

```
                    +------------------------------------+
                    |        Client / Crawler            |
                    | (Googlebot, Mobile, Desktop Web)  |
                    +-----------------+------------------+
                                      |
                           HTTPS / HTTP/2 Requests
                                      v
                    +------------------------------------+
                    |       Edge Proxy / Reverse Proxy   |
                    |  (Vercel Edge / Node.js Express)   |
                    +-----------------+------------------+
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v (Web Page Requests: GET /)                              v (API & Assets)
+------------------------------------+             +------------------------------------+
|        Express SSR Engine          |             |       Express Static & API         |
|  - Renders React to string         |             |  - Rate Limiting & Helmet Security |
|  - Injects Metadata, Schema.org    |             |  - /api/portfolio CRUD             |
|  - Emits Proper HTTP Status (200/404)|           |  - WebP / AVIF Asset Delivery      |
+-----------------+------------------+             +-----------------+------------------+
                  |                                                  |
                  +---------------------------+----------------------+
                                              |
                                              v
                              +--------------------------------+
                              |         Data Layer             |
                              | - data/portfolio.json          |
                              | - Structured Initial Seed      |
                              +--------------------------------+
```

---

## 2. Server-Side Rendering (SSR) & SEO Pipeline

### 2.1 Server-Side Rendering Engine
To satisfy technical SEO requirements and eliminate JavaScript-dependent crawling barriers, the server renders the React component tree using `renderToString` into the HTML template:
- Search engines receive fully-hydrated markup immediately upon initial response.
- Hero content, headings, project descriptions, research publications, and metadata are rendered in the raw response body.
- Fallback client-side hydration seamlessly attaches event listeners via `hydrateRoot` in `src/main.tsx`.

### 2.2 Dynamic Metadata & Schema Pipeline
Every page request injects structured data:
- **Canonical Tags:** Self-referential canonical URL matching `https://antigracity.vercel.app/` or canonical custom domain.
- **Heading Hierarchy:** Strict document outline starting with exactly one semantic `<h1>`.
- **JSON-LD Structured Data:**
  - `Person` & `WebSite` schemas.
  - `BreadcrumbList` schema showing the user's navigational path.
  - `FAQPage` schema addressing high-intent recruiter/client questions.
- **OpenGraph & Twitter Card:** Exact image dimensions, titles, descriptions, and crawler hints.

### 2.3 Status Code Handling
- Real 404 responses return HTTP status code `404` directly from Express with the custom 404 UI.
- No soft 404s (where a missing page returns HTTP 200 with error text).

---

## 3. Frontend Architecture

### 3.1 Technology Stack
- **Framework:** React 19 (`react`, `react-dom`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, modern CSS variables)
- **Icons:** `lucide-react`
- **Animations:** Framer Motion (`framer-motion`) with strict reduced-motion queries and zero cumulative layout shift.
- **Build Tool:** Vite 6 / Vite 8 with ESBuild / Rollup tree-shaking.

### 3.2 State Management
- `PortfolioContext`: Supplies live CMS content, theme preferences, and form dispatch actions.
- `AuthContext`: Manages JWT admin sessions, login credentials, and session expiry without polluting public bundles.

### 3.3 Responsive & Mobile Strategy
- Viewport containment: `html, body { overflow-x: hidden; width: 100%; max-width: 100vw; }`.
- Fluid typography using CSS `clamp()` and responsive Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
- Mobile navigation: Full-screen or sliding drawer with touch dismissal, lock-scroll when open, and keyboard ESC handling.

---

## 4. Performance & Asset Delivery Architecture

### 4.1 Modern Image Pipeline
- Conversion of source images (PNG, JPG) to next-generation **WebP** and **AVIF** formats.
- Explicit `width` and `height` dimensions on all image tags to prevent Cumulative Layout Shift (CLS).
- Native `loading="lazy"` on below-the-fold media; `fetchpriority="high"` and `loading="eager"` on LCP hero assets.

### 4.2 Caching & Compression
- Gzip & Brotli text compression on all static assets (`.js`, `.css`, `.html`, `.svg`).
- Long-term cache headers (`Cache-Control: public, max-age=31536000, immutable`) on versioned hashed bundles.
- Stale-while-revalidate policies on API payloads.

---

## 5. Security & Edge Configuration
- **Helmet Middleware:** Enterprise Content Security Policy (CSP), HSTS (63072000s, preload), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`).
- **Rate Limiting:** IP-based sliding window rate limits on contact form submissions and authentication attempts.
- **Input Sanitization & Safe URLs:** RFC-compliant URL validation (`sanitizeUrl`, `isSafeUrl`) for all links and media protocols.
