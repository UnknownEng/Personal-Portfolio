import React from 'react';
import { GraduationCap, Award, CheckCircle, Shield, Globe, Users, ExternalLink } from 'lucide-react';
import { EducationItem, CertificationItem, LeadershipItem } from '../../types/portfolio';

interface EducationProps {
  education: EducationItem[];
  certifications: CertificationItem[];
  leadership: LeadershipItem[];
}

export const Education: React.FC<EducationProps> = ({
  education,
  certifications,
  leadership,
}) => {
  const publishedEdu = education.filter((e) => e.status === 'published').sort((a, b) => a.order - b.order);
  const publishedCerts = certifications.filter((c) => c.status === 'published').sort((a, b) => a.order - b.order);
  const publishedLead = leadership.filter((l) => l.status === 'published').sort((a, b) => a.order - b.order);

  return (
    <section id="education" className="py-24 relative bg-[#090D18]/90 border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>ACADEMIA & CERTIFICATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-sans">
            Education, Credentials & Leadership
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl font-mono">
            Academic rigor at NUST combined with specialized European and US autonomous systems certifications and large-scale operational leadership.
          </p>
        </div>

        {/* 2-Column Split: Education & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          
          {/* Education Degrees & Specializations (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Academic Degrees */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                Academic Degree Program
              </h3>

              {publishedEdu.filter((e) => e.type === 'degree').map((edu) => (
                <div
                  key={edu.id}
                  className="p-6 rounded-2xl bg-[#0D121F] border border-cyan-500/30 hover:border-cyan-500/50 transition-all shadow-md relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                          ACADEMIC DEGREE
                        </span>
                        {edu.gpa && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                            <Award className="w-3 h-3" />
                            {edu.gpa}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
                        {edu.degree}
                      </h4>
                      <div className="text-xs sm:text-sm font-semibold text-cyan-400 font-mono mt-0.5">
                        {edu.institution}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400 shrink-0">
                      <span>{edu.startDate} – {edu.endDate}</span>
                    </div>
                  </div>

                  {edu.description && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal leading-relaxed">
                      {edu.description}
                    </p>
                  )}

                  {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-mono text-slate-400 mb-1.5 font-medium">
                        Relevant Coursework & Control Modules:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {edu.relevantCoursework.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono text-slate-300 bg-[#141C2E] px-2 py-0.5 rounded border border-[#1E293B]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Professional Specializations (Non-Credit) */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                Professional Specializations (Non-Credit)
              </h3>

              {publishedEdu.filter((e) => e.type === 'specialization').map((edu) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-blue-500/40 transition-all shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="inline-block px-2 py-0.5 rounded bg-blue-950/50 border border-blue-800/40 text-blue-300 font-mono text-[10px] font-semibold mb-1">
                        NON-CREDIT SPECIALIZATION
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-100 font-sans">
                        {edu.degree}
                      </h4>
                      <div className="text-xs font-semibold text-cyan-400/90 font-mono mt-0.5">
                        {edu.institution}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400 shrink-0">
                      <span>{edu.startDate} – {edu.endDate}</span>
                    </div>
                  </div>

                  {edu.description && (
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {edu.description}
                    </p>
                  )}

                  {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400 mb-1 font-medium">
                        Focus Modules:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {edu.relevantCoursework.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono text-slate-300 bg-[#141C2E] px-2 py-0.5 rounded border border-[#1E293B]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Certifications (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Official Flight & Technical Licensures
            </h3>

            {publishedCerts.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-blue-500/40 transition-all shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-950/50 border border-blue-800/40 px-2 py-0.5 rounded font-semibold">
                    {cert.date}
                  </span>
                  {cert.credentialId && (
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {cert.credentialId}
                    </span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-100">
                  {cert.name}
                </h4>

                <div className="text-xs font-mono text-cyan-300/80 mt-0.5 mb-2">
                  {cert.issuingOrganization}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {cert.description}
                </p>

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 mt-3"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}

            {/* Languages card directly from CV */}
            <div className="p-5 rounded-xl bg-[#0B101D] border border-[#1E293B]">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                Language Proficiencies
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-200">English</span>
                  <span className="text-cyan-400 font-medium">Professional Working</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-200">Urdu</span>
                  <span className="text-blue-400 font-medium">Native / Bilingual</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-200">Sindhi</span>
                  <span className="text-sky-400 font-medium">Native / Bilingual</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Leadership & Large-Scale Operations Section from CV */}
        {publishedLead.length > 0 && (
          <div className="mt-14 pt-10 border-t border-[#1E293B]">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white font-sans">
                Leadership & Large-Scale Operations
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {publishedLead.map((lead) => (
                <div
                  key={lead.id}
                  className="p-5 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[11px] font-mono text-cyan-400 mb-1">
                      {lead.organization} • {lead.date}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 font-sans leading-snug">
                      {lead.role}
                    </h4>
                    {lead.description && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {lead.description}
                      </p>
                    )}
                    {lead.bullets && lead.bullets.length > 0 && (
                      <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                        {lead.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
