import React, { useEffect, useCallback } from 'react';
import { ExternalLink, X, ChevronLeft, ChevronRight, Award, Building, BookOpen, Layers } from 'lucide-react';
import { sanitizeUrl, isSafeUrl } from '../../utils/url';

export interface ModalItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  category?: string;
  organization?: string;
  organizationLogo?: string;
  summary: string;
  mediaUrl?: string;
  externalUrl?: string;
  highlights?: string[];
  technologies?: string[];
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ModalItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  onNavigate,
}) => {
  const item = items[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < items.length - 1) {
        onNavigate(currentIndex + 1);
      }
    },
    [isOpen, currentIndex, items.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !item) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  return (
    <div
      className="modalBackground"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modalContainer" role="dialog" aria-modal="true">
        {/* Topbar */}
        <div className="modal-topbar">
          <div className="modal-org">
            <div className="modal-org-logo">
              {item.organizationLogo ? (
                <img src={item.organizationLogo} alt="" />
              ) : item.category === 'Swarm Systems' || item.category === 'Aerospace' ? (
                <Layers className="w-5 h-5 text-sky-500" />
              ) : item.date?.includes('Degree') || item.category === 'Education' ? (
                <BookOpen className="w-5 h-5 text-indigo-500" />
              ) : (
                <Building className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <span className="modal-org-name">{item.organization || item.category || 'Engineering Detail'}</span>
          </div>

          <div className="modal-topbar-actions">
            <span className="modal-counter">
              {currentIndex + 1} of {items.length}
            </span>
            {item.externalUrl && isSafeUrl(item.externalUrl) && (
              <a
                href={sanitizeUrl(item.externalUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-sky-500 p-1.5 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Open Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="modal-close"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Heading & Summary */}
        <div className="modal-heading">
          <h1>{item.title}</h1>
          {(item.subtitle || item.date) && (
            <div className="modal-date">
              {item.subtitle}
              {item.subtitle && item.date && ' • '}
              {item.date}
            </div>
          )}
          <p className="modal-summary">{item.summary}</p>
        </div>

        {/* Body content */}
        <div className="modal-body">
          {/* Media panel if available */}
          {item.mediaUrl && (
            <div className="modal-media-panel">
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="modal-media"
                loading="lazy"
              />
              {item.externalUrl && isSafeUrl(item.externalUrl) && (
                <a
                  href={sanitizeUrl(item.externalUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-external-link"
                >
                  View Live Project / Repository <ExternalLink className="w-3.5 h-3.5 inline ml-1" />
                </a>
              )}
            </div>
          )}

          {/* Highlights / Responsibilities */}
          {item.highlights && item.highlights.length > 0 && (
            <div className="modal-highlights">
              <h4 className="modal-highlights-title">Key Contributions & Technical Highlights</h4>
              <ol>
                {item.highlights.map((highlight, idx) => (
                  <li key={idx}>
                    <span className="modal-highlight-index">{idx + 1}</span>
                    <span className="modal-highlight-text">{highlight}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Technologies */}
          {item.technologies && item.technologies.length > 0 && (
            <div className="mt-2">
              <h4 className="modal-highlights-title">Technologies & Flight Stacks</h4>
              <div className="flex flex-wrap gap-2">
                {item.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="modal-footer-nav">
          <button
            className="modal-nav-btn"
            disabled={!hasPrev}
            onClick={() => hasPrev && onNavigate(currentIndex - 1)}
          >
            <ChevronLeft className="w-4 h-4" /> PREVIOUS
          </button>
          <button
            className="modal-nav-btn"
            disabled={!hasNext}
            onClick={() => hasNext && onNavigate(currentIndex + 1)}
          >
            NEXT <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
