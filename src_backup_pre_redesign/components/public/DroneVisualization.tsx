import React, { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';

interface DroneVisualizationProps {
  telemetry?: {
    alt: string;
    signal: string;
    gps: string;
    battery: string;
    flightTime: string;
    mode: string;
  };
}

export const DroneVisualization: React.FC<DroneVisualizationProps> = ({ telemetry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      // Gentle tilt angle (max 8 degrees)
      setRotate({
        x: Math.max(-8, Math.min(8, -y * 10)),
        y: Math.max(-8, Math.min(8, x * 10)),
      });
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('mousemove', handleMouseMove);
      node.addEventListener('mouseleave', () => setRotate({ x: 0, y: 0 }));
    }

    return () => {
      if (node) {
        node.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const stats = telemetry || {
    alt: '120.4 M [SIMULATED]',
    signal: 'MAVLINK SIM [TEST]',
    gps: '3D FIX (18 SV) [SITL]',
    battery: '24.8V [DEMO 6S]',
    flightTime: '28m 42s [TEST]',
    mode: 'SITL OFFBOARD',
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto aspect-square rounded-2xl bg-[#090D18] border border-cyan-500/25 p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-transform duration-200"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Background CAD / Engineering Blueprint Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

      {/* Top Aerospace Header with explicit Simulation Badge */}
      <div className="relative z-10 flex items-center justify-between border-b border-cyan-500/20 pb-3 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-semibold tracking-wider">UAV-AIRFRAME // CAD-SCHEMATIC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
            DEMO SIMULATION
          </span>
        </div>
      </div>

      {/* Main Schematic Body with 3D Tilt Effect */}
      <div
        className="relative flex-1 flex items-center justify-center my-2 transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Technical Coordinate Overlay Rings (CAD-style) */}
        <div className="absolute w-72 h-72 rounded-full border border-cyan-500/15 pointer-events-none" />
        <div className="absolute w-56 h-56 rounded-full border border-dashed border-cyan-500/20 pointer-events-none" />
        <div className="absolute w-40 h-40 rounded-full border border-blue-500/20 pointer-events-none" />

        {/* Engineering Crosshairs */}
        <div className="absolute w-full h-[1px] bg-cyan-500/15 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-cyan-500/15 pointer-events-none" />

        {/* Central Quadcopter Aerospace Vector Schematic */}
        <div className="relative w-64 h-64 z-10">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            {/* Structural Carbon Diagonal Frame Struts */}
            <line x1="45" y1="45" x2="155" y2="155" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <line x1="45" y1="45" x2="155" y2="155" stroke="#22D3EE" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.9" />

            <line x1="155" y1="45" x2="45" y2="155" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <line x1="155" y1="45" x2="45" y2="155" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.9" />

            {/* Rotor Assemblies with CW / CCW indicators */}
            {/* Front-Left (Motor 1 - CW) */}
            <g transform="translate(45, 45)">
              <circle r="22" fill="none" stroke="#22D3EE" strokeWidth="1" strokeDasharray="4 3" className="animate-spin" style={{ animationDuration: '2s' }} />
              <circle r="7" fill="#0F172A" stroke="#22D3EE" strokeWidth="2" />
              <text x="-14" y="-25" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">M1 (CW)</text>
              <line x1="-15" y1="0" x2="15" y2="0" stroke="#22D3EE" strokeWidth="1.5" opacity="0.7" />
            </g>

            {/* Front-Right (Motor 2 - CCW) */}
            <g transform="translate(155, 45)">
              <circle r="22" fill="none" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 3" className="animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <circle r="7" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
              <text x="-6" y="-25" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">M2 (CCW)</text>
              <line x1="0" y1="-15" x2="0" y2="15" stroke="#3B82F6" strokeWidth="1.5" opacity="0.7" />
            </g>

            {/* Rear-Left (Motor 3 - CCW) */}
            <g transform="translate(45, 155)">
              <circle r="22" fill="none" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 3" className="animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <circle r="7" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
              <text x="-14" y="30" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">M3 (CCW)</text>
              <line x1="0" y1="-15" x2="0" y2="15" stroke="#3B82F6" strokeWidth="1.5" opacity="0.7" />
            </g>

            {/* Rear-Right (Motor 4 - CW) */}
            <g transform="translate(155, 155)">
              <circle r="22" fill="none" stroke="#22D3EE" strokeWidth="1" strokeDasharray="4 3" className="animate-spin" style={{ animationDuration: '2s' }} />
              <circle r="7" fill="#0F172A" stroke="#22D3EE" strokeWidth="2" />
              <text x="-6" y="30" fill="#94A3B8" fontSize="6.5" fontFamily="monospace">M4 (CW)</text>
              <line x1="-15" y1="0" x2="15" y2="0" stroke="#22D3EE" strokeWidth="1.5" opacity="0.7" />
            </g>

            {/* Central Autopilot / Avionics Housing */}
            <rect x="76" y="76" width="48" height="48" rx="6" fill="#0B132B" stroke="#22D3EE" strokeWidth="2" />
            
            {/* Heading Orientation Arrow */}
            <polygon points="100,80 94,90 106,90" fill="#22D3EE" />

            {/* Center IMU Axis / Core */}
            <circle cx="100" cy="100" r="10" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
            <circle cx="100" cy="100" r="3" fill="#22D3EE" />

            {/* Architecture Annotation */}
            <text x="84" y="116" fill="#64748B" fontSize="6.5" fontFamily="monospace">PIXHAWK / PX4</text>
          </svg>
        </div>

        {/* Floating Simulation Metrics Callouts */}
        <div className="absolute top-2 left-2 bg-[#0A0F1D]/90 border border-cyan-500/30 rounded px-2.5 py-1 font-mono text-[10px] text-cyan-300">
          <div className="text-[8.5px] text-slate-400 font-semibold">SIM ALTITUDE</div>
          <div className="font-semibold">{stats.alt}</div>
        </div>

        <div className="absolute top-2 right-2 bg-[#0A0F1D]/90 border border-blue-500/30 rounded px-2.5 py-1 font-mono text-[10px] text-blue-300">
          <div className="text-[8.5px] text-slate-400 font-semibold">SIM TELEMETRY</div>
          <div className="font-semibold">{stats.signal}</div>
        </div>

        <div className="absolute bottom-2 left-2 bg-[#0A0F1D]/90 border border-slate-700 rounded px-2.5 py-1 font-mono text-[10px] text-slate-300">
          <div className="text-[8.5px] text-slate-400 font-semibold">SIM BATTERY</div>
          <div className="font-semibold">{stats.battery}</div>
        </div>

        <div className="absolute bottom-2 right-2 bg-[#0A0F1D]/90 border border-cyan-500/30 rounded px-2.5 py-1 font-mono text-[10px] text-cyan-300">
          <div className="text-[8.5px] text-slate-400 font-semibold">SIM NAVIGATION</div>
          <div className="font-semibold">{stats.gps}</div>
        </div>
      </div>

      {/* Bottom Technical Notice Banner */}
      <div className="relative z-10 pt-2.5 border-t border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>Quadrotor Avionics Schematic • Interactive Vector Model</span>
        </div>
        <div className="text-cyan-400 font-semibold">
          MODE: {stats.mode}
        </div>
      </div>
    </div>
  );
};
