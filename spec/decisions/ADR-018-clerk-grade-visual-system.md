# ADR-018 — A Clerk-grade visual system

Status: **Accepted**, 17 November 2026. Supersedes ADR-012 (Clerk fidelity), ADR-013
(the two-theme palette), ADR-016 (the homepage boundary inspector) and ADR-017
(responsive interaction), which were removed on this date and remain in git history.
Supersedes the theme and homepage decisions of ADR-015 (decisions 1, 2, 4 and 5) and
keeps its role, scoped-proof and canonical-data decisions. Keeps ADR-014 §2–§4.
`design-system.md` is the specification of the system this record chooses; where the two
disagree, `styles/tokens.css` wins, then `design-system.md`. Amended twice on 17 November
2026 (both at the end): the mobile menu is a modal sheet, and the anonymous field reports
became the named flagship case studies (ADR-019).

## Context

The site read as a careful document but not as a product. The owner set clerk.com as
the quality bar for structure, layout, effects and motion, with original code, copy and
assets and his own real content. A static prototype (`spec/prototype/`) was built
first, measured against captured Clerk pages and approved, then the live site was
rebuilt from it page by page.

Three things in the old system blocked that bar:

- **Two themes.** A remembered dark theme with its own accent (lime) doubled every
  visual decision, needed a toggle and a pre-paint script, and made dark *sections* —
  which Clerk uses for emphasis — a theme-switch problem.
- **A motion ban that was too broad.** "No marquees, no looping ambient animation"
  ruled out the small, purposeful loops and hover-driven illustrations that make Clerk
  feel alive, while the real failure (content hidden behind scroll reveals) needed a
  narrower rule.
- **One page shape.** Every page was a header and a ruled list. Clerk uses a distinct
  pattern per job — product page, leaderboard, changelog, legal document, blog post.

## Decision

1. **Light-only, with dark plates and dark pages.** There is one theme. The theme
   toggle, the pre-paint script and `prefers-color-scheme` handling are deleted;
   `<html data-theme="light">` is static (the gates read it). Dark appears in three
   scopes, all fed by one remap in `styles/tokens.css`: a dark band or notched plate
   inside a light page (`.tone-invert`), a dark *page* (`[data-surface="dark"]`, the
   `DarkSurface` wrapper: `/about`, `/evals`, the 404 and the error pages), and the
   chrome of a page that contains a dark surface (`html:has([data-surface="dark"])
   [data-chrome]`). These are surfaces, not modes: nothing is a visitor preference.
2. **Geist only.** Geist and Geist Mono. Newsreader and every serif use are removed;
   `--font-serif` maps to the sans so no call site renders a fallback face.
3. **The palette.** Canvas `#f7f7f8`, white surfaces, ink `#131316`, one violet accent
   `#6b4bff`, status green, amber and red, and a plate ramp (`#131316`, deep
   `#0f0f12`) with its own lifted violet `#9d8cff` and a cyan `#63d2ef` for data on dark
   grounds only. Every text colour is AA on the ground it is used on; the ratios are
   in `tokens.css`. The existing `--color-*` names keep their meaning so components
   written before the redesign render in the new palette.
4. **The grid.** Content is 1200px wide (it starts at x=120 at 1440); the gutter is
   `clamp(16px, 3vw, 24px)`; the floating pill nav is 1232px.
5. **The motion law.** Motion is allowed in three forms and no others:
   - *Micro-interactions on springs*: the arrow-swap caret, the button press
     (`scale(.97)`), the tab hover pill, menu entry, list-row and link colour shifts.
   - *Illustrations that react to hover or focus-within*: wires pulse, a hub lights up,
     charts redraw, bars fill, checks pop, replies rise. The reaction is decoration;
     the information is already on screen at rest. A hover moment that loops while it
     plays (a wire pulse, a halo) never loops at rest: it is not an ambient loop.
   - *A few ambient loops*: the marquee (paused on hover and focus), a slow float, the
     12s pulse rings, the sheen on a showcase change, the assistant's "searching"
     shimmer.
   Banned: scroll-triggered fade or slide-up reveals, typing effects, cursor
   followers, scroll-jacking and parallax. Content is never hidden waiting for an
   observer. Under `prefers-reduced-motion: reduce` every loop stops, every transition
   is instant, and the marquee is a static, centred row; one blanket rule in
   `styles/globals.css` enforces it so a new component cannot forget.
   Only paint and compositor properties animate, with three recorded exceptions, each
   instant under reduced motion: the walkthrough stage's `grid-template-rows`
   disclosure (an accordion), and two small size changes contained in their own
   element, so that nothing outside them moves — the copy-prompt chip's expansion
   (`max-width`, margin and padding of its parts, as the measured Clerk chip widens)
   and the showcase tab pill's `width` and `height` (it is absolutely positioned).
   design-system.md §6 records each; a new one must be as small and as contained.
