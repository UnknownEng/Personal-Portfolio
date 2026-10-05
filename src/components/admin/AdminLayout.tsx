import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { DashboardHome } from './DashboardHome';
import { HeroEditor } from './HeroEditor';
import { AboutEditor } from './AboutEditor';
import { SkillsManager } from './SkillsManager';
import { ResearchManager } from './ResearchManager';
import { ProjectsManager } from './ProjectsManager';
import { GalleryManager } from './GalleryManager';
import { ExperienceManager } from './ExperienceManager';
import { EducationManager } from './EducationManager';
import { CertificationsManager } from './CertificationsManager';
import { AchievementsManager } from './AchievementsManager';
import { LeadershipManager } from './LeadershipManager';
import { MessagesManager } from './MessagesManager';
import { ContactEditor } from './ContactEditor';
import { SocialLinksEditor } from './SocialLinksEditor';
import { NavigationEditor } from './NavigationEditor';
import { VisibilityManager } from './VisibilityManager';
import { AppearanceEditor } from './AppearanceEditor';
import { SectionMediaManager } from './SectionMediaManager';
import { MediaManager } from './MediaManager';
import { SeoEditor } from './SeoEditor';
import { SettingsEditor } from './SettingsEditor';
import { ToastContainer } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Lock, KeyRound } from 'lucide-react';
import { MediaFile } from '../../types/portfolio';

const VALID_ADMIN_TABS = new Set<AdminTab>([
  'dashboard', 'hero', 'about', 'skills', 'research', 'projects',
  'gallery', 'experience', 'education', 'certifications', 'achievements',
  'leadership', 'messages', 'contact', 'social-links', 'navigation',
  'visibility', 'appearance', 'section-images', 'media', 'seo', 'settings'
]);

function getTabFromUrl(): AdminTab {
  if (typeof window === 'undefined') return 'dashboard';
  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as AdminTab;
    if (tabParam && VALID_ADMIN_TABS.has(tabParam)) {
      return tabParam;
    }
    const hash = window.location.hash.replace(/^#/, '');
    if (hash.startsWith('tab=')) {
      const hashTab = hash.replace('tab=', '') as AdminTab;
      if (VALID_ADMIN_TABS.has(hashTab)) return hashTab;
    } else if (VALID_ADMIN_TABS.has(hash as AdminTab)) {
      return hash as AdminTab;
    }
  } catch {
    // fallback
  }
  return 'dashboard';
}

