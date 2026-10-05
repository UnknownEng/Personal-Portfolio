# Mansoor Ahmed Rind — Engineering Portfolio & Command CMS

> **Modern Engineering + UAV + Robotics + Software Portfolio with a Full-Featured Admin Panel / CMS**  
> Visual Identity: **Aerospace Engineering × Robotics × Software Engineering × Drone Control System**

Designed and built for **Mansoor Ahmed Rind** (Electrical & Electronics Engineering at NUST Islamabad, Gold Medalist, UAV Electronics & Swarm Robotics Specialist).

All content is strictly sourced from Mansoor's verified **CV (`CV.pdf`)** and LinkedIn: `https://www.linkedin.com/in/mansoorahmedrind`. **No jobs, technologies, degrees, or competitions have been invented.**

---

## ⚡ Quick Start

### 1. Start Both Frontend & Backend (Development)

```bash
npm run dev
```

This starts:
* **Backend API Server**: `http://localhost:5001` (Express, Auth, Multer, Persistent JSON Store)
* **Frontend Application**: `http://localhost:5173` (Vite + React + Tailwind with hot-reloading)

### 2. Production Build & Server

```bash
npm run build
npm start
```

The Express server will automatically serve the production build on `http://localhost:5001` with zero configuration needed.

---

## 🔐 Admin Panel / CMS & First-Run Setup

Access the Command Center at:
* **URL**: `http://localhost:5001/admin` (or click **"CMS Admin"** in the header)
* **First-Run Setup Flow**: If no administrator account exists, the application immediately prompts you with a **First-Run Administrator Account Creation** screen.
* Enter your desired username, email, and a secure password.
* The credentials are salted and hashed with `bcryptjs` (salt rounds 10) and stored in `data/admin.json`.
* Subsequent visits present a secure login form authenticated via JSON Web Tokens (JWT).
* *(You can update your password anytime securely via the **Password** button in the CMS topbar).*

---

## 🎨 Color System & Dynamic Theme Customization

The site is styled with **CSS variables / design tokens**, allowing immediate, site-wide color updates directly from the Admin Panel (**Appearance & Themes**):

### 5 Predefined Professional Themes:
1. **Theme 01 — Engineering Cyan** (Default): Deep Graphite (`#080B12`) + Electric Cyan (`#22D3EE`) + Technical Blue (`#3B82F6`)
2. **Theme 02 — Aerospace**: Dark Sky (`#0B0F19`) + Pure White (`#FFFFFF`) + Steel Blue (`#38BDF8`)
3. **Theme 03 — Robotics**: Deep Space (`#0A0915`) + Electric Blue (`#60A5FA`) + Robotics Purple (`#A855F7`)
4. **Theme 04 — Minimal**: Pitch Black (`#000000`) + Pure White + Slate Gray
5. **Theme 05 — Custom**: User-selected color pickers for:
   * Primary Color
   * Secondary Color
   * Background Color
   * Secondary Background Color
   * Card Background Color
   * Primary Text Color
   * Muted Text Color
   * Border Color

*(Changes update the entire website in real-time without reloading).*

---

## 🚁 Interactive Aerospace Schematic & Simulation Blueprint

The hero section features a **clean aerospace engineering CAD schematic** inspired by professional avionics and Ground Control Stations (QGroundControl / MAVLink):
* **Quadcopter CAD Blueprint**: Carbon fiber X-arms, Pixhawk center flight controller, motor hubs with animated CW / CCW rotation vectors.
* **Interactive 3D Tilt**: Schematic reacts with subtle mathematical tilt tracking cursor movement.
* **Explicit Simulation Notice**: All demonstration parameters are explicitly tagged `[SIMULATED] / [DEMO SIMULATION]` to maintain strict engineering integrity without misleading claims.
* **Admin Controls**: Can be toggled on/off anytime via CMS Website Settings or Section Visibility controls.

---

## 📂 Project Architecture