6. **One pattern per page job.** Each page takes the pattern that fits what it is
   for (design-system.md §7.1 is the full map):

   | Page | Pattern |
   |---|---|
   | `/` | Product home: announcement bar, hero, tabbed showcase, field-work plate, public bento, agent section with the copy-prompt chip, writing, CTA |
   | `/work` | Product overview: hero, field-work plate, public-systems grid, stack band, CTA |
   | `/work/[slug]` | Product page: work sub-nav, browser-frame recording, numbered steps beside a sticky frame, decision bento, results with methods, what broke, stack |
   | `/work/field/[slug]` | The product-page pattern, anonymous, with a draft ribbon while unpublished |
   | `/about` (dark) | Company page with a halftone portrait quote band |
   | `/hire` | Careers page: glass mark with pulse rings, letter, stats, roles |
   | `/contact` | Contact page: cards with dotted guides and an aurora glow |
   | `/writing`, `/notes` | Blog index: filter chips, featured covers, full list |
   | `/writing/[slug]`, `/notes/[slug]` | Blog post: 680px body, sticky sidebar with a table of contents and "Ask AI about this" |
   | `/evals` (dark) | Leaderboard: filters, tinted score tiles, retired rows kept |
   | `/resume` | Document layout with a sticky section nav and a print stylesheet |
   | `/now` | Changelog: date rail with dots |
   | `/trust` | Security page: evidence table including what is *not* claimed |
   | `/uses`, `/skills` | Glossary grid with a sticky category nav; a capability map |
   | `/privacy` | Legal page with a sticky nested table of contents |
   | 404, errors (dark) | A halftone "404" in a dotted frame, then useful links |

   *Amended 17 November 2026 (below):* the field-work plate on `/` and `/work` is the
   "Flagship work" plate, and the `/work/field/[slug]` row is replaced by the flagship
   case studies, `/work/bench-discovery` and `/work/careltc`.

7. **New routes.** `/contact` becomes a page (the contact funnel, `STATUS.href`) and
   no longer redirects to `/hire`, which stays the careers-style page.
   `/work/field/[slug]` publishes the two anonymous field reports, behind a
   `published` flag (CONTENT_MODEL.md §1.5). *Superseded 17 November 2026 (below and
   ADR-019): the reports are the named flagship case studies, and their URLs redirect.*

## Carried forward from the removed records

- **The LCP budget is 2,500 ms** (from ADR-012, decision 2). It was raised from
  2,000 ms to the Core Web Vitals "good" threshold after CI measured 2,018–2,373 ms at
  performance 98/99; the residual is the Geist swap repainting the hero text, and a
  budget below that would push toward `font-display: optional` and drop the brand face
  on slow connections. The redesign must keep LCP well under it: the hero text is
  server-rendered, no blocking client JS sits above the fold, and no large image is
  above the fold.
- **The footer is a curated map, not a sitemap** (from ADR-012), capped by
  `test/navigation.test.mts`.
- **The boundary inspector stays honest** (from ADR-016). It moved from the homepage
  to `/work/dbwhisper`. It shows three curated cases with native radio controls and
  the in-frame label "Illustrative cases · no query is sent"; it has no parser, model
  call or database request. Its footer shows DBWhisper's policy-corpus result,
  labelled a deterministic policy test, not model accuracy. The golden-set counts it
  once showed are retired and the DBWhisper recording stays withdrawn; the case study
  shows its capture, never that video.
- **Static project cards do not lift as a whole** (from ADR-016/017) is replaced:
  bento cards may change ground and shadow on hover, and their art may lean in
  (`--card-art-scale`), but text never moves and nothing is revealed only on hover.

## Consequences

- One remap block replaces a second theme, so a dark plate costs nothing to add and
  cannot drift from a dark page.
- The shared keyframes are global (`styles/globals.css`) and every CSS module names
  them through a custom property, `animation: var(--kf-marquee) …`. The module
  transform renames a bare animation name to a local one, so on 17 November 2026 the
  marquee, float, pulse rings, sheen and every hover illustration were dead in the
  production build until they moved onto `--kf-*` names (design-system.md §6).
- The primitives in `components/ui`, `components/layout` and `components/motion`
  (design-system.md §5) carry the system; a page composes them and keeps only its own
  composition in a CSS module.
- Page copy moved into one module per page under `content/pages/`
  (CONTENT_MODEL.md §5).
- Some legacy primitives (`TextLink`, `Metric`, `BoundaryMark`) remain where older
  components use them; `SectionHeading`, `EyebrowChip` and `Breadcrumb` had no
  importers left and have since been deleted, as has `ArticleHeader`.
- Open Graph cards use one renderer with a light and a dark tone (ARCHITECTURE.md §8).

## Gates changed

- `test:a11y`, `test:hue` and every other browser gate run the light site once; the
  `THEME=dark` CI steps are removed. The dark pages and plates are inside the light
  pass.
- `test:hue` allows the neutrals, the violet accent, the plate cyan and the status
  green, amber and red.
- The inspector and walkthrough checks (`test:interaction`, `walkthrough-input-audit`,
  `boundary-audit`) run on `/work/dbwhisper`.
