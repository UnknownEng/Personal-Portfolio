import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { LeadershipItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface LeadershipManagerProps {
  leadership: LeadershipItem[];
  onSaveLeadership: (leadership: LeadershipItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const LeadershipManager: React.FC<LeadershipManagerProps> = ({
  leadership,
  onSaveLeadership,
  onShowToast,
}) => {
  const [items, setItems] = useState<LeadershipItem[]>(leadership);
  const [editingItem, setEditingItem] = useState<LeadershipItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<LeadershipItem>>({});
  const [bulletsText, setBulletsText] = useState('');

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `lead-${Date.now()}`,
      role: '',
      organization: '',
      date: '2025 – 2026',
      description: '',
      bullets: [''],
      status: 'published',
      order: items.length + 1,
    });
    setEditingItem(formData as LeadershipItem);
  };

  const handleOpenEdit = (item: LeadershipItem) => {
    setIsNew(false);
    setFormData({
      ...item,
      bullets: item.bullets && item.bullets.length > 0 ? [...item.bullets] : [''],
    });
    setEditingItem(item);
  };

  const handleSaveModal = async () => {
    if (!formData.role || !formData.organization) {
      onShowToast('error', 'Role and organization are required');
      return;
    }

    const bulletsArray = (formData.bullets || [])
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const updatedItem: LeadershipItem = {
      id: formData.id || `lead-${Date.now()}`,
      role: formData.role.trim(),
      organization: formData.organization.trim(),
      date: formData.date || '',
      description: formData.description || '',
      bullets: bulletsArray,
      status: formData.status || 'published',
      order: formData.order || items.length + 1,
    };

    let nextItems: LeadershipItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((l) => (l.id === updatedItem.id ? updatedItem : l));
    }

    setItems(nextItems);
    setEditingItem(null);

    const res = await onSaveLeadership(nextItems);
    if (res.success) {
      onShowToast('success', `Leadership entry saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save leadership');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((l) => l.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveLeadership(nextItems);
    if (res.success) {
      onShowToast('success', 'Leadership entry deleted');
    } else {
      onShowToast('error', res.error || 'Failed to delete entry');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>STUDENT OPERATIONS & LEADERSHIP</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Leadership & Operations ({items.length} from CV)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            NUST Placement Office Student Exchange, NUST Career Connect, NUST Digital Club, and Orientation Director.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD LEADERSHIP ROLE</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((lead, index) => (
          <div
            key={lead.id}
            className="p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-100 font-sans">
                  {lead.role}
                </h3>
                <div className="text-xs font-mono text-cyan-400 mt-0.5">
                  {lead.organization} • {lead.date}
                </div>
                {lead.bullets && lead.bullets.length > 0 && (
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                    • {lead.bullets[0]}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleOpenEdit(lead)}
                className="p-2 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(lead.id)}
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
          title={isNew ? 'Add Leadership Role' : `Edit: ${formData.role}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  ROLE / TITLE *
                </label>
                <input
                  type="text"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="President NUST Young Student Exchange"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  ORGANIZATION *
                </label>
                <input
                  type="text"
                  value={formData.organization || ''}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="NUST Placement Office"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                DATES / DURATION
              </label>
              <input
                type="text"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Jun 2026 – August 2026"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-medium text-slate-300">
                  KEY INITIATIVES & IMPACT ({(formData.bullets || []).length})
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bullets: [...(formData.bullets || []), ''] })}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-mono flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add Bullet Point
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(formData.bullets || []).map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-cyan-500 font-mono text-xs">{idx + 1}.</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => {
                        const updated = [...(formData.bullets || [])];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, bullets: updated });
                      }}
                      className="flex-1 px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Directed 40+ engineering crew across competition flight testing..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (formData.bullets || []).filter((_, i) => i !== idx);
                        setFormData({ ...formData, bullets: updated });
                      }}
                      disabled={(formData.bullets || []).length <= 1}
                      className="text-slate-500 hover:text-rose-400 disabled:opacity-20 p-1 text-sm font-bold"
                      title="Remove bullet"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
                Save Role
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
        title="Delete Leadership Record"
        message="Are you sure you want to delete this leadership entry?"
        confirmText="Delete"
      />

    </div>
  );
};
