import { PortfolioData } from '../src/types/portfolio.ts';

export function renderServerSide(data: PortfolioData): string {
  const hero = data.hero || {};
  const currentYear = new Date().getFullYear();
  const directEmail = data.contact?.email || 'mansoorahmedrind@gmail.com';
  const directPhone = data.contact?.phone || '+92 327 3202419';
  const cleanPhone = directPhone.replace(/[^0-9+]/g, '');

  return `
  <div class="relative min-h-screen bg-[#080b12] text-[#f8fafc] overflow-x-hidden">
    <!-- Server-Rendered Antigracity Header -->
    <header class="navbar-wrapper" role="banner">
      <div class="left-nav flex items-center gap-3">
        <a href="#home" class="flex items-center gap-2 group text-left text-decoration-none focus:outline-none" aria-label="Antigracity Home">
          <div class="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-xs tracking-wider text-slate-100 font-mono">ANTIGRACITY</span>
            <span class="text-[9px] text-sky-400 font-mono tracking-widest mt-0.5 uppercase opacity-90">AERO•UAV</span>
          </div>
        </a>
        <a href="/CV.pdf" target="_blank" rel="noopener noreferrer" class="resume-btn hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-950">
          <span>Resume</span>
        </a>
      </div>
      <nav class="center-nav hidden lg:flex" aria-label="Main Navigation">
        <div class="links-wrapper flex items-center gap-4">
          <a href="#home" class="nav-link-btn active">Home</a>
          <a href="#education" class="nav-link-btn">Education</a>
          <a href="#showcase" class="nav-link-btn">Highlights</a>
          <a href="#work" class="nav-link-btn">Work</a>
          <a href="#research" class="nav-link-btn">Research</a>
          <a href="#projects" class="nav-link-btn">Projects</a>
          <a href="#skills" class="nav-link-btn">Skills</a>
          <a href="#contact" class="nav-link-btn">Contact</a>
        </div>
      </nav>
    </header>

    <!-- Main Content Container with Semantic Single H1 -->
    <main>
      <!-- Hero Section -->
      <section class="section" id="home">
        <div class="container text-center">
          <h2 class="text-xl md:text-2xl font-semibold text-slate-400 mb-2">
            Hi, I am <span class="text-white font-bold">${hero.name || 'Mansoor Ahmed Rind'}</span>
          </h2>
          <h1 class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mt-1 mb-6 flex items-center justify-center flex-wrap gap-2">
            <span>I am an </span>
            <span class="text-sky-400 inline-block min-w-[200px] text-left">Autonomous UAV Systems Engineer</span>
          </h1>
          <p class="max-w-2xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8 mx-auto px-4">
            ${hero.shortIntroduction || 'Electrical & Electronics Engineer specialized in multi-agent UAV swarms, flight control stacks, and real-time robotics embedded architectures.'}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4">
            <a href="https://www.linkedin.com/in/mansoorahmedrind" target="_blank" rel="noopener noreferrer" class="primary-btn">
              CONNECT WITH ME!
            </a>
            <a href="https://github.com/MansoorAhmedRind" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 font-bold text-sm">
              GITHUB
            </a>
            <a href="/CV.pdf" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 font-bold text-sm">
              VIEW RESUME
            </a>
            <a href="#work" class="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-slate-400 font-semibold text-sm">
              Explore Work
            </a>
          </div>
        </div>
      </section>

      <!-- Education Section -->
      <section class="section" id="education">
        <div class="container">
          <h2 class="section-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">Education</h2>
          <div class="education-wrapper w-full">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              ${(data.education || []).map(edu => `
                <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                  <h3 class="text-lg font-bold text-white mb-1">${edu.institution}</h3>
                  <div class="text-xs text-sky-400 font-mono mb-2">${edu.degree} ${edu.gpa ? `(${edu.gpa})` : ''}</div>
                  <div class="text-xs text-slate-400 mb-3">${edu.startDate || ''} – ${edu.endDate || ''}</div>
                  <p class="text-xs text-slate-300 leading-relaxed">${edu.description || ''}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- Autonomous Highlights Showcase -->
      <section class="section" id="showcase">
        <div class="container">
          <h2 class="section-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">Autonomous UAV & Swarm Highlights</h2>
          <p class="text-sky-400 font-mono text-xs uppercase tracking-wider mb-8">2024 to Present</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            ${(data.showcase || []).map(sc => `
              <article class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase">${sc.category || 'Swarm Systems'}</span>
                <h3 class="text-base font-bold text-white mt-3 mb-2">${sc.title}</h3>
                <p class="text-xs text-slate-300 leading-relaxed">${sc.description}</p>
              </article>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Experience Section -->
      <section class="section" id="work">
        <div class="container">
          <h2 class="section-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">Internships & Experience</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            ${(data.experience || []).map(exp => `
              <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                <h3 class="text-lg font-bold text-white">${exp.company}</h3>
                <div class="text-xs text-sky-400 font-mono mb-2">${exp.position} • ${exp.startDate} – ${exp.endDate || 'Present'}</div>
                <p class="text-xs text-slate-300 leading-relaxed">${exp.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Research & Publications Section -->
      <section class="section" id="research">
        <div class="container">
          <h2 class="section-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Research & Publications</h2>
          <p class="max-w-2xl text-slate-400 text-xs sm:text-sm mb-8">
            Dynamic Visual-Inertial SLAM, deterministic obstacle avoidance routines in ROS 2, and decentralized multi-agent coordination.
          </p>
          <div class="flex flex-col gap-4 w-full max-w-4xl text-left">
            ${((data.research && data.research.length > 0) ? data.research : (data.projects || []).filter(p => p.category?.includes('Research') || p.category?.includes('Paper'))).map(r => `
              <article class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase">${r.category || 'Publication'}</span>
                <h3 class="text-base font-bold text-white mt-2 mb-1">${r.title}</h3>
                <p class="text-xs text-slate-300 mb-3">${r.shortDescription || r.description || ''}</p>
                <div class="flex items-center gap-3 text-xs">
                  <a href="${r.githubUrl || 'https://github.com/MansoorAhmedRind'}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline">GitHub Repository</a>
                  ${r.publicationUrl ? `<a href="${r.publicationUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline">Read Paper</a>` : ''}
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Engineering Projects Section -->
      <section class="section" id="projects">
        <div class="container">
          <h2 class="section-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">Engineering Projects & Products</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
            ${(data.projects || []).map(p => `
              <article class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase">${p.category || 'Project'}</span>
                  <h3 class="text-base font-bold text-white mt-2 mb-1">${p.title}</h3>
                  <p class="text-xs text-slate-300 leading-relaxed mb-4">${p.shortDescription || ''}</p>
                </div>
                <div class="flex items-center gap-3 text-xs">
                  ${p.liveDemoUrl ? `<a href="${p.liveDemoUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-400 font-bold hover:underline">Live Platform</a>` : ''}
                  <a href="${p.githubUrl || 'https://github.com/MansoorAhmedRind'}" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-white">Source Code</a>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section class="section" id="skills">
        <div class="container">
          <h2 class="section-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Technical & Social Skills</h2>
          <div class="flex flex-wrap justify-center gap-2 max-w-3xl">
            ${(data.skills || []).map(s => `
              <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
                ${s.name} ${s.level ? `(${s.level})` : ''}
              </span>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Contact Coordinates Section -->
      <section class="section" id="contact">
        <div class="container text-center max-w-2xl mx-auto px-4">
          <h2 class="section-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">Contact Coordinates</h2>
          <p class="text-base sm:text-lg text-sky-400 font-semibold mb-6">Let's collaborate on autonomous systems & robotics!</p>
          <div class="flex flex-wrap items-center justify-center gap-4 mb-8">
            <a href="mailto:${directEmail}" class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-sky-400">
              <span class="text-xs font-semibold">${directEmail}</span>
            </a>
            <a href="tel:${cleanPhone}" class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-sky-400">
              <span class="text-xs font-semibold">${directPhone}</span>
            </a>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="w-full pt-12 pb-8 border-t border-slate-800 bg-[#080b12]/95 text-center text-xs text-slate-400" role="contentinfo">
      <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© ${currentYear} ${hero.name || 'Mansoor Ahmed Rind'} — Antigracity. All rights reserved.</p>
        <a href="#home" class="text-sky-400 hover:underline">Back to Top</a>
      </div>
    </footer>
  </div>
  `;
}
