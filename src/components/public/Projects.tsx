import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProjectItem } from '../../types/portfolio';
import { SectionHead, externalUrl, yearOf } from './siteKit';
import { DetailModal, ModalItem } from './DetailModal';

interface ProjectsProps {
  num: string;
  items: ProjectItem[];
}

const INITIAL = 5;

export const Projects: React.FC<ProjectsProps> = ({ num, items }) => {
  const [showAll, setShowAll] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!items.length) return null;

  const shown = showAll ? items : items.slice(0, INITIAL);

  const linksFor = (p: ProjectItem) =>
    [
      { label: 'Live', url: p.liveDemoUrl },
      { label: 'Code', url: p.githubUrl },
      { label: 'Write-up', url: p.documentationUrl },
      { label: 'Video', url: p.videoUrl },
    ]
      .map((l) => ({ ...l, url: externalUrl(l.url) }))
      .filter((l) => l.url && l.url !== '#');

  const modalItems: ModalItem[] = items.map((p) => ({
    id: p.id,
    title: p.title,
    role: p.myRole,
    date: p.projectDate,
    category: p.category,
    summary: p.fullDescription || p.shortDescription,
    mediaUrl: p.projectImage,
    technologies: p.technologies,
    links: linksFor(p),
  }));

  return (
    <section className="sec sec--alt" id="projects" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHead
          num={num}
          title="Projects"
          id="projects-title"
          note="Hardware, flight software and the web products I've shipped along the way."
        />

        <div className="proj-grid">
          {shown.map((p, i) => {
            const links = linksFor(p).slice(0, 2);
            return (
              <article className={`proj rv${i < 2 ? ' proj--lead' : ''}`} key={p.id}>
                <button
                  type="button"
                  className="proj__media"
                  onClick={() => setOpenIdx(i)}
                  aria-label={`Open details: ${p.title}`}
                  tabIndex={-1}
                >
                  {p.projectImage && (
                    <img src={p.projectImage} alt="" loading="lazy" decoding="async" width={800} height={500} />
                  )}
                </button>
                <p className="proj__meta mono">
                  <span>{p.category}</span>
                  <span>{yearOf(p.projectDate)}</span>
                </p>
                <h3 className="proj__title">
                  <button type="button" onClick={() => setOpenIdx(i)} aria-haspopup="dialog">
                    {p.title}
                  </button>
                </h3>
                <p className="proj__desc">{p.shortDescription}</p>
                {links.length > 0 && (
                  <div className="proj__foot">
                    {links.map((l) => (
                      <a key={l.label} className="link-arrow" href={l.url} target="_blank" rel="noopener noreferrer">
                        {l.label} <ArrowUpRight aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {items.length > INITIAL && (
          <div className="proj-more">
            <button type="button" className="btn btn--ghost" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
              {showAll ? 'Show fewer projects' : `Show all ${items.length} projects`}
            </button>
          </div>
        )}
      </div>

      <DetailModal
        isOpen={openIdx !== null}
        onClose={() => setOpenIdx(null)}
        items={modalItems}
        currentIndex={openIdx ?? 0}
        onNavigate={setOpenIdx}
      />
    </section>
  );
};