- `test:motion` checks the new contracts: the caret swap, the menus, the tab pill and
  panel crossfade, the marquee's hover pause, the copy chip, the hover moments on
  `/work`, a case study and a field report (a flagship case study since the second
  amendment), and each reduced-motion alternative. It
  also fails on an animation name that resolves to no keyframe (bare or through a
  `--kf-*` name) and on any loop other than an ambient one running at rest on any
  route.
- `test:a11y` also runs axe's `region` rule, so every piece of content sits in a
  landmark (the home announcement bar is `<aside aria-label="Announcement">`).
- `test:links` and `test:smoke` cover `/contact` and the field reports (noindex, but
  linked, so they must resolve); since the second amendment, the flagship case studies
  in their place. `test:print` checks the new résumé print styles.
- `test/icons.test.mts` checks the browser-chrome colours against the light canvas and
  the plate-deep token rather than a `--dark-bg` theme ramp.
- The Lighthouse budgets are unchanged (ADR-009).

## Amendment — 17 November 2026: the mobile menu is a modal sheet

**Context.** Below 1000px the site menu was a disclosure: a panel under the pill
while the page stayed live and scrollable. An audit (track AU-1) found that the panel
could stay open over the control that had focus once Tab left it (WCAG 2.4.11), and
that controls half-covered by the panel stayed tappable beside it (axe `target-size`,
WCAG 2.5.8). The reference's overlay menu covers the page.

**Decision.** The open mobile menu is a modal sheet:

- the menu button and the panel together are a `role="dialog"` with `aria-modal` and
  a name ("Site menu"); the button keeps `aria-expanded`, `aria-controls` and its
  "Open menu" / "Close menu" names, and the panel keeps its ids (`#site-mobile-nav`
  closed, `#mobile-menu` open);
- the rest of the page is `inert` and does not scroll (`lib/use-inert-background.ts`,
  the header marked as the modal root), under a light scrim that also dims the
  floating launcher;
- focus moves to the first link on open and Tab cycles within the dialog; Escape and a
  tap on the scrim close it and return focus to the button; choosing a link,
  navigating, opening the assistant and widening past the breakpoint close it too;
- reduced motion: it appears and goes at once (the global rule).

The desktop Work and About menus stay disclosures.

**Gates to update** (they encode the disclosure): `scripts/a11y.mjs`, the mobile-menu
keyboard contract (focus now moves into the panel on open, rather than staying on the
button, and Tab stays inside the dialog) and the `overlaysFor` note; and
`scripts/interaction-audit.mjs`, "it is a disclosure, not a second modal" and "the page
behind it keeps scrolling" (now: one dialog, `main` inert, scrolling locked), "a tap
outside closes it" (its probe skips points inside `header`, and the scrim is the
header's backdrop, so it finds none: tap a point below the panel directly), and the
"modal inert boundary" loop's note (the mobile menu now belongs in it).
`scripts/smoke.mjs` and `scripts/motion-audit.mjs` hold as written (Escape closes and
returns focus; the panel's ids and its fade and spring are unchanged); only the
comment in `smoke.mjs` names the old model.

## Amendment — 17 November 2026: the field reports became the flagship case studies

**Context.** The employer approved publishing the two products behind the anonymous
field reports by name, with their usage figures, captures and recordings on dummy data,
and curated code excerpts (ADR-019).

**Decision.**

- Decision 6: on `/` and `/work` the field-work plate is the "Flagship work" plate
  (`#flagship`): each product's real captures, its approved usage figure and a link to
  its case study. The `/work/field/[slug]` row is replaced by:

  | Page | Pattern |
  |---|---|
  | `/work/bench-discovery`, `/work/careltc` | Product page, flagship: work sub-nav, a hero with the real app in its frames and the approved figure, a product tour, recordings, numbered steps beside the architecture sketch, a highlights bento on the dark plate, the record (architecture, code, constraints, what broke, decisions, verification, deployment, outcome), the walkthrough card |

  design-system.md §7.1 holds the full row.
- Decision 7: `/work/field/[slug]`, its `published` flag and its draft ribbon are
  deleted. `/work/field/records-triage` and `/work/field/nfc-room-rounds` answer 308 to
  `/work/bench-discovery` and `/work/careltc` (`next.config.ts`). The flagship pages are
  published, indexed and in the sitemap.
- The Work menu's two columns are "Flagship" and "Public systems", and the work sub-nav
  lists the flagships first (`WORK_ITEMS`, `config/nav.ts`).

**Gates.** The gates that named a field report name the flagship case studies instead:
their route lists, the motion gate's hover moments (`#flagship` on `/work` and a
flagship case study's architecture figure), the smoke gate's expected text, and the
link gate's required routes. The metadata gate checks the two new redirects with the
others, and treats any case study `/work` links to that the sitemap omits as a draft.
New coverage came with the pages: the a11y gate audits both with every phone disclosure
open and the assistant opened from a case study's "Ask AI about …"; the interaction gate
holds the product tour's tabs, the recordings and the "Real app · dummy data" label on
every capture (spec/ENGINEERING.md §6).
