import React, { useCallback, useEffect, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { externalUrl } from './siteKit';

export interface ModalLink {
  label: string;
  url: string;
}

export interface ModalItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  category?: string;
  organization?: string;
  role?: string;
  summary: string;
  mediaUrl?: string;
  links?: ModalLink[];
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

/** Side sheet with full details for a project / showcase entry. */
export const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, items, currentIndex, onNavigate }) => {
  const item = items[currentIndex];
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      else if (e.key === 'ArrowRight' && currentIndex < items.length - 1) onNavigate(currentIndex + 1);
      else if (e.key === 'Tab' && sheetRef.current) {
        const f = sheetRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [currentIndex, items.length, onClose, onNavigate]
  );

  useEffect(() => {
    if (!isOpen) return;
    returnFocus.current = document.activeElement as HTMLElement;
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onKey]);

  useEffect(() => {
    if (!isOpen && returnFocus.current) {
      returnFocus.current.focus();
      returnFocus.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    sheetRef.current?.scrollTo({ top: 0 });
  }, [currentIndex]);

  if (!isOpen || !item) return null;

  const facts: [string, string][] = [
    ['Role', item.role || ''],
    ['With', item.organization || ''],
    ['Area', item.category || ''],
    ['When', item.date || ''],
  ].filter(([, v]) => v) as [string, string][];

  const links = (item.links || []).map((l) => ({ ...l, url: externalUrl(l.url) })).filter((l) => l.url && l.url !== '#');

  return (
    <div className="sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="sheet__bar">
          <span className="mono muted">
            {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <div className="sheet__bar-nav">
            <button
              type="button"
              className="icon-btn"
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous"
              style={currentIndex === 0 ? { opacity: 0.3, cursor: 'default' } : undefined}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === items.length - 1}
              aria-label="Next"
              style={currentIndex === items.length - 1 ? { opacity: 0.3, cursor: 'default' } : undefined}
            >
              <ChevronRight aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" ref={closeRef}>
              <X aria-hidden="true" />
            </button>
          </div>
        </div>

        {item.mediaUrl && (
          <div className="sheet__media">
            <img src={item.mediaUrl} alt={item.title} width={760} height={428} decoding="async" />
          </div>
        )}

        <div className="sheet__body">
          <h2 className="sheet__title" id="sheet-title">
            {item.title}
          </h2>
          {item.subtitle && <p className="sheet__sub">{item.subtitle}</p>}

          {facts.length > 0 && (
            <dl className="sheet__dl">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="mono">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="sheet__summary">{item.summary}</p>

          {item.highlights && item.highlights.length > 0 && (
            <>
              <h3 className="sheet__h mono">Highlights</h3>
              <ul className="xp__points">
                {item.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </>
          )}

          {item.technologies && item.technologies.length > 0 && (
            <>
              <h3 className="sheet__h mono">Stack</h3>
              <ul className="tag-list">
                {item.technologies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}

          {links.length > 0 && (
            <div className="sheet__links">
              {links.map((l, i) => (
                <a
                  key={l.url}
                  className={`btn ${i === 0 ? 'btn--primary' : 'btn--ghost'}`}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {l.label} <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
