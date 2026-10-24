# Design System & UI Guidelines — Mansoor Ahmed Rind Portfolio

## 1. Brand Identity & Visual Language
**Brand Concept:** Mansoor Ahmed Rind (UnknownEng) — Autonomous Flight, Swarm Robotics, Aerodynamics, and Future Engineering. Made by Maverick Tech Ventures.  
**Aesthetic:** Deep aerospace dark mode with luminous cyan/sky accents, frosted glass cards (glassmorphism), refined micro-interactions, and crisp high-contrast typography.

---

## 2. Color Palette & Tokens

### 2.1 Dark Mode (Default)
- **Deep Void Background:** `#080B12` (Base Canvas)
- **Surface Elevation 1:** `#0F172A` / `#0D1322` (Card / Section Backgrounds)
- **Surface Elevation 2:** `rgba(15, 23, 42, 0.75)` with `backdrop-blur-xl` (Floating Nav & Modals)
- **Border Subtle:** `rgba(255, 255, 255, 0.08)` / `#1E293B`
- **Border Highlight:** `rgba(56, 189, 248, 0.3)` (Sky Glow)

### 2.2 Accent & Semantic Colors
- **Primary Accent:** `#38BDF8` (Sky 400) / `#0284C7` (Sky 600)
- **Secondary Telemetry Accent:** `#22D3EE` (Cyan 400) / `#06B6D4` (Cyan 500)
- **Success:** `#10B981` (Emerald 500) / `#059669` (Emerald 600)
- **Warning:** `#F59E0B` (Amber 500)
- **Error / Danger:** `#F43F5E` (Rose 500) / `#E11D48` (Rose 600)

### 2.3 Typography
- **Headings & Brand:** `Montserrat`, -apple-system, sans-serif (Weights: 600, 700, 800)
- **Body & Copy:** `Inter`, `Montserrat`, system-ui, sans-serif (Weights: 400, 500)
- **Telemetry & Technical Specs:** `JetBrains Mono`, monospace (Weights: 400, 500, 600)

---

## 3. Component Guidelines

### 3.1 Header & Navigation
- **Desktop:** Floating frosted-glass navigation bar centered horizontally, anchored to top with 16px margin.
- **Mobile:**
  - Compact header with accessible logo and hamburger trigger button.
  - Full-screen or slide-in mobile menu drawer with large touch targets (min 48px height).
  - Background overlay with smooth fade-in and backdrop-blur.
  - Active section indicators and language switchers built into the drawer.

### 3.2 Hero Section
- Dynamic typing title with fixed minimum width to prevent line wrapping jumps.
- Clear action buttons: Download CV, Explore Work, and Contact.
- Social links with accessible icons and hover state glow.

### 3.3 Cards & Project Showcases
- Card corners: `rounded-2xl` or `rounded-xl`.
- Subtle border highlights on hover (`hover:border-sky-500/50`).
- Responsive multi-column grid: 1 column on mobile (`< 640px`), 2 columns on tablet (`640px - 1024px`), 3 columns on desktop (`> 1024px`).

### 3.4 Buttons & Interactive Elements
- Primary Button: `bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-sky-500/20 active:scale-95`.
- Secondary Button: `bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-5 py-2.5 rounded-xl transition`.
- Minimum tap target: 48x48px on mobile devices.

### 3.5 Forms & Feedback
- Floating or clear top-aligned labels.
- Input focus rings: `focus:ring-2 focus:ring-sky-500 focus:outline-none`.
- Instant inline feedback on validation errors.
- Persistent success toast / banner upon submission.

### 3.6 404 Error Page
- Styled to match the aerospace HUD aesthetic.
- Prominent `404` status with clear explanatory text: "Flight Path Not Found / Coordinate Deviation".
- Instant primary action: "Return to Home Radar" linking directly to `/`.
