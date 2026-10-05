import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Application Anomaly Caught by ErrorBoundary]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-[#0D121F] border border-rose-500/30 shadow-2xl shadow-rose-950/40 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 font-mono text-[11px] mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>INTERFACE FAULT SAFEGUARD ACTIVE</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {this.props.fallbackTitle || 'Component Rendering Anomaly'}
            </h2>

            <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
              The application encountered an unexpected runtime error and safely prevented a screen blackout.
            </p>

            {this.state.error && (
              <div className="text-left p-3 rounded-lg bg-[#060911] border border-slate-800 text-[11px] font-mono text-rose-300/90 mb-6 overflow-x-auto max-h-32">
                <span className="text-slate-500 select-none">Error: </span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RELOAD INTERFACE</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition border border-slate-700"
              >
                <span>RECOVER STATE</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#090D18] hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs transition border border-slate-800"
              >
                <Home className="w-3.5 h-3.5" />
                <span>LIVE SITE</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
