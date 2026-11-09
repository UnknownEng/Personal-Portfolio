import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { PublicPortfolio } from './pages/PublicPortfolio';
import { NotFound } from './pages/NotFound';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

/**
 * Public site only. The admin CMS is a separate entry (admin.html / src/admin-main.tsx)
 * published at a secret path, so this bundle contains no admin code, routes or links.
 */

/** Mirrors the public site's theme choice so the loading screen doesn't flash the wrong colour. */
const prefersDarkSite = (): boolean => {
  try {
    const saved = localStorage.getItem('site-theme');
    if (saved === 'light' || saved === 'dark') return saved === 'dark';
  } catch {
    /* storage blocked */
  }
  return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
};

const isHome = () => {
  const p = window.location.pathname;
  return p === '/' || p === '' || p === '/index.html';
};

const PublicRouter: React.FC = () => {
  const { isLoading } = usePortfolio();

  if (!isHome()) {
    document.title = 'Page not found | Mansoor Ahmed Rind';
    return <NotFound onBackToHome={() => window.location.assign('/')} />;
  }

  if (isLoading) {
    // Quiet placeholder in the site's paper/graphite colours while content loads (usually a few ms).
    return (
      <div
        aria-busy="true"
        aria-label="Loading"
        style={{ minHeight: '100vh', background: prefersDarkSite() ? '#10100f' : '#f3f1ec' }}
      />
    );
  }

  return <PublicPortfolio />;
};

export const App: React.FC = () => (
  <ErrorBoundary fallbackTitle="Something went wrong">
    <PortfolioProvider>
      <PublicRouter />
    </PortfolioProvider>
  </ErrorBoundary>
);

export default App;
