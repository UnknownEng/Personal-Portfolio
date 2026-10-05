import React, { useRef, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileImageUploaderProps {
  label?: string;
  imageUrl: string;
  onChange: (url: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  label = 'Profile Photo / Portrait',
  imageUrl,
  onChange,
  onShowToast,
}) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      onShowToast('error', 'File size exceeds 15MB limit');
      return;
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      onShowToast('error', 'Only JPEG, PNG, WEBP, and GIF images are supported');
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

      if (res.ok && data?.success && data?.media?.url) {
        onChange(data.media.url);
        onShowToast('success', `Photo "${file.name}" uploaded and set!`);
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

  return (
    <div className="p-5 rounded-2xl bg-[#090E1A] border border-[#1E293B] space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>{label}</span>
        </label>
        {imageUrl && (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
            <Check className="w-3 h-3" />
            Photo Active
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Preview Avatar */}
        <div className="relative w-20 h-20 rounded-2xl bg-[#0D121F] border-2 border-cyan-500/40 overflow-hidden shrink-0 shadow-lg flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile preview"
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-600" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/uploads/your-photo.jpg or https://..."
              className="flex-1 px-3 py-2 bg-[#0D121F] border border-[#1E293B] rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition shrink-0 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'UPLOADING...' : 'UPLOAD PHOTO'}</span>
            </button>

            {imageUrl && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-mono text-xs transition shrink-0"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>CLEAR</span>
              </button>
            )}
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Upload your professional portrait or enter an image path. Renders in the Hero and About sections.
          </p>
        </div>
      </div>
    </div>
  );
};
