import React from 'react';
import { Mail, ArrowUp } from 'lucide-react';
import { LinkedinIcon } from '../ui/Icons';

interface FooterProps {
  footerText: string;
  email: string;
  linkedInUrl: string;
}

export const Footer: React.FC<FooterProps> = ({ footerText, email, linkedInUrl }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#1E293B] bg-[#06080E] py-8 text-xs font-mono text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Copyright */}
        <div>
          <p className="text-slate-300">
            {footerText || '© 2026 Mansoor Ahmed Rind. Electrical & Electronics Engineering, UAV Systems & Robotics.'}
          </p>
        </div>

        {/* Links & Scroll to top */}
        <div className="flex items-center gap-5">
          {linkedInUrl && (
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          )}

          <button
            onClick={scrollToTop}
            className="p-1.5 rounded-lg bg-[#0E1424] hover:bg-[#162035] border border-[#1E293B] text-slate-400 hover:text-white transition ml-2"
            title="Return to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};
