import React, { useState } from 'react';
import { Trophy, Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { AchievementItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface AchievementsManagerProps {
  achievements: AchievementItem[];
  onSaveAchievements: (achievements: AchievementItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AchievementsManager: React.FC<AchievementsManagerProps> = ({
  achievements,
  onSaveAchievements,
  onShowToast,
}) => {
  const [items, setItems] = useState<AchievementItem[]>(achievements);
  const [editingItem, setEditingItem] = useState<AchievementItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AchievementItem>>({});

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `ach-${Date.now()}`,
      title: '',
      organization: '',
      date: '2025',
      description: '',
      link: '',
      status: 'published',
      order: items.length + 1,
    });
    setEditingItem(formData as AchievementItem);
  };

  const handleOpenEdit = (item: AchievementItem) => {
    setIsNew(false);
    setFormData(item);
    setEditingItem(item);
  };

  const handleSaveModal = async () => {
    if (!formData.title) {
      onShowToast('error', 'Title is required');
      return;
    }

    const updatedItem: AchievementItem = {
      id: formData.id || `ach-${Date.now()}`,
      title: formData.title,
      organization: formData.organization || '',
      date: formData.date || '',
      description: formData.description || '',
      image: formData.image || '',
      link: formData.link || '',
      status: formData.status || 'published',
      order: formData.order || items.length + 1,
    };

    let nextItems: AchievementItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((a) => (a.id === updatedItem.id ? updatedItem : a));
    }

    setItems(nextItems);
    setEditingItem(null);

    const res = await onSaveAchievements(nextItems);
    if (res.success) {
      onShowToast('success', `Honor "${updatedItem.title}" saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save achievement');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((a) => a.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveAchievements(nextItems);
    if (res.success) {
      onShowToast('success', 'Honor deleted');
    } else {
      onShowToast('error', res.error || 'Failed to delete honor');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    nextItems.forEach((a, idx) => {
      a.order = idx + 1;
    });

    setItems(nextItems);
    const res = await onSaveAchievements(nextItems);
    if (res.success) {
      onShowToast('info', 'Order updated');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Trophy className="w-4 h-4" />
            <span>AEROSPACE HONORS & COMPETITIONS</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Competitions & Recognition ({items.length} from CV)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Teknofest Turkey (2024 & 2025 finalist), National Aerothon Swift Wing title, IMechE UAS, and DBFC.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD COMPETITION / AWARD</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((ach, index) => (
          <div
            key={ach.id}
            className="p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
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
                <h3 className="text-sm font-bold text-slate-100 font-sans">
                  {ach.title}
                </h3>
                <div className="text-xs font-mono text-cyan-400 mt-0.5">
                  {ach.organization} • {ach.date}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleOpenEdit(ach)}
                className="p-2 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(ach.id)}
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
          title={isNew ? 'Add Achievement' : `Edit: ${formData.title}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                AWARD / TITLE *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="3rd Overall — National Aerothon ’25 | Swift Wing title"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                ORGANIZATION / COMPETITION
              </label>
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Teknofest Turkey / National Aerothon"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                YEAR / DATE
              </label>
              <input
                type="text"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="2025"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                VERIFICATION LINK (Optional)
              </label>
              <input
                type="url"
                value={formData.link || ''}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="https://..."
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
                Save Award
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
        title="Delete Achievement"
        message="Are you sure you want to delete this achievement record?"
        confirmText="Delete"
      />

    </div>
  );
};
