# Coding Rules & Engineering Standards — Portfolio

## 1. Core Principles
1. **Never Compromise Web Performance:** Keep JavaScript bundles lean. All assets must respect the sub-2s performance budget.
2. **Strict Semantic HTML:** Use `<header>`, `<main>`, `<nav>`, `<article>`, `<section>`, `<aside>`, and `<footer>` appropriately.
3. **Flawless Mobile Optimization:** Every feature must be built mobile-first. No horizontal scrolling (`overflow-x`) is tolerated under any condition.
4. **Accessible by Default (WCAG 2.1 AA):**
   - Interactive targets must be at least `48x48px` (or `44x44px` with padding).
   - High color contrast ratio (minimum 4.5:1 for normal text, 3:1 for large text).
   - All images must have meaningful, context-aware `alt` text. Decorative images must have `alt=""` and `aria-hidden="true"`.
   - Focus states must be distinct and keyboard-navigable.

---

## 2. Technical SEO Rules
1. **Single H1 Rule:** Each navigable route or page must render exactly one `<h1>` tag denoting the primary entity or title. All sub-sections must use `<h2>`, `<h3>`, etc. in strict descending order.
2. **Canonical Enforcement:** Every page must include an absolute canonical tag: `<link rel="canonical" href="..." />`.
3. **Robots & Indexing Directives:**
   - Public pages: `<meta name="robots" content="index, follow" />`.
   - Private / Admin / Internal views: `<meta name="robots" content="noindex, nofollow" />`.
   - `robots.txt` must unblock Googlebot and other major crawlers for public routes and specify the exact `sitemap.xml` URL.
4. **Structured Data:** Use valid Schema.org JSON-LD scripts without validation warnings in Google Rich Results.
5. **No Soft 404s:** Routes that do not exist must return genuine HTTP `404 Not Found` response headers.

---

## 3. UI/UX Rules
1. **Links & Buttons Distinction:**
   - Use `<button>` for actions (toggles, modal opens, form submissions).
   - Use `<a>` for navigational hops and page transitions.
   - All email addresses must be wrapped in `href="mailto:..."`.
   - All phone numbers must be wrapped in `href="tel:..."`.
   - Logos in headers and footers must be clickable and navigate to the home route.
2. **Form Interaction & Feedback:**
   - Every input must have an associated visible `<label>` or explicit `aria-label`.
   - All asynchronous submissions must display clear loading states, success messages upon resolution, and actionable error messages upon failure.
3. **No Unused or Broken UI:**
   - No placeholder or "Lorem ipsum" copy.
   - No broken buttons or inert click handlers.
   - No dead links or 404 targets in navigation or footers.

---

## 4. TypeScript & Code Quality
1. **Strict Types:** Do not use `any` unless interfacing with an untyped external library. Write explicit interfaces for all component props and API responses.
2. **Clean Components:** Keep components focused and modular (< 250 lines when feasible). Extract reusable UI elements into `src/components/ui/`.
3. **No Hardcoded Dates:** Always use dynamic date functions (e.g. `new Date().getFullYear()`) for copyright years and active timestamps.
