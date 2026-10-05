import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, ExternalLink, FileText } from 'lucide-react';
import { MediaFile } from '../../types/portfolio';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { sanitizeUrl, isSafeUrl } from '../../utils/url';

interface MediaManagerProps {
  media: MediaFile[];
  onMediaUploaded: (newMedia: MediaFile) => void;
  onMediaDeleted: (id: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  media,
  onMediaUploaded,
  onMediaDeleted,
  onShowToast,
}) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (<10MB)
    if (file.size > 10 * 1024 * 1024) {
      onShowToast('error', 'File size exceeds maximum allowed limit (10MB)');
      return;
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
    if (!validMimes.includes(file.type)) {
      onShowToast('error', 'Invalid file type. Only JPEG, PNG, WEBP, GIF, SVG, and PDF are supported.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = { error: `Server response error (${res.status})` };
      }

      if (res.ok && data?.success && data?.media) {
        onMediaUploaded(data.media);
        onShowToast('success', `File "${file.name}" uploaded successfully!`);
      } else {
        onShowToast('error', data?.error || 'Upload failed');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onShowToast('info', 'Asset URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        onMediaDeleted(id);
        onShowToast('success', 'Media asset deleted');
      } else {
        onShowToast('error', 'Failed to delete asset');
      }
    } catch (err: any) {
      onShowToast('error', err.message);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Upload Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D121F] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>PORTFOLIO ASSETS & MEDIA STORAGE</span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Media Manager ({media.length} Files)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Upload profile pictures, project schematics, hardware photos, and certificate scans (max 10MB).
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-sm disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'UPLOADING...' : 'UPLOAD NEW ASSET'}</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0D121F] border border-[#1E293B]">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-200 font-sans">No Uploaded Media Files</h3>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm mx-auto">
            Upload photos or diagrams to reference them across project cards, certificates, or the hero profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((file) => (
            <div
              key={file.id}
              className="group rounded-xl bg-[#090E1A] border border-[#1E293B] hover:border-cyan-500/40 overflow-hidden flex flex-col justify-between transition shadow-sm"
            >
              {/* Preview */}
              <div className="aspect-square bg-[#070A12] flex items-center justify-center overflow-hidden relative">
                {file.mimeType.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <FileText className="w-10 h-10 text-cyan-400" />
                )}
              </div>

              {/* Details & Actions */}
              <div className="p-2.5 bg-[#0D121F] border-t border-[#1E293B]">
                <div className="text-xs font-mono text-slate-200 truncate" title={file.originalName}>
                  {file.originalName}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </div>

                <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleCopyUrl(file.url, file.id)}
                    className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                    title="Copy File Path"
                  >
                    {copiedId === file.id ? (
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isSafeUrl(file.url) && (
                    <a
                      href={sanitizeUrl(file.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-[#090E1A] hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      title="View Full File"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => setDeleteConfirmId(file.id)}
                    className="p-1 rounded bg-[#090E1A] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Media File"
        message="Are you sure you want to permanently delete this uploaded file?"
        confirmText="Delete File"
      />

    </div>
  );
};
