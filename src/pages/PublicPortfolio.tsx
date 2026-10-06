import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { BackgroundWallpaper } from '../components/public/BackgroundWallpaper';
import { Header } from '../components/public/Header';
import { Hero } from '../components/public/Hero';
import { Education } from '../components/public/Education';
import { Showcase } from '../components/public/Showcase';
import { Experience } from '../components/public/Experience';
import { Research } from '../components/public/Research';
import { Projects } from '../components/public/Projects';
import { Skills } from '../components/public/Skills';
import { Competitions } from '../components/public/Competitions';
import { Contact } from '../components/public/Contact';
import { Footer } from '../components/public/Footer';
import { ResumeModal } from '../components/public/ResumeModal';
import { ShieldAlert } from 'lucide-react';

interface PublicPortfolioProps {
  onNavigateAdmin: () => void;
}

export const PublicPortfolio: React.FC<PublicPortfolioProps> = ({ onNavigateAdmin }) => {
  const { data, submitContactForm } = usePortfolio();
  const {
    siteSettings,
    sectionVisibility,
    hero,
    skills,
    projects,
    experience,
    education,
    certifications,
    achievements,
    leadership,
    contact,
  } = data;

  const [resumeOpen, setResumeOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'zh'>('en');

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === 'en' ? 'zh' : 'en'));
  };

  const githubUrl = data.socialLinks?.find((s) => s.platform === 'github')?.url || 'https://github.com/UnknownEng';

  // Maintenance mode screen
  if (siteSettings.maintenanceMode) {
    return (
      <div className="min-h-screen bg-[#f8fafd] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">System Under Maintenance</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-md">
          {siteSettings.websiteName} is currently updating telemetry and system software. Normal operations will resume shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden transition-colors duration-300">
      {/* Hallmark Animated Rotating Wallpaper Icons */}
      <BackgroundWallpaper />

      {/* Floating Frosted Glass Navbar */}
      <Header
        onOpenResume={() => setResumeOpen(true)}
        onNavigateAdmin={onNavigateAdmin}
        currentLang={currentLang}
        onToggleLang={toggleLanguage}
      />

      {/* Hero Section */}
      {sectionVisibility.hero && (
        <Hero
          hero={hero}
          linkedInUrl={contact.linkedIn}
          githubUrl={githubUrl}
          onOpenResume={() => setResumeOpen(true)}
          currentLang={currentLang}
        />
      )}

      {/* Education Section */}
      {sectionVisibility.education && (
        <Education
          education={education}
          certifications={certifications}
          leadership={leadership}
          currentLang={currentLang}
        />
      )}

      {/* Autonomous Systems & Swarm Highlights Showcase (matches Steven Feng's NVIDIA section) */}
      <Showcase showcase={data.showcase} currentLang={currentLang} />

      {/* Internships & Experience Section */}
      {sectionVisibility.experience && (
        <Experience
          experience={experience}
          currentLang={currentLang}
        />
      )}

      {/* Academic Research & Publications Section (SEPARATE) */}
      {(sectionVisibility.research ?? true) && (
        <Research
          research={
            (data.research && data.research.length > 0)
              ? data.research
              : projects.filter(
                  (p) =>
                    p.category.includes('Research') ||
                    p.category.includes('Review') ||
                    p.category.includes('Paper')
                )
          }
          currentLang={currentLang}
        />
      )}

      {/* Engineering Projects & Products Section (SEPARATE) */}
      {sectionVisibility.projects && (
        <Projects
          projects={projects}
          currentLang={currentLang}
        />
      )}

      {/* Skills Section */}
      {sectionVisibility.skills && (
        <Skills
          skills={skills}
          currentLang={currentLang}
        />
      )}

      {/* Competitions & Honors */}
      {sectionVisibility.competitions && (
        <Competitions
          achievements={achievements}
          currentLang={currentLang}
        />
      )}

      {/* Contact Section */}
      {sectionVisibility.contact && (
        <Contact
          contact={contact}
          githubUrl={githubUrl}
          onSubmitMessage={submitContactForm}
          currentLang={currentLang}
        />
      )}

      {/* Minimal Footer */}
      <Footer
        siteName={hero.name}
        footerText={siteSettings.footerText}
        currentLang={currentLang}
      />

      {/* Dedicated Resume Viewer Modal */}
      <ResumeModal
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
        pdfUrl="/CV.pdf"
      />
    </div>
  );
};
