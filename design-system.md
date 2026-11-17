# Design System — Mubin Attar

> The single source of truth for tokens, type, layout, components, motion, page
> patterns and the design law (§11). Tokens are defined once in `styles/tokens.css`
> and consumed only through Tailwind utilities, token-reading arbitrary values such
> as `shadow-[var(--shadow-card)]`, or `var()` inside a CSS module — no raw hex, px
> shadow or easing in a component (the recorded exceptions are in §11.1). This
> document explains *why* each value is what it is. **Where a value here and a value
> in `tokens.css` disagree, `tokens.css` wins and this document is the bug.**
>
> The decision: [ADR-018 — A Clerk-grade visual system](./spec/decisions/ADR-018-clerk-grade-visual-system.md).
> The role and the canonical data: [ADR-015](./spec/decisions/ADR-015-personal-platform.md).
> The approved visual reference is the static prototype in `spec/prototype/`. Every
> kept decision is indexed in [spec/decisions/README.md](./spec/decisions/README.md).

---

## 1. Thesis — a product, built in the open

This is Mubin Attar's personal platform as an **Applied AI Engineer** open to
**Forward Deployed Engineer** roles. It is built to the craft of a developer-product
site — the quality bar is clerk.com — with original code, copy and assets, and only
his own real work and figures. The employment title at Sevina remains AI/ML Engineer.

- **A light canvas, near-monochrome ink, one violet accent.** Hierarchy comes from
  type, space and hairlines. Colour is spent on action, state and evidence.
- **Dark plates for emphasis.** A notched dark plate marks the section that matters
  most on a page (the field work, a closing CTA); three pages are dark throughout
  (About, Evals, 404). There is no theme switch.
- **Every page has the pattern its job needs** — product page, leaderboard,
  changelog, document, blog post (§7).
- **Motion is feedback.** Springs on micro-interactions, illustrations that react to
  hover and focus, a few slow ambient loops — never content waiting on a scroll
  observer (§6).
- **Every figure carries its method.** No invented metric, customer, testimonial or
  logo wall; mock UI with numbers says "Illustrative sample · synthetic data" in the
  frame (§7.2).

---

## 2. Colour

The site is **light-only**. `<html data-theme="light">` is static; nothing reads
`prefers-color-scheme`, and there is no toggle or stored preference. Dark appears in
three scopes, all fed by **one remap block** at the end of `tokens.css`:

1. `.tone-invert` — a dark band or plate inside a light page (`Section tone="invert"`,
   `Plate`).
2. `[data-surface="dark"]` — a dark page, through `DarkSurface`
   (`components/layout/dark-surface.tsx`): `/about`, `/evals`, the 404 and the error
   pages. It sits one step deeper (`--color-plate-deep`).
3. `html:has([data-surface="dark"]) [data-chrome]` — the nav, footer and launcher of a
   dark page, so the chrome matches the page it floats over.

Inside a scope every `--color-*`, shadow, chrome and pill token is re-declared, so a
component written against the light tokens renders correctly on a plate with no
props. Aliases are re-declared too: a custom property inherits its *computed* value,
so `--shadow-surface: var(--shadow-card)` on `:root` would otherwise stay light.

### The light page

| Token | Value | Use · contrast |
|---|---|---|
| `--color-bg` | `#f7f7f8` | the canvas |
| `--color-bg-subtle` | `#f5f5f7` | sunken wells, menu-row hover |
| `--color-surface` / `-raised` | `#ffffff` | cards sit brighter than the canvas |
| `--color-ink` | `#131316` | 17.6:1 on canvas |
| `--color-ink-secondary` | `#5e5f6e` | 5.9:1 on canvas |
| `--color-ink-tertiary` | `#6e6f7e` | 4.6:1 canvas · 5.0:1 white · 4.55:1 sunken |
| `--color-border` / `-strong` | `#ebebee` / `#dcdce1` | hairlines; inputs and emphasised dividers |
| `--color-rule` | `#e6e6ea` | blueprint frame lines and fading rules |
| `--color-dots` | `#cfd0d6` | dot bands, dashed list rules |
| `--color-accent` | `#6b4bff` | 4.8:1 canvas · 5.2:1 white |
| `--color-accent-hover` | `#5a37ef` | 6.1:1; violet text on `accent-soft` |
| `--color-accent-soft` | `#efecff` | a tinted ground (violet text on it is 4.4:1, so use `accent-hover`) |
| `--color-on-accent` | `#ffffff` | 5.2:1 on the violet |
| `--color-positive` / `-warning` / `-negative` | `#15803d` / `#b45309` / `#dc2626` | status; each ≥ 4.5:1 on canvas |
| `--color-ambient` | `#38bdf8` | glows and data visuals only, never text |

