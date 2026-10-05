import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Star,
  Eye,
  EyeOff,
  Check,
  Save,
  FileText,
  Copy,
  GraduationCap,
} from 'lucide-react';
import { ProjectItem, StatusState } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface ResearchManagerProps {
  research: ProjectItem[];
  onSaveResearch: (items: ProjectItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ResearchManager: React.FC<ResearchManagerProps> = ({
  research = [],
  onSaveResearch,
  onShowToast,
}) => {
  const [items, setItems] = useState<ProjectItem[]>(research);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  React.useEffect(() => {
    setItems(research || []);
  }, [research]);

  // Form State
  const [formData, setFormData] = useState<Partial<ProjectItem>>({});
  const [modalTab, setModalTab] = useState<'basic' | 'methodology' | 'tags' | 'links'>('basic');
  const [tagInput, setTagInput] = useState('');

  const handleOpenAdd = () => {
    setIsNew(true);
    setModalTab('basic');
    setFormData({
      id: `res-${Date.now()}`,
      title: '',
      shortDescription: '',
      fullDescription: '',
      technologies: ['Visual SLAM', 'VI-SLAM', 'Sensor Fusion', 'SEECS NUST'],
      category: 'Technical Review (FYP)',
      projectImage: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=1200&q=80',
      githubUrl: 'https://github.com/UnknownEng',
      liveDemoUrl: '',
      documentationUrl: '',
      myRole: 'Lead Author & FYP Researcher (SEECS NUST)',
      projectDate: '2026',
      featured: true,
      status: 'published',
      order: items.length + 1,
    });
    setTagInput('');
    setEditingItem(formData as ProjectItem);
  };

  const handleOpenEdit = (paper: ProjectItem) => {
    setIsNew(false);
    setModalTab('basic');
    setFormData(paper);
    setTagInput('');
    setEditingItem(paper);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const current = formData.technologies || [];
    if (!current.includes(trimmed)) {
      setFormData({
        ...formData,
        technologies: [...current, trimmed],
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      technologies: (formData.technologies || []).filter((t) => t !== tagToRemove),
    });
  };

  const handleSaveModal = async () => {
    if (!formData.title || !formData.shortDescription) {
      onShowToast('error', 'Title and abstract/summary are required');
      return;
    }

    setSaving(true);
    const updatedPaper: ProjectItem = {
      id: formData.id || `res-${Date.now()}`,
      title: formData.title,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription || formData.shortDescription,
      technologies: formData.technologies || [],
      category: formData.category || 'Technical Review (FYP)',
      projectImage: formData.projectImage || '',
      githubUrl: formData.githubUrl || '',
      liveDemoUrl: formData.liveDemoUrl || '',
      documentationUrl: formData.documentationUrl || '',
      myRole: formData.myRole || 'Lead Author',
      projectDate: formData.projectDate || '2026',
      featured: Boolean(formData.featured),
      status: formData.status || 'published',
      order: formData.order || items.length + 1,
    };

    let nextItems: ProjectItem[];
    if (isNew) {
      nextItems = [...items, updatedPaper];
    } else {
      nextItems = items.map((p) => (p.id === updatedPaper.id ? updatedPaper : p));
    }

    setItems(nextItems);
    const res = await onSaveResearch(nextItems);
    setSaving(false);

    if (res.success) {
      onShowToast('success', `Paper "${updatedPaper.title}" saved successfully!`);
      setEditingItem(null);
    } else {
      onShowToast('error', res.error || 'Failed to save paper');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((p) => p.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveResearch(nextItems);
    if (res.success) {
      onShowToast('success', 'Research paper removed');
    } else {
      onShowToast('error', res.error || 'Failed to remove research paper');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    nextItems.forEach((p, idx) => {
      p.order = idx + 1;
    });

    setItems(nextItems);
    const res = await onSaveResearch(nextItems);
    if (res.success) {
      onShowToast('info', 'Paper order updated');
    }
  };

  const handleToggleStatus = async (paper: ProjectItem) => {
    const newStatus: StatusState = paper.status === 'published' ? 'draft' : 'published';
    const nextItems: ProjectItem[] = items.map((p) => (p.id === paper.id ? { ...p, status: newStatus } : p));
    setItems(nextItems);

    const res = await onSaveResearch(nextItems);
    if (res.success) {
      onShowToast('info', `Paper ${newStatus === 'published' ? 'published' : 'moved to drafts'}`);
    }
  };

  const handleCopyCitation = (paper: ProjectItem) => {
    const citation = `@article{rind${paper.projectDate.split('–')[0].trim()}${paper.id},
  title={${paper.title}},
  author={Rind, Mansoor Ahmed and Ali, Muhammad Moazzam and Zia, Muhammad Saad},
  journal={School of Electrical Engineering and Computer Science (SEECS), NUST},
  year={${paper.projectDate.split('–')[0].trim()}},
  url={${paper.githubUrl || 'https://github.com/UnknownEng'}}
}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(paper.id);
    onShowToast('success', 'BibTeX citation copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            <span>ACADEMIC RESEARCH & PAPERS DATABASE</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Research Publications & Papers ({items.length} Papers)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage your V-SLAM Review Paper, Nav2 obstacle braking architecture, and swarm coordination research independently.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW RESEARCH PAPER</span>
        </button>
      </div>

      {/* Papers List */}
      <div className="space-y-3">
        {items.map((paper, index) => (
          <div
            key={paper.id}
            className="p-5 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-slate-700 transition flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            {/* Left: Reorder buttons & Details */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex flex-col gap-1 shrink-0 mt-1">
                <button
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === items.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded font-semibold">
                    #{paper.order} • {paper.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded">
                    {paper.projectDate}
                  </span>
                  {paper.status === 'published' ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" />
                      PUBLISHED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <EyeOff className="w-2.5 h-2.5" />
                      DRAFT
                    </span>
                  )}
                  {paper.featured && (
                    <span className="text-[10px] font-mono text-yellow-300 bg-yellow-950/40 border border-yellow-800/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-yellow-300" />
                      FEATURED
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-100 leading-snug">
                  {paper.title}
                </h3>

                <p className="text-xs text-cyan-300/80 font-mono mt-1">
                  {paper.myRole || 'School of Electrical Engineering and Computer Science (SEECS), NUST'}
                </p>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {paper.shortDescription}
                </p>

                {/* Tags */}
                {paper.technologies && paper.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {paper.technologies.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
              <button
                onClick={() => handleCopyCitation(paper)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#090E1A] hover:bg-slate-800 border border-[#1E293B] text-slate-300 text-xs font-mono transition"
                title="Copy BibTeX Citation"
              >
                {copiedId === paper.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>BibTeX</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleToggleStatus(paper)}
                className="px-2.5 py-1.5 rounded-lg bg-[#090E1A] hover:bg-slate-800 border border-[#1E293B] text-slate-300 text-xs font-mono transition"
                title={paper.status === 'published' ? 'Switch to Draft' : 'Publish Paper'}
              >
                {paper.status === 'published' ? 'Draft' : 'Publish'}
              </button>

              <button
                onClick={() => handleOpenEdit(paper)}
                className="p-2 rounded-lg bg-[#090E1A] hover:bg-slate-800 border border-[#1E293B] text-cyan-400 hover:text-cyan-300 transition"
                title="Edit Paper"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(paper.id)}
                className="p-2 rounded-lg bg-[#090E1A] hover:bg-rose-950/40 border border-[#1E293B] text-rose-400 hover:text-rose-300 transition"
                title="Delete Paper"
              >
                <Trash2 className="w-4 h-4" />
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
          title={isNew ? 'Add Research Paper / Review' : `Edit: ${formData.title || 'Paper'}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Modal Tabs */}
            <div className="flex border-b border-[#1E293B] gap-2 pb-2">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                  modalTab === 'basic'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Overview & Authors
              </button>
              <button
                type="button"
                onClick={() => setModalTab('methodology')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                  modalTab === 'methodology'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Methodology & Findings
              </button>
              <button
                type="button"
                onClick={() => setModalTab('tags')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                  modalTab === 'tags'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Focus Areas / Tags
              </button>
              <button
                type="button"
                onClick={() => setModalTab('links')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                  modalTab === 'links'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4. Links & Cover
              </button>
            </div>

            {/* Tab 1: Overview */}
            {modalTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    PAPER TITLE *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. A Review of Visual and Visual-Inertial SLAM Techniques for Dynamic-Environment..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                      PUBLICATION CATEGORY
                    </label>
                    <select
                      value={formData.category || 'Technical Review (FYP)'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Technical Review (FYP)">Technical Review (FYP)</option>
                      <option value="Peer-Reviewed Paper">Peer-Reviewed Paper</option>
                      <option value="Conference Proceedings">Conference Proceedings</option>
                      <option value="Journal Article">Journal Article</option>
                      <option value="Swarm Research">Swarm Research</option>
                      <option value="Whitepaper">Whitepaper</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                      PUBLICATION YEAR / DATE
                    </label>
                    <input
                      type="text"
                      value={formData.projectDate || ''}
                      onChange={(e) => setFormData({ ...formData, projectDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. 2026, 2025 – 2026"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    AUTHORSHIP / AFFILIATION / ROLE
                  </label>
                  <input
                    type="text"
                    value={formData.myRole || ''}
                    onChange={(e) => setFormData({ ...formData, myRole: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Lead Author & FYP Researcher (SEECS NUST, Advisor: Dr. Moazzam Ali)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    SHORT ABSTRACT / SUMMARY *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="Brief 2-3 sentence abstract summarizing core research findings..."
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Methodology & Findings */}
            {modalTab === 'methodology' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    FULL METHODOLOGY, SYNTHESIS & FINDINGS
                  </label>
                  <textarea
                    rows={12}
                    value={formData.fullDescription || ''}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                    placeholder="Elaborate on the 4 pillars (Categorization, Hardware Constraints on sub-2 kg UAVs, Sensor Fusion Realities, Evaluation Gap) or experimental setups..."
                  />
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Supports multi-paragraph descriptions and bullet lists for modal previews.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Tags */}
            {modalTab === 'tags' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    RESEARCH FOCUS & TECHNOLOGIES
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Visual SLAM, VI-SLAM, IMU Fusion, Nav2"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold font-mono text-xs hover:bg-cyan-400"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(formData.technologies || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-cyan-300 text-xs font-mono border border-slate-700"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Links & Cover */}
            {modalTab === 'links' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    COVER IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={formData.projectImage || ''}
                    onChange={(e) => setFormData({ ...formData, projectImage: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    GITHUB REPOSITORY / CODE LINK
                  </label>
                  <input
                    type="text"
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="https://github.com/UnknownEng"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    DOCUMENTATION / DOI / PDF URL
                  </label>
                  <input
                    type="text"
                    value={formData.documentationUrl || ''}
                    onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="https://doi.org/... or /CV.pdf"
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
                    <span>Featured Paper (Highlighted Badge)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.status !== 'draft'}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })
                      }
                      className="rounded bg-[#090E1A] border-slate-700 text-cyan-500"
                    />
                    <span>Publicly Published</span>
                  </label>
                </div>
              </div>
            )}

            {/* Modal Footer */}
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
                disabled={saving}
                onClick={handleSaveModal}
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Paper'}
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
        title="Delete Research Paper"
        message="Are you sure you want to delete this research paper from your publications portfolio?"
        confirmText="Delete Paper"
      />
    </div>
  );
};
