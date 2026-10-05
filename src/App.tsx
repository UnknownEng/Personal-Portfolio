import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { PublicPortfolio } from './pages/PublicPortfolio';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { Terminal, Shield, ArrowLeft } from 'lucide-react';

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: portfolioLoading } = usePortfolio();

  // Navigation state: 'public' | 'admin'
  const [view, setView] = useState<'public' | 'admin'>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path.startsWith('/admin') || hash === '#admin' ? 'admin' : 'public';
  });

  // Sync with browser URL
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/admin') || hash === '#admin') {
        setView('admin');
      } else {
        setView('public');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    setView('admin');
    window.history.pushState({}, '', '/admin');
  };

  const navigateToPublic = () => {
    setView('public');
    window.history.pushState({}, '', '/');
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

  // Admin View
  if (view === 'admin') {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => setView('admin')}
          onBackToSite={navigateToPublic}
        />
      );
    }
    return <AdminLayout onViewLiveSite={navigateToPublic} />;
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
    <AuthProvider>
      <PortfolioProvider>
        <AppRouter />
      </PortfolioProvider>
    </AuthProvider>
  );
};

export default App;