### Plates

| Token | Value | Use · contrast |
|---|---|---|
| `--color-plate` | `#131316` | a dark band or notched plate |
| `--color-plate-deep` | `#0f0f12` | a dark page's canvas |
| `--color-plate-card` / `-raised` | `#1b1b1f` / `#222227` | cards on a plate; tiles on those cards |
| `--color-plate-border` / `-strong` | `#2a2a30` / `#34343b` | hairlines on dark |
| `--color-plate-ink` | `#f4f4f6` | text |
| `--color-plate-ink-secondary` | `#9d9daa` | 6.9:1 plate · 7.1:1 deep · 6.4:1 card |
| `--color-plate-ink-tertiary` | `#8d8ea0` | 5.8:1 plate · 5.3:1 card |
| `--color-plate-violet` | `#9d8cff` | the accent on dark, 6.7:1 |
| `--color-plate-cyan` | `#63d2ef` | data and the lit hub on dark grounds only, 10.6:1 |
| `--color-plate-positive` / `-warning` / `-negative` | `#4ade80` / `#fbbf24` / `#f87171` | status on dark |

**One accent per surface.** Violet on light, lifted violet on dark. Cyan is the one
non-accent hue with a job (live data on a plate); it never carries text on the light
page. The ambient blue is for glows only. `npm run test:hue` fails on any computed
colour outside the neutrals, the violet family, the plate cyan and the status
colours.

**Status pills** (`StatusPill`) use their own AA-checked ink, tint and ring tokens
(`--pill-positive-*`, `--pill-caution-*`, `--pill-accent-*`, `--pill-neutral-*`), each
remapped on dark.

---

## 3. Typography

**Geist** for everything read; **Geist Mono** for values, labels, tool names and code.
No serif: `--font-serif` maps to the sans so an older call site still renders the brand
face. Both are self-hosted by `next/font`.

| Token (utility `text-*`) | Size | Line · tracking · weight | Used by |
|---|---|---|---|
| `display` | `clamp(2.5rem, 5.2vw, 4rem)` — 40 → 64px | 1.125 · −0.035em · 700 | page titles (`PageHeader size="display"`) |
| `section` | `clamp(1.75rem, 3.4vw, 2.5rem)` — 28 → 40px | 1.15 · −0.03em · 700 | section h2 |
| `sub` | `clamp(1.625rem, 2.6vw, 2rem)` — 26 → 32px | 1.25 · −0.02em · 600 | small h2 (Careers-style) |
| `title` | 1.25rem — 20px | 1.4 · −0.015em · 700 | card titles |
| `title-sm` | 0.96875rem — 15.5px | 1.45 · −0.01em · 650 | dense bento cards |
| `page-lead` | `clamp(1.0625rem, 1.45vw, 1.25rem)` — 17 → 20px | 1.45 | the lead under a page title |
| `lead` | 1.0625rem — 17px | 1.6 | the lead under a section title |
| `kicker` | 0.875rem — 14px | 1.4 · 500 | the violet line above a title |
| `label` | 0.6875rem — 11px | 1.82 · 0.1em · 500, mono, uppercase | mono tags; used sparingly |

The fixed steps `xs` (12) to `5xl` (48) remain for body, list rows (15/500) and
legacy call sites. Body text is 16–17px at 1.6. Headings, block quotes and the h1–h4
defaults use `text-wrap: balance`; paragraphs and list items use `pretty`. Headings
are sentence case. Reading measure is `--width-prose` (68ch); a page header's lead is
capped at `--width-head` (640px).

---

## 4. Layout, spacing, radius, elevation

