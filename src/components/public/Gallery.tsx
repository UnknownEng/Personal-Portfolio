import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Images,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Layers,
  Sparkles,
  Plane,
  Cpu,
  Trophy,
  Award,
  Microscope,
} from 'lucide-react';
import { GalleryItem } from '../../types/portfolio';

interface GalleryProps {
  gallery: GalleryItem[];
}

export const Gallery: React.FC<GalleryProps> = ({ gallery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const publishedItems = useMemo(() => {
    return (gallery || [])
      .filter((item) => item.status === 'published')
      .sort((a, b) => a.order - b.order);
  }, [gallery]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    publishedItems.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return [
      'All',
      'UAV & Drones',
      'Robotics & Hardware',
      'Lab & Research',
      'Competitions & Awards',
      'CAD & Engineering',
      'Certificates',
      ...Array.from(cats).filter(
        (c) =>
          ![
            'All',
            'UAV & Drones',
            'Robotics & Hardware',
            'Lab & Research',
            'Competitions & Awards',
            'CAD & Engineering',
            'Certificates',
          ].includes(c)
      ),
    ];
  }, [publishedItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return publishedItems;
    return publishedItems.filter((item) => item.category === selectedCategory);
  }, [publishedItems, selectedCategory]);

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => ((prev ?? 0) + 1) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((prev) => ((prev ?? 0) - 1 + filteredItems.length) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleCloseLightbox, handleNext, handlePrev]);

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('uav') || c.includes('drone')) return <Plane className="w-3.5 h-3.5" />;
    if (c.includes('robot') || c.includes('hardware')) return <Cpu className="w-3.5 h-3.5" />;
    if (c.includes('competition') || c.includes('award')) return <Trophy className="w-3.5 h-3.5" />;
    if (c.includes('cert')) return <Award className="w-3.5 h-3.5" />;
    if (c.includes('lab') || c.includes('research')) return <Microscope className="w-3.5 h-3.5" />;
    return <Layers className="w-3.5 h-3.5" />;
  };

  return (
    <section id="gallery" className="py-24 relative bg-theme-bg border-t border-theme">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
              <Images className="w-3.5 h-3.5 text-theme-primary" />
              <span className="text-theme-primary">VISUAL DOSSIER & FIELD MEDIA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-theme-text mt-3 tracking-tight font-sans">
              Engineering Gallery
            </h2>
            <p className="text-theme-muted text-xs sm:text-sm mt-2 max-w-2xl font-mono">
              Field tests, autonomous UAV airframes, maritime touchdown telemetry, laboratory testbeds, and competition flight campaigns.
            </p>
          </div>

          <div className="text-xs font-mono text-theme-muted bg-theme-card px-3.5 py-2 rounded-xl border border-theme flex items-center gap-2">
            <span>ARCHIVE:</span>
            <span className="text-theme-primary font-bold">{filteredItems.length}</span>
            <span>ARTIFACTS</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-theme-primary text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-theme-card text-theme-muted hover:text-theme-text border border-theme hover:border-cyan-500/40'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid - Editorial / Masonry Flow */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-theme-card border border-theme">
            <Images className="w-12 h-12 text-theme-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm font-mono text-theme-muted">
              No media items available under "{selectedCategory}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const isLarge = item.featured || index === 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenLightbox(index)}
                  className={`group relative rounded-2xl overflow-hidden bg-theme-card border border-theme hover:border-theme-primary transition-all duration-300 cursor-pointer shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between ${
                    isLarge ? 'sm:col-span-2 lg:col-span-2' : 'col-span-1'
                  }`}
                >
                  {/* Image or CAD Blueprint Fallback */}
                  <div className={`relative w-full overflow-hidden bg-[#0A0E1A] ${isLarge ? 'h-72 sm:h-96' : 'h-64'}`}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.altText || item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      /* High-Tech Blueprint CAD Vector Placeholder */
                      <div className="w-full h-full relative flex items-center justify-center p-6 bg-gradient-to-br from-[#090E1A] via-[#0E1729] to-[#0A1020]">
                        <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
                        
                        {/* Blueprint decorative circle lines */}
                        <div className="absolute w-48 h-48 rounded-full border border-cyan-500/20" />
                        <div className="absolute w-32 h-32 rounded-full border border-dashed border-blue-500/20" />
                        <div className="absolute w-full h-[1px] bg-cyan-500/10" />
                        <div className="absolute h-full w-[1px] bg-cyan-500/10" />

                        {/* Quadcopter / Robotics CAD Schematic */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-300 transition-all duration-300 shadow-lg mb-3">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="font-mono text-xs font-bold text-slate-200 tracking-wider">
                            CAD SCHEMATIC ARTIFACT
                          </div>
                          <div className="font-mono text-[10px] text-cyan-400/80 mt-1">
                            SYS_REF // {item.category.toUpperCase()}
                          </div>
                        </div>

                        {/* Technical corner accents */}
                        <div className="absolute top-3 left-3 text-[9px] font-mono text-slate-500">
                          [POS_X: +24.87]
                        </div>
                        <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-500">
                          [VECTOR_LOCK: OK]
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay for Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-cyan-300 flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {item.featured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            FEATURED
                          </span>
                        )}
                        <span className="p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white/80 group-hover:text-cyan-400 group-hover:scale-110 transition-all">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Bottom Content Preview inside Image Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      {item.date && (
                        <div className="text-[11px] font-mono text-cyan-400 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date}</span>
                        </div>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1 font-sans">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {activeItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={handleCloseLightbox}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-5xl w-full max-h-[92vh] bg-[#090D18] border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Topbar */}
            <div className="flex items-center justify-between p-4 border-b border-[#1E293B] bg-[#080C16]/90">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30">
                  {activeItem.category}
                </span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  ARTIFACT {lightboxIndex + 1} OF {filteredItems.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCloseLightbox}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Area */}
            <div className="relative flex-1 bg-black/60 flex items-center justify-center overflow-hidden min-h-[300px] max-h-[62vh]">
              {activeItem.imageUrl ? (
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.altText || activeItem.title}
                  className="max-h-full max-w-full object-contain mx-auto"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-80 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#090E1A] to-[#0D1528]">
                  <div className="w-20 h-20 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
                    {getCategoryIcon(activeItem.category)}
                  </div>
                  <h4 className="text-slate-100 font-bold font-mono text-base">
                    {activeItem.title}
                  </h4>
                  <p className="text-slate-400 text-xs font-mono mt-1 max-w-md">
                    High-resolution field telemetry artifact registered in technical dossier.
                  </p>
                </div>
              )}

              {/* Navigation Arrows */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-cyan-500 text-white hover:text-slate-950 border border-white/20 hover:border-cyan-400 transition-all duration-200"
                    title="Previous (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-cyan-500 text-white hover:text-slate-950 border border-white/20 hover:border-cyan-400 transition-all duration-200"
                    title="Next (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Bottom Details */}
            <div className="p-5 bg-[#080C16] border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white font-sans">
                    {activeItem.title}
                  </h3>
                  {activeItem.date && (
                    <span className="text-xs font-mono text-slate-400">
                      • {activeItem.date}
                    </span>
                  )}
                </div>
                {activeItem.caption && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {activeItem.caption}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {activeItem.relatedProjectId && (
                  <a
                    href={`#projects`}
                    onClick={handleCloseLightbox}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition"
                  >
                    <span>Inspect Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
