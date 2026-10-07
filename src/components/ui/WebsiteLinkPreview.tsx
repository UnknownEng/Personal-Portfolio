import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Globe,
  Sparkles,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  X,
  Check,
  Copy,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { LinkPreviewData } from '../../types/portfolio';
import { sanitizeUrl, isSafeUrl } from '../../utils/url';

interface WebsiteLinkPreviewProps {
  url?: string | null;
  label?: string;
  onSelectImage?: (imageUrl: string) => void;
  onAutofill?: (meta: { title: string; description: string }) => void;
  compact?: boolean;
  className?: string;
}

export const WebsiteLinkPreview: React.FC<WebsiteLinkPreviewProps> = ({
  url,
  label = 'WEBSITE PREVIEW',
  onSelectImage,
  onAutofill,
  compact = false,
  className = '',
}) => {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedImageApplied, setSelectedImageApplied] = useState(false);
  const [autofillApplied, setAutofillApplied] = useState(false);

  const cleanUrl = (url || '').trim();
  const normalizedUrl = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
    ? cleanUrl
    : cleanUrl.startsWith('www.')
    ? `https://${cleanUrl}`
    : '';

  const activeUrlRef = useRef(normalizedUrl);
  activeUrlRef.current = normalizedUrl;

  useEffect(() => {
    if (!normalizedUrl || !isSafeUrl(normalizedUrl)) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(normalizedUrl)}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (isMounted && activeUrlRef.current === normalizedUrl) {
          if (json.success) {
            setData(json);
            setError(null);
          } else {
            setError(json.error || 'Failed to generate preview');
          }
        }
      } catch (err: any) {
        if (isMounted && activeUrlRef.current === normalizedUrl) {
          // Provide instant graceful fallback preview using domain
          try {
            const domain = new URL(normalizedUrl).hostname;
            setData({
              url: normalizedUrl,
              domain,
              title: domain,
              description: `Website preview for ${domain}`,
              image: `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(normalizedUrl)}`,
              screenshot: `https://image.thum.io/get/width/800/crop/600/${encodeURIComponent(normalizedUrl)}`,
              favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
            });
            setError(null);
          } catch {
            setError('Could not parse website URL');
          }
        }
      } finally {
        if (isMounted && activeUrlRef.current === normalizedUrl) {
          setLoading(false);
        }
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [normalizedUrl]);

  if (!normalizedUrl || !isSafeUrl(normalizedUrl)) {
    return null;
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(normalizedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectImage && data) {
      const bestImage = data.image || data.screenshot;
      if (bestImage) {
        onSelectImage(bestImage);
        setSelectedImageApplied(true);
        setTimeout(() => setSelectedImageApplied(false), 2500);
      }
    }
  };

  const handleApplyAutofill = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAutofill && data) {
      onAutofill({
        title: data.title || '',
        description: data.description || '',
      });
      setAutofillApplied(true);
      setTimeout(() => setAutofillApplied(false), 2500);
    }
  };

  // Loading skeleton
  if (loading && !data) {
    return (
      <div
        className={`mt-2 p-3.5 rounded-xl bg-[#090E1A] border border-cyan-500/30 animate-pulse transition-all ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wider">
              INSPECTING WEBSITE TELEMETRY & SNAPSHOT...
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Live Preview Engine</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-24 h-16 bg-[#0D121F] rounded-lg shrink-0 border border-[#1E293B]" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-[#1E293B] rounded w-3/4" />
            <div className="h-2.5 bg-[#1E293B]/70 rounded w-full" />
            <div className="h-2.5 bg-[#1E293B]/40 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={`mt-2 p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-[11px] font-mono text-rose-300 flex items-center gap-2 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
        <span className="truncate">Could not generate preview: {error}</span>
      </div>
    );
  }

  if (!data) return null;

  // COMPACT MODE
  if (compact) {
    return (
      <>
        <div
          className={`mt-2 p-2.5 rounded-xl bg-[#080D18] border border-cyan-500/30 hover:border-cyan-400/50 transition flex items-center justify-between gap-3 group ${className}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {data.favicon ? (
              <img
                src={data.favicon}
                alt=""
                className="w-4 h-4 rounded shrink-0 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-mono font-bold text-slate-200 truncate group-hover:text-cyan-300 transition">
                {data.title || data.domain}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {data.domain}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowLiveModal(true)}
              className="p-1.5 rounded-lg bg-[#0E1628] hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono transition flex items-center gap-1"
              title="Open Live Website Preview"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <a
              href={sanitizeUrl(data.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-[#0E1628] hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Open in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {showLiveModal && (
          <LiveWebsiteModal
            url={data.url}
            title={data.title}
            screenshot={data.screenshot || data.image}
            onClose={() => setShowLiveModal(false)}
          />
        )}
      </>
    );
  }

  // STANDARD RICH PREVIEW CARD
  const previewImage = data.image || data.screenshot;

  return (
    <>
      <div
        className={`mt-3 rounded-2xl bg-gradient-to-b from-[#0B101D] to-[#070A12] border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-950/20 overflow-hidden transition-all duration-300 ${className}`}
      >
        {/* Card Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#0E1628]/80 border-b border-[#1E293B]">
          <div className="flex items-center gap-2 min-w-0">
            {data.favicon ? (
              <img
                src={data.favicon}
                alt=""
                className="w-4 h-4 rounded shrink-0 object-contain bg-white/10 p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span className="text-[11px] font-mono font-semibold text-cyan-300 truncate">
              {data.domain}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-950/50 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-[10px] font-mono flex items-center gap-1"
              title="Copy URL"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() => setShowLiveModal(true)}
              className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-semibold transition flex items-center gap-1"
              title="Interactive Browser Preview"
            >
              <Monitor className="w-3 h-3" />
              <span>LIVE VIEW</span>
            </button>
            <a
              href={sanitizeUrl(data.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-slate-400 hover:text-cyan-400 transition"
              title="Open site in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card Body with Image & Details */}
        <div className="p-3.5 flex flex-col sm:flex-row gap-3.5">
          {/* Visual Snapshot */}
          {previewImage && (
            <div
              onClick={() => setShowLiveModal(true)}
              className="relative w-full sm:w-48 h-28 sm:h-28 rounded-xl overflow-hidden bg-black/60 border border-[#1E293B] group/img shrink-0 cursor-pointer"
              title="Click to launch interactive preview"
            >
              <img
                src={previewImage}
                alt={data.title}
                className="w-full h-full object-cover object-top transition duration-500 group-hover/img:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/img:opacity-30 transition" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[9px] font-mono text-cyan-300">
                <span className="bg-black/80 px-1.5 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /> Preview
                </span>
                <span className="bg-black/80 px-1.5 py-0.5 rounded text-slate-400">
                  Click to Expand
                </span>
              </div>
            </div>
          )}

          {/* Metadata Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-semibold mb-1">
                <Sparkles className="w-3 h-3" />
                <span>{label}</span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white font-sans line-clamp-1 leading-snug">
                {data.title}
              </h4>

              <p className="text-[11px] text-slate-300 font-sans line-clamp-2 mt-1 leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Action Buttons: Use as cover / Autofill */}
            <div className="flex items-center gap-2 flex-wrap pt-2 mt-2 border-t border-[#1E293B]/60">
              {onSelectImage && (
                <button
                  type="button"
                  onClick={handleApplyImage}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${
                    selectedImageApplied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300'
                  }`}
                  title="Copy this snapshot as your project cover image"
                >
                  {selectedImageApplied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>COVER UPDATED!</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3" />
                      <span>USE AS PROJECT COVER</span>
                    </>
                  )}
                </button>
              )}

              {onAutofill && (
                <button
                  type="button"
                  onClick={handleApplyAutofill}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition flex items-center gap-1.5 ${
                    autofillApplied
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title="Autofill title and description from website metadata"
                >
                  {autofillApplied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>INFO AUTO-FILLED</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>AUTOFILL TITLE & DESC</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Browser Modal */}
      {showLiveModal && (
        <LiveWebsiteModal
          url={data.url}
          title={data.title}
          screenshot={data.screenshot || data.image}
          onClose={() => setShowLiveModal(false)}
        />
      )}
    </>
  );
};

interface LiveWebsiteModalProps {
  url: string;
  title: string;
  screenshot?: string;
  onClose: () => void;
}

export const LiveWebsiteModal: React.FC<LiveWebsiteModalProps> = ({
  url,
  title,
  screenshot,
  onClose,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleReload = () => {
    setIframeLoaded(false);
    setIframeBlocked(false);
    setIframeKey((prev) => prev + 1);
  };

  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  const getDeviceWidth = () => {
    if (device === 'mobile') return 'max-w-[400px]';
    if (device === 'tablet') return 'max-w-[768px]';
    return 'max-w-full';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#0A0E17] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Browser Top Navigation Bar */}
        <div className="bg-[#080C14] border-b border-[#1E293B] px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Window Controls & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 cursor-pointer transition block"
                title="Close"
              />
              <span
                onClick={() => setDevice('desktop')}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 cursor-pointer transition block"
                title="Reset Size"
              />
              <span
                onClick={() => setDevice(device === 'desktop' ? 'mobile' : 'desktop')}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 cursor-pointer transition block"
                title="Toggle Viewport"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#0E1524] rounded-lg border border-[#1E293B] text-xs font-mono text-slate-300 max-w-xs truncate">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{title || domain}</span>
            </div>
          </div>

          {/* Center: Device Viewport Switcher */}
          <div className="flex items-center bg-[#0E1524] p-0.5 rounded-lg border border-[#1E293B]">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 ${
                device === 'desktop'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 ${
                device === 'tablet'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 ${
                device === 'mobile'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Right: URL Address Bar & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReload}
              className="p-1.5 rounded-lg bg-[#0E1524] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition"
              title="Reload Frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <a
              href={sanitizeUrl(url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition shadow-sm"
            >
              <span>OPEN SITE</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#0E1524] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Address Bar Subheading */}
        <div className="bg-[#060910] px-4 py-1.5 border-b border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-500">https://</span>
            <span className="text-cyan-300 font-semibold truncate">{url.replace(/^https?:\/\//, '')}</span>
          </div>
          <div className="text-[10px] text-slate-500 hidden sm:block">
            Viewport: {device.toUpperCase()} MODE
          </div>
        </div>

        {/* Browser Viewport */}
        <div className="flex-1 bg-[#05070D] overflow-hidden flex items-center justify-center p-2 relative">
          <div
            className={`w-full h-full transition-all duration-300 mx-auto rounded-xl overflow-hidden border border-[#1E293B] bg-slate-950 relative shadow-2xl ${getDeviceWidth()}`}
          >
            {/* Live iframe */}
            <iframe
              key={iframeKey}
              src={sanitizeUrl(url)}
              title={title}
              onLoad={() => setIframeLoaded(true)}
              onError={() => setIframeBlocked(true)}
              className="w-full h-full bg-white border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />

            {/* If iframe takes time or is blocked by X-Frame-Options */}
            {!iframeLoaded && (
              <div className="absolute inset-0 bg-[#090E1A] flex flex-col items-center justify-center p-6 text-center">
                {screenshot ? (
                  <div className="w-full max-w-lg mb-4 rounded-xl overflow-hidden border border-[#1E293B] shadow-lg">
                    <img
                      src={screenshot}
                      alt={title}
                      className="w-full h-56 object-cover object-top"
                    />
                  </div>
                ) : (
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                )}

                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
                  <Globe className="w-4 h-4" />
                  <span>CONNECTING TO LIVE SERVER...</span>
                </div>
                <p className="text-xs text-slate-400 font-mono max-w-md mb-4">
                  Loading {domain}. If this site enforces strict embedding policies (X-Frame-Options), you can open it directly in a new window.
                </p>

                <a
                  href={sanitizeUrl(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <span>OPEN IN NEW BROWSER TAB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
