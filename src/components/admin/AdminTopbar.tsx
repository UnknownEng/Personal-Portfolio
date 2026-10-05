import React from 'react';
import { Menu, ExternalLink, ShieldCheck, Eye, KeyRound } from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminTopbarProps {
  currentTab: AdminTab;
  onOpenMobileMenu: () => void;
  onViewLiveSite: () => void;
  onChangePasswordModal: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  currentTab,
  onOpenMobileMenu,
  onViewLiveSite,
  onChangePasswordModal,
}) => {
  const tabTitles: Record<AdminTab, string> = {
    dashboard: 'Command Dashboard Overview',
    hero: 'Hero Section & Flight Telemetry',
    about: 'Engineering Profile & Info Cards',
    skills: 'Technical & Leadership Competencies',
    research: 'Academic Research, Reviews & Publications',
    projects: 'Engineering Projects & Products Database',
    gallery: 'Visual Gallery & Field Media (8 from CV)',
    experience: 'Engineering & Research Timeline (9 from CV)',
    education: 'Education & Academic Honors (NUST, UCI, Naples)',
    certifications: 'Flight & Technical Certifications',
    achievements: 'Competitions & Aerospace Honors (Teknofest, DBFC)',
    leadership: 'Leadership & Large-Scale Operations',
    messages: 'Inquiries Inbox',
    contact: 'Contact Coordinates & Form Settings',
    'social-links': 'Social & Network Links',
    navigation: 'Navigation Menu Order & Links',
    visibility: 'Section Visibility Controls',
    appearance: 'Appearance & Theme Customization (CSS Tokens)',
    'section-images': 'Section Pictures & Frontend Media Manager',
    media: 'Media Manager & Asset Uploads',
    seo: 'Search Engine Optimization & Metadata',
    settings: 'Website Settings & Maintenance Mode',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080C16]/90 border-b border-[#1E293B] backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 hidden sm:inline">CMS</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-cyan-400 font-semibold">{tabTitles[currentTab] || currentTab}</span>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PERSISTENCE: ACTIVE</span>
        </div>

        <button
          onClick={onChangePasswordModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1424] hover:bg-[#162035] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-mono transition"
          title="Change Admin Password"
        >
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Password</span>
        </button>

        <button
          onClick={onViewLiveSite}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Live Site</span>
        </button>
      </div>

    </header>
  );
};
