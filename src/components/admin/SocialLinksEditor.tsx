import React, { useState } from 'react';
import { Share2, Plus, Edit2, Trash2, ArrowUp, ArrowDown, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { SocialLinkItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SocialPlatformIcon } from '../ui/Icons';

interface SocialLinksEditorProps {
  socialLinks: SocialLinkItem[];
  onSaveSocialLinks: (links: SocialLinkItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const PLATFORM_PRESETS = [
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/mansoorahmedrind' },
  { id: 'github', label: 'GitHub', placeholder: 'https://github.com/mansoorahmedrind' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
  { id: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/...' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { id: 'googlescholar', label: 'Google Scholar', placeholder: 'https://scholar.google.com/citations?user=...' },
  { id: 'researchgate', label: 'ResearchGate', placeholder: 'https://www.researchgate.net/profile/...' },
  { id: 'orcid', label: 'ORCID', placeholder: 'https://orcid.org/0000-...' },
  { id: 'website', label: 'Personal Website', placeholder: 'https://...' },
  { id: 'email', label: 'Email', placeholder: 'mailto:mansoorrind29@gmail.com' },
  { id: 'other', label: 'Custom Link', placeholder: 'https://...' },
];

export const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({
  socialLinks,
  onSaveSocialLinks,
  onShowToast,
}) => {
  const [items, setItems] = useState<SocialLinkItem[]>(socialLinks || []);
  const [editingItem, setEditingItem] = useState<SocialLinkItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SocialLinkItem>>({});

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `soc-${Date.now()}`,
      platform: 'github',
      label: 'GitHub',
      url: '',
      icon: 'github',
      order: items.length + 1,
      enabled: true,
    });
    setEditingItem(formData as SocialLinkItem);
  };

  const handleOpenEdit = (item: SocialLinkItem) => {
    setIsNew(false);
    setFormData(item);
    setEditingItem(item);
  };

  const handlePlatformChange = (newPlatform: string) => {
    const preset = PLATFORM_PRESETS.find((p) => p.id === newPlatform);
    setFormData((prev) => ({
      ...prev,
      platform: newPlatform,
      icon: newPlatform,
      label: prev.label && prev.label !== '' ? prev.label : preset?.label || 'Link',
    }));
  };

  const handleSaveModal = async () => {
    if (!formData.label || !formData.label.trim()) {
      onShowToast('error', 'Label is required');
      return;
    }

    if (!formData.url || !formData.url.trim()) {
      onShowToast('error', 'Destination URL is required');
      return;
    }

    const updatedItem: SocialLinkItem = {
      id: formData.id || `soc-${Date.now()}`,
      platform: formData.platform || 'other',
      label: formData.label.trim(),
      url: formData.url.trim(),
      icon: formData.icon || formData.platform || 'other',
      order: formData.order || items.length + 1,
      enabled: formData.enabled !== undefined ? formData.enabled : true,
    };

    let nextItems: SocialLinkItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    }

    setItems(nextItems);
    setEditingItem(null);

    const res = await onSaveSocialLinks(nextItems);
    if (res.success) {
      onShowToast('success', `Social link "${updatedItem.label}" saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save link');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((s) => s.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveSocialLinks(nextItems);
    if (res.success) {
      onShowToast('success', 'Social link deleted');
    } else {
      onShowToast('error', res.error || 'Failed to delete link');
    }
  };

  const handleToggleEnabled = async (item: SocialLinkItem) => {
    const nextItems = items.map((s) => (s.id === item.id ? { ...s, enabled: !s.enabled } : s));
    setItems(nextItems);
    const res = await onSaveSocialLinks(nextItems);
    if (res.success) {
      onShowToast('info', `${item.label} ${!item.enabled ? 'enabled' : 'hidden'}`);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    nextItems.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setItems(nextItems);
    const res = await onSaveSocialLinks(nextItems);
    if (res.success) {
      onShowToast('info', 'Links reordered');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Share2 className="w-4 h-4" />
            <span>EXTERNAL LINKS & NETWORKS</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Social & Research Profiles
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure your verified LinkedIn, GitHub, Google Scholar, ORCID, and academic profiles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD SOCIAL LINK</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#0D121F] border border-[#1E293B] text-slate-400 font-mono text-xs">
            No social profiles configured. Click "Add Social Link" to create one.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl bg-[#0D121F] border transition flex items-center justify-between gap-4 ${
                item.enabled ? 'border-[#1E293B] hover:border-slate-700' : 'border-[#1E293B]/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-20 text-slate-400"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-20 text-slate-400"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Platform Icon */}
                <div className="w-9 h-9 rounded-lg bg-[#090E1A] border border-[#1E293B] flex items-center justify-center text-cyan-400 shrink-0">
                  <SocialPlatformIcon platform={item.platform} icon={item.icon} className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100 font-sans truncate">
                      {item.label}
                    </h3>
                    {!item.enabled && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-400 hover:underline truncate block mt-0.5"
                  >
                    {item.url}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleEnabled(item)}
                  className={`p-2 rounded bg-[#090E1A] transition ${
                    item.enabled ? 'text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
                  }`}
                  title={item.enabled ? 'Visible on site (click to hide)' : 'Hidden (click to show)'}
                >
                  {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
                  title="Edit link"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-2 rounded bg-[#090E1A] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition"
                  title="Delete link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={isNew ? 'Add Social / Profile Link' : `Edit: ${formData.label}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                PLATFORM PRESET
              </label>
              <select
                value={formData.platform || 'other'}
                onChange={(e) => handlePlatformChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {PLATFORM_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                DISPLAY LABEL *
              </label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="LinkedIn Profile"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                DESTINATION URL *
              </label>
              <input
                type="text"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder={
                  PLATFORM_PRESETS.find((p) => p.id === formData.platform)?.placeholder || 'https://...'
                }
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.enabled !== false}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded bg-[#090E1A] border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Visible on live website</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-mono text-slate-400 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition"
              >
                Save Link
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Social Link"
        message="Are you sure you want to remove this profile link from your website?"
        confirmText="Delete Link"
      />
    </div>
  );
};