**Grid.** Content is `--width-content` **1200px**; at a 1440px viewport it starts at
x=120. The gutter is `--gutter` `clamp(1rem, 3vw, 1.5rem)` (16 → 24px), and
`--width-container` is the content plus two gutters. The floating pill nav is
`--width-nav` **1232px**. Blueprint frames are `--width-frame` 1010px and
`--width-frame-narrow` 592px. Breakpoints are Tailwind's defaults.

**The nav and sticky things.** The nav sits `--nav-top` 8px from the top and is
`--nav-h` 44px tall; `--nav-offset` is where it ends, and `--sticky-top` adds 24px for
sticky sidebars. Anchors scroll clear of it (`scroll-padding-top`). The work sub-nav
is `--subnav-h` 36px.

**Section rhythm** (`Section space=…`):

| `space` | Top → bottom |
|---|---|
| `head` | 64 → 96px, then 48 → 64px (a page-header band) |
| `xs` | 32 → 44px both |
| `sm` | 48 → 72px, then the `md` bottom |
| `md` (default) | 88 → 120px both |
| `lg` | 96 → 128px, then 104 → 144px |

**Radius.** `xs 4` tags and inline code · `sm 6` small controls · `control 7` /
`control-lg 9` buttons · `md 8` nav items, menu rows, inputs · `lg 12` the nav pill,
menus, covers · `xl 16` bento cards · `2xl 18` the large product stage · `pill` pills,
chips and the launcher.

**Elevation** is layered and low-opacity — a hairline ring, a close contact shadow, a
wide soft one — never one dark drop. `--shadow-card` and `-card-hover` (bento cards),
`--shadow-lift`, `--shadow-panel` (stages), `--shadow-menu` (menus and the assistant
drawer), `--shadow-nav`. Shadows live on `:root`, not in `@theme`, so the dark scopes
can remap them; use `shadow-[var(--shadow-card)]`. On dark, cards trade drop shadows
for inset hairlines.

**The plate notch.** A notched plate is clipped with a centred tab of the light page
cutting into its top edge, with 45° shoulders, `--notch` deep (44px; 26px under 640px).
The plate carries a masked grid (`--plate-grid-line`).

---

## 5. Components

Primitive CSS lives in `@layer components`, so a caller's Tailwind classes override it.
**No primitive sets an outer margin**; the caller spaces it. Server components unless
marked *client*.

### Links and buttons

- `Button({ variant: "violet" | "dark" | "grey" | "light" | "ghost" = "dark", size:
  "sm" | "md" | "lg", caret?, href?, newTab?, … })` (`components/ui/button.tsx`) — a
  link when it has `href`, else a native `<button>`. Heights 28 / 32 / 40px. Each fill
  is a lit gradient with a 1px ring and a contact shadow (`--btn-*` tokens) and keeps
  its colours on dark plates. Press: `scale(var(--press-scale))` (0.97) springing back
  over `--motion-press`. `buttonClassName(variant, size)` styles another element as a
  button. One violet button per viewport.
- `CaretLink({ href, tone: "ink" | "muted" | "accent", size: "sm" | "md", weight:
  "strong" | "regular", newTab? })` and `Caret()` (`components/ui/caret-link.tsx`) — the
  "continue" link with the arrow-swap caret (§6). Any interactive ancestor triggers the
  caret, so a whole card can animate its "Read more".
- `SmartLink({ href, newTab?, kind? })` — renders a route, a file, a mail link or
  another site correctly from its `href` (`linkKind`).
- The ghost pill (header Contact and Hire me): `--chrome-ghost-bg` (2% ink) plus a
  hairline inset ring `--chrome-ghost-ring` (12% ink).

### Type and headers

- `Kicker({ tone: "accent" | "cyan" | "ink", as? })` and `Label({ tone, as?, id? })`.
- `PageHeader({ kicker?, meta?, title, lede?, align: "start" | "center", size:
  "display" | "section", titleId?, children })` — kicker, h1, lead, then actions
  (`children`). Place it inside `<Section space="head">`.
- `SectionHeader({ kicker?, kickerTone?, title, as: "h2" | "h3", size: "lg" | "sm",
  lead?, align?, id?, children })`.

### Surfaces and layout

- `Section({ space, tone: "page" | "subtle" | "invert" })` and `Container`
  (`components/layout/`).
