import React, { useState } from 'react';
import { User, Save, Plus, Edit2, Trash2, Award, Shield, Zap, Cpu } from 'lucide-react';
import { AboutData, InfoCard } from '../../types/portfolio';
import { ProfileImageUploader } from './ProfileImageUploader';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface AboutEditorProps {
  about: AboutData;
  onSaveAbout: (about: AboutData) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AboutEditor: React.FC<AboutEditorProps> = ({
  about,
  onSaveAbout,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<AboutData>(about);
  const [editingCard, setEditingCard] = useState<InfoCard | null>(null);
  const [cardFormData, setCardFormData] = useState<Partial<InfoCard>>({});
  const [isNewCard, setIsNewCard] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newFocusAreaInput, setNewFocusAreaInput] = useState('');

  const handleAddFocusArea = () => {
    const trimmed = newFocusAreaInput.trim();
    if (!trimmed) return;
    const current = formData.focusAreas || [];
    if (!current.includes(trimmed)) {
      setFormData({
        ...formData,
        focusAreas: [...current, trimmed],
      });
    }
    setNewFocusAreaInput('');
  };

  const handleRemoveFocusArea = (idx: number) => {
    const next = (formData.focusAreas || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, focusAreas: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const areas = (formData.focusAreas || [])
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const payload: AboutData = {
      ...formData,
      focusAreas: areas,
    };

    const res = await onSaveAbout(payload);
    setSaving(false);

    if (res.success) {
      onShowToast('success', 'About profile saved to disk!');
    } else {
      onShowToast('error', res.error || 'Failed to save about profile');
    }
  };

  const handleOpenAddCard = () => {
    setIsNewCard(true);
    setCardFormData({
      id: `card-${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      icon: 'Award',
      order: (formData.infoCards || []).length + 1,
    });
    setEditingCard(cardFormData as InfoCard);
  };

  const handleOpenEditCard = (card: InfoCard) => {
    setIsNewCard(false);
    setCardFormData(card);
    setEditingCard(card);
  };

  const handleSaveCardModal = () => {
    if (!cardFormData.title) {
      onShowToast('error', 'Card title is required');
      return;
    }

    const newCard: InfoCard = {
      id: cardFormData.id || `card-${Date.now()}`,
      title: cardFormData.title,
      subtitle: cardFormData.subtitle || '',
      description: cardFormData.description || '',
      icon: cardFormData.icon || 'Award',
      order: cardFormData.order || (formData.infoCards || []).length + 1,
    };

    let nextCards: InfoCard[];
    if (isNewCard) {
      nextCards = [...(formData.infoCards || []), newCard];
    } else {
      nextCards = (formData.infoCards || []).map((c) => (c.id === newCard.id ? newCard : c));
    }

    setFormData({ ...formData, infoCards: nextCards });
    setEditingCard(null);
    onShowToast('info', 'Card updated in local state (click Save to persist)');
  };

  const handleDeleteCard = (id: string) => {
    const nextCards = (formData.infoCards || []).filter((c) => c.id !== id);
    setFormData({ ...formData, infoCards: nextCards });
    setDeleteConfirmId(null);
    onShowToast('info', 'Card removed');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <User className="w-4 h-4" />
            <span>ENGINEERING PROFILE DOSSIER</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            About Section & Highlight Cards
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage your biography paragraphs, philosophy statement, core competencies, and credentials cards.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SAVING...' : 'SAVE ABOUT PROFILE'}</span>
        </button>
      </div>

      {/* Main Text Content */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Section Headings & Biographies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              SECTION TITLE
            </label>
            <input
              type="text"
              value={formData.sectionTitle}
              onChange={(e) => setFormData({ ...formData, sectionTitle: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
              BADGE LABEL
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            PRIMARY BIO (Direct from CV)
          </label>
          <textarea
            rows={4}
            value={formData.bioParagraph}
            onChange={(e) => setFormData({ ...formData, bioParagraph: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            SECONDARY BIO / LEADERSHIP OVERVIEW
          </label>
          <textarea
            rows={4}
            value={formData.secondaryBio}
            onChange={(e) => setFormData({ ...formData, secondaryBio: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <ProfileImageUploader
          label="About Profile Image / Portrait"
          imageUrl={formData.profileImage || ''}
          onChange={(url) => setFormData({ ...formData, profileImage: url })}
          onShowToast={onShowToast}
        />

        <div>
          <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
            ENGINEERING PHILOSOPHY STATEMENT
          </label>
          <input
            type="text"
            value={formData.engineeringPhilosophy}
            onChange={(e) => setFormData({ ...formData, engineeringPhilosophy: e.target.value })}
            className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono font-medium text-slate-300">
              CORE FOCUS AREAS ({(formData.focusAreas || []).length})
            </label>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newFocusAreaInput}
              onChange={(e) => setNewFocusAreaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFocusArea();
                }
              }}
              placeholder="e.g. Swarm Robotics & Decentralized Flight Coordination"
              className="flex-1 px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddFocusArea}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-lg transition"
            >
              + Add Focus Area
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {(formData.focusAreas || []).map((area, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-xs">{idx + 1}.</span>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => {
                    const updated = [...(formData.focusAreas || [])];
                    updated[idx] = e.target.value;
                    setFormData({ ...formData, focusAreas: updated });
                  }}
                  className="flex-1 px-3 py-1.5 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFocusArea(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 text-sm font-bold"
                  title="Remove focus area"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Cards CRUD */}
      <div className="p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Highlight Profile Cards
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Academic honors, Teknofest international finalist, lab research, and international specializations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(formData.infoCards || []).map((card) => (
            <div
              key={card.id}
              className="p-4 rounded-xl bg-[#090E1A] border border-[#1E293B] flex items-start justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  ICON: {card.icon}
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-0.5">{card.title}</h4>
                <div className="text-xs font-mono text-slate-400">{card.subtitle}</div>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">{card.description}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEditCard(card)}
                  className="p-1.5 rounded hover:bg-slate-800 text-cyan-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(card.id)}
                  className="p-1.5 rounded hover:bg-rose-950/40 text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Modal */}
      {editingCard && (
        <Modal
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
          title={isNewCard ? 'Add Highlight Card' : 'Edit Highlight Card'}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                TITLE *
              </label>
              <input
                type="text"
                value={cardFormData.title || ''}
                onChange={(e) => setCardFormData({ ...cardFormData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="e.g. NUST Gold Medalist"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                SUBTITLE
              </label>
              <input
                type="text"
                value={cardFormData.subtitle || ''}
                onChange={(e) => setCardFormData({ ...cardFormData, subtitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Electrical & Electronics Engineering"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={cardFormData.description || ''}
                onChange={(e) => setCardFormData({ ...cardFormData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                ICON
              </label>
              <select
                value={cardFormData.icon || 'Award'}
                onChange={(e) => setCardFormData({ ...cardFormData, icon: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Award">Award (Trophy / Honor)</option>
                <option value="Shield">Shield (Teknofest / Security)</option>
                <option value="Zap">Zap (Captain / Energy)</option>
                <option value="Cpu">Cpu (IoT / Hardware / Naples)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="px-4 py-2 text-xs font-mono text-slate-400 bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCardModal}
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg"
              >
                Update Card
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteCard(deleteConfirmId)}
        title="Delete Highlight Card"
        message="Are you sure you want to delete this highlight card?"
        confirmText="Delete Card"
      />

    </form>
  );
};
