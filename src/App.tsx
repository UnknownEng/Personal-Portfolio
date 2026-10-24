import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { PublicPortfolio } from './pages/PublicPortfolio';
import { NotFound } from './pages/NotFound';
import { Terminal, Shield, Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Code-split admin modules to drastically reduce initial visitor bundle size
const AdminLogin = React.lazy(() =>
  import('./components/admin/AdminLogin').then((module) => ({ default: module.AdminLogin }))
);
const AdminLayout = React.lazy(() =>
  import('./components/admin/AdminLayout').then((module) => ({ default: module.AdminLayout }))
);

const resolveInitialView = (): 'public' | 'admin' | '404' => {
  const path = window.location.pathname;
  const hash = window.location.hash;
  if (path.startsWith('/admin') || hash === '#admin') return 'admin';
  if (path === '/' || path === '' || path === '/index.html' || path === '/CV.pdf') return 'public';
  return '404';
};

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: portfolioLoading } = usePortfolio();

  // Navigation state: 'public' | 'admin' | '404'
  const [view, setView] = useState<'public' | 'admin' | '404'>(resolveInitialView);

  // Sync with browser URL and update page title
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/admin') || hash === '#admin') {
        setView('admin');
        document.title = 'Admin CMS | Secure Control Panel';
      } else if (path === '/' || path === '' || path === '/index.html' || path === '/CV.pdf') {
        setView('public');
        document.title = 'Mansoor Ahmed Rind — UAV & Robotics Systems Engineer';
      } else {
        setView('404');
        document.title = '404 Flight Path Error — Coordinate Deviation | Mansoor Ahmed Rind';
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    setView('admin');
    window.history.pushState({}, '', '/admin');
    document.title = 'Admin CMS | Secure Control Panel';
  };

  const navigateToPublic = () => {
    setView('public');
    window.history.pushState({}, '', '/');
    document.title = 'Mansoor Ahmed Rind — UAV & Robotics Systems Engineer';
  };

  if (authLoading || portfolioLoading) {
    return (
      <div className="min-h-screen bg-[#080B12] text-white flex flex-col items-center justify-center font-mono">
        <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
          <Terminal className="w-6 h-6" />
        </div>
        <div className="text-xs text-cyan-400 font-semibold tracking-wider animate-pulse">
          INITIALIZING TELEMETRY STACK...
        </div>
      </div>
    );
  }

  // 404 View
  if (view === '404') {
    return <NotFound onBackToHome={navigateToPublic} />;
  }

  // Admin View
  if (view === 'admin') {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#080B12] text-white flex flex-col items-center justify-center font-mono">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <div className="text-xs text-cyan-400 font-semibold tracking-wider">
              LOADING SECURE WORKSPACE...
            </div>
          </div>
        }
      >
        {!isAuthenticated ? (
          <AdminLogin
            onLoginSuccess={() => setView('admin')}
            onBackToSite={navigateToPublic}
          />
        ) : (
          <AdminLayout onViewLiveSite={navigateToPublic} />
        )}
      </React.Suspense>
    );
  }

  // Public View
  return (
    <>
      <PublicPortfolio onNavigateAdmin={navigateToAdmin} />

      {/* If admin is logged in, show floating return-to-admin bar */}
      {isAuthenticated && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={navigateToAdmin}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-cyan-500 text-slate-950 font-mono text-xs font-bold shadow-xl hover:bg-cyan-400 transition"
          >
            <Shield className="w-4 h-4" />
            <span>Return to Admin CMS</span>
          </button>
        </div>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Application Safe Mode">
      <AuthProvider>
        <PortfolioProvider>
          <AppRouter />
        </PortfolioProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
