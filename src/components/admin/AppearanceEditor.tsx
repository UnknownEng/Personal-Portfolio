import React, { useState } from 'react';
import { Palette, Check, Save, RotateCcw, Sparkles, Moon, Sun, Monitor } from 'lucide-react';
import { ThemeSettings, ThemeColors } from '../../types/portfolio';
import { THEME_PRESETS } from '../../data/initialData';
import { ColorPicker } from '../ui/ColorPicker';

interface AppearanceEditorProps {
  theme: ThemeSettings;
  onSaveTheme: (newTheme: ThemeSettings) => Promise<{ success: boolean; error?: string }>;
  onApplyLocal: (newTheme: ThemeSettings) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AppearanceEditor: React.FC<AppearanceEditorProps> = ({
  theme,
  onSaveTheme,
  onApplyLocal,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<ThemeSettings>(theme);
  const [saving, setSaving] = useState(false);

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    const updated: ThemeSettings = {
      ...formData,
      [key]: value,
      activePreset: 'custom',
    };
    setFormData(updated);
    // Immediately update live CSS variables on screen
    onApplyLocal(updated);
  };

  const handleApplyPreset = (presetKey: 'cyan' | 'aerospace' | 'robotics' | 'minimal' | 'custom') => {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;

    const updated: ThemeSettings = {
      ...formData,
      ...preset.colors,
      activePreset: presetKey,
    };
    setFormData(updated);
    onApplyLocal(updated);
    onShowToast('info', `Applied ${preset.name}`);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await onSaveTheme(formData);
    setSaving(false);

    if (res.success) {
      onShowToast('success', 'Theme tokens successfully persisted to disk!');
    } else {
      onShowToast('error', res.error || 'Failed to save theme settings');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Palette className="w-4 h-4" />
            <span>DESIGN TOKENS & CSS VARIABLES</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Appearance & Color Theme Engine
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Changes update the entire portfolio in real-time using CSS variables (`--color-primary`, `--color-bg`, etc.).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'PERSISTING...' : 'SAVE THEME CHANGES'}</span>
        </button>
      </div>

      {/* Predefined Themes Grid */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Predefined Professional Themes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(THEME_PRESETS).filter(([key]) => key !== 'custom').map(([key, preset]) => {
            const isSelected = formData.activePreset === key;

            return (
              <div
                key={key}
                onClick={() => handleApplyPreset(key as any)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-[#090E1A] border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-100 font-sans">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Color Swatch Preview Bar */}
                  <div className="flex h-5 rounded overflow-hidden border border-slate-700/60 my-2">
                    <div style={{ backgroundColor: preset.colors.primaryColor }} className="flex-1" title="Primary" />
                    <div style={{ backgroundColor: preset.colors.secondaryColor }} className="flex-1" title="Secondary" />
                    <div style={{ backgroundColor: preset.colors.backgroundColor }} className="flex-1" title="Background" />
                    <div style={{ backgroundColor: preset.colors.cardColor }} className="flex-1" title="Card" />
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 mt-2">
                  Click to apply palette
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme Mode Switcher */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-4">
          Display Mode
        </h3>
        <div className="flex flex-wrap gap-3">
          {(['dark', 'light', 'system'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                const updated = { ...formData, mode };
                setFormData(updated);
                onApplyLocal(updated);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition capitalize ${
                formData.mode === mode
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-[#090E1A] text-slate-400 border border-[#1E293B] hover:text-white'
              }`}
            >
              {mode === 'dark' && <Moon className="w-3.5 h-3.5" />}
              {mode === 'light' && <Sun className="w-3.5 h-3.5" />}
              {mode === 'system' && <Monitor className="w-3.5 h-3.5" />}
              <span>{mode} Mode</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Design Tokens Pickers */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Fine-Grained Color Controls (Tokens)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Preset: <strong className="text-cyan-400 uppercase">{formData.activePreset}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorPicker
            label="Primary Color"
            value={formData.primaryColor}
            onChange={(val) => handleColorChange('primaryColor', val)}
            description="Accent highlights, badges, buttons, active states"
          />

          <ColorPicker
            label="Secondary Color"
            value={formData.secondaryColor}
            onChange={(val) => handleColorChange('secondaryColor', val)}
            description="Sub-accents, telemetry links, icons"
          />

          <ColorPicker
            label="Background Color"
            value={formData.backgroundColor}
            onChange={(val) => handleColorChange('backgroundColor', val)}
            description="Main canvas base (Deep Graphite)"
          />

          <ColorPicker
            label="Secondary Background"
            value={formData.backgroundSecondaryColor}
            onChange={(val) => handleColorChange('backgroundSecondaryColor', val)}
            description="Alternating sections and panels"
          />

          <ColorPicker
            label="Card Background"
            value={formData.cardColor}
            onChange={(val) => handleColorChange('cardColor', val)}
            description="Container cards, timeline nodes, modals"
          />

          <ColorPicker
            label="Primary Text Color"
            value={formData.textColor}
            onChange={(val) => handleColorChange('textColor', val)}
            description="Headlines, labels, titles"
          />

          <ColorPicker
            label="Muted Text Color"
            value={formData.mutedTextColor}
            onChange={(val) => handleColorChange('mutedTextColor', val)}
            description="Subtitles, descriptions, secondary copy"
          />

          <ColorPicker
            label="Border Color"
            value={formData.borderColor}
            onChange={(val) => handleColorChange('borderColor', val)}
            description="Divider lines, card outlines, grids"
          />
        </div>
      </div>

    </div>
  );
};
