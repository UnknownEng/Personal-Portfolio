import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/public/Header';
import { Hero } from '../components/public/Hero';
import { StatusBanner } from '../components/public/StatusBanner';
import { About } from '../components/public/About';
import { Skills } from '../components/public/Skills';
import { Projects } from '../components/public/Projects';
import { Experience } from '../components/public/Experience';
import { Competitions } from '../components/public/Competitions';
import { Education } from '../components/public/Education';
import { Contact } from '../components/public/Contact';
import { Footer } from '../components/public/Footer';
import { ShieldAlert } from 'lucide-react';

interface PublicPortfolioProps {
  onNavigateAdmin: () => void;
}

export const PublicPortfolio: React.FC<PublicPortfolioProps> = ({ onNavigateAdmin }) => {
  const { data, submitContactForm } = usePortfolio();
  const { siteSettings, sectionVisibility, hero, about, skills, projects, experience, education, certifications, achievements, leadership, contact, navigation } = data;

  // If maintenance mode enabled
  if (siteSettings.maintenanceMode) {
    return (
      <div className="min-h-screen bg-[#080B12] text-white flex flex-col items-center justify-center p-6 text-center font-mono">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">SYSTEM MAINTENANCE ACTIVE</h1>
        <p className="text-slate-400 text-sm mt-3 max-w-md">
          {siteSettings.websiteName} is currently undergoing scheduled telemetry reconfiguration. Normal autonomous operations will resume shortly.
        </p>
        <button
          onClick={onNavigateAdmin}
          className="mt-8 px-5 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs hover:bg-cyan-500/30 transition"
        >
          Administrator Access Override
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Header */}
      <Header
        navigation={navigation}
        siteName={siteSettings.websiteName}
        linkedInUrl={contact.linkedIn}
        onNavigateAdmin={onNavigateAdmin}
      />

      {/* Hero Section */}
      {sectionVisibility.hero && (
        <Hero
          hero={hero}
          droneEnabled={siteSettings.droneVisualizationEnabled && sectionVisibility.droneSchematic}
        />
      )}

      {/* Dynamic Telemetry Status Banner */}
      {sectionVisibility.statusBanner && <StatusBanner data={data} />}

      {/* About Profile Section */}
      {sectionVisibility.about && <About about={about} />}

      {/* Skills & Technologies Section */}
      {sectionVisibility.skills && <Skills skills={skills} />}

      {/* Selected Technical Projects Section */}
      {sectionVisibility.projects && <Projects projects={projects} />}

      {/* Engineering & Research Experience Timeline */}
      {sectionVisibility.experience && <Experience experience={experience} />}

      {/* Competitions & Aerospace Honors */}
      {sectionVisibility.competitions && <Competitions achievements={achievements} />}

      {/* Academia, Certifications & Leadership */}
      {sectionVisibility.education && (
        <Education
          education={education}
          certifications={certifications}
          leadership={leadership}
        />
      )}

      {/* Direct Contact & Inquiry Form */}
      {sectionVisibility.contact && (
        <Contact contact={contact} onSubmitMessage={submitContactForm} />
      )}

      {/* Minimal Engineering Footer */}
      <Footer
        footerText={siteSettings.footerText}
        email={contact.email}
        linkedInUrl={contact.linkedIn}
      />
    </div>
  );
};