interface AdminLayoutProps {
  onViewLiveSite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onViewLiveSite }) => {
  const {
    data,
    saveSection,
    applyTheme,
    resetToDefaults,
    markMessageAsRead,
    deleteContactMessage,
  } = usePortfolio();

  const { logout, changePassword } = useAuth();

  const [currentTab, setCurrentTab] = useState<AdminTab>(() => getTabFromUrl());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  // Synchronize tab changes with browser URL and history state (REL-02)
  const handleSelectTab = React.useCallback((tab: AdminTab) => {
    setCurrentTab(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === 'dashboard') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      const newRelativeUrl = url.pathname + (url.search ? url.search : '') + url.hash;
      const currentRelativeUrl = window.location.pathname + window.location.search + window.location.hash;
      if (newRelativeUrl !== currentRelativeUrl) {
        window.history.pushState({ tab }, '', newRelativeUrl);
      }
    } catch {
      // fallback
    }
  }, []);

  // Listen to browser Back and Forward navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const tabFromUrl = getTabFromUrl();
      setCurrentTab(tabFromUrl);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Password Modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters');
      return;
    }

    const res = await changePassword(currentPassword, newPassword);
    if (res.success) {
      showToast('success', 'Admin password successfully updated!');
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError(res.error || 'Failed to update password');
    }
  };

  const handleMediaUploaded = (file: MediaFile) => {
    saveSection('media', [file, ...(data?.media || [])]);
  };

  const handleMediaDeleted = (id: string) => {
    saveSection('media', (data?.media || []).filter((m) => m.id !== id));
  };

  const unreadCount = (data?.contactMessages || []).filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex font-sans">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onLogout={logout}
        unreadMessagesCount={unreadCount}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Sticky Topbar */}
        <AdminTopbar
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onViewLiveSite={onViewLiveSite}
          onChangePasswordModal={() => setPasswordModalOpen(true)}
        />

        {/* Dynamic Section Editor */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary fallbackTitle="Admin Section Fault Safeguard" onReset={() => handleSelectTab('dashboard')}>
          {currentTab === 'dashboard' && (
            <DashboardHome data={data} onNavigateTab={handleSelectTab} />
          )}

          {currentTab === 'hero' && (
            <HeroEditor
              hero={data.hero}
              onSaveHero={(hero) => saveSection('hero', hero)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'about' && (
            <AboutEditor
              about={data.about}
              onSaveAbout={(about) => saveSection('about', about)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'skills' && (
            <SkillsManager
              skills={data.skills}
              onSaveSkills={(skills) => saveSection('skills', skills)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'research' && (
            <ResearchManager
              research={data.research || []}
              onSaveResearch={(resList) => saveSection('research', resList)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsManager
              projects={data.projects}
              onSaveProjects={(projects) => saveSection('projects', projects)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'gallery' && (
            <GalleryManager
              gallery={data.gallery || []}
              projects={data.projects}
              certifications={data.certifications}
              onSaveGallery={(gallery) => saveSection('gallery', gallery)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'experience' && (
            <ExperienceManager
              experience={data.experience}
              onSaveExperience={(exp) => saveSection('experience', exp)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'education' && (
            <EducationManager
              education={data.education}
              onSaveEducation={(edu) => saveSection('education', edu)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'certifications' && (
            <CertificationsManager
              certifications={data.certifications}
              onSaveCertifications={(certs) => saveSection('certifications', certs)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'achievements' && (
            <AchievementsManager
              achievements={data.achievements}
              onSaveAchievements={(achs) => saveSection('achievements', achs)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'leadership' && (
            <LeadershipManager
              leadership={data.leadership}
              onSaveLeadership={(lead) => saveSection('leadership', lead)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'messages' && (
            <MessagesManager
              messages={data.contactMessages}
              onMarkRead={markMessageAsRead}
              onDeleteMessage={deleteContactMessage}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'contact' && (
            <ContactEditor
              contact={data.contact}
              onSaveContact={(contact) => saveSection('contact', contact)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'social-links' && (
            <SocialLinksEditor
              socialLinks={data.socialLinks}
              onSaveSocialLinks={(links) => saveSection('socialLinks', links)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'navigation' && (
            <NavigationEditor
              navigation={data.navigation}
              onSaveNavigation={(items) => saveSection('navigation', items)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'visibility' && (
            <VisibilityManager
              visibility={data.sectionVisibility}
              onSaveVisibility={(visibility) => saveSection('sectionVisibility', visibility)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'appearance' && (
            <AppearanceEditor
              theme={data.theme}
              onSaveTheme={(theme) => saveSection('theme', theme)}
              onApplyLocal={applyTheme}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'section-images' && (
            <SectionMediaManager
              data={data}
              onSaveSection={saveSection}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'media' && (
            <MediaManager
              media={data.media}
              onMediaUploaded={handleMediaUploaded}
              onMediaDeleted={handleMediaDeleted}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'seo' && (
            <SeoEditor
              seo={data.seo}
              onSaveSeo={(seo) => saveSection('seo', seo)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsEditor
              settings={data.siteSettings}
              onSaveSettings={(settings) => saveSection('siteSettings', settings)}
              onResetDefaults={resetToDefaults}
              onShowToast={showToast}
            />
          )}
          </ErrorBoundary>
        </main>

      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <Modal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          title="Update Administrator Password"
          maxWidth="md"
        >
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            {passError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
                {passError}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                CURRENT PASSWORD
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                NEW PASSWORD (min. 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                CONFIRM NEW PASSWORD
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 text-xs font-mono text-slate-400 bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg"
              >
                Update Password
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
