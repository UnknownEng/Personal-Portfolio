import React from 'react';
import { CertificationItem, EducationItem, LeadershipItem } from '../../types/portfolio';
import { SectionHead, externalUrl } from './siteKit';

interface EducationProps {
  num: string;
  education: EducationItem[];
  certifications: CertificationItem[];
  leadership: LeadershipItem[];
}

const range = (a?: string, b?: string, current?: boolean) => {
  const end = current ? 'Present' : b;
  if (!a) return end || '';
  if (!end || end === a) return a;
  return `${a} — ${end}`;
};

export const Education: React.FC<EducationProps> = ({ num, education, certifications, leadership }) => {
  if (!education.length && !certifications.length && !leadership.length) return null;
  const degrees = education.filter((e) => e.type === 'degree');
  const courses = education.filter((e) => e.type !== 'degree');

  return (
    <section className="sec sec--alt" id="education" aria-labelledby="education-title">
      <div className="wrap">
        <SectionHead num={num} title="Education & leadership" id="education-title" />

        <div className="cred">
          <div className="cred__col rv">
            <h3 className="mono">Education</h3>
            {degrees.map((e) => (
              <div className="cred__item" key={e.id}>
                <strong>{e.degree}</strong>
                <p>{e.institution}</p>
                <span className="mono">{range(e.startDate, e.endDate, e.current)}</span>
                {e.gpa && <span className="cred__honor mono">{e.gpa}</span>}
              </div>
            ))}
            {courses.map((e) => (
              <div className="cred__item" key={e.id}>
                <strong>{e.degree.replace(/^Non-Credit Specialization\s+[—–-]\s+/i, '')}</strong>
                <p>{e.institution}</p>
                <span className="mono">
                  Specialization · {range(e.startDate, e.endDate, e.current)}
                </span>
              </div>
            ))}
          </div>

          {leadership.length > 0 && (
            <div className="cred__col rv">
              <h3 className="mono">Leadership</h3>
              {leadership.map((l) => (
                <div className="cred__item" key={l.id}>
                  <strong>{l.role}</strong>
                  <p>{l.organization}</p>
                  <span className="mono">{l.date}</span>
                  {l.description && <p>{l.description}</p>}
                  {l.bullets?.length > 0 && (
                    <ul>
                      {l.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div className="cred__col rv">
              <h3 className="mono">Certifications</h3>
              {certifications.map((c) => {
                const href = externalUrl(c.credentialUrl || c.pdfUrl);
                return (
                  <div className="cred__item" key={c.id}>
                    <strong>
                      {href && href !== '#' ? (
                        <a className="link" href={href} target="_blank" rel="noopener noreferrer">
                          {c.name}
                        </a>
                      ) : (
                        c.name
                      )}
                    </strong>
                    <p>{c.issuingOrganization}</p>
                    <span className="mono">{c.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