- `Plate({ notch = true, grid = true, contained = true, as, id, labelledBy, label })` —
  the notched dark plate. Children turn dark automatically (§2).
- `Bento({ columns: 2 | 3 })`, `Card({ as, span: 1 | 2, hover = true })`,
  `CardArt({ decorative })`, `CardBody` — a card renders light or dark from its
  context. On hover or focus-within its ground and shadow step up and its art leans in
  (`--card-art-scale`, light cards only); its text never moves.
- `RuleX`, `DotBand`, `Frame({ width: "default" | "narrow", padded?, as? })`
  (`components/ui/blueprint.tsx`) — blueprint frame lines and dot bands.
- `BrowserFrame({ url?, children })` — the window frame for product footage.
- `DarkSurface({ as? })` — wraps a dark page. A dark page may also export
  `viewport = { themeColor: BROWSER_CHROME.dark }`.

### Navigation and chrome (`components/layout/`)

- The **floating pill nav**: Work and About dropdown menus, Evals and Writing links,
  and the Contact and Hire me ghost pills; data in `config/nav.ts`. The Work menu has
  two rich columns (Field work, Public systems) and an "All work" footer; the About
  menu is an icon list. A mobile menu below the desktop breakpoint.
- `WorkSubnav({ current })` — the switcher bar under the nav on `/work/[slug]` and
  `/work/field/[slug]`, rendered first; items from `WORK_ITEMS`.
- The **announcement bar** (home only) with the availability line (`STATUS.text`).
- The **five-column footer** with the fading dotted texture (`--chrome-dots`).
- The floating **"Ask AI" launcher** (*client*) — opens the assistant through
  `openAssistant()` (spec/AI_ASSISTANT.md §5).

### Content structures

- `StickySteps({ steps: { id?, title, body, media }[], label?, titleAs? })` (*client*)
  — numbered steps beside a sticky media frame; the active step's media crossfades in.
- `Toc({ items: { id, label, items? }[], title })` (*client*) — a sticky table of
  contents with an active-section indicator.
- `Timeline({ label? })` and `TimelineEntry({ date, dateTime, title?, titleAs?, tags?,
  id? })` — the changelog's date rail with a dot per entry.
- `StatusPill({ status: "verified" | "retired" | "draft" | "not-claimed" | "in-use" |
  "pilot" | "deployed-demo" })` — labels from `STATUS_PILL` in `config/site.ts`.
- `Chip({ variant: "outline" | "raised" | "soft", size, mono?, dot?, icon?, as? })`.
- `StatsRow({ stats: { label, value, source? }[], align? })` — a figure with a
  `source` links to its method.

### Decoration and motion

- `CircuitArt({ fade: "center" | "top" | "sides" })` — faint original circuit lines;
  fills its positioned parent. `aria-hidden`.
- `DottedGuides`, `DottedRule` — dotted guide lines; the ancestor needs
  `overflow-x: clip`.
- `Marquee({ duration = 48, delay = 0, reverse, gap = 12, fade, label })` and
  `MarqueeGroup` (`components/motion/`) — the duplicate set is `aria-hidden` and
  `inert`, so the row is read once.
- `Float({ distance = 10, duration = 6 })` and `PulseRings({ size = 196, radius = 52,
  count = 3, period = 12 })` — both `aria-hidden`.

### Long-form

`ArticleHeader`, `ArticleFooter`, `CodeBlock` (Shiki, server-highlighted, a filename
bar and a copy button), `Callout` (a 3px left stripe, `--stripe-width`), `Figure`,
`PullQuote`, and the MDX blocks `DecisionLog` and `FailureLog` (hairline rows, mono
numbers, no zebra striping). The case-study `SystemDiagram` is one tab stop with arrow,
Home and End navigation and a narration list as its text alternative.

**Legacy primitives** still imported by older components: `TextLink`, `Metric` (a mono
tabular value that links its method) and `BoundaryMark`. `SectionHeading`,
`EyebrowChip` and `Breadcrumb` have no importers and are due for deletion.

---

## 6. Motion

