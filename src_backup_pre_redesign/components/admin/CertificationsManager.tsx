import React, { useState } from 'react';
import { Award, Plus, Edit2, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { CertificationItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

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

  const handleSaveModal = async () => {
    if (!formData.name || !formData.issuingOrganization) {
      onShowToast('error', 'Name and organization are required');
      return;
    }

    const updatedItem: CertificationItem = {
      id: formData.id || `cert-${Date.now()}`,
      name: formData.name,
      issuingOrganization: formData.issuingOrganization,
      date: formData.date || '',
      credentialId: formData.credentialId || '',
      credentialUrl: formData.credentialUrl || '',
      description: formData.description || '',
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
            <span>CERTIFICATIONS & LICENSES</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Certifications Management ({items.length} from CV)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            UAS Remote Pilot Open Category A1+A3 and Linux Foundation Nephio LFS179.
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
        {items.map((cert, index) => (
          <div
            key={cert.id}
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
                  {cert.name}
                </h3>
                <div className="text-xs font-mono text-cyan-400 mt-0.5">
                  {cert.issuingOrganization} • {cert.date}
                </div>
                {cert.credentialId && (
                  <div className="text-[10px] font-mono text-slate-500">
                    ID: {cert.credentialId}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleOpenEdit(cert)}
                className="p-2 rounded bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(cert.id)}
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
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                CERTIFICATION NAME *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="UAS Remote Pilot Open Category — A1+A3"
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
                placeholder="Civil Aviation Authority / EASA"
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
                  placeholder="LFS179"
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
                placeholder="https://..."
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
        message="Are you sure you want to delete this certification?"
        confirmText="Delete"
      />

    </div>
  );
};
