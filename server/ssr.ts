import { PortfolioData } from '../src/types/portfolio.ts';
import { escapeHtml as esc, isDangerousUrl } from './security.ts';

/**
 * Server-rendered HTML for crawlers and first paint. React replaces it on load.
 * Every CMS value is HTML-escaped and every link is scheme-checked, so content saved
 * through the CMS can never inject markup or script into the page.
 */

const published = <T extends { status?: string }>(x: T) => x.status === undefined || x.status === 'published';

function safeHref(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (isDangerousUrl(trimmed)) return '';
  if (/^(https?:|mailto:|tel:)/i.test(trimmed) || (trimmed.startsWith('/') && !trimmed.startsWith('//')) || trimmed.startsWith('#')) {
    return esc(trimmed);
  }
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(trimmed)) return esc(`https://${trimmed}`);
  return '';
}

const link = (url: string | undefined, label: string) => {
  const href = safeHref(url);
  return href ? `<a class="link-arrow" href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : '';
};

const section = (id: string, num: number, title: string, body: string) => `
  <section class="sec" id="${id}">
    <div class="wrap">
      <header class="sec__head"><p class="sec__num mono"><b>§${String(num).padStart(2, '0')}</b></p><h2 class="sec__title">${esc(title)}</h2><span></span></header>
      ${body}
    </div>
  </section>`;

export function renderServerSide(data: PortfolioData): string {
  const hero = data.hero || ({} as PortfolioData['hero']);
  const contact = data.contact || ({} as PortfolioData['contact']);
  const name = hero.name || 'Mansoor Ahmed Rind';
  const year = new Date().getFullYear();
  const vis = data.sectionVisibility || ({} as PortfolioData['sectionVisibility']);

  const showcase = data.showcase || [];
  const experience = (data.experience || []).filter(published);
  const research = (data.research || []).filter(published);
  const projects = (data.projects || []).filter(published);
  const achievements = (data.achievements || []).filter(published);
  const education = (data.education || []).filter(published);

  const blocks: string[] = [];
  let n = 0;

  if (showcase.length) {
    blocks.push(
      section(
        'work',
        ++n,
        'Selected work',
        `<ol class="work__list">${showcase
          .map(
            (s) => `<li><article class="work__row"><h3 class="work__title">${esc(s.title)}</h3>
              <p class="work__meta mono">${esc(s.category)} — ${esc(s.organization)} · ${esc(s.date)}</p>
              <p>${esc(s.summary)}</p></article></li>`
          )
          .join('')}</ol>`
      )
    );
  }

  if (vis.experience !== false && experience.length) {
    blocks.push(
      section(
        'experience',
        ++n,
        'Experience',
        `<ol class="xp">${experience
          .map(
            (x) => `<li class="xp__item"><p class="xp__when mono">${esc(x.startDate)} — ${esc(x.current ? 'Present' : x.endDate)}</p>
              <div><h3 class="xp__role">${esc(x.position)}</h3><p class="xp__org"><b>${esc(x.company)}</b> · ${esc(x.location)}</p>
              <p class="xp__desc">${esc(x.description)}</p></div></li>`
          )
          .join('')}</ol>`
      )
    );
  }

  if (vis.research !== false && research.length) {
    blocks.push(
      section(
        'research',
        ++n,
        'Research',
        `<ol class="refs">${research
          .map(
            (r, i) => `<li class="ref"><span class="ref__n">[${i + 1}]</span><div><h3 class="ref__title">${esc(r.title)}</h3>
              <p class="ref__venue mono">${esc([r.category, r.myRole, r.projectDate].filter(Boolean).join(' · '))}</p>
              <p class="ref__abs">${esc(r.shortDescription)}</p>
              <div class="ref__links">${link(r.documentationUrl, 'Read paper')}${link(r.githubUrl, 'Code')}</div></div></li>`
          )
          .join('')}</ol>`
      )
    );
  }

  if (vis.projects !== false && projects.length) {
    blocks.push(
      section(
        'projects',
        ++n,
        'Projects',
        `<div class="proj-grid">${projects
          .map(
            (p) => `<article class="proj"><p class="proj__meta mono"><span>${esc(p.category)}</span><span>${esc(p.projectDate)}</span></p>
              <h3 class="proj__title">${esc(p.title)}</h3><p class="proj__desc">${esc(p.shortDescription)}</p>
              <div class="proj__foot">${link(p.liveDemoUrl, 'Live')}${link(p.githubUrl, 'Code')}</div></article>`
          )
          .join('')}</div>`
      )
    );
  }

  if (vis.competitions !== false && achievements.length) {
    blocks.push(
      section(
        'honors',
        ++n,
        'Competitions & honors',
        `<ul>${achievements
          .map((a) => `<li class="cred__item"><strong>${esc(a.title)}</strong><p>${esc(a.organization)} · ${esc(a.date)}</p></li>`)
          .join('')}</ul>`
      )
    );
  }

  if (vis.education !== false && education.length) {
    blocks.push(
      section(
        'education',
        ++n,
        'Education',
        `<ul>${education
          .map((e) => `<li class="cred__item"><strong>${esc(e.degree)}</strong><p>${esc(e.institution)}</p><span class="mono">${esc(e.startDate)} — ${esc(e.endDate)}</span></li>`)
          .join('')}</ul>`
      )
    );
  }

  const email = contact.email || '';
  const phone = contact.phone || '';
  const tel = phone.replace(/[^0-9+]/g, '');

  return `
  <div class="site">
    <header class="hdr"><div class="wrap hdr__inner"><a class="brand" href="#top"><span class="brand__name">${esc(name)}</span></a>
      <a class="btn btn--ghost" href="/CV.pdf" target="_blank" rel="noopener noreferrer">Résumé</a></div></header>
    <main id="main">
      <section class="hero wrap" id="top">
        <p class="hero__kicker mono">${esc(hero.title)}</p>
        <h1 class="hero__name">${esc(name)}</h1>
        <p class="hero__lede">${esc(hero.shortIntroduction)}</p>
      </section>
      ${blocks.join('')}
      ${
        vis.contact !== false
          ? `<section class="sec contact" id="contact"><div class="wrap">
        <p class="contact__big">${esc(contact.heading || 'Get in touch')}</p>
        <p class="contact__lede">${esc(contact.description)}</p>
        ${email ? `<a class="contact__email" href="mailto:${esc(email)}">${esc(email)}</a>` : ''}
        ${contact.showPhone && tel ? `<p><a href="tel:${esc(tel)}">${esc(phone)}</a></p>` : ''}
      </div></section>`
          : ''
      }
    </main>
    <footer class="ftr"><div class="wrap ftr__inner mono"><p>© ${year} ${esc(name)}</p></div></footer>
  </div>`;
}
