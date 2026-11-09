import React from 'react';
import { AchievementItem } from '../../types/portfolio';
import { SectionHead, externalUrl, yearOf } from './siteKit';

interface CompetitionsProps {
  num: string;
  items: AchievementItem[];
}

/** Split "Finalist — Teknofest Turkey 2025 | Dynamic UAV Landing" into its parts. */
function parseTitle(title: string): { rank: string; event: string; detail: string } {
  const [head, ...tail] = title.split(/\s+[—–]\s+/);
  const hasRank = tail.length > 0;
  const body = hasRank ? tail.join(' — ') : head;
  const [event, ...detail] = body.split(/\s+\|\s+/);
  return { rank: hasRank ? head : '', event, detail: detail.join(' · ') };
}

export const Competitions: React.FC<CompetitionsProps> = ({ num, items }) => {
  if (!items.length) return null;

  return (
    <section className="sec" id="honors" aria-labelledby="honors-title">
      <div className="wrap">
        <SectionHead
          num={num}
          title="Competitions & honors"
          id="honors-title"
          note="International and national UAV and robotics competitions, entered with teams I led or co-led."
        />

        <table className="results rv">
          <caption className="vh">Competition results</caption>
          <thead className="vh">
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Result</th>
              <th scope="col">Organizer</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => {
              const { rank, event, detail } = parseTitle(a.title);
              const href = externalUrl(a.link);
              return (
                <tr key={a.id}>
                  <td className="r-year mono">{yearOf(a.date)}</td>
                  <td>
                    {rank && <span className="r-rank mono">{rank}</span>}
                    <div className="r-title">
                      {href && href !== '#' ? (
                        <a className="link" href={href} target="_blank" rel="noopener noreferrer">
                          {event}
                        </a>
                      ) : (
                        event
                      )}
                      {detail && <small>{detail}</small>}
                      {a.organization && a.organization !== event && (
                        <small className="r-org-inline muted">{a.organization}</small>
                      )}
                    </div>
                  </td>
                  <td className="r-org">{a.organization !== event ? a.organization : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
