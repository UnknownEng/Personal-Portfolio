import React from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

/**
 * Admin CMS entry. Built as its own page (admin.html) and published only at the secret
 * path set in the ADMIN_PATH environment variable (see scripts/place-admin.mjs).
 * Nothing in the public site links to or bundles this code.
 */

const goToSite = () => window.location.assign('/');

const AdminRouter: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: dataLoading } = usePortfolio();

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#080B12] text-white flex flex-col items-center justify-center font-mono">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <div className="text-xs text-cyan-400 font-semibold tracking-wider">Loading…</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <AdminLayout onViewLiveSite={goToSite} />
  ) : (
    <AdminLogin onLoginSuccess={() => undefined} onBackToSite={goToSite} />
  );
};

export const AdminApp: React.FC = () => (
  <ErrorBoundary fallbackTitle="Admin Safe Mode">
    <AuthProvider>
      <PortfolioProvider>
        <AdminRouter />
      </PortfolioProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default AdminApp;
