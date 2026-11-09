import React, { useState } from 'react';
import { ExperienceItem } from '../../types/portfolio';
import { SectionHead } from './siteKit';

interface ExperienceProps {
  num: string;
  items: ExperienceItem[];
}

const INITIAL = 6;

export const Experience: React.FC<ExperienceProps> = ({ num, items }) => {
  const [showAll, setShowAll] = useState(false);
  if (!items.length) return null;
  const shown = showAll ? items : items.slice(0, INITIAL);

  return (
    <section className="sec sec--alt" id="experience" aria-labelledby="experience-title">
      <div className="wrap">
        <SectionHead
          num={num}
          title="Experience"
          id="experience-title"
          note="Labs, competition teams and companies, including two I founded."
        />

        <ol className="xp">
          {shown.map((x) => (
            <li className="xp__item rv" key={x.id}>
              <p className="xp__when mono">
                <span>
                  {x.startDate} — {x.current ? 'Present' : x.endDate}
                </span>
                {x.current && (
                  <span className="xp__now">
                    <span className="status-dot" aria-hidden="true" /> Now
                  </span>
                )}
              </p>

              <div>
                <h3 className="xp__role">{x.position}</h3>
                <p className="xp__org">
                  <b>{x.company}</b>
                  {x.location ? <span className="muted"> · {x.location}</span> : null}
                </p>
                {x.description && <p className="xp__desc">{x.description}</p>}

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

                {x.technologies?.length > 0 && (
                  <ul className="tag-list xp__tags" aria-label="Technologies">
                    {x.technologies.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>

              {x.image || x.companyLogo ? (
                <div className="xp__logo" aria-hidden="true">
                  <img src={x.companyLogo || x.image} alt="" loading="lazy" decoding="async" width={96} height={96} />
                </div>
              ) : (
                <span aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>

        {items.length > INITIAL && (
          <div className="proj-more">
            <button type="button" className="btn btn--ghost" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
              {showAll ? 'Show fewer roles' : `Show all ${items.length} roles`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
