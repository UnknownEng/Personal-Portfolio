import React, { useState } from 'react';
import { Mail, Save, Phone, MapPin, Shield } from 'lucide-react';
import { LinkedinIcon } from '../ui/Icons';
import { ContactData } from '../../types/portfolio';

interface ContactEditorProps {
  contact: ContactData;
  onSaveContact: (contact: ContactData) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ContactEditor: React.FC<ContactEditorProps> = ({
  contact,
  onSaveContact,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<ContactData>(contact);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await onSaveContact(formData);
    setSaving(false);

    if (res.success) {
      onShowToast('success', 'Contact settings successfully saved to disk!');
    } else {
      onShowToast('error', res.error || 'Failed to save contact settings');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Mail className="w-4 h-4" />
            <span>COMMUNICATION CHANNELS</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Contact Section & Channels Editor
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Control your direct email, phone privacy, base location, availability beacon, and inquiry form.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SAVING...' : 'SAVE CONTACT SETTINGS'}</span>
        </button>
      </div>

      {/* Main Form Fields */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Section Headings & Availability
        </h3>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            SECTION HEADING
          </label>
          <input
            type="text"
            value={formData.heading}
            onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            SECTION DESCRIPTION
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            AVAILABILITY BEACON MESSAGE
          </label>
          <input
            type="text"
            value={formData.availabilityStatus}
            onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            placeholder="e.g. Available for UAV Engineering & Autonomous Systems roles"
          />
        </div>
      </div>

      {/* Direct Coordinates */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Direct Coordinates & Privacy Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              PRIMARY EMAIL *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              LINKEDIN URL *
            </label>
            <input
              type="url"
              required
              value={formData.linkedIn}
              onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono font-medium text-slate-300">
                PHONE NUMBER
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.showPhone}
                  onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                  className="rounded bg-[#090E1A] border-slate-700 text-cyan-500"
                />
                <span>Display on Website</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="+92 327 3202419"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              LOCATION BASE
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="Islamabad, Pakistan"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
            <input
              type="checkbox"
              checked={formData.formEnabled}
              onChange={(e) => setFormData({ ...formData, formEnabled: e.target.checked })}
              className="rounded bg-[#090E1A] border-slate-700 text-cyan-500"
            />
            <span>Enable Interactive Visitor Inquiry Dispatch Form</span>
          </label>
        </div>
      </div>

    </form>
  );
};
