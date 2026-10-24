import React from 'react';
import { ArrowUp, Mail, Phone, ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../ui/Icons';

interface FooterProps {
  siteName?: string;
  footerText?: string;
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Footer: React.FC<FooterProps> = ({
  siteName = 'Mansoor Ahmed Rind',
  footerText,
  currentLang = 'en',
}) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const footerNavLinks = [
    { id: 'home', label: currentLang === 'zh' ? '主页' : 'Home' },
    { id: 'education', label: currentLang === 'zh' ? '教育' : 'Education' },
    { id: 'showcase', label: currentLang === 'zh' ? '亮点' : 'Highlights' },
    { id: 'work', label: currentLang === 'zh' ? '履历' : 'Work' },
    { id: 'research', label: currentLang === 'zh' ? '学术论文' : 'Research' },
    { id: 'projects', label: currentLang === 'zh' ? '工程项目' : 'Projects' },
    { id: 'skills', label: currentLang === 'zh' ? '技能' : 'Skills' },
    { id: 'contact', label: currentLang === 'zh' ? '联系' : 'Contact' },
  ];

  return (
    <footer className="w-full pt-12 pb-8 border-t border-slate-800 relative z-10 bg-[#080b12]/95 backdrop-blur-md" role="contentinfo">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/80">
          {/* Col 1: Brand & Bio */}
          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
              aria-label="Antigracity Top"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wider text-slate-100 font-mono group-hover:text-sky-400 transition">
                  ANTIGRACITY
                </span>
                <span className="text-[10px] text-sky-400 font-mono tracking-wider">
                  AUTONOMOUS UAV FLIGHT SYSTEMS
                </span>
              </div>
            </button>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {currentLang === 'zh'
                ? '自主无人机蜂群、航空嵌入式系统与数字孪生飞行仿真前沿工程项目与学术展示。'
                : 'Advanced autonomous UAV swarm robotics, embedded flight stacks, and digital-twin aerospace simulations engineered by Mansoor Ahmed Rind.'}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest mb-3">
              {currentLang === 'zh' ? '快速导航' : 'Navigation'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {footerNavLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-slate-400 hover:text-sky-400 transition py-1 focus:outline-none"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Direct Connect & Links */}
          <div className="flex flex-col items-start gap-2.5">
            <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest mb-1">
              {currentLang === 'zh' ? '直达联系' : 'Direct Comms'}
            </div>
            <a
              href="mailto:mansoorahmedrind@gmail.com"
              className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-sky-400 transition"
              aria-label="Direct Email"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>mansoorahmedrind@gmail.com</span>
            </a>
            <a
              href="tel:+923273202419"
              className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-sky-400 transition"
              aria-label="Direct Phone"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>+92 327 3202419</span>
            </a>
            <div className="flex items-center gap-2 mt-2">
              <a
                href="https://github.com/MansoorAhmedRind"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-500 hover:text-slate-950 text-slate-300 transition"
                aria-label="GitHub Profile"
                title="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/mansoorahmedrind"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-500 hover:text-slate-950 text-slate-300 transition"
                aria-label="LinkedIn Profile"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="/CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-500 hover:text-slate-950 text-slate-300 transition text-xs font-mono font-bold flex items-center gap-1"
                aria-label="Curriculum Vitae"
                title="View CV PDF"
              >
                <span>CV</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            {footerText || `© ${currentYear} ${siteName} — Antigracity. All rights reserved. Specialized in UAV Autonomy & Embedded Systems.`}
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-400 transition p-2 rounded-xl hover:bg-white/5"
            aria-label="Scroll back to top of page"
          >
            <span>{currentLang === 'zh' ? '回到顶部' : 'Back to Top'}</span>
            <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>
      </div>
    </footer>
  );
};
