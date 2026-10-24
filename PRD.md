# Product Requirements Document (PRD) — Antigracity

## 1. Project Overview & Vision
**Project Name:** Antigracity  
**Role:** Flagship Web Application & Autonomous Systems / Aerospace Portfolio  
**Objective:** Deliver an ultra-high-performance, server-rendered, mobile-first, and SEO-dominant web platform showcasing autonomous UAV swarms, flight control engineering, robotics research, and engineering innovations.  
**Quality Target:** Flawless technical SEO, sub-2-second load times, 100/100 Core Web Vitals, zero layout shifts, zero broken links, and full WCAG 2.1 AA accessibility compliance.

---

## 2. Target Audience & User Personas
1. **Robotics & Aerospace Industry Recruiters / Hiring Managers:** Need immediate, fast-loading, mobile-friendly access to verifiable projects, technical papers, CV downloads, and interactive demonstrations.
2. **Academic & Research Collaborators:** Require clean navigation, structured citation/paper metadata, research overviews, and direct contact avenues.
3. **Search Engine Crawlers (Googlebot, Bingbot):** Need clean server-rendered HTML, valid semantic schemas (Person, WebSite, Breadcrumbs, FAQ), explicit canonical tags, XML sitemaps, and crawlable site topology with no redirect chains or orphan pages.

---

## 3. Scope of Requirements

### 3.1 Documentation & Governance (Part 1)
- Maintain 6 synchronized foundational documents:
  - `PRD.md`: Functional and non-functional specifications.
  - `ARCHITECTURE.md`: Server, client, and SEO pipeline designs.
  - `RULES.md`: Zero-tolerance engineering and coding guidelines.
  - `DESIGN.md`: Comprehensive design system tokens and mobile guidelines.
  - `TASKS.md`: Granular checklist tracking all fixes and milestones.
  - `MEMORY.md`: Persistent engineering decisions and workspace state.

### 3.2 UI/UX and Functional Fixes (Part 2 — Exactly 20 Fixes)
1. **Remove Horizontal Scrolling:** Eliminate `overflow-x` across all viewports (320px to 4K), constraining wide codeblocks, matrices, and absolute containers.
2. **Find Broken Links:** Audit all internal and external anchors (`href`), social profiles, paper links, and media resources.
3. **Add a Mobile Menu:** Implement an accessible, animated mobile drawer navigation with focus trapping, backdrop blur, and smooth section scrolling.
4. **Add a Favicon:** Replace default Vite SVG with bespoke, multi-resolution Antigracity icons (SVG, 32x32 PNG, 180x180 Apple Touch Icon, and web manifest).
5. **Fix Page Titles:** Dynamic, keyword-rich `<title>` tags tailored to each view and section under 60 characters.
6. **Add Meta Descriptions:** High-CTR, informative meta descriptions under 155 characters per route.
7. **Fix Footer Links:** Ensure all footer links (socials, policy, back-to-top, contact) are active, secure, and keyboard accessible.
8. **Add a Custom 404 Page:** Develop an interactive, cyberpunk-styled 404 error page returning proper HTTP 404 status with navigation back to safety.
9. **Fix the Copyright Year:** Dynamically compute the current year (`new Date().getFullYear()`) to eliminate stale copyright dates.
10. **Compress Images:** Compress all raster media assets without visual degradation to optimize bandwidth.
11. **Fix Broken Buttons:** Audit all interactive `<button>` elements, ensuring active event handlers, accessibility roles, and visual feedback.
12. **Add Success Message:** Provide visible, persistent, and accessible feedback upon successful form submission or action completion.
13. **Add Error Messages:** Clear, inline and toast-level validation error messages for failed submissions or network faults.
14. **Remove Placeholder Text:** Purge generic "Lorem ipsum", placeholder labels, or dummy copy from all components.
15. **Remove Unused Navigation:** Audit navigation headers and remove non-existent, duplicate, or disabled destination routes.
16. **Fix Mobile Overflow:** Resolve flexbox/grid blowout, unconstrained preformatted tags, and fixed-width containers on mobile screens.
17. **Make the Logo Clickable:** Ensure header logo/brand mark links back to root `#home` / `/` with full accessibility.
18. **Make the Phone Number Clickable:** Format all telephone representations with `tel:+...` RFC 3966 standards.
19. **Make the Email Clickable:** Provide `mailto:` anchors with pre-populated subjects and sanitized protocols.
20. **Make Every Page Mobile Optimized:** Fully responsive typography, touch targets (>= 48px), and adaptive layouts for all viewports.

### 3.3 Comprehensive Technical SEO & Performance (Part 3)
1. **Render Server-Side (SSR):** Implement server-side rendering / pre-rendering so search bots receive fully populated HTML without client JS execution.
2. **Submit to Search Console:** Format project for instant Google Search Console and Bing Webmaster submission with verification hooks.
3. **Check & Implement Noindex Tags Properly:** Keep indexing enabled on public routes while applying `noindex, nofollow` to private/admin routes (`/admin`, API endpoints).
4. **Add Canonical Tags:** Enforce self-referential, absolute canonical URLs (`rel="canonical"`) to prevent duplicate content penalties.
5. **Ensure Exactly One H1 Per Page:** Enforce strict semantic heading hierarchy with a single `<h1>` representing primary document topic.
6. **Implement Breadcrumbs:** Add visible and Schema.org `BreadcrumbList` structured data for hierarchal indexing.
7. **Add Alt Text on Images:** Comprehensive, descriptive, context-specific `alt` attributes on all `<img>` tags.
8. **Fix Layout Shift (CLS):** Reserve explicit width/height or aspect ratios on media, icons, and hero typography to achieve CLS < 0.05.
9. **Generate sitemap.xml:** Automated, dynamically validated `sitemap.xml` with priority, change frequency, and lastmod timestamps.
10. **Unblock Googlebot:** Ensure `robots.txt` explicitly permits `Googlebot`, `bingbot`, and major crawlers while disallowing private directories.
11. **Remove All Redirect Chains:** Direct 1:1 status 200 or 301 paths without multi-hop hops.
12. **Handle 404s Properly for Search Engines:** Ensure non-existent URLs return true HTTP 404 Not Found status headers, preventing soft-404 indexing.
13. **Write SEO-Optimized Meta Descriptions:** Contextual, intent-targeted meta descriptions integrating primary target keywords.
14. **Add FAQ Schema:** Structured data schema (`FAQPage` JSON-LD) for technical and hiring inquiries.
15. **Link Orphan Pages to the Main Site Structure:** Ensure zero unreachable pages; all sub-routes, policies, or project details must be discoverable via crawls.
16. **Convert Images -> WebP / AVIF Format:** Modern image pipeline converting legacy PNG/JPG into lightweight modern formats.
17. **Ensure Site Loads Under 2s:** Performance budget enforcing LCP < 1.8s, TBT < 150ms, FCP < 1.0s, and total page weight < 1.5MB.

---

## 4. Success Metrics & Quality Gates
- **Google Lighthouse Score:** >= 95 in Performance, 100 in Accessibility, 100 in Best Practices, 100 in SEO.
- **Core Web Vitals:** LCP <= 1.8s, CLS <= 0.05, INP <= 150ms.
- **Mobile Usability:** 100% pass on Google Mobile-Friendly audit.
- **W3C Validation:** Clean HTML5 and CSS semantic compliance.
