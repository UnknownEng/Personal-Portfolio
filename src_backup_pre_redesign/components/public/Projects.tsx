import React, { useState, useMemo } from 'react';
import {
  Layers,
  ExternalLink,
  FileText,
  Calendar,
  User,
  ArrowRight,
  Shield,
  Tag,
} from 'lucide-react';
import { GithubIcon } from '../ui/Icons';
import { ProjectItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';

interface ProjectsProps {
  projects: ProjectItem[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);

  const publishedProjects = useMemo(() => {
    return projects
      .filter((p) => p.status === 'published')
      .sort((a, b) => a.order - b.order);
  }, [projects]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    publishedProjects.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [publishedProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return publishedProjects;
    return publishedProjects.filter((p) => p.category === selectedCategory);
  }, [publishedProjects, selectedCategory]);

  return (
    <section id="projects" className="py-24 relative bg-[#080B12] border-t border-[#1E293B]">
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>MISSION PORTFOLIO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-sans">
              Selected Technical Projects
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl font-mono">
              Real engineering prototypes: from multi-UAV swarm ground control and GPS-denied navigation to precision landing on moving surface vessels.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-[#0E1526] px-3 py-1.5 rounded-lg border border-[#1E293B]">
            DISPLAYING: <span className="text-cyan-400 font-bold">{filteredProjects.length}</span> PROJECTS
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-[#0E1424] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl bg-[#0D121F] border border-[#1E293B] hover:border-cyan-500/50 hover:bg-[#111728] transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg"
            >
              <div className="p-6">
                {/* Header Tag Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-800/40 font-medium">
                    {project.category}
                  </span>
                  {project.projectDate && (
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      {project.projectDate}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition line-clamp-2 leading-snug font-sans">
                  {project.title}
                </h3>

                {/* Role */}
                {project.myRole && (
                  <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Role: <strong className="text-slate-300 font-medium">{project.myRole}</strong></span>
                  </div>
                )}

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                  {project.shortDescription}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {project.technologies.slice(0, 5).map((tech, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono text-slate-300 bg-[#162035] px-2 py-0.5 rounded border border-[#1E293B]"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 5 && (
                    <span className="text-[10px] font-mono text-cyan-400/80 bg-[#162035] px-1.5 py-0.5 rounded">
                      +{project.technologies.length - 5}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-6 py-3.5 bg-[#090E18] border-t border-[#1E293B] flex items-center justify-between">
                <button
                  onClick={() => setActiveModalProject(project)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 group-hover:translate-x-1 transition duration-200"
                >
                  <span>Technical Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {project.liveDemoUrl && (
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-slate-800 transition"
                      title="Live System / Video Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Project Detail Technical Modal */}
      {activeModalProject && (
        <Modal
          isOpen={!!activeModalProject}
          onClose={() => setActiveModalProject(null)}
          title={activeModalProject.title}
          subtitle={`CATEGORY: ${activeModalProject.category} // DATE: ${activeModalProject.projectDate || 'N/A'}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-sm text-slate-300 font-sans">
            {/* Metadata Bar */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#0A0E1A] border border-[#1E293B] text-xs font-mono">
              <div>
                <span className="text-slate-500">ROLE:</span>{' '}
                <span className="text-cyan-300 font-semibold">{activeModalProject.myRole || 'Engineer'}</span>
              </div>
              <div>
                <span className="text-slate-500">TIMELINE:</span>{' '}
                <span className="text-slate-200">{activeModalProject.projectDate || 'Completed'}</span>
              </div>
            </div>

            {/* Full Technical Description */}
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase text-cyan-400 mb-2">
                Technical Specification & Execution
              </h4>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                {activeModalProject.fullDescription || activeModalProject.shortDescription}
              </p>
            </div>

            {/* Technologies */}
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase text-cyan-400 mb-2">
                Flight Stack & Architecture Stacks
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeModalProject.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* External Links if available */}
            {(activeModalProject.githubUrl || activeModalProject.liveDemoUrl || activeModalProject.documentationUrl) && (
              <div className="pt-4 border-t border-[#1E293B] flex flex-wrap gap-3">
                {activeModalProject.githubUrl && (
                  <a
                    href={activeModalProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>View Repository</span>
                  </a>
                )}
                {activeModalProject.liveDemoUrl && (
                  <a
                    href={activeModalProject.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-xs font-mono text-slate-950 font-bold transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Demonstration</span>
                  </a>
                )}
                {activeModalProject.documentationUrl && (
                  <a
                    href={activeModalProject.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Technical Documentation</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
};
