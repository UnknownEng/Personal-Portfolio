import React, { useState, useRef } from 'react';
import { Award, Plus, Edit2, Trash2, ArrowUp, ArrowDown, ExternalLink, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { CertificationItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

interface CertificationsManagerProps {
  certifications: CertificationItem[];
  onSaveCertifications: (certs: CertificationItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const CertificationsManager: React.FC<CertificationsManagerProps> = ({
  certifications,
  onSaveCertifications,
  onShowToast,
}) => {
  const { token } = useAuth();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [items, setItems] = useState<CertificationItem[]>(certifications);
  const [editingItem, setEditingItem] = useState<CertificationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CertificationItem>>({});

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `cert-${Date.now()}`,
      name: '',
      issuingOrganization: '',
      date: '2024',
      credentialId: '',
      credentialUrl: '',
      description: '',
      image: '',
      pdfUrl: '',
      status: 'published',
      order: items.length + 1,
    });
    setEditingItem(formData as CertificationItem);
  };

  const handleOpenEdit = (item: CertificationItem) => {
    setIsNew(false);
    setFormData(item);
    setEditingItem(item);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'pdf' | 'img'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      onShowToast('error', 'File size exceeds 15MB limit');
      return;
    }

    const data = new FormData();
    data.append('file', file);

    if (type === 'pdf') setUploadingPdf(true);
    else setUploadingImg(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        if (type === 'pdf') {
          setFormData((prev) => ({ ...prev, pdfUrl: resJson.media.url }));
          onShowToast('success', 'Certificate PDF uploaded!');
        } else {
          setFormData((prev) => ({ ...prev, image: resJson.media.url }));
          onShowToast('success', 'Certificate thumbnail image uploaded!');
        }
      } else {
        onShowToast('error', resJson.error || 'Upload failed');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Upload error');
    } finally {
      if (type === 'pdf') {
        setUploadingPdf(false);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
      } else {
        setUploadingImg(false);
        if (imgInputRef.current) imgInputRef.current.value = '';
      }
    }
  };

  const handleSaveModal = async () => {
    if (!formData.name || !formData.issuingOrganization) {
      onShowToast('error', 'Name and organization are required');
      return;
    }

    const updatedItem: CertificationItem = {
      id: formData.id || `cert-${Date.now()}`,
      name: formData.name.trim(),
      issuingOrganization: formData.issuingOrganization.trim(),
      date: formData.date || '',
      credentialId: formData.credentialId || '',
      credentialUrl: formData.credentialUrl || '',
      description: formData.description || '',
      image: formData.image || '',
      pdfUrl: formData.pdfUrl || '',
      status: formData.status || 'published',
      order: formData.order || items.length + 1,
    };

    let nextItems: CertificationItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((c) => (c.id === updatedItem.id ? updatedItem : c));
    }

    setItems(nextItems);
    setEditingItem(null);

    const res = await onSaveCertifications(nextItems);
    if (res.success) {
      onShowToast('success', `Certification saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save certification');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((c) => c.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveCertifications(nextItems);
    if (res.success) {
      onShowToast('success', 'Certification deleted');
    } else {
      onShowToast('error', res.error || 'Failed to delete certification');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    nextItems.forEach((c, idx) => {
      c.order = idx + 1;
    });

    setItems(nextItems);
    const res = await onSaveCertifications(nextItems);
    if (res.success) {
      onShowToast('info', 'Certification order updated');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Award className="w-4 h-4" />
            <span>CREDENTIALS & SPECIALIZATIONS</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Technical Certifications Management
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Maintain verified flight and system credentials from UPenn, DeepLearning.AI, and European institutions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD CERTIFICATION</span>
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

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold">
                    {item.date}
                  </span>
                  {item.credentialId && (
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {item.credentialId}
                    </span>
                  )}
                  {item.pdfUrl && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      PDF attached
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans mt-0.5 truncate">
                  {item.name}
                </h3>
                <div className="text-xs font-mono text-slate-400 truncate">
                  {item.issuingOrganization}
                </div>
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
          title={isNew ? 'Add Certification' : `Edit: ${formData.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                CERTIFICATION NAME *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Robotics Specialization"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                ISSUING ORGANIZATION *
              </label>
              <input
                type="text"
                value={formData.issuingOrganization || ''}
                onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="University of Pennsylvania / DeepLearning.AI"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  DATE
                </label>
                <input
                  type="text"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  CREDENTIAL ID
                </label>
                <input
                  type="text"
                  value={formData.credentialId || ''}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. COURSERA-12345"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                CREDENTIAL VERIFICATION URL
              </label>
              <input
                type="url"
                value={formData.credentialUrl || ''}
                onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="https://coursera.org/verify/..."
              />
            </div>

            {/* Document PDF Upload */}
            <div className="p-3.5 rounded-xl bg-[#090E1A] border border-[#1E293B] space-y-2">
              <label className="block text-xs font-mono font-semibold text-cyan-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>CERTIFICATE PDF DOCUMENT</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.pdfUrl || ''}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="flex-1 px-3 py-2 bg-[#0D121F] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="/uploads/... or external PDF URL"
                />
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingPdf}
                  onClick={() => pdfInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  <span>{uploadingPdf ? '...' : 'Upload PDF'}</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Image Upload */}
            <div className="p-3.5 rounded-xl bg-[#090E1A] border border-[#1E293B] space-y-2">
              <label className="block text-xs font-mono font-semibold text-cyan-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>CERTIFICATE PREVIEW IMAGE</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 px-3 py-2 bg-[#0D121F] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="/uploads/... image preview"
                />
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'img')}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingImg}
                  onClick={() => imgInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  <span>{uploadingImg ? '...' : 'Upload Image'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                DESCRIPTION / SYLLABUS TOPICS
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Aerial robotics, path planning, quadrotor dynamics..."
              />
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
                Save Certification
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
        title="Delete Certification"
        message="Are you sure you want to remove this certification?"
        confirmText="Delete"
      />
    </div>
  );
};
