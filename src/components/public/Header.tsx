import React, { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X, ArrowUpRight } from 'lucide-react';

export interface NavEntry {
  id: string;
  label: string;
  num: string;
  /** Show in the desktop bar (the mobile drawer always lists everything). */
  primary: boolean;
}

interface HeaderProps {
  name: string;
  role: string;
  nav: NavEntry[];
  active: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  cvUrl: string;
  email: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export const Header: React.FC<HeaderProps> = ({ name, role, nav, active, theme, onToggleTheme, cvUrl, email }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth >= 1080 && setOpen(false);
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const shortRole = role.split(/[&,|·]/)[0].trim();

  return (
    <>
      <header className={`hdr${scrolled || open ? ' is-scrolled' : ''}`}>
        <div className="wrap hdr__inner">
          <a href="#top" className="brand" aria-label={`${name} — back to top`} onClick={() => setOpen(false)}>
            <span className="brand__mark" aria-hidden="true">
              {initials(name)}
            </span>
            <span className="brand__name">
              {name}
              <small>{shortRole}</small>
            </span>
          </a>

          <nav className="nav" aria-label="Primary">
            {nav
              .filter((n) => n.primary)
              .map((n) => (
                <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}>
                  <span>{n.num}</span>
                  {n.label}
                </a>
              ))}
          </nav>

          <div className="hdr__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
            >
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <a className="btn btn--ghost hdr__cv" href={cvUrl} target="_blank" rel="noopener noreferrer">
              Résumé
            </a>
            <button
              type="button"
              className="icon-btn menu-btn"
              aria-expanded={open}
              aria-controls="site-drawer"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="drawer" id="site-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
          <nav className="drawer__nav" aria-label="Sections">
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
                <span>{n.num}</span>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="drawer__foot">
            <a className="btn btn--primary" href={cvUrl} target="_blank" rel="noopener noreferrer">
              Download résumé <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="btn btn--ghost" href={`mailto:${email}`}>
              Email me
            </a>
          </div>
        </div>
      )}
    </>
  );
};
