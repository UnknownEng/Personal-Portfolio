import React from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { ExperienceItem, HeroData, SocialLinkItem } from '../../types/portfolio';
import { SocialPlatformIcon } from '../ui/Icons';
import { externalUrl, useLocalTime } from './siteKit';

interface HeroProps {
  hero: HeroData;
  location: string;
  availability: string;
  current: ExperienceItem[];
  socials: SocialLinkItem[];
  cvUrl: string;
  email: string;
}

export const Hero: React.FC<HeroProps> = ({ hero, location, availability, current, socials, cvUrl, email }) => {
  const time = useLocalTime('Asia/Karachi');
  const words = hero.name.trim().split(/\s+/);
  const first = words.length > 2 ? words[0] : words.slice(0, -1).join(' ');
  const rest = words.length > 2 ? words.slice(1).join(' ') : words[words.length - 1];
  const chips = hero.subtitle
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  const visibleSocials = socials.filter((s) => s.platform !== 'email').slice(0, 5);

  return (
    <section className="hero wrap" id="top" aria-labelledby="hero-name">
      <div className="hero__meta mono rv">
        <span>
          <span className="status-dot" aria-hidden="true" />
          {availability}
        </span>
        <span>
          {location}
          {time && (
            <>
              {' '}· <time aria-label={`Local time ${time}`}>{time} PKT</time>
            </>
          )}
        </span>
      </div>

      <div className="hero__grid">
        <div className="hero__text rv">
          <p className="hero__kicker mono">{hero.title}</p>
          <h1 className="hero__name" id="hero-name">
            <span>{first}</span>
            <span>
              {rest}
              <em aria-hidden="true">.</em>
            </span>
          </h1>
          <p className="hero__lede">{hero.shortIntroduction}</p>

          {chips.length > 0 && (
            <ul className="tag-list hero__chips" aria-label="Focus areas">
              {chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}

          <div className="hero__actions">
            <a className="btn btn--primary" href="#work">
              See the work <ArrowDown aria-hidden="true" />
            </a>
            <a className="btn btn--ghost" href={cvUrl} target="_blank" rel="noopener noreferrer">
              Résumé <ArrowUpRight aria-hidden="true" />
            </a>
            <div className="hero__social">
              <a className="icon-btn" href={`mailto:${email}`} aria-label="Email">
                <SocialPlatformIcon platform="email" />
              </a>
              {visibleSocials.map((s) => (
                <a
                  key={s.id}
                  className="icon-btn"
                  href={externalUrl(s.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label || s.platform}
                  title={s.label || s.platform}
                >
                  <SocialPlatformIcon platform={s.platform} icon={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {hero.profileImage && (
          <figure className="hero__figure rv">
            <div className="frame">
              <img
                src={hero.profileImage}
                alt={`Portrait of ${hero.name}`}
                width={480}
                height={600}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <figcaption className="mono">
              <span>Fig. 01</span>
              <span>{hero.name}</span>
            </figcaption>
          </figure>
        )}
      </div>

      {current.length > 0 && (
        <div className="now rv">
          <p className="now__label mono">Currently</p>
          <ul className="now__list">
            {current.slice(0, 3).map((x) => (
              <li className="now__item" key={x.id}>
                <strong>{x.position}</strong>
                <span>{x.company}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
