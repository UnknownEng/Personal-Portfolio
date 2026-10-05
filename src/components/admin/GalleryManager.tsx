import React, { useState, useRef } from 'react';
import {
  Images,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { GalleryItem, ProjectItem, CertificationItem, StatusState } from '../../types/portfolio';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

interface GalleryManagerProps {
  gallery: GalleryItem[];
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
  onSaveGallery: (items: GalleryItem[]) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const DEFAULT_CATEGORIES = [
  'UAV & Drones',
  'Robotics & Hardware',
  'Lab & Research',
  'Competitions & Awards',
  'CAD & Engineering',
  'Certificates',
];

export const GalleryManager: React.FC<GalleryManagerProps> = ({
  gallery,
  projects = [],
  certifications = [],
  onSaveGallery,
  onShowToast,
}) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<GalleryItem[]>(gallery || []);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({});
  const [uploading, setUploading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  React.useEffect(() => {
    setItems(gallery || []);
  }, [gallery]);

  const handleOpenAdd = () => {
    setIsNew(true);
    setFormData({
      id: `gal-${Date.now()}`,
      title: '',
      caption: '',
      category: 'UAV & Drones',
      imageUrl: '',
      altText: '',
      relatedProjectId: '',
      relatedCertificationId: '',
      featured: false,
      status: 'published',
      order: items.length + 1,
      date: new Date().getFullYear().toString(),
    });
    setEditingItem(formData as GalleryItem);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setIsNew(false);
    setFormData(item);
    setEditingItem(item);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onShowToast('error', 'Image size must be less than 10MB');
      return;
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      onShowToast('error', 'Only JPEG, PNG, WEBP, GIF, and SVG images are supported');
      return;
    }

    const data = new FormData();
    data.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      let resJson: any = null;
      try {
        resJson = await res.json();
      } catch {
        resJson = { error: `Server response error (${res.status})` };
      }

      if (res.ok && resJson?.success && resJson?.media) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: resJson.media.url,
          altText: prev.altText || file.name,
        }));
        onShowToast('success', 'Image uploaded successfully!');
      } else {
        onShowToast('error', resJson?.error || 'Upload failed');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveModal = async () => {
    if (!formData.title || !formData.title.trim()) {
      onShowToast('error', 'Title is required');
      return;
    }

    if (!formData.category || !formData.category.trim()) {
      onShowToast('error', 'Category is required');
      return;
    }

    const updatedItem: GalleryItem = {
      id: formData.id || `gal-${Date.now()}`,
      title: formData.title.trim(),
      caption: formData.caption || '',
      category: formData.category.trim(),
      imageUrl: formData.imageUrl || '',
      altText: formData.altText || formData.title,
      relatedProjectId: formData.relatedProjectId || undefined,
      relatedCertificationId: formData.relatedCertificationId || undefined,
      featured: !!formData.featured,
      status: formData.status || 'published',
      order: formData.order || items.length + 1,
      date: formData.date || '',
    };

    let nextItems: GalleryItem[];
    if (isNew) {
      nextItems = [...items, updatedItem];
    } else {
      nextItems = items.map((g) => (g.id === updatedItem.id ? updatedItem : g));
    }

    setItems(nextItems);
    setEditingItem(null);

    const res = await onSaveGallery(nextItems);
    if (res.success) {
      onShowToast('success', `Gallery item "${updatedItem.title}" saved!`);
    } else {
      onShowToast('error', res.error || 'Failed to save gallery item');
    }
  };

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((g) => g.id !== id);
    setItems(nextItems);
    setDeleteConfirmId(null);

    const res = await onSaveGallery(nextItems);
    if (res.success) {
      onShowToast('success', 'Gallery item deleted');
    } else {
      onShowToast('error', res.error || 'Failed to delete gallery item');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextItems = [...items];
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;

    nextItems.forEach((g, idx) => {
      g.order = idx + 1;
    });

    setItems(nextItems);
    const res = await onSaveGallery(nextItems);
    if (res.success) {
      onShowToast('info', 'Gallery order updated');
    }
  };

  const handleToggleStatus = async (item: GalleryItem) => {
    const nextStatus: StatusState = item.status === 'published' ? 'draft' : 'published';
    const nextItems: GalleryItem[] = items.map((g) => (g.id === item.id ? { ...g, status: nextStatus } : g));
    setItems(nextItems);
    const res = await onSaveGallery(nextItems);
    if (res.success) {
      onShowToast('info', `Status set to ${nextStatus}`);
    }
  };

  // Filter items for display
  const displayedItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.caption || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.category.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <Images className="w-4 h-4" />
            <span>MEDIA ASSET MANAGEMENT</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Visual Gallery & Field Media
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage drone photography, CAD blueprints, laboratory testbeds, and competition flight captures.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD GALLERY ITEM</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#0D121F] border border-[#1E293B]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search gallery artifacts by title, caption, or category..."
            className="w-full pl-9 pr-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:inline" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Categories</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {displayedItems.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-[#0D121F] border border-[#1E293B] text-slate-400 font-mono text-xs">
            No gallery items found matching your filters.
          </div>
        ) : (
          displayedItems.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#0D121F] border border-[#1E293B] hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left: Reorder controls & Thumbnail & Info */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-20 text-slate-400"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 disabled:opacity-20 text-slate-400"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Image Thumbnail */}
                <div className="w-16 h-14 rounded-lg bg-[#090E1A] border border-[#1E293B] overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                {/* Text Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold uppercase">
                      {item.category}
                    </span>
                    {item.featured && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    {item.date && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {item.date}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 font-sans mt-1 truncate">
                    {item.title}
                  </h3>

                  {item.caption && (
                    <p className="text-xs text-slate-400 font-sans truncate mt-0.5">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleToggleStatus(item)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                    item.status === 'published'
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/40'
                      : 'bg-amber-950/40 text-amber-400 border border-amber-500/30 hover:bg-amber-900/40'
                  }`}
                  title="Toggle published status"
                >
                  {item.status === 'published' ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Draft</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 rounded-lg bg-[#090E1A] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition"
                  title="Edit item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-2 rounded-lg bg-[#090E1A] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={isNew ? 'Add Gallery Item' : `Edit: ${formData.title || 'Item'}`}
          maxWidth="lg"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                TITLE *
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Teknofest 2025 Autonomous Touchdown"
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  CATEGORY *
                </label>
                <input
                  type="text"
                  list="category-suggestions"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Select or enter category"
                />
                <datalist id="category-suggestions">
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  DATE / YEAR
                </label>
                <input
                  type="text"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. 2025"
                />
              </div>
            </div>

            {/* Image Upload / URL */}
            <div className="p-4 rounded-xl bg-[#090E1A] border border-[#1E293B] space-y-3">
              <label className="block text-xs font-mono font-semibold text-cyan-400">
                MEDIA FILE / IMAGE
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 w-full px-3 py-2 bg-[#0D121F] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="/uploads/... or external image URL"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition shrink-0 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}</span>
                </button>
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[#1E293B] bg-black/40 flex items-center justify-center">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-900/80 text-rose-300 text-xs font-mono transition"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                CAPTION / FIELD NOTES
              </label>
              <textarea
                rows={3}
                value={formData.caption || ''}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Brief technical description or test telemetry context..."
              />
            </div>

            {/* Associated Project / Certification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  ASSOCIATED PROJECT
                </label>
                <select
                  value={formData.relatedProjectId || ''}
                  onChange={(e) => setFormData({ ...formData, relatedProjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">None (Independent Media)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  ALT TEXT (FOR ACCESSIBILITY)
                </label>
                <input
                  type="text"
                  value={formData.altText || ''}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090E1A] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Descriptive image label"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded bg-[#090E1A] border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Featured Hero Media (Spans 2 columns)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.status === 'published'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.checked ? 'published' : 'draft',
                    })
                  }
                  className="rounded bg-[#090E1A] border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Published Publicly</span>
              </label>
            </div>

            {/* Footer Buttons */}
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
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition shadow-md"
              >
                Save Item
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Gallery Item"
        message="Are you sure you want to remove this gallery media item? This action will update your published gallery."
        confirmText="Delete Item"
      />
    </div>
  );
};
