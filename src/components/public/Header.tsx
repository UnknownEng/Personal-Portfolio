import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, Sun, Moon, FileText, Mail, Phone } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

interface HeaderProps {
  onOpenResume: () => void;
  onNavigateAdmin: () => void;
  currentLang: 'en' | 'zh' | 'ur';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenResume,
  onNavigateAdmin,
  currentLang,
  onToggleLang,
}) => {
  const { data, applyTheme } = usePortfolio();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = data.theme?.mode === 'dark';

  const toggleTheme = () => {
    applyTheme({
      ...data.theme,
      mode: isDark ? 'light' : 'dark',
    });
  };

  // Close mobile drawer on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    },
    [mobileMenuOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, handleKeyDown]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'education', 'showcase', 'work', 'research', 'projects', 'skills', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220 && rect.bottom >= 180) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -75;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Only display navigation items that are active and enabled in sectionVisibility
  const visibility = data.sectionVisibility || {};
  const allNavItems = [
    { id: 'home', label: currentLang === 'zh' ? '主页' : 'Home', visible: visibility.hero ?? true },
    { id: 'education', label: currentLang === 'zh' ? '教育' : 'Education', visible: visibility.education ?? true },
    { id: 'showcase', label: currentLang === 'zh' ? '亮点' : 'Highlights', visible: true },
    { id: 'work', label: currentLang === 'zh' ? '履历' : 'Work', visible: visibility.experience ?? true },
    { id: 'research', label: currentLang === 'zh' ? '研究' : 'Research', visible: visibility.research ?? true },
    { id: 'projects', label: currentLang === 'zh' ? '项目' : 'Projects', visible: visibility.projects ?? true },
    { id: 'skills', label: currentLang === 'zh' ? '技能' : 'Skills', visible: visibility.skills ?? true },
    { id: 'contact', label: currentLang === 'zh' ? '联系' : 'Contact', visible: visibility.contact ?? true },
  ];

  const navItems = allNavItems.filter((item) => item.visible);

  return (
    <>
      <header className="navbar-wrapper" role="banner">
        {/* Left Side: Clickable Logo & Resume */}
        <div className="left-nav flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none whitespace-nowrap shrink-0"
            aria-label="Antigracity Home"
            title="Antigracity Flight Radar"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-300 shadow-sm shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="flex flex-col whitespace-nowrap shrink-0">
              <span className="font-bold text-xs tracking-wider text-slate-100 font-mono group-hover:text-sky-400 transition leading-none whitespace-nowrap shrink-0">
                ANTIGRACITY
              </span>
              <span className="text-[9px] text-sky-400 font-mono tracking-widest mt-0.5 uppercase opacity-90 whitespace-nowrap shrink-0">
                AERO•UAV
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenResume}
            className="resume-btn hidden sm:inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap shrink-0"
            aria-label="Open Curriculum Vitae"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap shrink-0">{currentLang === 'zh' ? '简历' : 'Resume'}</span>
          </button>
        </div>

        {/* Center / Right Side: Nav Links (Desktop) */}
        <nav className="center-nav hidden lg:flex" aria-label="Main Navigation">
          <div className="links-wrapper">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`nav-link-btn ${activeSection === item.id ? 'active' : ''}`}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}

            {/* Language Toggle */}
            <button
              type="button"
              onClick={onToggleLang}
              className="language-toggle ml-1"
              aria-label="Toggle language between English and Chinese"
              title="Toggle English / 中文"
            >
              <span className={currentLang === 'zh' ? 'active-lang' : 'inactive-lang'}>中</span>
              <span className="text-slate-300 text-xs">/</span>
              <span className={currentLang === 'en' ? 'active-lang' : 'inactive-lang'}>EN</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Tablet / Mobile Trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={onOpenResume}
            className="resume-btn text-xs py-1.5 px-3 flex sm:hidden items-center gap-1 whitespace-nowrap shrink-0"
            aria-label="Resume"
          >
            <FileText className="w-3 h-3 shrink-0" />
            <span className="whitespace-nowrap shrink-0">CV</span>
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            className="language-toggle text-xs py-1 px-2 h-7"
            aria-label="Language switch"
          >
            <span className={currentLang === 'zh' ? 'active-lang' : 'inactive-lang'}>中</span>
            <span className="text-slate-300">/</span>
            <span className={currentLang === 'en' ? 'active-lang' : 'inactive-lang'}>EN</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-sky-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer & Backdrop (WCAG compliant touch menu) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end sm:justify-start">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            className="relative z-50 w-full sm:max-w-md sm:mx-auto mt-auto sm:mt-24 p-6 rounded-t-3xl sm:rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <span className="font-mono font-bold text-sm text-white whitespace-nowrap shrink-0">ANTIGRACITY</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <div className="flex flex-col gap-1 py-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center justify-between min-h-[48px] ${
                    activeSection === item.id
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {activeSection === item.id && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions in Mobile Menu */}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenResume();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg min-h-[48px]"
              >
                <FileText className="w-4 h-4" />
                <span>{currentLang === 'zh' ? '查看工程简历 (PDF)' : 'View Engineering Resume (PDF)'}</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 text-xs font-semibold text-slate-300 hover:text-white transition min-h-[44px]"
                  aria-label="Toggle dark and light theme"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
                  <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {data.contact?.phone && (
                    <a
                      href={`tel:${data.contact.phone.replace(/[^0-9+]/g, '')}`}
                      className="p-2.5 rounded-xl bg-slate-800/60 text-slate-300 hover:text-sky-400 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Call direct phone"
                      title="Direct Phone"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {data.contact?.email && (
                    <a
                      href={`mailto:${data.contact.email}`}
                      className="p-2.5 rounded-xl bg-slate-800/60 text-slate-300 hover:text-sky-400 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Send email"
                      title="Direct Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
