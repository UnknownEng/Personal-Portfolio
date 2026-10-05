import React from 'react';
import { ArrowRight, Download, Terminal, Shield, Cpu, Activity } from 'lucide-react';
import { LinkedinIcon } from '../ui/Icons';
import { HeroData } from '../../types/portfolio';
import { DroneVisualization } from './DroneVisualization';

interface HeroProps {
  hero: HeroData;
  droneEnabled: boolean;
}

export const Hero: React.FC<HeroProps> = ({ hero, droneEnabled }) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden"
    >
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

      {/* Decorative Radar Sweep Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-cyan-500/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full border border-blue-500/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>{hero.badge || 'AUTONOMY & ROBOTICS SYSTEMS • ISLAMABAD, PK'}</span>
            </div>

            {/* Main Name Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
                {hero.name || 'Mansoor Ahmed Rind'}
              </h1>
              <div className="mt-2 text-lg sm:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent font-mono">
                {hero.title || 'UAV Electronics & Robotics Systems Engineer'}
              </div>
            </div>

            {/* Subtitle / Key Focuses */}
            <p className="text-sm sm:text-base font-mono text-cyan-200/80 border-l-2 border-cyan-500/50 pl-3">
              {hero.subtitle || 'NUST Gold Medalist • Autonomous UAV Navigation • Swarm Robotics • Flight-Stack Integration'}
            </p>

            {/* Introduction paragraph */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              {hero.shortIntroduction ||
                'Bachelor’s in Electrical Engineering student at NUST Islamabad with specialized expertise in UAV Electronics and Automation. Proven experience in multi-UAV swarm autonomy, GPS-denied navigation, and field-ready robotic systems.'}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg py-2">
              <div className="bg-[#0D121F] border border-[#1E293B] rounded-lg p-2.5">
                <div className="text-[10px] font-mono text-slate-400">ACADEMIC HONORS</div>
                <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                  ★ Gold Medalist
                </div>
              </div>
              <div className="bg-[#0D121F] border border-[#1E293B] rounded-lg p-2.5">
                <div className="text-[10px] font-mono text-slate-400">TEKNOFEST FINALIST</div>
                <div className="text-xs sm:text-sm font-bold text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
                  160+ Teams (2024, 2025)
                </div>
              </div>
              <div className="bg-[#0D121F] border border-[#1E293B] rounded-lg p-2.5">
                <div className="text-[10px] font-mono text-slate-400">LEADERSHIP</div>
                <div className="text-xs sm:text-sm font-bold text-blue-400 font-mono flex items-center gap-1 mt-0.5">
                  AeroMavericks Captain
                </div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={hero.primaryButtonLink || '#projects'}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition duration-200"
              >
                <span>{hero.primaryButtonText || 'Inspect Technical Projects'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={hero.secondaryButtonLink || 'https://www.linkedin.com/in/mansoorahmedrind'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] hover:border-blue-500/50 text-slate-200 font-mono text-xs sm:text-sm transition duration-200"
              >
                <LinkedinIcon className="w-4 h-4 text-blue-400" />
                <span>{hero.secondaryButtonText || 'Connect on LinkedIn'}</span>
              </a>

              <a
                href="/CV.pdf"
                download="Mansoor_Ahmed_Rind_CV.pdf"
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-transparent hover:bg-slate-800/40 border border-slate-700/60 text-slate-300 font-mono text-xs transition"
                title="Download original CV document"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download CV</span>
              </a>
            </div>
          </div>

          {/* Right Hero: Drone Technical Visualization (5 cols on desktop) */}
          <div className="lg:col-span-5 w-full flex justify-center">
            {droneEnabled ? (
              <DroneVisualization telemetry={hero.telemetryStats} />
            ) : (
              <div className="w-full max-w-md aspect-square rounded-2xl bg-[#0D121F] border border-[#1E293B] p-8 flex flex-col items-center justify-center text-center">
                <Cpu className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
                <h4 className="text-slate-200 font-mono text-sm font-semibold">UAV AUTONOMY ENGINE</h4>
                <p className="text-slate-400 text-xs mt-2 font-mono">Flight-Stack Integration & Autonomous Missions Active</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
