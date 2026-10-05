import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Shield } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'education', 'showcase', 'work', 'research', 'projects', 'skills', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
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
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: currentLang === 'zh' ? '主页' : currentLang === 'ur' ? 'ہوم' : 'Home' },
    { id: 'education', label: currentLang === 'zh' ? '教育' : currentLang === 'ur' ? 'تعلیم' : 'Education' },
    { id: 'showcase', label: currentLang === 'zh' ? '亮点' : currentLang === 'ur' ? 'نمایاں' : 'Highlights' },
    { id: 'work', label: currentLang === 'zh' ? '履历' : currentLang === 'ur' ? 'تجربہ' : 'Work' },
    { id: 'research', label: currentLang === 'zh' ? '学术研究' : currentLang === 'ur' ? 'تحقیق' : 'Research' },
    { id: 'projects', label: currentLang === 'zh' ? '工程项目' : currentLang === 'ur' ? 'پروجیکٹس' : 'Projects' },
    { id: 'skills', label: currentLang === 'zh' ? '专业技能' : currentLang === 'ur' ? 'مہارتیں' : 'Skills' },
    { id: 'contact', label: currentLang === 'zh' ? '联系方式' : currentLang === 'ur' ? 'رابطہ' : 'Contact' },
  ];

  return (
    <>
      <header className="navbar-wrapper">
        {/* Left Side: Resume Button */}
        <div className="left-nav">
          <button
            type="button"
            onClick={onOpenResume}
            className="resume-btn"
          >
            {currentLang === 'zh' ? '简历' : currentLang === 'ur' ? 'سی وی' : 'Resume'}
          </button>
        </div>

        {/* Center / Right Side: Nav Links */}
        <div className="center-nav hidden md:flex">
          <div className="links-wrapper">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`nav-link-btn ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}

            {/* Language Toggle matching Steven Feng's 中 / EN toggle */}
            <button
              type="button"
              onClick={onToggleLang}
              className="language-toggle ml-1"
              aria-label="Toggle language"
              title="Toggle English / 中文"
            >
              <span className={currentLang === 'zh' ? 'active-lang' : 'inactive-lang'}>中</span>
              <span className="text-slate-400 text-xs">/</span>
              <span className={currentLang === 'en' ? 'active-lang' : 'inactive-lang'}>EN</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin CMS Access */}
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-sky-500 transition"
              title="CMS Admin Panel"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={onToggleLang}
            className="language-toggle text-xs py-1 px-2 h-7"
          >
            <span className={currentLang === 'zh' ? 'active-lang' : 'inactive-lang'}>中</span>
            <span className="text-slate-400">/</span>
            <span className={currentLang === 'en' ? 'active-lang' : 'inactive-lang'}>EN</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 z-50 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeSection === item.id
                  ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={onNavigateAdmin}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400"
            >
              <Shield className="w-3.5 h-3.5" /> CMS Admin
            </button>
          </div>
        </div>
      )}
    </>
  );
};
