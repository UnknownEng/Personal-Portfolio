import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Check,
  Eye,
  EyeOff,
  Sliders,
} from 'lucide-react';
import { SkillItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface SkillsManagerProps {
  skills: SkillItem[];
  onSaveSkills: (skills: SkillItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  onSaveSkills,
  onShowToast,
}) => {
  const [items, setItems] = useState<SkillItem[]>(skills);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('All');

  // Form state
  const [formData, setFormData] = useState<Partial<SkillItem>>({});

  const categories = ['All', 'Robotics & Navigation', 'Software & Frameworks', 'Programming', 'Embedded & Hardware', 'Systems', 'Other'];
  const availableIcons = [
    'Compass', 'Map', 'Share2', 'Target', 'Radio', 'GitBranch', 'Cpu', 'Terminal',
    'Code', 'Box', 'Sliders', 'Activity', 'Monitor', 'Crosshair', 'Eye', 'Layout',
    'FileCode', 'Layers', 'Server', 'Zap', 'HardDrive', 'Shield'
  ];

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `sk-${Date.now()}`,
      name: '',
      category: 'Robotics & Navigation',
      description: '',
      icon: 'Cpu',
      featured: false,
      order: items.length + 1,
      enabled: true,
    });
    setEditingSkill(formData as SkillItem);
  };

  const handleOpenEdit = (skill: SkillItem) => {
    setIsNew(false);
    setFormData(skill);
    setEditingSkill(skill);
  };

  const handleSaveModal = async () => {
    if (!formData.name) {
      onShowToast('error', 'Skill name is required');
      return;
    }

    const updatedItem: SkillItem = {
      id: formData.id || `sk-${Date.now()}`,
      name: formData.name,
      category: formData.category || 'Robotics & Navigation',
      description: formData.description || '',
      icon: formData.icon || 'Cpu',
      featured: Boolean(formData.featured),
      order: formData.order || items.length + 1,
      enabled: formData.enabled !== undefined ? formData.enabled : true,
    };

    let nextItems: SkillItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((s) => (s.id === updatedItem.id ? updatedItem : s));
    }

    setItems(nextItems);
    setEditingSkill(null);

    const res = await onSaveSkills(nextItems);
    if (res.success) {
      onShowToast('success', `Skill "${updatedItem.name}" saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save skill');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((s) => s.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveSkills(nextItems);
    if (res.success) {
      onShowToast('success', 'Skill deleted successfully');
    } else {
      onShowToast('error', res.error || 'Failed to delete skill');
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
    const res = await onSaveSkills(nextItems);
    if (res.success) {
      onShowToast('info', 'Skill reordered');
    }
  };

  const handleToggleEnabled = async (skill: SkillItem) => {
    const nextItems = items.map((s) => (s.id === skill.id ? { ...s, enabled: !s.enabled } : s));
    setItems(nextItems);

    const res = await onSaveSkills(nextItems);
    if (res.success) {
      onShowToast('info', `Skill ${!skill.enabled ? 'enabled' : 'disabled'}`);
    }
  };

  const filteredItems = items.filter(
    (s) => filterCategory === 'All' || s.category === filterCategory
  );

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Wrench className="w-4 h-4" />
            <span>TECHNICAL SKILLS REPOSITORY</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Skills Management ({items.length} Skills)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Reorder, assign categories, adjust proficiencies, and toggle visibility.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW SKILL</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
              filterCategory === cat
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-[#0E1424] text-slate-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((skill, index) => (
          <div
            key={skill.id}
            className={`p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
              skill.enabled
                ? 'bg-[#0D121F] border-[#1E293B] hover:border-slate-700'
                : 'bg-[#090D17] border-[#1E293B]/60 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-20 text-slate-400"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  disabled={index === filteredItems.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-20 text-slate-400"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 truncate font-mono">
                    {skill.name}
                  </span>
                  {skill.featured && (
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1 rounded">
                      CORE
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {skill.category}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleToggleEnabled(skill)}
                className="p-1.5 rounded bg-[#090E1A] hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title={skill.enabled ? 'Disable Skill' : 'Enable Skill'}
              >
                {skill.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              <button
                onClick={() => handleOpenEdit(skill)}
                className="p-1.5 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(skill.id)}
                className="p-1.5 rounded bg-[#090E1A] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingSkill && (
        <Modal
          isOpen={!!editingSkill}
          onClose={() => setEditingSkill(null)}
          title={isNew ? 'Add Skill' : `Edit: ${formData.name || 'Skill'}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                SKILL NAME *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="e.g. ROS, ArduPilot, Swarm Robotics"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                CATEGORY
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Robotics & Navigation"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                ICON
              </label>
              <select
                value={formData.icon || 'Cpu'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {availableIcons.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                DESCRIPTION / CONTEXT (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. MAVROS flight-stack interfacing & Gazebo SITL simulation"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded bg-[#090E1A] border-slate-700 text-cyan-500"
                />
                <span>Featured / Core Skill</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.enabled !== false}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded bg-[#090E1A] border-slate-700 text-cyan-500"
                />
                <span>Active & Visible</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg"
              >
                Save Skill
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
        title="Delete Skill"
        message="Are you sure you want to delete this technical skill from your portfolio?"
        confirmText="Delete Skill"
      />

    </div>
  );
};
