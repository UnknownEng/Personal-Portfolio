import React from 'react';
import { SocialLinkItem } from '../../types/portfolio';
import { externalUrl } from './siteKit';

interface FooterProps {
  name: string;
  footerText: string;
  socials: SocialLinkItem[];
  cvUrl: string;
}

export const Footer: React.FC<FooterProps> = ({ name, footerText, socials, cvUrl }) => {
  const year = new Date().getFullYear();
  // Keep the CMS credit line but never show a stale year.
  const credit = (footerText || '')
    .replace(/©\s*\d{4}\s*/g, '')
    .replace(new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.?\\s*`), '')
    .replace(/\s*All rights reserved\.?/i, '')
    .trim();

  return (
    <footer className="ftr">
      <div className="wrap ftr__inner mono">
        <p>
          © {year} {name}
          {credit ? ` · ${credit}` : ''}
        </p>
        <nav className="ftr__links" aria-label="Footer">
          {socials.map((s) => (
            <a key={s.id} href={externalUrl(s.url)} target={s.platform === 'email' ? undefined : '_blank'} rel="noopener noreferrer">
              {s.label || s.platform}
            </a>
          ))}
          <a href={cvUrl} target="_blank" rel="noopener noreferrer">
            Résumé
          </a>
          <a href="#top">Back to top ↑</a>
        </nav>
      </div>
    </footer>
  );
};
