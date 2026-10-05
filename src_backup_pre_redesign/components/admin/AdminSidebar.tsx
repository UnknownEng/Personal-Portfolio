import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  User,
  Wrench,
  Layers,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
  Users,
  MessageSquare,
  Mail,
  Share2,
  Compass,
  Eye,
  Palette,
  Image as ImageIcon,
  Search,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'achievements'
  | 'leadership'
  | 'messages'
  | 'contact'
  | 'social-links'
  | 'navigation'
  | 'visibility'
  | 'appearance'
  | 'media'
  | 'seo'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  unreadMessagesCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  unreadMessagesCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuGroups: Array<{
    title: string;
    items: Array<{ id: AdminTab; label: string; icon: React.ReactNode; badge?: number }>;
  }> = [
    {
      title: 'CORE DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        {
          id: 'messages',
          label: 'Inquiries Inbox',
          icon: <MessageSquare className="w-4 h-4" />,
          badge: unreadMessagesCount,
        },
      ],
    },
    {
      title: 'PORTFOLIO SECTIONS',
      items: [
        { id: 'hero', label: 'Hero Section', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'about', label: 'About Profile', icon: <User className="w-4 h-4" /> },
        { id: 'skills', label: 'Skills & Tech', icon: <Wrench className="w-4 h-4" /> },
        { id: 'projects', label: 'Projects (9 CV)', icon: <Layers className="w-4 h-4" /> },
        { id: 'experience', label: 'Experience (9 CV)', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'competitions' as any, label: 'Achievements (7 CV)', icon: <Trophy className="w-4 h-4" /> },
        { id: 'education', label: 'Education & Honors', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
        { id: 'leadership', label: 'Leadership', icon: <Users className="w-4 h-4" /> },
        { id: 'contact', label: 'Contact Details', icon: <Mail className="w-4 h-4" /> },
      ],
    },
    {
      title: 'STRUCTURE & DESIGN',
      items: [
        { id: 'appearance', label: 'Appearance & Themes', icon: <Palette className="w-4 h-4" /> },
        { id: 'media', label: 'Media Manager', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'navigation', label: 'Navigation Menu', icon: <Compass className="w-4 h-4" /> },
        { id: 'visibility', label: 'Section Visibility', icon: <Eye className="w-4 h-4" /> },
        { id: 'social-links', label: 'Social & Profiles', icon: <Share2 className="w-4 h-4" /> },
      ],
    },
    {
      title: 'SYSTEM & CONFIG',
      items: [
        { id: 'seo', label: 'SEO & Metadata', icon: <Search className="w-4 h-4" /> },
        { id: 'settings', label: 'Website Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#090D18] border-r border-[#1E293B] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
              CMS
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 font-mono">MANSOOR RIND</div>
              <div className="text-[10px] font-mono text-cyan-400">ENGINEERING CMS</div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="text-[10px] font-mono font-semibold text-slate-400 px-3 mb-1.5 uppercase tracking-wider">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const targetTab = (item.id === ('competitions' as any) ? 'achievements' : item.id) as AdminTab;
                  const isActive = currentTab === targetTab;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(targetTab);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-[#111728]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-500 text-slate-950 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Profile / Logout Bar */}
        <div className="p-3 border-t border-[#1E293B] bg-[#070A12]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/40 border border-transparent transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
