import React, { useEffect } from 'react';
import { PlaneTakeoff, Home, ArrowLeft, Terminal, Compass, Mail } from 'lucide-react';

interface NotFoundProps {
  onBackToHome?: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onBackToHome }) => {
  useEffect(() => {
    document.title = '404 Flight Path Error — Coordinate Deviation | Antigracity';

    // Ensure search engines do not index 404 pages
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previousRobots = metaRobots?.content || 'index, follow';
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = 'noindex, nofollow';

    return () => {
      if (metaRobots) {
        metaRobots.content = previousRobots;
      }
      document.title = 'Antigracity | Mansoor Ahmed Rind — UAV & Robotics Systems Engineer';
    };
  }, []);

  const handleReturnHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#080b12] text-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full border border-sky-500/30 animate-ping" />
        <div className="w-[450px] h-[450px] sm:w-[700px] sm:h-[700px] rounded-full border border-sky-500/20" />
        <div className="w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full border border-sky-500/10" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
        {/* Aerospace Emblem */}
        <div className="w-20 h-20 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6 shadow-xl shadow-sky-500/10">
          <PlaneTakeoff className="w-10 h-10 animate-pulse" />
        </div>

        {/* Telemetry Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-rose-500/40 text-rose-400 font-mono text-xs font-semibold mb-4 tracking-widest">
          <Terminal className="w-3.5 h-3.5" />
          <span>FLIGHT TELEMETRY EXCEPTION // STATUS 404</span>
        </div>

        {/* Status Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-3">
          404 <span className="text-sky-400 font-mono text-3xl sm:text-4xl font-normal block sm:inline">// LOST SIGNAL</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-md leading-relaxed">
          The requested flight path or waypoint does not exist within the Antigracity telemetry grid. The coordinates may have shifted or the page was decommissioned.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReturnHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Radar</span>
          </button>

          <a
            href="/#projects"
            onClick={(e) => {
              e.preventDefault();
              handleReturnHome();
              setTimeout(() => {
                const el = document.getElementById('projects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition hover:scale-105"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Explore Projects</span>
          </a>

          <a
            href="mailto:mansoorahmedrind@gmail.com"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-slate-400 hover:text-sky-400 text-xs font-mono transition"
          >
            <Mail className="w-4 h-4" />
            <span>Report Issue</span>
          </a>
        </div>

        {/* Diagnostics Info */}
        <div className="mt-12 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-slate-400 text-left w-full">
          <div><span className="text-slate-400">TIMESTAMP:</span> {new Date().toISOString()}</div>
          <div><span className="text-slate-400">WAYPOINT:</span> {typeof window !== 'undefined' ? window.location.pathname : '/'}</div>
          <div><span className="text-slate-400">ORIGIN:</span> ANTIGRACITY_AUTONOMY_CORE</div>
        </div>
      </div>
    </main>
  );
};
