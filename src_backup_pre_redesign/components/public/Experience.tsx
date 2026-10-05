import React from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { ExperienceItem } from '../../types/portfolio';

interface ExperienceProps {
  experience: ExperienceItem[];
}

export const Experience: React.FC<ExperienceProps> = ({ experience }) => {
  const publishedExp = experience
    .filter((e) => e.status === 'published')
    .sort((a, b) => a.order - b.order);

  return (
    <section id="experience" className="py-24 relative bg-[#090D18]/70 border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/50 border border-blue-500/30 text-blue-400 font-mono text-xs">
            <Briefcase className="w-3.5 h-3.5" />
            <span>OPERATIONAL TIMELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-sans">
            Engineering & Research Experience
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl font-mono">
            Proven track record in autonomous UAV flight engineering, multi-drone swarm coordination, and robotics laboratory research.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative border-l-2 border-cyan-500/30 ml-3 sm:ml-6 space-y-12">
          {publishedExp.map((item, idx) => (
            <div key={item.id} className="relative pl-6 sm:pl-10 group">
              
              {/* Timeline Node Indicator */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#080B12] border-2 border-cyan-400 group-hover:scale-125 group-hover:bg-cyan-400 transition-all duration-200">
                {item.current && (
                  <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-50" />
                )}
              </div>

              {/* Experience Card */}
              <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] hover:border-cyan-500/40 hover:bg-[#111728] transition-all shadow-md">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-sans group-hover:text-cyan-300 transition">
                      {item.position}
                    </h3>
                    <div className="text-sm font-semibold text-cyan-400 font-mono mt-0.5">
                      {item.company}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {item.startDate} — {item.current ? 'Present' : item.endDate}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description if present */}
                {item.description && (
                  <p className="text-xs sm:text-sm text-slate-300 mb-4 font-normal">
                    {item.description}
                  </p>
                )}

                {/* Bullet Points / Responsibilities */}
                {item.responsibilities && item.responsibilities.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {item.responsibilities.map((bullet, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Badges */}
                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/80">
                    {item.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono text-cyan-300/90 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
