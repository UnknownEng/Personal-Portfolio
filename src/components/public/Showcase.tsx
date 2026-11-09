import React, { useState } from 'react';
import { ShowcaseItem } from '../../types/portfolio';
import { ArrowUpRight } from 'lucide-react';
import { SectionHead, externalUrl, pad, yearOf } from './siteKit';
import { DetailModal, ModalItem } from './DetailModal';

interface ShowcaseProps {
  num: string;
  items: ShowcaseItem[];
}

/** Selected work: an index of entries with a sticky preview on wide screens. */
export const Showcase: React.FC<ShowcaseProps> = ({ num, items }) => {
  const [active, setActive] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!items.length) return null;
  const current = items[Math.min(active, items.length - 1)];

  const modalItems: ModalItem[] = items.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    date: s.date,
    category: s.category,
    organization: s.organization,
    summary: s.summary,
    mediaUrl: s.mediaUrl,
    highlights: s.highlights,
    technologies: s.technologies,
    links: s.links,
  }));
  const currentLinks = (current.links || [])
    .map((l) => ({ ...l, url: externalUrl(l.url) }))
    .filter((l) => l.url && l.url !== '#');

  return (
    <section className="sec" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead
          num={num}
          title="Selected work"
          id="work-title"
          note="Flight-tested systems, competition airframes and research, from swarm formation control to precision landing on a moving boat."
        />

        <div className="work">
          <ol className="work__list">
            {items.map((s, i) => (
              <li key={s.id} className="rv">
                <button
                  type="button"
                  className={`work__row${i === active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setOpenIdx(i)}
                  aria-haspopup="dialog"
                >
                  <span className="work__idx mono">{pad(i + 1)}</span>
                  <span className="work__title">{s.title}</span>
                  <span className="work__year mono">{yearOf(s.date)}</span>
                  <span className="work__meta mono">
                    {s.category} — {s.organization.split('(')[0].trim()}
                  </span>
                  {s.mediaUrl && (
                    <span className="work__thumb">
                      <img src={s.mediaUrl} alt="" loading="lazy" decoding="async" width={640} height={360} />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>

          <aside className="work__preview" aria-label={`Preview: ${current.title}`}>
            <div className="frame">
              {current.mediaUrl && <img key={current.id} src={current.mediaUrl} alt="" decoding="async" />}
            </div>
            <div className="work__preview-body">
              <p className="mono muted">
                Fig. {pad(active + 1)} — {current.subtitle || current.category}
              </p>
              <p>{current.summary}</p>
              {currentLinks.length > 0 && (
                <div className="work__links">
                  {currentLinks.map((l) => (
                    <a key={l.label} className="link-arrow" href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label} <ArrowUpRight aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
              <p className="mono muted">Select an entry for the full write-up →</p>
            </div>
          </aside>
        </div>
      </div>

      <DetailModal
        isOpen={openIdx !== null}
        onClose={() => setOpenIdx(null)}
        items={modalItems}
        currentIndex={openIdx ?? 0}
        onNavigate={(i) => {
          setOpenIdx(i);
          setActive(i);
        }}
      />
    </section>
  );
};
