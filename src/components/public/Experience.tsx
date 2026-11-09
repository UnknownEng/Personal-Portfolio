import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ExperienceItem } from '../../types/portfolio';
import { SectionHead, externalUrl, pad } from './siteKit';

interface ExperienceProps {
  num: string;
  items: ExperienceItem[];
}

/** Every role in a horizontal slider: arrows, swipe/trackpad, and keyboard all work. */
export const Experience: React.FC<ExperienceProps> = ({ num, items }) => {
  const trackRef = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** Distance between the left edges of two neighbouring cards (card width + gap). */
  const stepOf = (el: HTMLElement) => {
    const cards = el.children as HTMLCollectionOf<HTMLElement>;
    return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : el.clientWidth;
  };
  const currentIndex = (el: HTMLElement) => Math.round(el.scrollLeft / stepOf(el));

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const step = stepOf(el);
    const atEndNow = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const shown = Math.max(1, Math.floor((el.clientWidth + 20) / step));
    setVisible(shown);
    setIndex(atEndNow ? Math.max(0, items.length - shown) : currentIndex(el));
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(atEndNow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, items.length]);

  const go = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    // Read the live scroll position (not state) so fast repeated clicks keep stepping.
    const step = stepOf(el);
    const next = Math.max(0, Math.min(items.length - 1, currentIndex(el) + dir));
    el.scrollTo({ left: next * step, behavior: 'smooth' });
    // Refresh the counter/buttons once the smooth scroll settles, even if scroll events are throttled.
    window.setTimeout(update, 500);
  };

  if (!items.length) return null;

  return (
    <section className="sec sec--alt" id="experience" aria-labelledby="experience-title">
      <div className="wrap">
        <SectionHead
          num={num}
          title="Experience"
          id="experience-title"
          note={`${items.length} roles across labs, competition teams and companies, newest first.`}
        />

        <div className="xps-bar rv">
          <p className="mono muted" aria-live="polite">
            {visible > 1
              ? `${pad(index + 1)}–${pad(Math.min(items.length, index + visible))}`
              : pad(index + 1)}{' '}
            / {pad(items.length)}
          </p>
          <div className="xps-btns">
            <button type="button" className="icon-btn xps-btn" onClick={() => go(-1)} disabled={atStart} aria-label="Previous role">
              <ArrowLeft aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn xps-btn" onClick={() => go(1)} disabled={atEnd} aria-label="Next role">
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <ol
          className="xps rv"
          ref={trackRef}
          tabIndex={0}
          aria-label="Experience, scroll sideways to see every role"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              go(1);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              go(-1);
            }
          }}
        >
          {items.map((x) => {
            const links = (x.links || []).map((l) => ({ ...l, url: externalUrl(l.url) })).filter((l) => l.url && l.url !== '#');
            const logo = x.companyLogo || x.image;
            return (
              <li className="xpc" key={x.id}>
                <div className="xpc__top">
                  <p className="xpc__when mono">
                    {x.startDate} — {x.current ? 'Present' : x.endDate}
                    {x.current && (
                      <span className="xp__now">
                        <span className="status-dot" aria-hidden="true" /> Now
                      </span>
                    )}
                  </p>
                  {logo && (
                    <span className="xpc__logo" aria-hidden="true">
                      <img src={logo} alt="" loading="lazy" decoding="async" width={44} height={44} />
                    </span>
                  )}
                </div>
                <h3 className="xp__role">{x.position}</h3>
                <p className="xp__org">
                  <b>{x.company}</b>
                  {x.location ? <span className="muted"> · {x.location}</span> : null}
                </p>
                {x.description && <p className="xpc__desc">{x.description}</p>}

                {x.achievements?.length > 0 && (
                  <ul className="xp__points">
                    {x.achievements.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                )}

                {x.responsibilities?.length > 0 && (
                  <details className="xp__more">
                    <summary className="mono">What I did</summary>
                    <ul className="xp__points">
                      {x.responsibilities.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </details>
                )}

                <div className="xpc__foot">
                  {links.length > 0 && (
                    <div className="xpc__links">
                      {links.map((l) => (
                        <a key={l.label} className="link-arrow" href={l.url} target="_blank" rel="noopener noreferrer">
                          {l.label} <ArrowUpRight aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  )}
                  {x.technologies?.length > 0 && (
                    <ul className="tag-list" aria-label="Technologies">
                      {x.technologies.slice(0, 6).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