### Curves and durations

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.33, 1, 0.68, 1)` | interaction feedback; the default |
| `--ease-std` | `cubic-bezier(0.4, 0, 0.2, 1)` | symmetric loops (the wire pulse) |
| `--spring` | `linear(0, 0.3763 11.1%, 0.782 22.2%, 0.9614 33.3%, 1.0079 44.4%, 1.0098 55.6%, 1.0045 66.7%, 1.0012 77.8%, 1)` | menus, the drawer, a press springing back |
| `--spring-soft` | `linear(0, 0.1812 9.1%, …, 1)` | the caret swap, the phone sheet |
| `--ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | an arriving panel |

Springs overshoot slightly and settle; where `linear()` is unsupported they fall back
to near-equivalent cubic curves. Durations: colour `--motion-fast` 150ms · small
surfaces `--motion-base` 200ms · card elevation and illustration states
`--motion-slow` 350ms · a panel or step media `--motion-panel` 520ms · a menu
`--motion-menu` 140ms opacity with `--motion-menu-spring` 240ms transform · the caret
`--motion-caret` 400ms · the press `--motion-press` 300ms. A bare `transition` lands on
200ms and `--ease-out`.

### The motion law (ADR-018)

**Allowed, in three forms only:**

1. **Micro-interactions on springs.**
   - The **arrow-swap caret** (`.caret-swap`, `styles/globals.css`): two masked
     triangles in a clipped 10×8px box; on hover or focus of the nearest link or
     button, the first slides out right while the second slides in from the left, and
     the pair brightens.
   - The button press (`scale(.97)`), the tab hover pill and the selected tab's dot,
     menus (opacity plus a spring), list rows and footer links shifting colour over
     150ms.
2. **Illustrations that react to hover or focus-within.** Wires pulse and the hub lights
   cyan; halos spread; spinners spin; a timeline lights in sequence; checks pop; charts
   redraw (`stroke-dashoffset`); bars fill; replies rise. The reaction decorates
   information that is already on screen at rest.
3. **A few ambient loops.** The marquee (paused on hover and focus-within), `Float`,
   the 12s pulse rings, the sheen sweep on a showcase change, and the assistant's
   "searching" shimmer and send spinner.

**Banned:** scroll-triggered fade or slide-up reveals, typing effects, cursor
followers and spotlights, scroll-jacking, parallax, and tilt. Content is never hidden
waiting for an observer, and nothing is conveyed by motion alone.

**Shared keyframes** (`styles/globals.css`): `marquee`, `float`, `hero-ring`, `sheen`,
`pop`, `halo`, `wire`, `spin`, `draw`, `fill`, `rise`, `fadein`. Each reads an
optional custom property for its travel (`--float`, `--ring-scale`, `--wire-distance`,
`--draw-length`), so one keyframe serves every size. None may be used as a
scroll-triggered reveal.

**Only paint and compositor properties animate** — `opacity`, `transform`/`translate`,
colour, background, border colour, box-shadow, plus a cheap mask or filter on small
elements (the caret's mask, `rise`'s 2px blur). Never width, height, margin, padding or
grid tracks. **One recorded exception:** the case-study walkthrough's stage disclosure
(`components/case-studies/walkthrough.module.css`) transitions `grid-template-rows`,
because animating to an unknown auto height otherwise needs JS measurement; the
perceived motion is carried by opacity and translate on the contents.

### Reduced motion

