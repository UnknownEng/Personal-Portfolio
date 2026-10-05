import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { ExperienceItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

interface ExperienceManagerProps {
  experience: ExperienceItem[];
  onSaveExperience: (experience: ExperienceItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({
  experience,
  onSaveExperience,
  onShowToast,
}) => {
  const [items, setItems] = useState<ExperienceItem[]>(experience);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { token } = useAuth();
  // Form state
  const [formData, setFormData] = useState<Partial<ExperienceItem>>({});
  const [respInput, setRespInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      location: 'Islamabad, Pakistan',
      startDate: '2025',
      endDate: 'Present',
      current: true,
      description: '',
      responsibilities: [''],
      achievements: [],
      technologies: [],
      image: '',
      status: 'published',
      order: items.length + 1,
    });
    setTechInput('');
    setEditingItem(formData as ExperienceItem);
  };

  const handleOpenEdit = (item: ExperienceItem) => {
    setIsNew(false);
    setFormData({
      ...item,
      responsibilities: item.responsibilities && item.responsibilities.length > 0 ? [...item.responsibilities] : [''],
    });
    setTechInput((item.technologies || []).join(', '));
    setEditingItem(item);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      onShowToast('error', 'File size exceeds maximum 15MB limit');
      return;
    }

    const data = new FormData();
    data.append('file', file);

    setUploadingImage(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setFormData((prev) => ({ ...prev, image: resJson.media.url }));
        onShowToast('success', 'Experience card picture uploaded!');
      } else {
        onShowToast('error', resJson.error || 'Upload failed');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Upload error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveModal = async () => {
    if (!formData.company || !formData.position) {
      onShowToast('error', 'Company and position are required');
      return;
    }

    const respArray = (formData.responsibilities || [])
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const techArray = techInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updatedItem: ExperienceItem = {
      id: formData.id || `exp-${Date.now()}`,
      company: formData.company.trim(),
      position: formData.position.trim(),
      location: formData.location || 'Islamabad, Pakistan',
      startDate: formData.startDate || '',
      endDate: formData.current ? 'Present' : (formData.endDate || ''),
      current: Boolean(formData.current),
      description: formData.description || '',
      responsibilities: respArray,
      achievements: formData.achievements || [],
      technologies: techArray,
      companyLogo: formData.companyLogo || '',
      image: formData.image || '',
      status: formData.status || 'published',
      order: formData.order || items.length + 1,
    };

    let nextItems: ExperienceItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((e) => (e.id === updatedItem.id ? updatedItem : e));
    }

    setItems(nextItems);
    setEditingItem(null);

    const res = await onSaveExperience(nextItems);
    if (res.success) {
      onShowToast('success', `Experience at ${updatedItem.company} saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save experience');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((e) => e.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveExperience(nextItems);
    if (res.success) {
      onShowToast('success', 'Experience deleted successfully');
    } else {
      onShowToast('error', res.error || 'Failed to delete experience');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    nextItems.forEach((e, idx) => {
      e.order = idx + 1;
    });

    setItems(nextItems);
    const res = await onSaveExperience(nextItems);
    if (res.success) {
      onShowToast('info', 'Experience order updated');
    }
  };

  const handleToggleStatus = async (item: ExperienceItem) => {
    const newStatus: 'published' | 'draft' = item.status === 'published' ? 'draft' : 'published';
    const nextItems: ExperienceItem[] = items.map((e) => (e.id === item.id ? { ...e, status: newStatus } : e));
    setItems(nextItems);

    const res = await onSaveExperience(nextItems);
    if (res.success) {
      onShowToast('info', `Experience ${newStatus === 'published' ? 'published' : 'hidden'}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Briefcase className="w-4 h-4" />
            <span>ENGINEERING & RESEARCH TIMELINE</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Experience Management ({items.length} Roles from CV)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            All positions (Team AeroMavericks, INTELGENCY, CSN Lab SEECS, Teknofest Vitesse, Fiverr, SINES) are fully editable.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD EXPERIENCE ROLE</span>
        </button>
      </div>

      {/* Experience list */}
      <div className="space-y-3">
        {items.map((exp, index) => (
          <div
            key={exp.id}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-100 font-sans">
                    {exp.position}
                  </span>
                  <span className="text-xs font-mono text-cyan-400">
                    @ {exp.company}
                  </span>
                  {exp.current && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                      PRESENT
                    </span>
                  )}
                  {exp.status === 'draft' && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded">
                      HIDDEN
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {exp.startDate} – {exp.endDate} • {exp.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleToggleStatus(exp)}
                className="p-2 rounded bg-[#090E1A] hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title={exp.status === 'published' ? 'Hide role' : 'Publish role'}
              >
                {exp.status === 'published' ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                onClick={() => handleOpenEdit(exp)}
                className="p-2 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(exp.id)}
                className="p-2 rounded bg-[#090E1A] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={isNew ? 'Add Experience' : `Edit: ${formData.company}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  COMPANY / ORGANIZATION *
                </label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Team AeroMavericks"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  ROLE / POSITION *
                </label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Founder & Team Captain"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  LOCATION
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Islamabad, Pakistan or Remote"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  START DATE
                </label>
                <input
                  type="text"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Nov 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  END DATE
                </label>
                <input
                  type="text"
                  disabled={formData.current}
                  value={formData.current ? 'Present' : (formData.endDate || '')}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  placeholder="Present"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="currentToggle"
                checked={formData.current || false}
                onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                className="rounded bg-[#090E1A] border-slate-700 text-cyan-500"
              />
              <label htmlFor="currentToggle" className="text-xs font-mono text-slate-300 cursor-pointer">
                Current Active Position
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-medium text-slate-300">
                  RESPONSIBILITIES & ACHIEVEMENTS ({(formData.responsibilities || []).length})
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, responsibilities: [...(formData.responsibilities || []), ''] })}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-mono flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add Bullet Point
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {(formData.responsibilities || []).map((resp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-cyan-500 font-mono text-xs">{idx + 1}.</span>
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => {
                        const updated = [...(formData.responsibilities || [])];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, responsibilities: updated });
                      }}
                      className="flex-1 px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Integrated ROS nodes for autonomous mission execution..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (formData.responsibilities || []).filter((_, i) => i !== idx);
                        setFormData({ ...formData, responsibilities: updated });
                      }}
                      disabled={(formData.responsibilities || []).length <= 1}
                      className="text-slate-500 hover:text-rose-400 disabled:opacity-20 p-1 text-sm font-bold"
                      title="Remove bullet"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                CARD PICTURE / BACKGROUND IMAGE
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="https://... or click Upload"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </div>
              {formData.image && (
                <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-[#1E293B]">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                TECHNOLOGIES USED (Comma separated)
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="ROS, ArduPilot, PX4, Pixhawk, Computer Vision"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg"
              >
                Save Experience
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
        title="Delete Experience"
        message="Are you sure you want to delete this experience entry?"
        confirmText="Delete Role"
      />

    </div>
  );
};
