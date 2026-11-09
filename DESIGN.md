# Design system — public site

Concept: a "flight test report". Editorial and technical rather than sci-fi: warm paper and ink, one aviation-orange signal colour, numbered sections, hairline rules, and lists or tables instead of card grids and carousels. All public styles live in `src/styles/site.css`, scoped under `.site`.

## Colour tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#f3f1ec` | `#10100f` | Page background |
| `--paper-2` | `#e9e6df` | `#181816` | Alternate sections |
| `--ink` | `#151513` | `#ece9e2` | Text, rules, primary borders |
| `--ink-2` | `#47453f` | `#b9b4aa` | Body copy |
| `--ink-3` | `#6b675f` | `#8e897f` | Labels, metadata |
| `--rule` | `#d3cec3` | `#2c2b27` | Hairlines |
| `--signal` | `#ff4f00` | `#ff5a1f` | Accent marks, primary buttons (ink text on top) |
| `--signal-ink` | `#b23a06` | `#ff8a5c` | Accent-coloured text (meets 4.5:1) |

The contact section and footer are an inverse dark band in both themes. The theme follows the visitor's system setting until they use the toggle (stored as `site-theme`).

## Type

- **Display:** Archivo, wide (`font-stretch` 112–125%), weight 800, tight tracking — name, section titles, 404.
- **Body:** Archivo at normal width, 17px, line-height 1.6.
- **Labels and data:** IBM Plex Mono, uppercase, small — dates, section numbers, tags.

## Layout and components

- Max width 1240px, gutter `clamp(16px, 4vw, 40px)`, mobile-first, no horizontal scroll.
- Section head: `§NN` number, wide title, one-line note, separated by a full-width ink rule.
- Selected work: numbered index with a sticky image preview; rows open a side sheet with details and links.
- Experience: horizontal slider of role cards (scroll-snap, arrow buttons, keyboard, range counter).
- Buttons: square, mono uppercase labels; primary = signal orange, ghost = ink outline.
- Project images: generated technical illustrations (dark grid, cream line work, one orange accent) in `uploads/projects/`.

## Motion and accessibility

- Fade-up reveal on scroll; disabled for `prefers-reduced-motion` and when the CMS turns animations off.
- One `h1` per page, labelled controls, visible focus rings in the signal colour, WCAG AA contrast in both themes, 44px minimum touch targets.
