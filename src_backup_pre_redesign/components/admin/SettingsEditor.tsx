import React, { useState } from 'react';
import { Settings, Save, AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../../types/portfolio';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface SettingsEditorProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<{ success: boolean; error?: string }>;
  onResetDefaults: () => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
  settings,
  onSaveSettings,
  onResetDefaults,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await onSaveSettings(formData);
    setSaving(false);

    if (res.success) {
      onShowToast('success', 'Website settings persisted to disk!');
    } else {
      onShowToast('error', res.error || 'Failed to save settings');
    }
  };

  const handleResetConfirm = async () => {
    setResetConfirmOpen(false);
    const res = await onResetDefaults();
    if (res.success) {
      onShowToast('success', 'Portfolio data reset to original CV values!');
      // Refresh local form
      setFormData(settings);
    } else {
      onShowToast('error', res.error || 'Failed to reset defaults');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Settings className="w-4 h-4" />
            <span>GLOBAL WEBSITE CONFIGURATION</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            System & Website Settings
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure system states, maintenance mode, drone rendering, and footer branding.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SAVING...' : 'SAVE SETTINGS'}</span>
        </button>
      </div>

      {/* Identity & URLs */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          General Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              WEBSITE NAME
            </label>
            <input
              type="text"
              required
              value={formData.websiteName}
              onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              PUBLIC WEBSITE URL
            </label>
            <input
              type="url"
              value={formData.publicWebsiteUrl}
              onChange={(e) => setFormData({ ...formData, publicWebsiteUrl: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            FOOTER COPYRIGHT TEXT
          </label>
          <input
            type="text"
            value={formData.footerText}
            onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              DEFAULT LANGUAGE
            </label>
            <input
              type="text"
              value={formData.defaultLanguage}
              onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              ANALYTICS ID (Optional)
            </label>
            <input
              type="text"
              value={formData.analyticsId}
              onChange={(e) => setFormData({ ...formData, analyticsId: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. G-XXXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Engine Controls & Features
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#090E1A] border border-[#1E293B] cursor-pointer">
            <div>
              <div className="text-xs font-mono font-bold text-slate-200">
                Interactive Drone Visualization HUD
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Renders quadrotor schematic with 3D mouse tilt and live telemetry callouts
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.droneVisualizationEnabled}
              onChange={(e) => setFormData({ ...formData, droneVisualizationEnabled: e.target.checked })}
              className="rounded bg-[#080C16] border-slate-700 text-cyan-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#090E1A] border border-[#1E293B] cursor-pointer">
            <div>
              <div className="text-xs font-mono font-bold text-slate-200">
                Micro-Interactions & Animations
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Enables smooth transitions, hover glows, and radar sweeps (respects prefers-reduced-motion)
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.animationsEnabled}
              onChange={(e) => setFormData({ ...formData, animationsEnabled: e.target.checked })}
              className="rounded bg-[#080C16] border-slate-700 text-cyan-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#090E1A] border border-amber-500/30 cursor-pointer">
            <div>
              <div className="text-xs font-mono font-bold text-amber-300">
                Maintenance Mode
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Displays scheduled maintenance notice to public visitors while allowing admin access
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.maintenanceMode}
              onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
              className="rounded bg-[#080C16] border-slate-700 text-amber-500 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone: Reset to Initial Data */}
      <div className="p-6 rounded-2xl bg-[#180B0F] border border-rose-900/40 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone / Factory Restore</span>
        </div>
        <p className="text-xs text-slate-300">
          Restore all portfolio sections, projects, experience, skills, and honors directly to the original CV dataset.
        </p>
        <button
          type="button"
          onClick={() => setResetConfirmOpen(true)}
          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Data to Original CV</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Portfolio to Default CV Data"
        message="Are you sure you want to reset all data back to the original CV dataset? Any custom additions will be reverted."
        confirmText="Reset Everything"
        isDestructive={true}
      />

    </form>
  );
};
