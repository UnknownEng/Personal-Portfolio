import React from 'react';
import { Activity, Layers, Wrench, Briefcase, Calendar, ShieldCheck } from 'lucide-react';
import { PortfolioData } from '../../types/portfolio';

interface StatusBannerProps {
  data: PortfolioData;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ data }) => {
  const publishedProjectsCount = data.projects.filter(p => p.status === 'published').length;
  const activeSkillsCount = data.skills.filter(s => s.enabled).length;
  const publishedExpCount = data.experience.filter(e => e.status === 'published').length;
  const competitionsCount = data.achievements.filter(a => a.status === 'published').length;
  const lastUpdated = data.siteSettings.lastUpdated || new Date().toISOString().split('T')[0];

  return (
    <div className="w-full border-y border-[#1E293B] bg-[#0A0E1A]/80 backdrop-blur-md relative z-20 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs font-mono text-slate-400">
          
          {/* System Status online beacon */}
          <div className="flex items-center gap-2 text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold tracking-wider">SYSTEM STATUS: ONLINE</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">COMMAND CENTER</span>
          </div>

          {/* Dynamic Real Counts */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 hover:text-cyan-300 transition">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>PROJECTS:</span>
              <span className="font-bold text-slate-100 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                {publishedProjectsCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-blue-300 transition">
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>SKILLS:</span>
              <span className="font-bold text-slate-100 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                {activeSkillsCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-sky-300 transition">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" />
              <span>ROLES:</span>
              <span className="font-bold text-slate-100 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                {publishedExpCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 hover:text-amber-300 transition hidden md:flex">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>HONORS:</span>
              <span className="font-bold text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">
                {competitionsCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 hidden lg:flex">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>UPDATED:</span>
              <span className="text-slate-400">{lastUpdated}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
