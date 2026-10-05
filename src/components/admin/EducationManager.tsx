import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Award,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { EducationItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

interface EducationManagerProps {
  education: EducationItem[];
  onSaveEducation: (education: EducationItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const EducationManager: React.FC<EducationManagerProps> = ({
  education,
  onSaveEducation,
  onShowToast,
}) => {
  const [items, setItems] = useState<EducationItem[]>(education);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { token } = useAuth();
  // Form state
  const [formData, setFormData] = useState<Partial<EducationItem>>({});
  const [courseworkInput, setCourseworkInput] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      location: 'Islamabad, Pakistan',
      startDate: '2023',
      endDate: '2027',
      current: false,
      type: 'degree',
      description: '',
      gpa: '',
      relevantCoursework: [],
      achievements: [],
      image: '',
      status: 'published',
      order: items.length + 1,
    });
    setCourseworkInput('');
    setAchievementsInput('');
    setEditingItem(formData as EducationItem);
  };

  const handleOpenEdit = (item: EducationItem) => {
    setIsNew(false);
    setFormData(item);
    setCourseworkInput((item.relevantCoursework || []).join(', '));
    setAchievementsInput((item.achievements || []).join('\n'));
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
        onShowToast('success', 'Cover picture uploaded!');
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
    if (!formData.degree || !formData.institution) {
      onShowToast('error', 'Degree and institution are required');
      return;
    }

    const courseArray = courseworkInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const achArray = achievementsInput
      .split('\n')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const updatedItem: EducationItem = {
      id: formData.id || `edu-${Date.now()}`,
      degree: formData.degree,
      institution: formData.institution,
      location: formData.location || '',
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      current: Boolean(formData.current),
      type: formData.type || 'degree',
      description: formData.description || '',
      gpa: formData.gpa || '',
      relevantCoursework: courseArray,
      achievements: achArray,
      image: formData.image || '',
      status: formData.status || 'published',
      order: formData.order || items.length + 1,
    };

    let nextItems: EducationItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((e) => (e.id === updatedItem.id ? updatedItem : e));
    }

    setItems(nextItems);
    setEditingItem(null);

    const res = await onSaveEducation(nextItems);
    if (res.success) {
      onShowToast('success', `Education entry saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save education');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((e) => e.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveEducation(nextItems);
    if (res.success) {
      onShowToast('success', 'Education record deleted');
    } else {
      onShowToast('error', res.error || 'Failed to delete record');
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
    const res = await onSaveEducation(nextItems);
    if (res.success) {
      onShowToast('info', 'Education order updated');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>ACADEMIC DEGREES & SPECIALIZATIONS</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Education Management ({items.length} Entries from CV)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage NUST Electrical Engineering (Gold Medalist), UCI IoT, and University of Naples Autonomous Vehicles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD DEGREE / SPECIALIZATION</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((edu, index) => (
          <div
            key={edu.id}
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
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    edu.type === 'degree'
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300'
                      : 'bg-blue-950/60 border border-blue-500/40 text-blue-300'
                  }`}>
                    {edu.type === 'degree' ? 'DEGREE' : 'SPECIALIZATION'}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-sans">
                    {edu.degree}
                  </h3>
                  {edu.gpa && (
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                      <Award className="w-2.5 h-2.5" />
                      {edu.gpa}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  {edu.institution} • {edu.startDate} – {edu.endDate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleOpenEdit(edu)}
                className="p-2 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(edu.id)}
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
          title={isNew ? 'Add Education' : `Edit: ${formData.institution}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                PROGRAM TYPE *
              </label>
              <select
                value={formData.type || 'degree'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'degree' | 'specialization' })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="degree">Academic Degree Program (e.g. NUST Bachelor of Engineering)</option>
                <option value="specialization">Professional Specialization / Non-Credit (e.g. UCI, Naples)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  DEGREE / SPECIALIZATION *
                </label>
                <input
                  type="text"
                  value={formData.degree || ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Bachelor of Engineering — Electrical & Electronics"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  INSTITUTION *
                </label>
                <input
                  type="text"
                  value={formData.institution || ''}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="National University of Sciences and Technology (NUST)"
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
                  placeholder="Islamabad, Pakistan"
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
                  placeholder="Sep 2023"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  END DATE
                </label>
                <input
                  type="text"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Aug 2027"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                HONORS / GPA (e.g. Gold Medalist)
              </label>
              <input
                type="text"
                value={formData.gpa || ''}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Gold Medalist"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                RELEVANT COURSEWORK (Comma separated)
              </label>
              <input
                type="text"
                value={courseworkInput}
                onChange={(e) => setCourseworkInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Linear Control Systems, Embedded Systems, Robotics & Autonomous Systems"
              />
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
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
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
                Save Education
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
        title="Delete Education Entry"
        message="Are you sure you want to delete this educational record?"
        confirmText="Delete Entry"
      />

    </div>
  );
};
