import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProjectItem } from '../../types/portfolio';
import { SectionHead, externalUrl, yearOf } from './siteKit';

interface ResearchProps {
  num: string;
  items: ProjectItem[];
  scholarUrl?: string;
}

export const Research: React.FC<ResearchProps> = ({ num, items, scholarUrl }) => {
  if (!items.length) return null;

  return (
    <section className="sec" id="research" aria-labelledby="research-title">
      <div className="wrap">
        <SectionHead
          num={num}
          title="Research"
          id="research-title"
          note={
            <>
              Papers and technical reviews on UAV localization and navigation.
              {scholarUrl && (
                <>
                  {' '}
                  Full list on{' '}
                  <a className="link" href={scholarUrl} target="_blank" rel="noopener noreferrer">
                    Google Scholar
                  </a>
                  .
                </>
              )}
            </>
          }
        />

        <ol className="refs">
          {items.map((r, i) => {
            const links = [
              { label: 'Read paper', url: r.documentationUrl },
              { label: 'Code', url: r.githubUrl },
              { label: 'Demo', url: r.liveDemoUrl },
            ]
              .map((l) => ({ ...l, url: externalUrl(l.url) }))
              .filter((l) => l.url && l.url !== '#');

            return (
              <li className="ref rv" key={r.id}>
                <span className="ref__n">[{i + 1}]</span>
                <div>
                  <h3 className="ref__title">{r.title}</h3>
                  <p className="ref__venue mono">
                    {[r.category, r.myRole, yearOf(r.projectDate)].filter(Boolean).join(' · ')}
                  </p>
                  {r.shortDescription && <p className="ref__abs">{r.shortDescription}</p>}
                  {links.length > 0 && (
                    <div className="ref__links">
                      {links.map((l) => (
                        <a key={l.label} className="link-arrow" href={l.url} target="_blank" rel="noopener noreferrer">
                          {l.label} <ArrowUpRight aria-hidden="true" />
                        </a>
                      ))}
                    </div>
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
