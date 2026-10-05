import React, { useState } from 'react';
import { Eye, Save, EyeOff, ShieldCheck } from 'lucide-react';
import { SectionVisibility } from '../../types/portfolio';

interface VisibilityManagerProps {
  visibility: SectionVisibility;
  onSaveVisibility: (visibility: SectionVisibility) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const VisibilityManager: React.FC<VisibilityManagerProps> = ({
  visibility,
  onSaveVisibility,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<SectionVisibility>(visibility);
  const [saving, setSaving] = useState(false);

  const sectionsConfig: Array<{ key: keyof SectionVisibility; label: string; desc: string }> = [
    { key: 'hero', label: 'Hero Section', desc: 'Main headline, callsigns, CTAs, and intro' },
    { key: 'droneSchematic', label: 'Interactive Drone Schematic', desc: 'Subtle technical quadrotor HUD & telemetry model' },
    { key: 'statusBanner', label: 'Dynamic Status Banner', desc: 'Live metrics bar (online status, projects, skills count)' },
    { key: 'about', label: 'About & Engineering Dossier', desc: 'Bio, philosophy quote, and highlight credential cards' },
    { key: 'skills', label: 'Technical & Social Skills', desc: 'Categorized skills with proficiencies, leadership and search' },
    { key: 'research', label: 'Academic Research & Publications', desc: 'V-SLAM review paper, Nav2 obstacle braking, and citations' },
    { key: 'projects', label: 'Engineering Projects & Products', desc: 'UAV platforms, LawerAI, Sasta Dawa Finder, swarm GCS' },
    { key: 'experience', label: 'Operational Experience Timeline', desc: 'Team AeroMavericks, INTELGENCY, CSN Lab, Teknofest' },
    { key: 'competitions', label: 'Competitions & Aerospace Honors', desc: 'National Aerothon Swift Wing, Teknofest, DBFC' },
    { key: 'education', label: 'Academia & Leadership', desc: 'NUST Gold Medalist, UCI IoT, Naples, Student Operations' },
    { key: 'certifications', label: 'Certifications & Licensures', desc: 'UAS Remote Pilot Open Category A1+A3 & Nephio' },
    { key: 'contact', label: 'Contact Coordinates & Inquiry Form', desc: 'Direct email, phone toggle, location, and message dispatch' },
  ];

  const handleToggle = (key: keyof SectionVisibility) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await onSaveVisibility(formData);
    setSaving(false);

    if (res.success) {
      onShowToast('success', 'Section visibility preferences persisted to disk!');
    } else {
      onShowToast('error', res.error || 'Failed to save visibility settings');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Eye className="w-4 h-4" />
            <span>MODULAR SECTION TOGGLES</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Section Visibility Controls
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Instantly show or hide entire sections from the public engineering portfolio.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SAVING...' : 'SAVE VISIBILITY'}</span>
        </button>
      </div>

      {/* Grid of Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionsConfig.map(({ key, label, desc }) => {
          const isVisible = formData[key];

          return (
            <div
              key={key}
              onClick={() => handleToggle(key)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isVisible
                  ? 'bg-[#0D121F] border-cyan-500/40 hover:border-cyan-400 shadow-sm'
                  : 'bg-[#080B14] border-[#1E293B]/60 opacity-60 hover:opacity-90'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100 font-sans">
                    {label}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isVisible
                        ? 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isVisible ? 'VISIBLE' : 'HIDDEN'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {desc}
                </p>
              </div>

              <div
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${
                  isVisible ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    isVisible ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
