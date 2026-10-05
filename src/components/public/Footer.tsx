import React from 'react';
import { ArrowUp } from 'lucide-react';

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
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full py-8 border-t border-slate-800 text-center relative z-10 bg-[#080b12]/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          {footerText || `© 2026 ${siteName}. Electrical & Electronics Engineering, UAV Systems & Robotics.`}
        </p>

        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition"
        >
          <span>{currentLang === 'zh' ? '回到顶部' : 'Back to Top'}</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
