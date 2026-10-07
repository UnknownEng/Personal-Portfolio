import React, { useState, useRef } from 'react';
import {
  Layers,
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
  Upload,
  Image as ImageIcon,
  Video,
  FileCode,
} from 'lucide-react';
import { ProjectItem } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { WebsiteLinkPreview, LiveWebsiteModal } from '../ui/WebsiteLinkPreview';

interface ProjectsManagerProps {
  projects: ProjectItem[];
  onSaveProjects: (projects: ProjectItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onSaveProjects,
  onShowToast,
}) => {
  const { token } = useAuth();
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState('');

  const [items, setItems] = useState<ProjectItem[]>(projects);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; title: string } | null>(null);

  React.useEffect(() => {
    setItems(projects || []);
  }, [projects]);

  // Form State
  const [formData, setFormData] = useState<Partial<ProjectItem>>({});
  const [modalTab, setModalTab] = useState<'basic' | 'tech' | 'specs' | 'links'>('basic');
  const [tagInput, setTagInput] = useState('');

  const handleOpenAdd = () => {
    setIsNew(true);
    setModalTab('basic');
    setFormData({
      id: `proj-${Date.now()}`,
      title: '',
      shortDescription: '',
      fullDescription: '',
      technologies: ['ROS', 'PX4 Autopilot', 'Python'],
      category: 'Autonomous Guidance',
      projectImage: '',
      githubUrl: '',
      liveDemoUrl: '',
      documentationUrl: '',
      myRole: 'Lead Autonomy Engineer',
      projectDate: '2025',
      featured: false,
      status: 'published',
      order: items.length + 1,
    });
    setTagInput('');
    setEditingItem(formData as ProjectItem);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setIsNew(false);
    setModalTab('basic');
    setFormData(project);
    setTagInput('');
    setEditingItem(project);
  };

  const handleAddTechTag = () => {
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

  const handleRemoveTechTag = (tagToRemove: string) => {
    const current = formData.technologies || [];
    setFormData({
      ...formData,
      technologies: current.filter((t) => t !== tagToRemove),
    });
  };

  const handleAddSuggestedTag = (suggestedTag: string) => {
    const current = formData.technologies || [];
    if (!current.includes(suggestedTag)) {
      setFormData({
        ...formData,
        technologies: [...current, suggestedTag],
      });
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      onShowToast('error', 'Image size must be less than 15MB');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    setUploadingCover(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      let resJson: any = null;
      try {
        resJson = await res.json();
      } catch {
        resJson = { error: `Server error (${res.status})` };
      }
      if (res.ok && resJson?.success && resJson?.media?.url) {
        setFormData((prev) => ({ ...prev, projectImage: resJson.media.url }));
        onShowToast('success', 'Cover image uploaded!');
      } else {
        onShowToast('error', resJson?.error || 'Upload failed');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Upload error');
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onShowToast('error', 'Image size must be less than 10MB');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    setUploadingGallery(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      let resJson: any = null;
      try {
        resJson = await res.json();
      } catch {
        resJson = { error: `Server error (${res.status})` };
      }
      if (res.ok && resJson?.success && resJson?.media?.url) {
        setFormData((prev) => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), resJson.media.url],
        }));
        onShowToast('success', 'Image added to project gallery!');
      } else {
        onShowToast('error', resJson.error || 'Upload failed');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Upload error');
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleAddGalleryUrl = () => {
    const trimmed = newGalleryUrlInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), trimmed],
    }));
    setNewGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSaveModal = async (publishImmediate = false) => {
    if (!formData.title || !formData.title.trim()) {
      onShowToast('error', 'Project title is required');
      setModalTab('basic');
      return;
    }

    if (!formData.shortDescription || !formData.shortDescription.trim()) {
      onShowToast('error', 'Short description is required');
      setModalTab('specs');
      return;
    }

    const currentTags = (formData.technologies || []).filter((t) => t && t.trim().length > 0);

    const updatedItem: ProjectItem = {
      id: formData.id || `proj-${Date.now()}`,
      title: formData.title.trim(),
      shortDescription: formData.shortDescription.trim(),
      fullDescription: (formData.fullDescription || formData.shortDescription).trim(),
      technologies: currentTags.length > 0 ? currentTags : ['Autonomous Systems'],
      category: formData.category?.trim() || 'Autonomous Navigation',
      projectImage: formData.projectImage?.trim() || '',
      galleryImages: formData.galleryImages || [],
      githubUrl: formData.githubUrl?.trim() || '',
      liveDemoUrl: formData.liveDemoUrl?.trim() || '',
      videoUrl: formData.videoUrl?.trim() || '',
      documentationUrl: formData.documentationUrl?.trim() || '',
      diagramUrl: formData.diagramUrl?.trim() || '',
      myRole: formData.myRole?.trim() || 'Lead Engineer',
      projectDate: formData.projectDate?.trim() || '2025',
      featured: Boolean(formData.featured),
      status: publishImmediate ? 'published' : (formData.status || 'published'),
      order: formData.order || items.length + 1,
    };

    let nextItems: ProjectItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((p) => (p.id === updatedItem.id ? updatedItem : p));
    }

    setItems(nextItems);
    setEditingItem(null);

    setSaving(true);
    const res = await onSaveProjects(nextItems);
    setSaving(false);

    if (res.success) {
      onShowToast('success', `Project "${updatedItem.title}" saved successfully!`);
    } else {
      onShowToast('error', res.error || 'Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((p) => p.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveProjects(nextItems);
    if (res.success) {
      onShowToast('success', 'Project deleted successfully');
    } else {
      onShowToast('error', res.error || 'Failed to delete project');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    // Update order values
    nextItems.forEach((p, idx) => {
      p.order = idx + 1;
    });

    setItems(nextItems);
    const res = await onSaveProjects(nextItems);
    if (res.success) {
      onShowToast('info', 'Project order updated');
    }
  };

  const handleToggleStatus = async (project: ProjectItem) => {
    const newStatus: 'published' | 'draft' = project.status === 'published' ? 'draft' : 'published';
    const nextItems: ProjectItem[] = items.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p));
    setItems(nextItems);

    const res = await onSaveProjects(nextItems);
    if (res.success) {
      onShowToast('info', `Project ${newStatus === 'published' ? 'published' : 'moved to drafts'}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Layers className="w-4 h-4" />
            <span>MISSION PROJECTS DATABASE</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Projects Management ({items.length} Total)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            All 9 projects from your CV are pre-populated. Add, edit, reorder, or draft/publish as desired.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PROJECT</span>
        </button>
      </div>

      {/* Projects Table / Cards List */}
      <div className="space-y-3">
        {items.map((project, index) => (
          <div
            key={project.id}
            className="p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Reorder buttons & Title */}
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
              <div className="flex flex-col gap-0.5 shrink-0">
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

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded">
                    #{project.order} • {project.category}
                  </span>
                  {project.status === 'published' ? (
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
                  {project.featured && (
                    <span className="text-[10px] font-mono text-yellow-300 bg-yellow-950/40 border border-yellow-800/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-yellow-300" />
                      FEATURED
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-100 mt-1 truncate">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-xl">
                  {project.shortDescription}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleToggleStatus(project)}
                className="px-2.5 py-1.5 rounded-lg bg-[#090E1A] hover:bg-slate-800 border border-[#1E293B] text-slate-300 text-xs font-mono transition"
                title={project.status === 'published' ? 'Switch to Draft' : 'Publish Project'}
              >
                {project.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>

              {project.liveDemoUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl({ url: project.liveDemoUrl!, title: project.title })}
                  className="p-2 rounded-lg bg-[#090E1A] hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition"
                  title="Preview Live Website"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleOpenEdit(project)}
                className="p-2 rounded-lg bg-[#090E1A] hover:bg-slate-800 border border-[#1E293B] text-cyan-400 hover:text-cyan-300 transition"
                title="Edit Project"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(project.id)}
                className="p-2 rounded-lg bg-[#090E1A] hover:bg-rose-950/40 border border-[#1E293B] text-rose-400 hover:text-rose-300 transition"
                title="Delete Project"
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
          title={isNew ? 'Add Technical Project' : `Edit: ${formData.title || 'Project'}`}
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
                1. Basic Info
              </button>
              <button
                type="button"
                onClick={() => setModalTab('tech')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                  modalTab === 'tech'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Tech Tags ({(formData.technologies || []).length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('specs')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition ${
                  modalTab === 'specs'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Specifications
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
                4. Links & Media
              </button>
            </div>

            {/* TAB 1: BASIC INFO */}
            {modalTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    PROJECT TITLE *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Vision-Guided Dynamic UAV Landing System"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                      CATEGORY *
                    </label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Autonomous Guidance, Swarm Robotics"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                      MY ROLE
                    </label>
                    <input
                      type="text"
                      value={formData.myRole || ''}
                      onChange={(e) => setFormData({ ...formData, myRole: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Lead Autonomy Engineer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    TIMELINE / PROJECT DATE
                  </label>
                  <input
                    type="text"
                    value={formData.projectDate || ''}
                    onChange={(e) => setFormData({ ...formData, projectDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. 2025"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded bg-[#090E1A] border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Featured Project (Highlighted on Home)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.status === 'published'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })}
                      className="rounded bg-[#090E1A] border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Published Publicly</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: TECH TAGS */}
            {modalTab === 'tech' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                    CURRENT TECHNOLOGIES & TOOLS
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-[#090E1A] border border-[#1E293B] rounded-xl min-h-[56px] items-center">
                    {(formData.technologies || []).length === 0 ? (
                      <span className="text-xs text-slate-500 font-mono italic">No technologies added yet. Add tags below.</span>
                    ) : (
                      (formData.technologies || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono"
                        >
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTechTag(t)}
                            className="text-cyan-400 hover:text-rose-400 font-bold transition ml-0.5"
                            title="Remove Tag"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTechTag();
                      }
                    }}
                    placeholder="Type technology (e.g. MAVROS, PyMAVLink) & press Enter"
                    className="flex-1 px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTechTag}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono rounded-lg transition"
                  >
                    + Add Tag
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1.5">
                    QUICK-ADD SUGGESTIONS:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['ROS', 'PX4 Autopilot', 'ArduPilot', 'Gazebo SITL', 'MAVROS', 'PyMAVLink', 'Fast-DDS', 'Python', 'C++', 'Computer Vision', 'OpenCV', 'Pixhawk', 'GPS-Denied', 'Swarm Robotics'].map((suggest) => (
                      <button
                        key={suggest}
                        type="button"
                        onClick={() => handleAddSuggestedTag(suggest)}
                        disabled={(formData.technologies || []).includes(suggest)}
                        className="px-2 py-1 text-[11px] font-mono rounded bg-slate-800/80 hover:bg-cyan-950/40 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        + {suggest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SPECIFICATIONS */}
            {modalTab === 'specs' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    SHORT DESCRIPTION (Card summary) *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="Brief 1-2 sentence description shown on project cards..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    FULL TECHNICAL DOSSIER & ARCHITECTURAL SPECS
                  </label>
                  <textarea
                    rows={6}
                    value={formData.fullDescription || ''}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    placeholder="Detailed flight architecture, control algorithms, sensor fusion details, and test outcomes..."
                  />
                </div>
              </div>
            )}

            {/* TAB 4: LINKS & MEDIA */}
            {modalTab === 'links' && (
              <div className="space-y-5">
                {/* 1. Cover Image */}
                <div className="p-4 rounded-xl bg-[#090E1A] border border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>PROJECT COVER IMAGE</span>
                    </label>
                    {formData.projectImage && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        Cover Active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={formData.projectImage || ''}
                      onChange={(e) => setFormData({ ...formData, projectImage: e.target.value })}
                      className="flex-1 w-full px-3 py-2 bg-[#0D121F] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="/uploads/... or external image URL"
                    />

                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingCover ? 'UPLOADING...' : 'UPLOAD COVER'}</span>
                    </button>
                  </div>

                  {formData.projectImage && (
                    <div className="relative w-full h-36 rounded-lg overflow-hidden border border-[#1E293B] bg-black/40 flex items-center justify-center">
                      <img
                        src={formData.projectImage}
                        alt="Project cover preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, projectImage: '' })}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-900 text-rose-300 text-xs font-mono transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Gallery Images */}
                <div className="p-4 rounded-xl bg-[#090E1A] border border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>PROJECT GALLERY IMAGES ({(formData.galleryImages || []).length})</span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={newGalleryUrlInput}
                      onChange={(e) => setNewGalleryUrlInput(e.target.value)}
                      className="flex-1 w-full px-3 py-2 bg-[#0D121F] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="Enter image URL or upload below..."
                    />

                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition shrink-0"
                    >
                      Add URL
                    </button>

                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingGallery}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingGallery ? 'UPLOADING...' : 'UPLOAD'}</span>
                    </button>
                  </div>

                  {/* Gallery Thumbnails List */}
                  {(formData.galleryImages || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {(formData.galleryImages || []).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 rounded-lg overflow-hidden border border-[#1E293B] bg-black/40 group"
                        >
                          <img
                            src={imgUrl}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded bg-black/80 hover:bg-rose-900 text-rose-300 transition opacity-0 group-hover:opacity-100"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Media & Demonstration URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-rose-400" />
                      <span>VIDEO / FLIGHT DEMO URL</span>
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="https://youtube.com/watch?v=... or MP4"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-blue-400" />
                      <span>CAD / ARCHITECTURE DIAGRAM URL</span>
                    </label>
                    <input
                      type="url"
                      value={formData.diagramUrl || ''}
                      onChange={(e) => setFormData({ ...formData, diagramUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      placeholder="https://... diagram or CAD schematic"
                    />
                  </div>
                </div>

                {/* 4. Repositories & Demos */}
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-mono font-medium text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>LIVE DEMO / PLATFORM URL</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Instant Live Website Preview Enabled
                      </span>
                    </label>
                    <input
                      type="url"
                      value={formData.liveDemoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                      placeholder="https://example.com (write link to see live website preview)"
                    />
                    {/* Live Website Preview Card */}
                    <WebsiteLinkPreview
                      url={formData.liveDemoUrl}
                      label="LIVE APPLICATION PREVIEW"
                      onSelectImage={(imageUrl) => {
                        setFormData((prev) => ({ ...prev, projectImage: imageUrl }));
                        onShowToast('success', 'Website snapshot set as project cover image!');
                      }}
                      onAutofill={(meta) => {
                        setFormData((prev) => ({
                          ...prev,
                          title: prev.title || meta.title,
                          shortDescription: prev.shortDescription || meta.description,
                          fullDescription: prev.fullDescription || meta.description,
                        }));
                        onShowToast('info', 'Autofilled project title & description from website!');
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                        GITHUB REPO URL
                      </label>
                      <input
                        type="url"
                        value={formData.githubUrl || ''}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                        placeholder="https://github.com/..."
                      />
                      <WebsiteLinkPreview
                        url={formData.githubUrl}
                        label="GITHUB REPOSITORY"
                        compact={true}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                        DOCUMENTATION / REPORT
                      </label>
                      <input
                        type="url"
                        value={formData.documentationUrl || ''}
                        onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                        placeholder="https://... PDF or docs"
                      />
                      <WebsiteLinkPreview
                        url={formData.documentationUrl}
                        label="DOCUMENTATION SITE"
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
              <div className="flex gap-2">
                {modalTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs: Array<'basic' | 'tech' | 'specs' | 'links'> = ['basic', 'tech', 'specs', 'links'];
                      const currentIdx = tabs.indexOf(modalTab);
                      if (currentIdx > 0) setModalTab(tabs[currentIdx - 1]);
                    }}
                    className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-800/40 rounded-lg transition"
                  >
                    ← Previous
                  </button>
                )}
                {modalTab !== 'links' && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs: Array<'basic' | 'tech' | 'specs' | 'links'> = ['basic', 'tech', 'specs', 'links'];
                      const currentIdx = tabs.indexOf(modalTab);
                      if (currentIdx < tabs.length - 1) setModalTab(tabs[currentIdx + 1]);
                    }}
                    className="px-3 py-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 rounded-lg transition"
                  >
                    Next →
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveModal(false)}
                  className="px-4 py-2 text-xs font-mono text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveModal(true)}
                  className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition shadow-md shadow-cyan-500/20"
                >
                  Save & Publish
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Destructive Delete */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Project"
        message="Are you sure you want to delete this project? This change will be permanently saved to disk."
        confirmText="Delete Project"
        isDestructive={true}
      />

      {/* Live Interactive Website Preview Modal */}
      {previewModalUrl && (
        <LiveWebsiteModal
          url={previewModalUrl.url}
          title={previewModalUrl.title}
          onClose={() => setPreviewModalUrl(null)}
        />
      )}

    </div>
  );
};
