import React, { useState } from 'react';
import { Share2, Plus, Edit2, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { SocialLinkItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface SocialLinksEditorProps {
  socialLinks: SocialLinkItem[];
  onSaveSocialLinks: (links: SocialLinkItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({
  socialLinks,
  onSaveSocialLinks,
  onShowToast,
}) => {
  const [items, setItems] = useState<SocialLinkItem[]>(socialLinks);
  const [editingItem, setEditingItem] = useState<SocialLinkItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SocialLinkItem>>({});

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `soc-${Date.now()}`,
      platform: 'github',
      label: 'GitHub Profile',
      url: '',
      icon: 'Github',
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

  const handleSaveModal = async () => {
    if (!formData.label || !formData.url) {
      onShowToast('error', 'Label and URL are required');
      return;
    }

    const updatedItem: SocialLinkItem = {
      id: formData.id || `soc-${Date.now()}`,
      platform: formData.platform || 'other',
      label: formData.label,
      url: formData.url,
      icon: formData.icon || 'Share2',
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
      onShowToast('success', `Social link saved!`);
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
            Social Links Management
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure your verified LinkedIn profile, email, and technical networks.
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
        {items.map((item, index) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-slate-700 transition flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-20 text-slate-400"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === items.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-20 text-slate-400"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-100 font-sans truncate">
                  {item.label}
                </h3>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-cyan-400 hover:underline truncate block"
                >
                  {item.url}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-2 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(item.id)}
                className="p-2 rounded bg-[#090E1A] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={isNew ? 'Add Social Link' : `Edit: ${formData.label}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                LABEL *
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
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="https://www.linkedin.com/in/mansoorahmedrind"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-mono text-slate-400 bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg"
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
        message="Are you sure you want to remove this link?"
        confirmText="Delete"
      />

    </div>
  );
};
