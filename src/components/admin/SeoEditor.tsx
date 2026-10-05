import React, { useState } from 'react';
import { Search, Save, Globe } from 'lucide-react';
import { SeoSettings } from '../../types/portfolio';

interface SeoEditorProps {
  seo: SeoSettings;
  onSaveSeo: (seo: SeoSettings) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SeoEditor: React.FC<SeoEditorProps> = ({
  seo,
  onSaveSeo,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<SeoSettings>(seo);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await onSaveSeo(formData);
    setSaving(false);

    if (res.success) {
      onShowToast('success', 'SEO configuration saved to disk!');
    } else {
      onShowToast('error', res.error || 'Failed to save SEO configuration');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Search className="w-4 h-4" />
            <span>SEARCH ENGINE OPTIMIZATION</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            SEO & Metadata Configuration
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Ensure recruiters and technical hiring managers find your profile across Google and LinkedIn link embeds.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SAVING...' : 'SAVE SEO SETTINGS'}</span>
        </button>
      </div>

      {/* Meta Tags */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Standard Web Metadata
        </h3>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            WEBSITE BROWSER TITLE
          </label>
          <input
            type="text"
            required
            value={formData.websiteTitle}
            onChange={(e) => setFormData({ ...formData, websiteTitle: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            META DESCRIPTION
          </label>
          <textarea
            rows={3}
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            KEYWORDS (Comma separated)
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Open Graph Tags for Social Previews */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          Open Graph & Social Sharing Cards
        </h3>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            OG TITLE
          </label>
          <input
            type="text"
            value={formData.ogTitle}
            onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            OG DESCRIPTION
          </label>
          <textarea
            rows={2}
            value={formData.ogDescription}
            onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            SOCIAL PREVIEW IMAGE URL
          </label>
          <input
            type="text"
            value={formData.ogImage}
            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            placeholder="/uploads/... or https://..."
          />
        </div>
      </div>

    </form>
  );
};
