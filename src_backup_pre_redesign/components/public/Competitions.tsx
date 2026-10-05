import React from 'react';
import { Trophy, Award, ShieldAlert, Star, ExternalLink } from 'lucide-react';
import { AchievementItem } from '../../types/portfolio';

interface CompetitionsProps {
  achievements: AchievementItem[];
}

export const Competitions: React.FC<CompetitionsProps> = ({ achievements }) => {
  const published = achievements
    .filter((a) => a.status === 'published')
    .sort((a, b) => a.order - b.order);

  return (
    <section id="competitions" className="py-24 relative bg-[#080B12] border-t border-[#1E293B]">
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-950/50 border border-amber-500/30 text-amber-400 font-mono text-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>HONORS & AEROSPACE COMPETITIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-sans">
            Competitions & Recognition
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl font-mono">
            Rigorous international and national flight competitions tested against world-class aerospace university delegations.
          </p>
        </div>

        {/* Grid of Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {published.map((ach) => (
            <div
              key={ach.id}
              className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] hover:border-amber-500/40 hover:bg-[#111728] transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:border-amber-400 transition">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {ach.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition leading-snug">
                  {ach.title}
                </h3>

                <div className="text-xs font-mono text-cyan-400/90 mt-1 mb-3">
                  {ach.organization}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {ach.description}
                </p>
              </div>

              {ach.link && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <a
                    href={ach.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Verify Accreditations</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
