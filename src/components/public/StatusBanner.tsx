import React from 'react';
import { Activity, Layers, Wrench, Briefcase, Calendar, ShieldCheck, Images } from 'lucide-react';
import { PortfolioData } from '../../types/portfolio';

interface StatusBannerProps {
  data: PortfolioData;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ data }) => {
  const publishedProjectsCount = (data.projects || []).filter(p => p.status === 'published').length;
  const activeSkillsCount = (data.skills || []).filter(s => s.enabled).length;
  const publishedExpCount = (data.experience || []).filter(e => e.status === 'published').length;
  const competitionsCount = (data.achievements || []).filter(a => a.status === 'published').length;
  const galleryCount = (data.gallery || []).filter(g => g.status === 'published').length;
  const lastUpdated = data.siteSettings.lastUpdated || new Date().toISOString().split('T')[0];

  return (
    <div className="w-full border-y border-theme bg-theme-card/85 backdrop-blur-md relative z-20 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs font-mono text-theme-muted">
          
          {/* System Status online beacon */}
          <div className="flex items-center gap-2 text-theme-text">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold tracking-wider">SYSTEM STATUS: ONLINE</span>
            <span className="text-theme-muted opacity-40 hidden sm:inline">|</span>
            <span className="text-theme-muted hidden sm:inline">COMMAND CENTER</span>
          </div>

          {/* Dynamic Real Counts */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 hover:text-theme-primary transition">
              <Layers className="w-3.5 h-3.5 text-theme-primary" />
              <span>PROJECTS:</span>
              <span className="font-bold text-theme-text bg-theme-bg px-1.5 py-0.5 rounded border border-theme">
                {publishedProjectsCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-theme-primary transition">
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>SKILLS:</span>
              <span className="font-bold text-theme-text bg-theme-bg px-1.5 py-0.5 rounded border border-theme">
                {activeSkillsCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-theme-primary transition">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" />
              <span>ROLES:</span>
              <span className="font-bold text-theme-text bg-theme-bg px-1.5 py-0.5 rounded border border-theme">
                {publishedExpCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-theme-primary transition hidden sm:flex">
              <Images className="w-3.5 h-3.5 text-theme-primary" />
              <span>GALLERY:</span>
              <span className="font-bold text-theme-text bg-theme-bg px-1.5 py-0.5 rounded border border-theme">
                {galleryCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-amber-400 transition hidden md:flex">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>HONORS:</span>
              <span className="font-bold text-amber-500 dark:text-amber-300 bg-theme-bg px-1.5 py-0.5 rounded border border-theme">
                {competitionsCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-theme-muted hidden lg:flex">
              <Calendar className="w-3.5 h-3.5 text-theme-muted" />
              <span>UPDATED:</span>
              <span className="text-theme-text font-semibold">{lastUpdated}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
