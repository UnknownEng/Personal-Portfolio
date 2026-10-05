import React, { useEffect, useCallback } from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '../../utils/url';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  onClose,
  pdfUrl = '/CV.pdf',
}) => {
  const safePdfUrl = sanitizeUrl(pdfUrl);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="modalBackground"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modalContainer"
        style={{ maxWidth: '960px', width: '92vw', height: '90vh', padding: '18px 24px' }}
        role="dialog"
        aria-modal="true"
      >
        {/* Topbar */}
        <div className="modal-topbar">
          <div className="modal-org">
            <div className="modal-org-logo">
              <FileText className="w-5 h-5 text-sky-600" />
            </div>
            <span className="modal-org-name">Curriculum Vitae — Mansoor Ahmed Rind</span>
          </div>

          <div className="modal-topbar-actions">
            <a
              href={safePdfUrl}
              download="Mansoor_Ahmed_Rind_CV.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition"
              title="Download CV"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </a>
            <a
              href={safePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-500 hover:text-sky-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="modal-close"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 w-full h-full mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 min-h-[550px]">
          <iframe
            src={safePdfUrl !== '#' ? `${safePdfUrl}#toolbar=0&navpanes=0` : 'about:blank'}
            title="Mansoor Ahmed Rind CV"
            className="w-full h-full min-h-[550px] border-0"
          />
        </div>
      </div>
    </div>
  );
};
