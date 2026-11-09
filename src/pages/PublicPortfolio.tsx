import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header, NavEntry } from '../components/public/Header';
import { Hero } from '../components/public/Hero';
import { Showcase } from '../components/public/Showcase';
import { Experience } from '../components/public/Experience';
import { Research } from '../components/public/Research';
import { Projects } from '../components/public/Projects';
import { Competitions } from '../components/public/Competitions';
import { Education } from '../components/public/Education';
import { Skills } from '../components/public/Skills';
import { Contact } from '../components/public/Contact';
import { Footer } from '../components/public/Footer';
import { externalUrl, pad, useActiveSection, useReveal } from '../components/public/siteKit';
import '../styles/site.css';

interface PublicPortfolioProps {
  /** Kept for API compatibility; the admin lives at /admin and is not linked from the public site. */
  onNavigateAdmin?: () => void;
}

type Theme = 'light' | 'dark';
const THEME_KEY = 'site-theme';
const CV_URL = '/CV.pdf';

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage blocked */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;
const published = <T extends { status?: string }>(x: T) => x.status !== 'draft';

export const PublicPortfolio: React.FC<PublicPortfolioProps> = () => {
  const { data, submitContactForm } = usePortfolio();
  const { siteSettings, sectionVisibility: vis, hero, contact } = data;
  const rootRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<Theme>(initialTheme);
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const bg = theme === 'dark' ? '#10100f' : '#f3f1ec';
    document.body.style.setProperty('--site-body-bg', bg);
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg));
  }, [theme]);

  // ---- Content, filtered and ordered for the public view ----
  const socials = useMemo(
    () => (data.socialLinks || []).filter((s) => s.enabled !== false && s.url).sort(byOrder),
    [data.socialLinks]
  );
  const experience = useMemo(() => data.experience.filter(published).sort(byOrder), [data.experience]);
  const current = useMemo(() => experience.filter((x) => x.current), [experience]);
  const projects = useMemo(
    () =>
      data.projects
        .filter(published)
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order),
    [data.projects]
  );
  const research = useMemo(() => {
    const list = data.research?.length
      ? data.research
      : data.projects.filter((p) => /research|review|paper/i.test(p.category));
    return list.filter(published).sort(byOrder);
  }, [data.research, data.projects]);
  const achievements = useMemo(() => data.achievements.filter(published).sort(byOrder), [data.achievements]);
  const education = useMemo(() => data.education.filter(published).sort(byOrder), [data.education]);
  const certifications = useMemo(() => data.certifications.filter(published).sort(byOrder), [data.certifications]);
  const leadership = useMemo(() => data.leadership.filter(published).sort(byOrder), [data.leadership]);
  const showcase = data.showcase || [];

  // Most-used technologies across work, to round out the toolkit
  const usedTech = useMemo(() => {
    const count = new Map<string, number>();
    [...projects, ...showcase, ...experience].forEach((x) =>
      (x.technologies || []).forEach((t) => count.set(t, (count.get(t) || 0) + 1))
    );
    return Array.from(count.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
  }, [projects, showcase, experience]);

  const scholarUrl = externalUrl(socials.find((s) => /scholar/i.test(s.platform))?.url);

  // ---- Section registry: drives numbering, nav and order ----
  const sections = [
    { id: 'work', label: 'Work', primary: true, show: showcase.length > 0 },
    { id: 'experience', label: 'Experience', primary: true, show: vis.experience && experience.length > 0 },
    { id: 'research', label: 'Research', primary: true, show: (vis.research ?? true) && research.length > 0 },
    { id: 'projects', label: 'Projects', primary: true, show: vis.projects && projects.length > 0 },
    { id: 'honors', label: 'Honors', primary: true, show: vis.competitions && achievements.length > 0 },
    { id: 'education', label: 'Education', primary: false, show: vis.education },
    { id: 'toolkit', label: 'Toolkit', primary: false, show: vis.skills },
    { id: 'contact', label: 'Contact', primary: true, show: vis.contact },
  ].filter((s) => s.show);

  const num = (id: string) => pad(sections.findIndex((s) => s.id === id) + 1);
  const nav: NavEntry[] = sections.map((s) => ({ id: s.id, label: s.label, primary: s.primary, num: num(s.id) }));
  const active = useActiveSection(sections.map((s) => s.id));

  useReveal(rootRef, siteSettings.animationsEnabled !== false, [data]);

  if (siteSettings.maintenanceMode) {
    return (
      <div className="site" data-theme={theme}>
        <main className="wrap" style={{ minHeight: '100vh', display: 'grid', placeContent: 'center', gap: 16 }}>
          <p className="mono muted">Back shortly</p>
          <h1 className="sec__title">{hero.name}</h1>
          <p className="sec__note">This site is being updated. In the meantime, email {contact.email}.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="site" data-theme={theme} ref={rootRef}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Header
        name={hero.name}
        role={hero.title}
        nav={nav}
        active={active}
        theme={theme}
        onToggleTheme={toggleTheme}
        cvUrl={CV_URL}
        email={contact.email}
      />

      <main id="main">
        {vis.hero && (
          <Hero
            hero={hero}
            location={contact.location}
            availability={contact.availabilityStatus}
            current={current}
            socials={socials}
            cvUrl={CV_URL}
            email={contact.email}
          />
        )}

        {sections.some((s) => s.id === 'work') && <Showcase num={num('work')} items={showcase} />}
        {sections.some((s) => s.id === 'experience') && <Experience num={num('experience')} items={experience} />}
        {sections.some((s) => s.id === 'research') && (
          <Research num={num('research')} items={research} scholarUrl={scholarUrl} />
        )}
        {sections.some((s) => s.id === 'projects') && <Projects num={num('projects')} items={projects} />}
        {sections.some((s) => s.id === 'honors') && <Competitions num={num('honors')} items={achievements} />}
        {sections.some((s) => s.id === 'education') && (
          <Education
            num={num('education')}
            education={education}
            certifications={vis.certifications ? certifications : []}
            leadership={vis.leadership ? leadership : []}
          />
        )}
        {sections.some((s) => s.id === 'toolkit') && (
          <Skills num={num('toolkit')} skills={data.skills} usedTech={usedTech} />
        )}
        {sections.some((s) => s.id === 'contact') && (
          <Contact num={num('contact')} contact={contact} socials={socials} onSubmitMessage={submitContactForm} />
        )}
      </main>

      <Footer name={hero.name} footerText={siteSettings.footerText} socials={socials} cvUrl={CV_URL} />
    </div>
  );
};