```text
portfolio/
├── CV.pdf                       # Original CV document
├── data/
│   ├── portfolio.json           # Atomic, persistent JSON database
│   └── admin.json               # Hashed admin credentials (Bcrypt)
├── uploads/                     # Uploaded images, diagrams, certificates
├── server/
│   ├── index.ts                 # Express API server & static routes
│   ├── auth.ts                  # JWT authentication & bcrypt hashing
│   ├── store.ts                 # Thread-safe persistent JSON store
│   └── types.ts                 # Server types
├── src/
│   ├── main.tsx                 # React DOM root
│   ├── App.tsx                  # Routing (Public Portfolio <-> Admin CMS)
│   ├── index.css                # CSS variables, tactical grid, Tailwind v4
│   ├── types/
│   │   └── portfolio.ts         # Complete TypeScript interfaces
│   ├── data/
│   │   └── initialData.ts       # 100% verified data directly from CV.pdf
│   ├── context/
│   │   ├── AuthContext.tsx      # Admin auth, tokens, sessions
│   │   └── PortfolioContext.tsx # Persistence, live tokens, CRUD operations
│   ├── components/
│   │   ├── public/              # Public Engineering Portfolio
│   │   │   ├── Header.tsx       # Sticky blurred nav with beacons
│   │   │   ├── Hero.tsx         # Headline, callsign, and drone HUD
│   │   │   ├── DroneVisualization.tsx # Interactive schematic
│   │   │   ├── StatusBanner.tsx # Live metrics from real database counts
│   │   │   ├── About.tsx        # Bio, philosophy, credentials cards
│   │   │   ├── Skills.tsx       # Filterable skills with proficiencies
│   │   │   ├── Projects.tsx     # 9 CV projects with technical modals
│   │   │   ├── Experience.tsx   # 9 CV timeline roles
│   │   │   ├── Competitions.tsx # Teknofest, National Aerothon honors
│   │   │   ├── Education.tsx    # NUST Gold Medalist, UCI, Naples
│   │   │   ├── Contact.tsx      # Verified coordinates & message form
│   │   │   └── Footer.tsx       # Minimal engineering footer
│   │   ├── admin/               # Professional SaaS CMS Command Center
│   │   │   ├── AdminLayout.tsx  # Sidebar, topbar, toast alerts
│   │   │   ├── DashboardHome.tsx# Live metrics & recent inquiries
│   │   │   ├── HeroEditor.tsx   # Headlines, CTAs, telemetry indicators
│   │   │   ├── AboutEditor.tsx  # Bio, philosophy, highlight cards CRUD
│   │   │   ├── SkillsManager.tsx# Full CRUD, categories, proficiencies
│   │   │   ├── ProjectsManager.tsx # Full CRUD, markdown specs, reorder
│   │   │   ├── ExperienceManager.tsx # Full CRUD, timeline, bullet points
│   │   │   ├── EducationManager.tsx # Degrees, coursework, honors CRUD
│   │   │   ├── CertificationsManager.tsx # Licenses, IDs, URLs CRUD
│   │   │   ├── AchievementsManager.tsx # Competitions & awards CRUD
│   │   │   ├── LeadershipManager.tsx # Large-scale operations CRUD
│   │   │   ├── MessagesManager.tsx # Inquiries inbox from contact form
│   │   │   ├── ContactEditor.tsx # Email, phone privacy toggle, coordinates
│   │   │   ├── SocialLinksEditor.tsx # External profile links CRUD
│   │   │   ├── NavigationEditor.tsx # Reorder & edit menu items
│   │   │   ├── VisibilityManager.tsx # Modular section ON/OFF toggles
│   │   │   ├── AppearanceEditor.tsx # 5 themes & fine-grained token pickers
│   │   │   ├── MediaManager.tsx # File upload, preview, delete, copy path
│   │   │   ├── SeoEditor.tsx    # Titles, descriptions, keywords, OG tags
│   │   │   └── SettingsEditor.tsx # Site config, maintenance mode, restore
│   │   └── ui/
│   │       ├── Modal.tsx        # Accessible dialog
│   │       ├── ConfirmDialog.tsx# Destructive delete confirmations
│   │       ├── ColorPicker.tsx  # Hex swatches & sliders
│   │       ├── Icons.tsx        # Clean SVG brand icons
│   │       └── Toast.tsx        # Floating alert notifications
```

---

## 🔒 Security & Persistence Details

* **No Plaintext Passwords**: All administrator passwords are authenticated using `bcryptjs` with salt rounds 10.
* **JWT Protected Endpoints**: All CMS mutation routes (`/api/portfolio/*`, `/api/upload`, `/api/contact-messages/*`) require a valid Bearer token.
* **Atomic JSON Storage**: The backend writes updates to temporary files and utilizes `fs.renameSync` to ensure data integrity during power interrupts or restarts.
* **File Validation**: Multer verifies MIME types (JPEG, PNG, WEBP, GIF, SVG, PDF) and enforces a 10MB per-file limit.
* **Safety Confirmation**: Destructive actions (deleting projects, skills, messages, or resetting defaults) always present a confirmation modal.

---

## 📋 Verified CV Data Included

1. **Academic Excellence**: NUST Bachelor of Engineering in Electrical & Electronics Engineering (2023–2027) — **Gold Medalist**.
2. **International Specializations**:
   * University of California (UCI) — Internet of Things
   * University of Naples Federico II — Autonomous Vehicle Engineering
3. **9 Real Engineering Projects**:
   * Custom Build Ground Control Station for UAV Swarms (MAVLink, PyMAVLink)
   * Autonomous Kamikaze UAVs for Warfare (Vision Guidance, Loitering Munitions)
   * Autonomous Interceptor UAV (High-speed aerial tracking)
   * UAV Orthomosaic Mapping (ROS-based photogrammetry pipeline)
   * GPS-Denied Navigation (Optical flow, velocity-control, EKF)
   * Multi-UAV Swarm Formation (Decentralized radio telemetry)
   * YOLOv8 Road Crack Detection (Edge AI, computer vision)
   * VTOL UAV Prototype (Hybrid transition dynamics)
   * ROS/Gazebo Autonomous Flight (ArduCopter SITL simulation)
4. **9 Real Experience Roles**:
   * Team AeroMavericks — Founder & Team Captain
   * INTELGENCY IT Solutions — Drone Swarm Engineer
   * CSN Lab, SEECS — NUST — Research Student (UAV Autonomy & Swarms)
   * Team Vitesse, Teknofest Turkey — Vice-Captain & Lead Electronics
   * Fiverr — Freelance Robotics & Automation Consultant
   * Aerial Robotics Lab, SINES NUST — Robotics Engineer Intern
   * Precision Newsletters — Web Developer
   * KoreaEHT.Co — Summer Intern
   * National School & College System — Robotics Workshop Instructor
5. **7 Major Competitions & Honors**:
   * 3rd Overall — National Aerothon ’25 | Swift Wing title | Autonomous Disaster-Relief UAV
   * Finalist — Teknofest Turkey 2025 | Dynamic Landing on Moving USV | 160+ teams
   * Finalist — Teknofest Turkey 2024 | Anti Drone UAV | 160+ teams
   * Participant — IMeChE UAS Challenge 2025 | Disaster Relief UAV
   * Ranked 112/200 — International Design, Build & Fly Competition 2025
   * Finalist — National Design, Build & Fly Competition 2024
   * Participant — National Engineering Robotics Competition 2024 & 2025
6. **Certifications & Licensures**:
   * UAS Remote Pilot Open Category — A1+A3
   * Introduction to Nephio LFS179 (The Linux Foundation)
