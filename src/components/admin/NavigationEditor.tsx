import React, { useState } from 'react';
import { Compass, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { NavigationItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface NavigationEditorProps {
  navigation: NavigationItem[];
  onSaveNavigation: (items: NavigationItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const NavigationEditor: React.FC<NavigationEditorProps> = ({
  navigation,
  onSaveNavigation,
  onShowToast,
}) => {
  const [items, setItems] = useState<NavigationItem[]>(navigation);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<NavigationItem>>({});

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `nav-${Date.now()}`,
      label: '',
      href: '#',
      enabled: true,
      order: items.length + 1,
    });
    setEditingItem(formData as NavigationItem);
  };

  const handleOpenEdit = (item: NavigationItem) => {
    setIsNew(false);
    setFormData(item);
    setEditingItem(item);
  };

  const handleSaveModal = async () => {
    if (!formData.label || !formData.href) {
      onShowToast('error', 'Label and URL anchor are required');
      return;
    }

    const updatedItem: NavigationItem = {
      id: formData.id || `nav-${Date.now()}`,
      label: formData.label,
      href: formData.href,
      enabled: formData.enabled !== undefined ? formData.enabled : true,
      order: formData.order || items.length + 1,
      isExternal: Boolean(formData.isExternal),
    };

    let nextItems: NavigationItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((n) => (n.id === updatedItem.id ? updatedItem : n));
    }

    setItems(nextItems);
    setEditingItem(null);

    const res = await onSaveNavigation(nextItems);
    if (res.success) {
      onShowToast('success', `Navigation item saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save navigation');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((n) => n.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveNavigation(nextItems);
    if (res.success) {
      onShowToast('success', 'Navigation item deleted');
    } else {
      onShowToast('error', res.error || 'Failed to delete navigation item');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    nextItems.forEach((n, idx) => {
      n.order = idx + 1;
    });

    setItems(nextItems);
    const res = await onSaveNavigation(nextItems);
    if (res.success) {
      onShowToast('info', 'Navigation order updated');
    }
  };

  const handleToggleEnabled = async (item: NavigationItem) => {
    const nextItems = items.map((n) => (n.id === item.id ? { ...n, enabled: !n.enabled } : n));
    setItems(nextItems);

    const res = await onSaveNavigation(nextItems);
    if (res.success) {
      onShowToast('info', `Menu item ${!item.enabled ? 'enabled' : 'disabled'}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Compass className="w-4 h-4" />
            <span>NAVIGATION STRUCTURE</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Navigation Menu Editor
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Rearrange menu order, toggle visibility, and update anchor links for the public header.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD MENU ITEM</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
              item.enabled
                ? 'bg-[#0D121F] border-[#1E293B] hover:border-slate-700'
                : 'bg-[#080B14] border-[#1E293B]/60 opacity-60'
            }`}
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 font-sans">
                    {item.label}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.2 rounded">
                    {item.href}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggleEnabled(item)}
                className="p-1.5 rounded bg-[#090E1A] hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                {item.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(item.id)}
                className="p-1.5 rounded bg-[#090E1A] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition"
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
          title={isNew ? 'Add Navigation Item' : `Edit: ${formData.label}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                MENU LABEL *
              </label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Projects"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                ANCHOR / LINK TARGET *
              </label>
              <input
                type="text"
                value={formData.href || ''}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="#projects"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="navEnabled"
                checked={formData.enabled !== false}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="rounded bg-[#090E1A] border-slate-700 text-cyan-500"
              />
              <label htmlFor="navEnabled" className="text-xs font-mono text-slate-300 cursor-pointer">
                Enabled in Header Navigation
              </label>
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
                Save Menu Item
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
        title="Delete Menu Item"
        message="Are you sure you want to remove this navigation link from the header?"
        confirmText="Delete"
      />

    </div>
  );
};
