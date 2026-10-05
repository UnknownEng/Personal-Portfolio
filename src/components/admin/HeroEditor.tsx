import React, { useState } from 'react';
import { Sparkles, Save, Compass, Radio, Cpu, Activity } from 'lucide-react';
import { HeroData } from '../../types/portfolio';
import { ProfileImageUploader } from './ProfileImageUploader';

interface HeroEditorProps {
  hero: HeroData;
  onSaveHero: (hero: HeroData) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({
  hero,
  onSaveHero,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<HeroData>(hero);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await onSaveHero(formData);
    setSaving(false);

    if (res.success) {
      onShowToast('success', 'Hero section updated and saved to disk!');
    } else {
      onShowToast('error', res.error || 'Failed to save Hero section');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>HERO CONFIGURATION</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Hero Section & Flight Telemetry
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure header headlines, call signs, CTA button targets, and real-time schematic values.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SAVING...' : 'SAVE HERO SETTINGS'}</span>
        </button>
      </div>

      {/* Main Identity Information */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Primary Identity & Headings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              STATUS BADGE / CALLSIGN
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              PROFESSIONAL TITLE
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              SUBTITLE / CORE PILLARS
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            SHORT INTRODUCTION (Punchy technical overview)
          </label>
          <textarea
            rows={3}
            value={formData.shortIntroduction}
            onChange={(e) => setFormData({ ...formData, shortIntroduction: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Profile Image Manager */}
        <ProfileImageUploader
          label="Hero Profile Portrait"
          imageUrl={formData.profileImage || ''}
          onChange={(url) => setFormData({ ...formData, profileImage: url })}
          onShowToast={onShowToast}
        />
      </div>

      {/* Buttons Configuration */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Action Buttons
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3 p-4 rounded-xl bg-[#090E1A] border border-[#1E293B]">
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">PRIMARY BUTTON</span>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Label Text</label>
              <input
                type="text"
                value={formData.primaryButtonText}
                onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0D121F] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Link (Anchor or URL)</label>
              <input
                type="text"
                value={formData.primaryButtonLink}
                onChange={(e) => setFormData({ ...formData, primaryButtonLink: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0D121F] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-[#090E1A] border border-[#1E293B]">
            <span className="text-[11px] font-mono text-blue-400 font-semibold">SECONDARY BUTTON</span>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Label Text</label>
              <input
                type="text"
                value={formData.secondaryButtonText}
                onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0D121F] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Link (Anchor or URL)</label>
              <input
                type="text"
                value={formData.secondaryButtonLink}
                onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0D121F] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drone Telemetry HUD Values */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Decorative Drone Telemetry Indicators
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">ALTITUDE</label>
            <input
              type="text"
              value={formData.telemetryStats?.alt || '120.4 M'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telemetryStats: { ...formData.telemetryStats, alt: e.target.value },
                })
              }
              className="w-full px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">SIGNAL / LINK</label>
            <input
              type="text"
              value={formData.telemetryStats?.signal || '98.6%'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telemetryStats: { ...formData.telemetryStats, signal: e.target.value },
                })
              }
              className="w-full px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">GNSS FIX</label>
            <input
              type="text"
              value={formData.telemetryStats?.gps || '3D FIX (18 SV)'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telemetryStats: { ...formData.telemetryStats, gps: e.target.value },
                })
              }
              className="w-full px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">BATTERY</label>
            <input
              type="text"
              value={formData.telemetryStats?.battery || '24.8V (94%)'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telemetryStats: { ...formData.telemetryStats, battery: e.target.value },
                })
              }
              className="w-full px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">FLIGHT TIME</label>
            <input
              type="text"
              value={formData.telemetryStats?.flightTime || '28m 42s'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telemetryStats: { ...formData.telemetryStats, flightTime: e.target.value },
                })
              }
              className="w-full px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">AUTOPILOT MODE</label>
            <input
              type="text"
              value={formData.telemetryStats?.mode || 'OFFBOARD AUTO'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  telemetryStats: { ...formData.telemetryStats, mode: e.target.value },
                })
              }
              className="w-full px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded text-xs font-mono text-slate-200"
            />
          </div>
        </div>
      </div>

    </form>
  );
};