One blanket rule in `styles/globals.css`: under `prefers-reduced-motion: reduce` every
animation and transition runs for `--motion-reduced` (0.01ms), with no delay and one
iteration, and smooth scrolling is off. Decorative loops therefore stop and state
changes are instant, and a new component cannot forget. Components add only what that
cannot express: the marquee becomes a static, centred row; the pulse rings disappear.
A transform that *expresses state* (a selected tab's pill position) keeps its end
value — reduced motion removes the travel, not the state.

---

## 7. Page patterns and content

### 7.1 The page map

Every page uses the shared nav, footer and the canvas, unless marked dark. Copy lives
in `content/pages/<page>.ts` (spec/CONTENT_MODEL.md §5).

| Route | Pattern | Sections |
|---|---|---|
| `/` | Product home | announcement bar · hero · tabbed showcase (sliding pill, blurred crossfade, sheen) · field-work plate with cards to the reports · public-systems bento with real metrics and method links · agent section with the copy-prompt chip (`public/llms.txt`) · writing · CTA |
| `/work` | Product overview | hero · dark plate of field work (`#field`, two large cards) · public systems (`#public`, four cards with a real poster and one metric with its method) · stack band · CTA |
| `/work/[slug]` | Product page | work sub-nav · hero with a status pill, CTAs and a `BrowserFrame` playing the captioned recording (click to play, `preload="none"`; DBWhisper shows its capture) · numbered "How it works" `StickySteps` · decision bento · results with methods (retired shown as Retired) · what broke · stack · prev/next. `/work/dbwhisper` holds the boundary inspector |
| `/work/field/[slug]` | Product page, anonymous | the draft ribbon while unpublished · hero with status pills and the private-repository notice · problem and users · constraints as a numbered list · what I built · an architecture sketch (custom SVG) · the trace as sticky steps · the boundary ledger · deployment · what broke as a timeline · decisions · verification and "Not measured" · outcome ("Proves" / "Doesn't show") · walkthrough CTA |
| `/about` (dark) | Company page | page header · principles · a quote band with a halftone portrait of `public/mubin.png` · experience · education |
| `/hire` | Careers page | glass mark with pulse rings · the letter, signed with a round headshot · stats · "Working with me" grid · "Open to" roles |
| `/contact` | Contact page | header · cards (hiring, freelance, the assistant, résumé, source) with dotted guides and an aurora glow |
| `/writing`, `/notes` | Blog index | RSS link · filter chips (All / Essays / Guides / Notes; `?type=` preselects) · three featured covers · the full list. `/notes` is the same index with Notes selected |
| `/writing/[slug]`, `/notes/[slug]` | Blog post | back link · date, reading time, category pill · title · lead · a typeset cover (essays) · a ~680px body · a sticky sidebar with the category, a "Jump to" `Toc` and "Ask AI about this" · share, prev/next, related project |
| `/evals` (dark) | Leaderboard | dark hero with circuit art · project and status filters · a table with tinted score tiles, sample, method link and date · retired rows visible with the reason |
| `/resume` | Document | header with the PDF download · sticky section nav · summary · experience timeline · selected projects with metric and method · skills grid · education · a print stylesheet (§10) |
| `/now` | Changelog | date rail with dots, dated entries with category pills, RSS link, faint circuit art |
| `/trust` | Security page | light hero with circuit art · "Evidence at a glance" table (Verified / Retired / Not claimed, each with a source link, including what is *not* claimed) · practice cards · CTA |
| `/uses` | Glossary grid | category sections with a sticky category nav; a card per tool with a monogram tile, what it is for and where it is used |
| `/skills` | Capability map | groups from `content/resume.ts`, each linked to where it is used; no self-rated bars |
| `/privacy` | Legal page | header with faint circuit art · intro · "Last updated" · body column with a sticky nested `Toc` |
| 404, errors (dark) | 404 page | a "404" made of dots inside a dotted frame · one line · "Go to homepage" · Work, Writing, Contact. Errors: "Something went wrong", a retry and the email |

### 7.2 Content law

- **No metric without a linked method.** `MetricSchema.method` is `.min(1)`.
- **No invented measurements, outcomes, testimonials, clients or logos.** Mock UI that
  shows numbers carries "Illustrative sample · synthetic data" *inside the frame*. A
  project carries "Deployed demo" and links a demo only while it is up; nothing calls a
  project "live".
- **One source per figure.** Every figure is written once in `content/evals.ts`; pages
  read it through `DBWHISPER_EVIDENCE`, `CROWNWAGER_EVIDENCE` or `requireEval()`, and
  `test/evidence.test.mts` fails on a retyped or retired figure. A deterministic policy
  test is never presented as model accuracy.
- **Retired, not deleted.** A published result that turns out not to hold keeps its
  registry row, muted, with the reason; its figures come down everywhere else.
- **The field work is anonymous** (spec/CONTENT_MODEL.md §1.5): no employer, product,
  client, facility or private repository is named beside it.
- Experience is "3.5+ years"; the availability line is `STATUS.text` in
  `config/site.ts`, never retyped.

---

## 8. Accessibility

Target **WCAG 2.2 AA**, gated by `scripts/a11y.mjs` (spec/ENGINEERING.md §4) at 1280,
768 and 360px, plus the open menus, the open mobile menu, the open assistant panel, the
reduced-motion contract and the keyboard focus-trap contract.

- **Focus is visible on everything**: a 2px violet ring at a 2px offset
  (`:focus-visible`, `styles/globals.css`), following each element's radius. Never
  removed, never replaced by a colour change alone. On dark scopes the ring is the
  lifted violet.
- **Contrast.** Every text token is ≥ 4.5:1 on the grounds it is used on; the ratios
  are in `tokens.css` and §2.
- **Nothing is carried by colour or motion alone.** A status pill has a word; a
  refused path is dashed *and* ends in a cross *and* says "Refuse"; an illustration's
  hover reaction repeats information already in text.
- **Menus** are disclosure buttons with `aria-expanded`; Escape closes and returns focus
  to the trigger. Tabs use arrow keys with one tab stop.
- **Scrollable regions** (the sub-nav, wide tables, the assistant transcript) have a tab
  stop and a name.
- **No horizontal document overflow** at any tested viewport.
- **Touch targets.** axe checks the 24×24px minimum; aim for 44px on anything people tap
  (use the `lg` button) and review by hand.
- **A modal makes the rest of the page `inert`**, not just focus-trapped
  (`lib/use-inert-background.ts`). The launchers live in the inerted subtree, so focus
  is restored one frame after close, once the boundary is released (ADR-014 §4).
- **Disclosure uses native `<details>`**: keyboard-operable, found by find-in-page, and
  printed expanded.
- **Decoration is hidden**: circuit art, dot bands, marks, rings and the marquee's
  duplicate set are `aria-hidden`; the portrait's alt is "Mubin Attar".
- **Reduced motion** is honoured globally (§6).

---

## 9. Performance

The CI gate (`scripts/lighthouse-budget.mjs`, ADR-009) fails on performance below 0.95;
accessibility, best practices or SEO below 1.0; LCP above 2,500ms; CLS of 0.05 or more;
TBT of 150ms or more. It prints first-load JavaScript without failing on it. The budgets
are in [ENGINEERING.md §5](spec/ENGINEERING.md). Home and writing LCP sit closest to the
limit on CI runners, so the hero text is server-rendered, no blocking client JS sits
above the fold, and no large image is above the fold.

- **Client components take props; they do not import a registry or a schema from
  `content/`.** Importing the content layer into a client component drags the eval
  registry and Zod across the boundary; it cost 290KB once.
- Server components by default; client components only on the allowlist in
  [ARCHITECTURE.md §5](spec/ARCHITECTURE.md#5-client-component-allowlist). Motion is CSS:
  no animation library and no runtime dependency.
- Images through `next/image` with intrinsic dimensions; below-fold images lazy.
  Recordings fetch no video until played (`preload="none"`, a poster, captions).
- No remote image or font hosts in the page — CSP is `img-src 'self' blob: data:` and
  `font-src 'self' data:`.

---

## 10. Print

`/resume` is printed and saved as a PDF, and case studies get printed for offline
review. The print stylesheet in `styles/globals.css` is written against **landmarks plus
one `data-print="hide"` hook**, not a list of component classes, so a new piece of chrome
is excluded by *being* chrome.

It re-derives the palette to black on white (plates included), drops every shadow, the
nav, the footer and the "Download PDF" action, collapses section padding, avoids breaks
inside list items, figures and articles, and spells out external URLs only. Gated by
`npm run test:print`, which emulates print media, asserts the chrome is gone and writes a
real PDF to `.screenshots/`.

---

## 11. Design law

The rules below hold whatever the tokens become. Litmus test for every screen: *would
this sit comfortably beside the best developer-product sites without copying any of
them?* If not, simplify.

### 11.1 Token discipline

- Components consume tokens, never literals: Tailwind utilities, arbitrary values that
  read a token, or `var()` in a CSS module. No lint rule enforces this; review does.
- Palette literals outside `tokens.css` exist only where CSS variables cannot be read,
  and a palette change updates them in the same change:
  - `lib/og.tsx` — satori cannot read custom properties, so each literal is named beside
    the token it mirrors. No gate compares them.
  - `constants/theme.ts` — `BROWSER_CHROME` (`light` `#f7f7f8`, `dark` `#0f0f12`) for the
    `theme-color` tag and the web manifest; `test/icons.test.mts` checks them.
  - `app/icon.svg` — ground `--color-bg`, stroke `--color-accent`, checked by
    `test/icons.test.mts`; then run `npm run build:icons` to re-render `favicon.ico` and
    `apple-icon.png`.
  - the print palette in `styles/globals.css`.
- **Known deviations**, to be moved onto tokens: illustration colours written as hex in
  the home bento art, hero and showcase modules, the about, hire, contact and misc
  modules (the glass and obsidian marks, gradients in drawn art). `app/icon.svg` still
  draws the pre-ADR-018 palette (`#fcfcfe`, `#7624f4`).

### 11.2 Accent budget

The accent may appear in at most **two elements per viewport**: links plus ONE of the
primary action, the active selection, or linked evidence. Everything else is ink,
secondary ink and hairlines. If a screen feels flat, fix hierarchy with size, weight
and space — never by adding accent. One violet button per viewport.

### 11.3 Page tempo

Adjacent sections differ in at least one of: ground (canvas, sunken, or a dark plate),
density (one feature versus a grid), or scale. Never two card grids in a row, and never
two dark plates back to back.

### 11.4 Component rules

- **Buttons** are `Button`; never a hand-styled link that looks like one.
- **Links:** in-prose links are ink, underlined at rest, accent on hover
  (`components/mdx/prose.ts`). The "continue" affordance is `CaretLink`.
- **An arrow states where a link goes.** ↗ only on a link that opens a new tab or a mail
  client, and every such link carries it; a page of this site gets the caret or →, and
  its motion moves forward, not diagonally.
- **Cards** may step up ground and shadow on hover and lean their art in; their text
  never moves, and nothing is revealed only on hover.
- **Metrics** are mono and tabular, never in a coloured box, and link their method.
- **Status** is a `StatusPill` with a word, never colour alone.
- **Tables** (leaderboard, evidence, decisions) use hairline rows, mono numbers and
  generous padding; no zebra striping, no coloured headers.

### 11.5 Imagery and icons

- Diagrams, custom SVG sketches and real product captures. A capture carries a caption
  naming the surface it shows; never an implied live result. The portrait is real; the
  halftone treatment is a CSS or pre-rendered dot pattern of the same photo. No stock
  imagery, 3D renders or AI-generated imagery.
- Icons come from `lucide-react` or are drawn in the system's style, and appear only where
  they carry meaning. No brand logos for tools or third parties: tools get monogram
  tiles. Decorative glyphs are `aria-hidden`.

### 11.6 Anti-patterns — banned

1. Gradient text and neon. Glows are allowed only as one soft ambient glow behind a
   surface (the contact aurora, the hero mark); blur only on the nav's translucent
   backdrop and the showcase crossfade.
2. A theme toggle or a second theme. Dark is a surface (§2), never a mode.
3. A second accent, or the accent as decoration.
4. Uppercase headings or body text; letter-spaced all-caps buttons. The one exception is
   the 11px mono `label`, used sparingly.
5. Skill-badge walls, self-rated bars or stars, and client-logo walls. A stack marquee is
   text and monograms only, honest about what it claims ("tools I use"), with a real text
   list behind it.
6. Card grids as the default layout; two grids in a row.
7. Typing animations, cursor followers, spotlight cursors, tilt cards, particle
   backgrounds.
8. Scroll-triggered reveals, scroll-jacking, parallax, and video that autoplays or has no
   control. Recordings never autoplay, fetch nothing until played, and have captions.
9. Stock imagery, 3D blobs, emoji in headings or UI chrome.
10. Vague superlatives; any metric without a method.
11. Center-aligned long-form text; measures over 75ch.
12. **Invented or placeholder social proof** — testimonials, quotes, client names or
    logos that are not real and permissioned. A "sample layout" label does not cure it.
13. Copied assets, copy or code from a reference site. Learn the principle; build an
    original.
14. Anything whose only justification is "looks impressive."
