import React from 'react';
import { Award, Shield, Zap, Cpu, CheckCircle2, Terminal, Layers } from 'lucide-react';
import { AboutData } from '../../types/portfolio';

interface AboutProps {
  about: AboutData;
}

export const About: React.FC<AboutProps> = ({ about }) => {
  const iconMap: Record<string, React.ReactNode> = {
    Award: <Award className="w-6 h-6 text-amber-400" />,
    Shield: <Shield className="w-6 h-6 text-cyan-400" />,
    Zap: <Zap className="w-6 h-6 text-blue-400" />,
    Cpu: <Cpu className="w-6 h-6 text-emerald-400" />,
  };

  const sortedCards = [...(about.infoCards || [])].sort((a, b) => a.order - b.order);

  return (
    <section id="about" className="py-24 relative bg-[#080B12] overflow-hidden">
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Terminal className="w-3.5 h-3.5" />
            <span>{about.badge || 'ENGINEERING DOSSIER'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-sans">
            {about.sectionTitle || 'Engineering Profile & Technical Focus'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-3" />
        </div>

        {/* Top Split: Detailed Bio & Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-7 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p className="font-normal text-slate-200">
              {about.bioParagraph}
            </p>
            <p className="text-slate-400">
              {about.secondaryBio}
            </p>

            {/* Philosophy callout box */}
            {about.engineeringPhilosophy && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#0E1526] to-[#0A0F1D] border-l-4 border-cyan-400 border-y border-r border-[#1E293B]">
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Engineering Principle
                </div>
                <blockquote className="text-xs sm:text-sm italic text-slate-300 font-mono">
                  "{about.engineeringPhilosophy}"
                </blockquote>
              </div>
            )}
          </div>

          {/* Right Column: Focus Areas */}
          <div className="lg:col-span-5 bg-[#0D121F] border border-[#1E293B] rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Core Technical Competencies
            </h3>
            <div className="space-y-3">
              {(about.focusAreas || []).map((area, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
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
              className="group p-5 rounded-xl bg-[#0D111C] border border-[#1E293B] hover:border-cyan-500/50 hover:bg-[#111726] transition-all duration-200 shadow-md hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#141C2E] border border-[#1E293B] group-hover:border-cyan-500/40 flex items-center justify-center mb-4 transition-colors">
                  {iconMap[card.icon] || <Cpu className="w-5 h-5 text-cyan-400" />}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-100 font-sans group-hover:text-cyan-300 transition-colors">
                  {card.title}
                </h4>
                <div className="text-[11px] font-mono text-cyan-400/90 mt-0.5 mb-2 font-medium">
                  {card.subtitle}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
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
