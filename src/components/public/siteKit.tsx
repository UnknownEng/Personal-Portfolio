import React, { useEffect, useState } from 'react';
import { sanitizeUrl } from '../../utils/url';

/** Shared building blocks for the public site. */

export interface SectionHeadProps {
  num: string;
  title: string;
  note?: React.ReactNode;
  id?: string;
}

export const SectionHead: React.FC<SectionHeadProps> = ({ num, title, note, id }) => (
  <header className="sec__head rv">
    <p className="sec__num mono">
      <b>§{num}</b>
    </p>
    <h2 className="sec__title" id={id}>
      {title}
    </h2>
    {note ? <p className="sec__note">{note}</p> : <span aria-hidden="true" />}
  </header>
);

/** Make a CMS-provided URL safe and absolute (handles values like "researchgate.net/..."). */
export function externalUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return sanitizeUrl(trimmed);
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return sanitizeUrl(`https://${trimmed}`);
  return sanitizeUrl(trimmed);
}

export function isExternal(url: string): boolean {
  return /^https?:/i.test(url);
}

/** Pull a display year (or range) out of free-form CMS dates. */
export function yearOf(date?: string): string {
  if (!date) return '';
  const years = date.match(/\d{4}/g);
  if (!years) return date;
  const uniq = Array.from(new Set(years));
  return uniq.length > 1 ? `${uniq[0]}–${uniq[uniq.length - 1].slice(2)}` : uniq[0];
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Live local time for a timezone, refreshed every 30s. */
export function useLocalTime(timeZone: string): string {
  const fmt = () => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());
    } catch {
      return '';
    }
  };
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const t = window.setInterval(() => setTime(fmt()), 30_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone]);
  return time;
}

/** Highlight the nav item whose section is currently in view. */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState('');
  const key = ids.join(',');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

/** Fade-up reveal for elements with .rv; disabled for reduced motion or when the CMS turns animations off. */
export function useReveal(rootRef: React.RefObject<HTMLElement | null>, enabled: boolean, deps: unknown[]) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!enabled || reduce || typeof IntersectionObserver === 'undefined') {
      root.classList.remove('has-motion');
      return;
    }
    root.classList.add('has-motion');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    root.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}
