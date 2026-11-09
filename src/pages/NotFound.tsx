import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Moon, Sun } from 'lucide-react';
import '../styles/site.css';

interface NotFoundProps {
  onBackToHome?: () => void;
}

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem('site-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage blocked */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** 404 page in the same "flight test report" style as the public site. */
export const NotFound: React.FC<NotFoundProps> = ({ onBackToHome }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    document.title = 'Page not found | Mansoor Ahmed Rind';

    // Keep 404s out of search results.
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previousRobots = metaRobots?.content || 'index, follow';
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = 'noindex, nofollow';

    return () => {
      if (metaRobots) metaRobots.content = previousRobots;
    };
  }, []);

  useEffect(() => {
    document.body.style.setProperty('--site-body-bg', theme === 'dark' ? '#10100f' : '#f3f1ec');
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('site-theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });

  const goHome = (e: React.MouseEvent) => {
    if (onBackToHome) {
      e.preventDefault();
      onBackToHome();
    }
  };

  return (
    <div className="site nf" data-theme={theme}>
      <header className="hdr is-scrolled">
        <div className="wrap hdr__inner">
          <a href="/" className="brand" onClick={goHome} aria-label="Mansoor Ahmed Rind — home">
            <span className="brand__mark" aria-hidden="true">
              MAR
            </span>
            <span className="brand__name">
              Mansoor Ahmed Rind
              <small>Robotics Engineer</small>
            </span>
          </a>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main id="main" className="wrap nf__main">
        <p className="nf__meta mono">
          <span>Error 404</span>
          <span className="nf__path">{path}</span>
        </p>

        <h1 className="nf__code" aria-label="404">
          404<em aria-hidden="true">.</em>
        </h1>

        <p className="nf__title">This page doesn't exist.</p>
        <p className="nf__lede">
          The link may be old or mistyped. Everything on this site lives on the homepage: selected work, experience,
          research, projects and how to get in touch.
        </p>

        <div className="hero__actions">
          <a className="btn btn--primary" href="/" onClick={goHome}>
            <ArrowLeft aria-hidden="true" /> Back to homepage
          </a>
          <a className="btn btn--ghost" href="/#work">
            See the work <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <ul className="nf__links">
          <li>
            <a className="link-arrow" href="/#projects">
              Projects <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
          <li>
            <a className="link-arrow" href="/#research">
              Research <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
          <li>
            <a className="link-arrow" href="/#contact">
              Contact <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
          <li>
            <a className="link-arrow" href="/CV.pdf" target="_blank" rel="noopener noreferrer">
              Résumé <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
        </ul>
      </main>

      <footer className="ftr">
        <div className="wrap ftr__inner mono">
          <p>© {new Date().getFullYear()} Mansoor Ahmed Rind</p>
          <a href="mailto:ahmedmansoorrind1210@gmail.com">ahmedmansoorrind1210@gmail.com</a>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
