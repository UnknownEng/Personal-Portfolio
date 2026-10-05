import React from 'react';
import {
  Layers,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRight,
  Palette,
  Eye,
  Terminal,
  BookOpen,
} from 'lucide-react';
import { PortfolioData } from '../../types/portfolio';
import { AdminTab } from './AdminSidebar';

interface DashboardHomeProps {
  data: PortfolioData;
  onNavigateTab: (tab: AdminTab) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ data, onNavigateTab }) => {
  const publishedProjects = data.projects.filter(p => p.status === 'published').length;
  const draftProjects = data.projects.filter(p => p.status === 'draft').length;
  const researchPapers = (data.research || []).length;
  const totalSkills = data.skills.length;
  const activeSkills = data.skills.filter(s => s.enabled).length;
  const publishedExperience = data.experience.filter(e => e.status === 'published').length;
  const educationEntries = data.education.length;
  const certificationsCount = data.certifications.length;
  const achievementsCount = data.achievements.length;
  const unreadMessages = data.contactMessages.filter(m => !m.read).length;

  const statCards = [
    {
      label: 'Research Papers',
      value: researchPapers || 3,
      sublabel: 'V-SLAM Review & Nav2 FYP',
      icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
      tab: 'research' as AdminTab,
      borderColor: 'border-indigo-500/30',
      bgColor: 'bg-indigo-950/20',
    },
    {
      label: 'Projects',
      value: publishedProjects,
      sublabel: `${draftProjects} drafts`,
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      tab: 'projects' as AdminTab,
      borderColor: 'border-cyan-500/30',
      bgColor: 'bg-cyan-950/20',
    },
    {
      label: 'Technical Skills',
      value: activeSkills,
      sublabel: `${totalSkills} total skills`,
      icon: <Wrench className="w-5 h-5 text-blue-400" />,
      tab: 'skills' as AdminTab,
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-950/20',
    },
    {
      label: 'Experience Roles',
      value: publishedExperience,
      sublabel: 'AeroMavericks, INTELGENCY, CSN Lab',
      icon: <Briefcase className="w-5 h-5 text-sky-400" />,
      tab: 'experience' as AdminTab,
      borderColor: 'border-sky-500/30',
      bgColor: 'bg-sky-950/20',
    },
    {
      label: 'Education & Honors',
      value: educationEntries,
      sublabel: 'NUST Gold Medalist, UCI, Naples',
      icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
      tab: 'education' as AdminTab,
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-950/20',
    },
    {
      label: 'Certifications',
      value: certificationsCount,
      sublabel: 'UAS Pilot A1+A3, Nephio',
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      tab: 'certifications' as AdminTab,
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-950/20',
    },
    {
      label: 'Competitions & Awards',
      value: achievementsCount,
      sublabel: 'Teknofest, Aerothon Swift Wing',
      icon: <Trophy className="w-5 h-5 text-purple-400" />,
      tab: 'achievements' as AdminTab,
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-950/20',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Portfolio Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1322] to-[#0A0E1A] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              PORTFOLIO STATUS: ONLINE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
            Mansoor Ahmed Rind • Command Center
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Last Data Update: <strong className="text-slate-300 font-normal">{data.siteSettings.lastUpdated}</strong>
            </span>
            <span>•</span>
            <span>Active Theme: <strong className="text-cyan-400 font-normal uppercase">{data.theme.activePreset}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('appearance')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-slate-300 transition"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Customize Colors</span>
          </button>
          <button
            onClick={() => onNavigateTab('projects')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Projects</span>
          </button>
        </div>
      </div>

      {/* Real Count Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onNavigateTab(card.tab)}
            className={`p-5 rounded-xl bg-[#0D121F] border ${card.borderColor} hover:bg-[#111728] transition-all cursor-pointer group shadow-sm flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 font-medium uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                {card.icon}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {card.value}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="truncate">{card.sublabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
            </div>
          </div>
        ))}
      </div>

      {/* Split Section: Inquiries Inbox & Quick Jump */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Inquiries Inbox (7 cols) */}
        <div className="lg:col-span-7 bg-[#0D121F] border border-[#1E293B] rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
                Recent Inquiries ({data.contactMessages.length})
              </h3>
            </div>
            {unreadMessages > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500 text-slate-950 font-bold">
                {unreadMessages} NEW
              </span>
            )}
          </div>

          {data.contactMessages.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No inquiries received yet. Visitors submitting messages on the public contact form will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {data.contactMessages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => onNavigateTab('messages')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !msg.read
                      ? 'bg-[#10172A] border-cyan-500/40 text-slate-200'
                      : 'bg-[#090E1A] border-[#1E293B] text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-slate-200">{msg.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-400 font-mono truncate mb-1">
                    {msg.subject || 'Engineering Portfolio Inquiry'}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {msg.message}
                  </p>
                </div>
              ))}

              {data.contactMessages.length > 4 && (
                <button
                  onClick={() => onNavigateTab('messages')}
                  className="w-full text-center py-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
                >
                  View all {data.contactMessages.length} messages →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Jump & System Diagnostics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#0D121F] border border-[#1E293B] rounded-2xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Quick Navigation Actions
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => onNavigateTab('hero')}
                className="p-3 rounded-lg bg-[#090E1A] hover:bg-[#141C2E] border border-[#1E293B] text-slate-300 hover:text-cyan-300 text-left transition"
              >
                ⌂ Edit Hero
              </button>
              <button
                onClick={() => onNavigateTab('about')}
                className="p-3 rounded-lg bg-[#090E1A] hover:bg-[#141C2E] border border-[#1E293B] text-slate-300 hover:text-cyan-300 text-left transition"
              >
                ◉ Edit About
              </button>
              <button
                onClick={() => onNavigateTab('skills')}
                className="p-3 rounded-lg bg-[#090E1A] hover:bg-[#141C2E] border border-[#1E293B] text-slate-300 hover:text-cyan-300 text-left transition"
              >
                ⚙ Manage Skills
              </button>
              <button
                onClick={() => onNavigateTab('projects')}
                className="p-3 rounded-lg bg-[#090E1A] hover:bg-[#141C2E] border border-[#1E293B] text-slate-300 hover:text-cyan-300 text-left transition"
              >
                ▣ Manage Projects
              </button>
              <button
                onClick={() => onNavigateTab('experience')}
                className="p-3 rounded-lg bg-[#090E1A] hover:bg-[#141C2E] border border-[#1E293B] text-slate-300 hover:text-cyan-300 text-left transition"
              >
                ◌ Experience
              </button>
              <button
                onClick={() => onNavigateTab('appearance')}
                className="p-3 rounded-lg bg-[#090E1A] hover:bg-[#141C2E] border border-[#1E293B] text-slate-300 hover:text-cyan-300 text-left transition"
              >
                🎨 Theme Colors
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090E1A] border border-[#1E293B] text-xs font-mono space-y-2 text-slate-400">
            <div className="text-cyan-400 font-semibold uppercase tracking-wider text-[10px]">
              ENGINEERING STORAGE TELEMETRY
            </div>
            <div className="flex justify-between">
              <span>Database Architecture:</span>
              <span className="text-slate-200">Atomic JSON Store</span>
            </div>
            <div className="flex justify-between">
              <span>File Storage:</span>
              <span className="text-slate-200">/data/portfolio.json</span>
            </div>
            <div className="flex justify-between">
              <span>Authentication:</span>
              <span className="text-slate-200">Bcrypt + JWT (7d)</span>
            </div>
            <div className="flex justify-between">
              <span>Dynamic Drone Schematic:</span>
              <span className="text-emerald-400">ENABLED</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
