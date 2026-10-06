import React, { useState } from 'react';
import { ProjectItem } from '../../types/portfolio';
import { DetailModal, ModalItem } from './DetailModal';
import { ChevronLeft, ChevronRight, ArrowUpRight, FolderGit2 } from 'lucide-react';
import { sanitizeUrl, isSafeUrl } from '../../utils/url';

interface ProjectsProps {
  projects: ProjectItem[];
  currentLang?: 'en' | 'zh' | 'ur';
}

export const Projects: React.FC<ProjectsProps> = ({
  projects,
  currentLang = 'en',
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModalIndex, setSelectedModalIndex] = useState(0);

  // Separate engineering systems and products from academic papers
  const engineeringProjects = projects.filter(
    (p) => !p.category.includes('Research') && !p.category.includes('Review') && !p.category.includes('Paper')
  );
  const displayProjects = engineeringProjects.length > 0 ? engineeringProjects : projects;

  // Featured projects for the master carousel (prioritizing startup products and flagship UAVs)
  const featuredProjects = displayProjects.filter((p) => p.featured);
  const activeFeatured = featuredProjects.length > 0 ? featuredProjects : displayProjects;

  const getProjectImage = (p: ProjectItem, idx: number) => {
    if (p.projectImage) return p.projectImage;
    const projectImages = [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', // telemetry GCS
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80', // loitering drone
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80', // interceptor
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', // precision landing
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80', // medical drone
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', // carbon fiber avionics
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80', // waypoint quad
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // telemetry packet analyzer
    ];
    return projectImages[idx % projectImages.length];
  };

  const modalItems: ModalItem[] = displayProjects.map((p, idx) => ({
    id: p.id,
    title: p.title,
    subtitle: p.category,
    date: p.projectDate,
    category: p.category,
    organization: p.myRole || 'Lead UAV Engineer',
    summary: p.fullDescription || p.shortDescription,
    mediaUrl: getProjectImage(p, idx),
    externalUrl: p.liveDemoUrl || p.githubUrl || p.documentationUrl,
    highlights: [
      `Role: ${p.myRole || 'System Design & Flight Integration'}`,
      `Category: ${p.category}`,
      ...(p.technologies ? [`Key Technologies: ${p.technologies.join(', ')}`] : []),
    ],
    technologies: p.technologies || [],
  }));

  const handleOpenModal = (index: number) => {
    setSelectedModalIndex(index);
    setModalOpen(true);
  };

  const activeCarouselProject = activeFeatured[carouselIndex] || displayProjects[0];

  return (
    <section className="section" id="projects">
      <div className="container">
        <h1>{currentLang === 'zh' ? '工程系统与产品' : 'Engineering Projects & Products'}</h1>

        {/* Master Project Carousel matching Steven Feng's site */}
        <div className="project-wrapper w-full mb-12">
          <div className="masterCarousel relative rounded-2xl overflow-hidden shadow-2xl w-full min-h-[460px] md:min-h-[500px]">
            <img
              src={getProjectImage(activeCarouselProject, carouselIndex)}
              alt={activeCarouselProject?.title}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-700"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Arrows */}
            <button
              onClick={() =>
                setCarouselIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition border border-white/20 z-10"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                setCarouselIndex((prev) => (prev + 1) % featuredProjects.length)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition border border-white/20 z-10"
              aria-label="Next project"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Caption */}
            <div className="carousel-caption-custom">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-sky-500 text-white">
                  {activeCarouselProject?.category}
                </span>
                <span className="text-xs text-sky-300 font-semibold">• {activeCarouselProject?.projectDate}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                {activeCarouselProject?.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mb-4">
                {activeCarouselProject?.shortDescription}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const origIdx = projects.findIndex((p) => p.id === activeCarouselProject?.id);
                    handleOpenModal(origIdx >= 0 ? origIdx : 0);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition shadow-lg hover:scale-105"
                >
                  <span>{currentLang === 'zh' ? '阅读更多' : 'Read More'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                {activeCarouselProject?.liveDemoUrl && isSafeUrl(activeCarouselProject.liveDemoUrl) && (
                  <a
                    href={sanitizeUrl(activeCarouselProject.liveDemoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-lg hover:scale-105"
                  >
                    <span>{currentLang === 'zh' ? '访问在线系统' : 'Live Platform'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {featuredProjects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    carouselIndex === idx ? 'w-6 bg-sky-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid of All Project Cards (.publication-card style) */}
        <div className="publications-wrapper w-full">
          <div className="grid">
            {displayProjects.map((proj, idx) => (
              <div
                key={proj.id}
                className="publication-card cursor-pointer group"
                onClick={() => handleOpenModal(idx)}
              >
                <div
                  className="background-media"
                  style={{
                    backgroundImage: `url(${getProjectImage(proj, idx)})`,
                  }}
                />

                <div className="content">
                  <div
                    className="publication-type"
                    data-type={
                      proj.category.includes('Swarm')
                        ? 'IEEE'
                        : proj.category.includes('Teknofest')
                        ? 'Teknofest'
                        : proj.category.includes('Aerothon')
                        ? 'Aerothon'
                        : 'ACM'
                    }
                  >
                    {proj.category}
                  </div>

                  <h3 className="header line-clamp-2">
                    {proj.title}
                  </h3>
                  <h4 className="subtitle">
                    {proj.projectDate}
                  </h4>

                  <div className="flex items-center gap-2 mt-auto w-full">
                    <button
                      type="button"
                      className="btn flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(idx);
                      }}
                    >
                      {currentLang === 'zh' ? '阅读更多' : 'Read More'}
                    </button>
                    {proj.liveDemoUrl && isSafeUrl(proj.liveDemoUrl) && (
                      <a
                        href={sanitizeUrl(proj.liveDemoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold transition shrink-0 flex items-center gap-1"
                        title="Visit Live Application"
                      >
                        <span>Demo</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Modal */}
        <DetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          items={modalItems}
          currentIndex={selectedModalIndex}
          onNavigate={(newIdx) => setSelectedModalIndex(newIdx)}
        />
      </div>
    </section>
  );
};
