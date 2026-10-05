import React from 'react';
import { Award, Shield, Zap, Cpu, CheckCircle2, Terminal, Layers, User } from 'lucide-react';
import { AboutData } from '../../types/portfolio';

interface AboutProps {
  about: AboutData;
}

export const About: React.FC<AboutProps> = ({ about }) => {
  const iconMap: Record<string, React.ReactNode> = {
    Award: <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
    Shield: <Shield className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
    Zap: <Zap className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
    Cpu: <Cpu className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  };

  const sortedCards = [...(about.infoCards || [])].sort((a, b) => a.order - b.order);
  const hasPhoto = Boolean(about.profileImage && about.profileImage.trim().length > 0);

  return (
    <section id="about" className="py-24 relative bg-theme-bg overflow-hidden border-t border-theme">
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Terminal className="w-3.5 h-3.5 text-theme-primary" />
            <span className="text-theme-primary">{about.badge || 'ENGINEERING DOSSIER'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-theme-text mt-3 tracking-tight font-sans">
            {about.sectionTitle || 'Engineering Profile & Technical Focus'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-3" />
        </div>

        {/* Top Split: Photo / Bio & Focus Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 items-start">
          
          {/* Left: Bio & Philosophy Statement (7 cols) */}
          <div className="lg:col-span-7 space-y-4 text-theme-text text-sm sm:text-base leading-relaxed">
            
            {hasPhoto && (
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-theme-card border border-theme shadow-sm mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-theme-primary shrink-0 shadow-md">
                  <img
                    src={about.profileImage}
                    alt="Mansoor Ahmed Rind"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold font-mono text-theme-text">
                    Mansoor Ahmed Rind
                  </div>
                  <div className="text-xs font-mono text-theme-primary mt-0.5">
                    NUST Gold Medalist • Aerial Robotics Engineer
                  </div>
                  <div className="text-[11px] font-mono text-theme-muted mt-0.5">
                    Specialized in UAV Autonomy, ROS, Flight Stacks & Embedded Edge ML
                  </div>
                </div>
              </div>
            )}

            <p className="font-normal text-theme-text/90 leading-relaxed">
              {about.bioParagraph}
            </p>
            <p className="text-theme-muted leading-relaxed">
              {about.secondaryBio}
            </p>

            {/* Philosophy callout box */}
            {about.engineeringPhilosophy && (
              <div className="mt-6 p-4 rounded-xl bg-theme-card border-l-4 border-theme-primary border-y border-r border-theme shadow-sm">
                <div className="text-[11px] font-mono text-theme-primary uppercase tracking-wider mb-1 flex items-center gap-1.5 font-semibold">
                  <Layers className="w-3.5 h-3.5" />
                  Engineering Principle
                </div>
                <blockquote className="text-xs sm:text-sm italic text-theme-text font-mono">
                  "{about.engineeringPhilosophy}"
                </blockquote>
              </div>
            )}
          </div>

          {/* Right Column: Focus Areas (5 cols) */}
          <div className="lg:col-span-5 bg-theme-card border border-theme rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Core Technical Competencies
            </h3>
            <div className="space-y-3">
              {(about.focusAreas || []).map((area, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-theme-text/90">
                  <CheckCircle2 className="w-4 h-4 text-theme-primary shrink-0 mt-0.5" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Highlight Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedCards.map((card) => (
            <div
              key={card.id}
              className="group p-5 rounded-2xl bg-theme-card border border-theme hover:border-theme-primary transition-all duration-200 shadow-md hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-theme-bg border border-theme group-hover:border-theme-primary flex items-center justify-center mb-4 transition-colors">
                  {iconMap[card.icon] || <Cpu className="w-5 h-5 text-theme-primary" />}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-theme-text font-sans group-hover:text-theme-primary transition-colors">
                  {card.title}
                </h4>
                <div className="text-[11px] font-mono text-theme-primary mt-0.5 mb-2 font-medium">
                  {card.subtitle}
                </div>
                <p className="text-xs text-theme-muted leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
