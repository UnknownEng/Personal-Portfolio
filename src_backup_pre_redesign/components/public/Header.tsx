import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, ExternalLink, Terminal, ChevronRight } from 'lucide-react';
import { LinkedinIcon } from '../ui/Icons';
import { NavigationItem } from '../../types/portfolio';

interface HeaderProps {
  navigation: NavigationItem[];
  siteName: string;
  linkedInUrl: string;
  onNavigateAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  navigation,
  siteName,
  linkedInUrl,
  onNavigateAdmin,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active section detection
      const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'competitions', 'education', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const enabledNav = navigation
    .filter((n) => n.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 bg-[#080B12]/90 backdrop-blur-md border-b border-[#1E293B]/80 shadow-lg shadow-black/40'
          : 'py-4 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Callsign / Brand */}
        <a
          href="#hero"
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
            <span className="font-mono text-cyan-400 font-bold text-sm">MR</span>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors font-mono">
              MANSOOR AHMED RIND
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              UAV & ROBOTICS ENGINEER
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0D111C]/70 border border-[#1E293B]/80 rounded-full px-3 py-1 backdrop-blur-md">
          {enabledNav.map((item) => {
            const targetId = item.href.replace('#', '');
            const isActive = activeSection === targetId;

            return (
              <a
                key={item.id}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* LinkedIn Direct Link */}
          <a
            href={linkedInUrl || 'https://www.linkedin.com/in/mansoorahmedrind'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-[#111827] border border-[#1E293B] hover:border-cyan-500/50 transition shadow-sm"
          >
            <LinkedinIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* Admin CMS Access */}
          <button
            onClick={onNavigateAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40 hover:border-cyan-400 transition"
            title="Access Portfolio Admin Panel"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CMS Admin</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onNavigateAdmin}
            className="p-1.5 rounded text-cyan-400 hover:bg-slate-800"
            title="CMS Admin"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0E1A] border-b border-[#1E293B] px-4 pt-3 pb-5 shadow-2xl animate-in fade-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2">
            {enabledNav.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm font-mono text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-lg transition"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-[#1E293B] flex flex-col gap-2">
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono text-white bg-blue-600/20 border border-blue-500/40 rounded-lg"
              >
                <LinkedinIcon className="w-4 h-4 text-blue-400" />
                Connect on LinkedIn
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateAdmin();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-500/40 rounded-lg"
              >
                <Terminal className="w-4 h-4" />
                CMS Admin Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
