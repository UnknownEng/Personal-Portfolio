import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Terminal, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Mail, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const { login, setupAdmin, isInitialized, allowDevFallback } = useAuth();

  // Setup form state
  const [setupUsername, setSetupUsername] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (setupPassword !== setupConfirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (setupPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    const res = await setupAdmin(setupUsername, setupEmail, setupPassword, setupConfirm);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Failed to initialize administrator account.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Authentication rejected. Verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

      <div className="w-full max-w-md bg-[#0D121F] border border-[#1E293B] rounded-2xl shadow-2xl p-8 relative z-10">
        
        {/* Header Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Terminal className="w-6 h-6" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
            {!isInitialized ? 'First-Run CMS Setup' : 'Command Center Login'}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {!isInitialized
              ? 'Initialize your master administrator account to secure this portfolio.'
              : 'Mansoor Ahmed Rind • Engineering Portfolio CMS'}
          </p>
        </div>

        {/* Notice for First-Run vs Dev */}
        {!isInitialized ? (
          <div className="mb-6 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-200">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>INITIAL SETUP REQUIRED</span>
            </div>
            <p className="text-[11px] text-slate-300">
              No administrator account exists yet. Create your credentials below to establish encrypted access.
            </p>
          </div>
        ) : allowDevFallback ? (
          <div className="mb-6 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] font-mono text-amber-200">
            <span className="font-bold">[DEVELOPMENT MODE]:</span> Dev fallback account active (admin / admin123). Set strong production credentials in CMS Settings.
          </div>
        ) : null}

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* First-Run Setup Form */}
        {!isInitialized ? (
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                ADMIN USERNAME
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={setupUsername}
                  onChange={(e) => setSetupUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080C16] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. mansoor"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                ADMIN EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080C16] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. ahmedmansoorrind1210@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                MASTER PASSWORD (min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080C16] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080C16] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>INITIALIZING SECURE ACCOUNT...</span>
              ) : (
                <>
                  <span>CREATE ADMINISTRATOR ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Standard Secure Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                USERNAME OR EMAIL
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080C16] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  placeholder="Username or Email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080C16] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>ACCESS COMMAND DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-[#1E293B] text-center">
          <button
            type="button"
            onClick={onBackToSite}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition"
          >
            ← Return to Public Portfolio
          </button>
        </div>

      </div>
    </div>
  );
};
