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

This is Mubin Attar's personal platform as an **Applied AI Engineer**. It is built to
the craft of a developer-product site — the quality bar is clerk.com — with original
code, copy and assets, and only his own real work and figures. The role is always
`SITE.role` (`config/site.ts`), and the roles he is open to are listed once, in
`content/pages/hire.ts`. The employment title at Sevina remains AI/ML Engineer.

- **A light canvas, near-monochrome ink, one violet accent.** Hierarchy comes from
  type, space and hairlines. Colour is spent on action, state and evidence.
- **Dark plates for emphasis.** A notched dark plate marks the section that matters
  most on a page (the flagship work, a closing CTA); three pages are dark throughout
  (About, Evals, 404). There is no theme switch.
- **Every page has the pattern its job needs** — product page, leaderboard,
  changelog, document, blog post (§7).
- **Motion is feedback.** Springs on micro-interactions, illustrations that react to
  hover and focus, a few slow ambient loops — never content waiting on a scroll
  observer (§6).
- **Every figure carries its method.** No invented metric, customer, testimonial or
  logo wall; mock UI with numbers says "Illustrative sample · synthetic data" in the
  frame, and a capture of a real product says "Real app · dummy data" (§7.2).

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
| `--color-ambient` | `#38bdf8` | glows, data visuals and faint decorative lines only, never text |

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
page. The ambient sky is for glows and faint decorative lines (the /hire construction
lines) only. `npm run test:hue` fails on any computed colour outside the neutrals, the
violet family, the plate cyan and the status colours.

**Status pills** (`StatusPill`) use their own AA-checked ink, tint and ring tokens
(`--pill-positive-*`, `--pill-caution-*`, `--pill-accent-*`, `--pill-neutral-*`), each
remapped on dark.

---

## 3. Typography

**Geist** for everything read; **Geist Mono** for values, labels, tool names and code.
No serif: `--font-serif` maps to the sans so an older call site still renders the brand
face. Both are self-hosted by `next/font`.

Geist is preloaded: the hero text, which is each page's LCP element, is set in it.
Geist Mono is fetched only after the first contentful paint (`BOOT_SCRIPT` in
`app/layout.tsx`, `mono-pending` in `styles/tokens.css`); until then mono text sets in
the system's monospace face. So the swap stays out of sight, **keep mono text out of the
first screenful** where you can. Today the home page and the DBWhisper case study have
none there at 412 × 823 (the gate's mobile viewport); the visible exceptions are small
labels, the header's "Ctrl K" hint on desktop and a flagship's "Private repository"
line, where a swap between two monospace faces is hard to see. See
`spec/ENGINEERING.md` §5 for why the face can't load before that paint.

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
`--nav-h` 44px tall; `--nav-offset` is where it ends. The work sub-nav is `--subnav-h`
36px; its `data-subnav` moves `--chrome-offset` (where all stuck chrome ends) below it.
`--sticky-top` is `--chrome-offset` plus 24px: every sticky panel sits there and every
anchor stops there (`scroll-padding-top`), so nothing tucks under the tray (§8). Never
hard-code a sticky `top`. A sticky media frame beside steps (StickySteps) is centred in
the room below the chrome, level with the active step, and top-aligned when taller.

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
  button. One violet button per viewport. A link to another site opens a new tab by
  default, and a link that leaves the site (a new tab or a `mailto:`) carries the
  out-arrow ↗ in place of the caret (§11.4).
- `CaretLink({ href, tone: "ink" | "muted" | "accent", size: "sm" | "md", weight:
  "strong" | "regular", newTab? })` and `Caret()` (`components/ui/caret-link.tsx`) — the
  "continue" link with the arrow-swap caret (§6). Any interactive ancestor triggers the
  caret, so a whole card can animate its "Read more". It too swaps the caret for the
  out-arrow when the link leaves the site.
- `ArrowOut({ inline? })` (`components/ui/caret-link.tsx`) — the out-arrow ↗ (§6) for a
  plain link that leaves the site (the footer's social links and email, the résumé's
  contacts, an outbound link in prose); `inline` spaces it after the last word of a
  sentence. `Button` and `CaretLink` add it themselves.
- `SmartLink({ href, newTab?, kind? })` — renders a route, a file, a mail link or
  another site correctly from its `href` (`linkKind`); `opensOutside(href, newTab)` and
  `isWebLink(href)` decide the ↗ and the new-tab default.
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
- `ScrollRegion({ label, className })` (*client*, `components/layout/`) — the sideways
  scroller around a wide table. While its content overflows it is a region named
  `label` with a tab stop and carries `data-overflows` (a pinned column draws its edge
  from it); while the content fits it is a plain box (§8).
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
  two rich columns (Flagship, Public systems) and an "All work" footer; the About
  menu is an icon list. While a menu is open the other items step back to secondary
  ink, so the open one reads as the subject. Below the desktop breakpoint the mobile
  menu is a **modal sheet** (ADR-018, amended 17 Nov 2026): the button and the panel
  under the pill form one dialog ("Site menu"); the rest of the page is `inert` and
  does not scroll, under a light scrim (`--scrim`) that also dims the launcher, and
  the pill turns solid. Focus moves to the first link and Tab cycles within the
  dialog; Escape or a tap on the scrim closes it, with focus back on the button.
- `WorkSubnav({ current })` — the switcher bar under the nav on every case study,
  flagship and public, rendered first; items from `WORK_ITEMS`.
- The **announcement bar** (home only) with the availability line (`STATUS.text`): an
  `<aside aria-label="Announcement">`, so its content sits in a landmark.
- The **five-column footer** with the fading dotted texture (`--chrome-dots`). Its
  base bar ends `--launcher-clearance` above the bottom, so at the end of a page
  nothing sits under the launcher.
- The floating **"Ask AI" launcher** (*client*) — opens the assistant through
  `openAssistant()` (spec/AI_ASSISTANT.md §5). Its footprint is `--launcher-h` and
  `--launcher-inset`; `scroll-padding-bottom` keeps a control focused by Tab clear of
  it (§8).

### Content structures

- `StickySteps({ steps: { id?, title, body, media }[], label?, titleAs? })` (*client*)
  — numbered steps beside a sticky media frame; the active step's media crossfades in.
  The active step and its frame pane carry `data-active`, the hook a media's hover
  moment keys on; the frame itself is inert.
- `Toc({ items: { id, label, items? }[], title })` (*client*) — a sticky table of
  contents with an active-section indicator. An entry chosen by a click or a deep link
  stays current while its jump scrolls; only the reader's own scrolling moves it.
- `Timeline({ label? })` and `TimelineEntry({ date, dateTime, title?, titleAs?, tags?,
  id? })` — the changelog's date rail with a dot per entry.
- `StatusPill({ status: "verified" | "retired" | "draft" | "not-claimed" | "in-use" |
  "pilot" | "deployed-demo" })` — labels from `STATUS_PILL` in `config/site.ts`.
- `Chip({ variant: "outline" | "raised" | "soft", size, mono?, dot?, icon?, as? })`.
- `StatsRow({ stats: { label, value, source? }[], align? })` — a figure with a
  `source` links to its method.
- `ShowMore({ more, less, className })` (`components/ui/show-more.tsx`) — progressive
  disclosure for phones: below 760px the rest of a long list waits behind a native
  `<details>` with a full-width "Show 4 more incidents" control (it reads "Show fewer
  incidents" when open); from 760px, and in print, the wrapper and its control
  disappear (`display: contents` on the details and its `::details-content`), so the
  items lay out in the parent's grid as if never wrapped. Put the first items before
  it and the rest inside, in the same parent. The content always stays in the DOM, a
  deep link into it opens it, and browsers without `::details-content` keep the
  control at every width. Used by the flagship case studies' highlights, constraints,
  incidents and decisions.
- `PhoneFrame({ className, children })` (`components/ui/phone-frame.tsx`) — a phone
  body around a mobile capture, every proportion a share of its width (container
  units); `phoneFrameAspect(width, height)` gives the whole frame's aspect ratio for
  fitting it into a box. Decorative chrome; the capture carries the alt text.

### Case-study parts (`components/flagship/`, `components/work/`)

The three flagship case studies share one template (`FlagshipPage`, fed by
`content/flagship/`); these are its reusable parts, plus the pieces every case study
uses.

- `ShotFrame({ shot, product, sizes, priority?, label?, labelAt? })` — one capture of
  the real app in the frame of its surface (`Frame`: a `BrowserFrame` for the web, the
  desktop app's own window, a `PhoneFrame`, or a sheet of paper for a document the app
  wrote), labelled "Real app · dummy data" inside the frame. `labelAt="top"` moves the
  label up where a stage crops the frame's foot. Only the one above-the-fold capture
  sets `priority`; every other is lazy. `frameFit(shot)` gives a layout the frame's
  aspect ratio.
- `MediaGallery({ label, listLabel, tabs, stage?, captions? })` (*client*) — the product
  tour, the recordings and the code excerpts: a segmented control picks the surface
  (Desktop | Web, Portal | Mobile), a list picks the item, and a viewer shows it. Each
  control is a set of ARIA tabs with one tab stop (←/→ and Home/End between surfaces,
  ↑/↓ or ←/→ between items); a control with nothing to choose is not rendered. With
  `stage` (captures) every item fits one fixed stage, so a choice never moves the page.
  The pill springs to the chosen surface and a new item rises out of a short blur; both
  are instant under reduced motion. Hidden items are `hidden`, so their lazy images
  load only when chosen.
- **The reveal contract** (`components/work/reveal.ts`): before a control scrolls to an
  element, it calls `reveal(element)`, which sends `REVEAL_EVENT` from it; a container
  that can hide its content (a gallery's tab panels) shows the part that holds it at
  once, so the scroll lands on something visible. "Watch the demo" uses it to reach a
  recording on a surface the visitor had switched away from. Nobody listening is fine.
- `DemoPlayer` and `WatchDemoButton` (*client*, `components/work/demo-player.tsx`) — a
  recording in its frame: `preload="none"`, never autoplays, and its poster is a
  `next/image` laid over the video (lazy unless `priority`) that a button plays, then
  native controls and the WebVTT captions take over. "Watch the demo" reveals the
  player, scrolls to it and plays it.
- `ArchitectureSketch({ sketch, orientation?, focus?, caption?, notes? })` — an original
  boundary diagram in HTML: zones framed by the boundary they state, their parts in
  data-flow order, and labelled crossings, read as one ordered list. With
  `orientation="row"` the zones sit side by side once the sketch itself is 1,000px wide
  (a container query, so it holds in any column) and stack below that; `column` always
  stacks them (the trace's sticky frame). `focus` lights the zone, part or crossing a
  trace step touches. Its wires pulse only while the element that holds it is hovered or
  holds focus.
- `AskAiButton({ label, variant? })` and `AskAiQuestions({ title, questions, align? })`
  (*client*, `components/work/ask-ai.tsx`) — "Ask AI about <product>" in a case study's
  hero, which opens the assistant on the page's own starters and sends nothing, and the
  same starters as chips in the closing band, each sending exactly the question it
  shows (§8).

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

`ArticleFooter`, `CodeBlock` (Shiki, server-highlighted, a filename
bar and a copy button), `Callout` (a 3px left stripe, `--stripe-width`), `Figure`,
`PullQuote`, and the MDX blocks `DecisionLog` and `FailureLog` (hairline rows, mono
numbers, no zebra striping). The case-study `SystemDiagram` is one tab stop with arrow,
Home and End navigation and a narration list as its text alternative.

**Legacy primitives** still imported by older components: `TextLink`, `Metric` (a mono
tabular value that links its method) and `BoundaryMark`. `SectionHeading`,
`EyebrowChip`, `Breadcrumb` and `ArticleHeader` have been deleted.

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
   - The **out-arrow** (`.arrow-out`, the caret's twin): two masked ↗ arrows in a
     clipped 10×10px box; on hover or focus the first leaves up and to the right while
     the second arrives from the lower left, and the pair brightens. Only on a link
     that leaves the site (§11.4).
   - The button press (`scale(.97)`), the tab hover pill and the selected tab's dot,
     menus (opacity plus a spring), list rows and footer links shifting colour over
     150ms.
2. **Illustrations that react to hover or focus-within.** Wires pulse and the hub lights
   cyan; halos spread; spinners spin; a timeline lights in sequence; checks pop; charts
   redraw (`stroke-dashoffset`); bars fill; replies rise. The reaction decorates
   information that is already on screen at rest. A hover moment never loops unhovered,
   even when it is a loop while it plays: the pulse on a flagship sketch's wires runs while
   the element that holds the sketch is hovered or holds focus, and a case study's flow
   wires while its steps are (StickySteps' frame is inert, so the moment keys on the
   steps' root and the pane marked `data-active`). At rest the pulse is hidden.
3. **A few ambient loops.** The marquee (paused on hover and focus-within), `Float`,
   the 12s pulse rings, the sheen sweep on a showcase change, the assistant's
   "searching" shimmer and send spinner, the home facts strip's swap: two sets of
   five, exchanged slot by slot in a wave every few seconds, which runs only on screen
   and in a visible tab, holds under the pointer and focus, and stops with its own
   pause button (WCAG 2.2.2). Its resting set is the other half of the swap, not
   content waiting for an observer: assistive tech reads both sets throughout, and
   under reduced motion both show, still. And the home writing wall's drift: every
   essay and note on two columns moving in opposite directions under a fade, held
   under the pointer, while focus is inside (a card focused out of view is brought in
   by seeking the drift, never by scrolling) and by its pause button; still, two
   cards a column, under reduced motion and on phones.

**Banned:** scroll-triggered fade or slide-up reveals, typing effects, cursor
followers and spotlights, scroll-jacking, parallax, and tilt. Content is never hidden
waiting for an observer, and nothing is conveyed by motion alone.

**Shared keyframes** (`styles/globals.css`): `marquee`, `float`, `hero-ring`, `sheen`,
`pop`, `halo`, `wire`, `spin`, `draw`, `fill`, `rise`, `fadein`. Each reads an
optional custom property for its travel (`--float`, `--ring-scale`, `--wire-distance`,
`--draw-length`), so one keyframe serves every size. None may be used as a
scroll-triggered reveal.

**Reference a shared keyframe through its `--kf-*` name**, declared beside it on
`:root`: `animation: var(--kf-marquee) 48s linear infinite`, never `animation: marquee
…`. A CSS module renames every animation name it finds to a local one (`marquee`
becomes `<hash>_marquee`), which matches no global keyframe, so a bare name is a dead
animation in the production build; the transform leaves `var()` alone. A keyframe used
by one module only may live in that module instead, under a bare name (the flagship
sketch's `sketch-wire-*`, the assistant's `a-*`), since the transform renames the
definition and its uses together. `npm run test:motion` fails on any animation name,
bare or `--kf-*`, that resolves to no keyframe.

**Only paint and compositor properties animate** — `opacity`, `transform`/`translate`,
colour, background, border colour, box-shadow, plus a cheap mask or filter on small
elements (the caret's mask, `rise`'s 2px blur). Never width, height, margin, padding or
grid tracks. **Three recorded exceptions**, each instant under reduced motion:

1. The case-study walkthrough's stage disclosure
   (`components/case-studies/walkthrough.module.css`) transitions `grid-template-rows`,
   because animating to an unknown auto height otherwise needs JS measurement; the
   perceived motion is carried by opacity and translate on the contents. It is an
   accordion, so like any disclosure it moves the content below it.
2. The copy-prompt chip (`components/home/hero.module.css`) expands as Clerk's measured
   chip does: the prompt's `max-width` and margin, the button's padding, the label's
   `max-width` and the avatar stack's `margin-left` spring open. It is contained: the
   chip is an inline pill in its own grid row, so only the chip itself grows, and the
   row's height and every neighbour stay put.
3. The showcase's tab pill (`components/home/showcase.module.css`) springs its `width`
   and `height` with its `transform` when it lands on a tab of another size. It is
   contained: absolutely positioned behind the tabs, so nothing reflows.

A new exception must be as small and as contained as 2 and 3 — no layout shift outside
the element — and is recorded here.

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
| `/` | Product home | announcement bar · hero (the h1; a sub line naming Bench Discovery and CareLTC with their usage figures; the copy-prompt chip) · tabbed showcase (Bench Discovery, CareLTC, SignFlow, DBWhisper, the assistant: sliding pill, blurred crossfade, sheen; under the stage a row of pills, one per screen of the chosen product, each product remembering its screen; a flagship screen layers two real captures, one labelled "Real app · dummy data"; DBWhisper's and the assistant's screens are illustrated cards a visitor can try, whose cases are native radio buttons, whose answers come from the case study's boundary cases and the assistant's own fixed replies, and whose foot says "Illustrative") · the "At a glance" facts strip (two sets of five that swap slot by slot, with a pause button) · the "Flagship work" plate (`#flagship`: a bento whose two wide cards show each product's real captures, its approved usage figure and a link to its case study, between cards on the engineering behind them) · public-systems bento with real metrics and method links · agent section (drifting sample questions; ask on this site, copy the prompt that points an AI at `public/llms.txt`, privacy) · the "How I work" plate · writing (the featured quote, and every other essay and note on a wall of two drifting columns with a pause button) · CTA |
| `/work` | Product overview | hero with jumps to both groups · the "Flagship work" plate (`#flagship`: a card per product with its real captures, its approved usage figure and its case study) · public systems (`#public`: four cards, each with a real capture and one metric with its method) · "What these systems run on": one technology line per system, flagships first · CTA |
| `/work/bench-discovery`, `/work/careltc` | Product page, flagship ([ADR-019](./spec/decisions/ADR-019-named-flagship-case-studies.md)) | work sub-nav · hero: the "Built at Sevina Technologies", "In use" and private-repository pills, the product statement, "Request a walkthrough", "Watch the demo" and "Ask AI about <product>", the "My role" and "How I build" lines, the figures row (the approved usage figure, then test counts linked to Verification), and the real app in its frames · product tour (`MediaGallery`: Desktop \| Web, or Portal \| Mobile) · the problem, its users and what I built · recordings, each beside its scene list · how it works (`StickySteps` over the `ArchitectureSketch`) · engineering highlights (a bento on the dark plate) · architecture (the sketches and the boundary table) · code excerpts (Shiki, each with its story) · constraints · what broke · decisions · verification and "Not measured" · deployment, with the stack and its AWS services · outcome ("Proves" / "Doesn't show") · the walkthrough card with the "Ask AI" question chips · prev/next. Below 760px `ShowMore` holds back the rest of the highlights, constraints, incidents and decisions. The old `/work/field/*` URLs answer 308 |
| `/work/[slug]` (public) | Product page | work sub-nav · hero: a "Watch the recording" pill (DBWhisper: "Walk through a request"), the product statement, "Try the demo" while a demo is up, "View source" and "Ask AI about <product>", the "Deployed demo" pill only while a demo is linked, then a `BrowserFrame` playing the captioned recording (click to play, `preload="none"`; DBWhisper shows its capture) · numbered "How it works" `StickySteps` (DBWhisper: its request walkthrough, then the boundary inspector) · the decision bento on a dark plate · results with methods (retired shown as Retired) · the shipping log · the full write-up beside its reading outline · stack · prev/next and the CTA with the "Ask AI" question chips |
| `/about` (dark) | Company page | hero with the obsidian mark · "Where I've worked": each role and the degree, the Sevina cell linking both flagship case studies · a quote band with a halftone portrait of `public/mubin.png` · the stack band · principles · the closing split |
| `/hire` | Careers page | glass mark with pulse rings · the letter, signed with a round headshot · stats · "Working with me" grid · "Open to" roles |
| `/contact` | Contact page | header · cards (hiring, freelance, the assistant, résumé, source) with dotted guides and an aurora glow |
| `/writing`, `/notes` | Blog index | RSS link · filter chips (All / Essays / Guides / Notes; `?type=` preselects) · three featured covers · the full list · the newsletter sign-up card, rendered only while the Buttondown list is connected (`NewsletterForm`). `/notes` is the same index with Notes selected |
| `/writing/[slug]`, `/notes/[slug]` | Blog post | back link · date, reading time, category pill · title · lead · a typeset cover (essays) · a ~680px body · from `xl` a sticky sidebar with the category, a "Jump to" `Toc` and "Ask AI about this"; below `xl` the category and "Ask AI about this" close the header, where they sit in the Tab order · share, prev/next, related project |
| `/evals` (dark) | Leaderboard | dark hero with circuit art · project and status filters · a table with tinted score tiles, sample, method link and date · retired rows visible with the reason |
| `/resume` | Document | header with the PDF download · sticky section nav · summary · experience timeline · selected projects, each with how it is built, its metric and method · skills grid · education · a print stylesheet (§10) |
| `/now` | Changelog | date rail with dots, dated entries with category pills (Building, Exploring, Reading), the availability card, faint circuit art |
| `/trust` | Security page | light hero with circuit art · "Evidence at a glance" table (Verified / Retired / Not claimed, each with a source link, including what is *not* claimed) · principles · practice cards · CTA |
| `/uses` | Glossary grid | category sections with a sticky category nav; a card per tool with a monogram tile, what it is for and where it is used |
| `/skills` | Capability map | groups from `content/resume.ts`, each linked to where it is used; no self-rated bars · a matrix of the groups by case study (both flagships, then the public systems, under the Work menu's group labels), marked only from each case study's own stack, scrolling sideways in a `ScrollRegion` with the group column pinned |
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
- **The flagship case studies publish only what was approved** (spec/CONTENT_MODEL.md
  §1.5): the names Sevina Technologies, Bench Discovery, CareLTC and SignFlow, the usage figures
  word for word, and captures of the real apps on dummy data. Every capture carries
  "Real app · dummy data" inside its frame — at the frame's top where a stage crops its
  foot (`ShotFrame labelAt="top"`). No production URL, repository, client or facility
  name, no attribution by git history, and no colleague named. Their status is "In
  use", never a frequency such as "daily" that no record supports
  ([ADR-019](./spec/decisions/ADR-019-named-flagship-case-studies.md)).
- Experience is "3.5+ years"; the availability line is `STATUS.text` in
  `config/site.ts`, never retyped.

---

## 8. Accessibility

Target **WCAG 2.2 AA**, gated by `scripts/a11y.mjs` (spec/ENGINEERING.md §4) at 1280,
768 and 360px, plus the flagships' phone disclosures opened, the open menus, the open
mobile menu, the assistant panel (from the header and from a page's own "Ask AI"
buttons) and a mocked conversation in it, the reduced-motion contract and the keyboard
contracts.

- **Focus is visible on everything**: a 2px violet ring at a 2px offset
  (`:focus-visible`, `styles/globals.css`), following each element's radius. Never
  removed, never replaced by a colour change alone. On dark scopes the ring is the
  lifted violet.
- **Focus is never hidden under the chrome** (2.4.11): `scroll-padding-top` clears the
  floating nav (on a case study, the nav and the work sub-nav: `--nav-offset` plus
  `--subnav-h` plus 12px) and `scroll-padding-bottom` (`--launcher-clearance`) the "Ask
  AI" launcher when Tab scrolls a control into view, and the footer's last row ends
  above the launcher.
- **Tab order follows what is seen.** Content that a layout moves (the blog post's
  category and "Ask AI about this" below `xl`) is rendered where it appears, not moved
  there by CSS from elsewhere in the DOM.
- **Contrast.** Every text token is ≥ 4.5:1 on the grounds it is used on; the ratios
  are in `tokens.css` and §2.
- **Nothing is carried by colour or motion alone.** A status pill has a word; a
  refused path is dashed *and* ends in a cross *and* says "Refuse"; an illustration's
  hover reaction repeats information already in text.
- **Menus**: the desktop Work and About menus are disclosure buttons with
  `aria-expanded`; the mobile menu is a modal dialog (focus moves in, Tab cycles inside
  it). Either way, Escape closes and returns focus to the trigger. Tabs use arrow keys
  with one tab stop.
- **Every piece of content sits in a landmark** — the header, nav, main and footer, or a
  named `<aside>` or region (the home announcement bar is `<aside
  aria-label="Announcement">`), so landmark navigation reaches all of it. `test:a11y`
  runs axe's `region` rule.
- **Scrollable regions** (the sub-nav, wide tables, the assistant transcript) have a tab
  stop and a name. A wide table scrolls in a `ScrollRegion`, which becomes a named
  region with a tab stop only while the table is wider than its column (the /evals
  leaderboard, the /skills matrix).
- **No horizontal document overflow** at any tested viewport.
- **Touch targets.** axe checks the 24×24px minimum; aim for 44px on anything people tap
  (use the `lg` button) and review by hand.
- **A modal makes the rest of the page `inert`**, not just focus-trapped
  (`lib/use-inert-background.ts`): the assistant, and the open mobile menu (whose
  header is marked `data-modal-root` so the pill stays live). The launchers live in
  the inerted subtree, so the assistant restores focus one frame after close, once the
  boundary is released (ADR-014 §4).
- **Disclosure uses native `<details>`**: keyboard-operable, found by find-in-page, and
  printed expanded. On phones the flagship case studies hold the rest of their long
  lists behind `ShowMore`; the section headings and anchors stay outside it, so a
  citation or a deep link always lands on something visible.
- **"Ask AI about this" opens without sending.** On every case study, "Ask AI about
  <product>" in the hero (`components/work/ask-ai.tsx`), and on every essay and note,
  "Ask this site's assistant" under "Ask AI about this"
  (`components/writing/ask-assistant-button.tsx`), open the assistant on that page's
  own starter questions and send nothing, so an exploratory click never spends an
  answer. Only a chip that shows its question sends it: a case study's closing band
  lists its starters as chips, and each sends exactly the question it shows. These
  buttons and chips, like the header trigger, the floating launcher and the openers on
  `/` (the announcement bar, the agent section) and `/contact`, are launchers
  (`data-assistant-launcher`), so focus returns to the one that opened the panel when
  it closes.
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
- Images through `next/image` with intrinsic dimensions; below-fold images lazy. A page
  marks at most its one above-the-fold capture `priority` (on `/`, the Bench Discovery
  capture in the showcase's first tab; on a flagship case study, the hero's main
  capture).
- Recordings fetch no video until played (`preload="none"`, captions), and a poster is
  a lazy `next/image` laid over the video (eager only in a public case study's hero), so
  a recording below the fold or on a hidden tab costs nothing at load. Flagship media
  budgets: WebP captures and posters ≤ 300 KB each, WebM recordings ≤ 7.5 MB
  (ADR-019).
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
  - `scripts/resume-document.mts` — the résumé PDF is printed from a standalone HTML
    document that cannot read the site's CSS, so it declares ink `#131316`,
    ink-secondary `#5e5f6e`, ink-tertiary `#6e6f7e`, border-strong `#dcdce1` and accent
    `#6b4bff` (links only) as literals; then run `npm run build:resume`.
  - the print palette in `styles/globals.css`, and the résumé page's own print rules in
    `components/resume/resume.module.css`.
- **Known deviations**, to be moved onto tokens: illustration colours written as hex in
  the home bento art, hero, showcase and sections modules, and the about, contact and
  misc modules (the obsidian mark, gradients in drawn art). The /hire hero reads tokens
  (`--color-accent`, `--color-ambient`) except one stop: the handwritten accent's deep
  cyan `#1597bd`, which carries its contrast on the canvas and has no token that dark.
  (`#000` in a `mask-image` gradient is an alpha mask, not a colour.)

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
  its motion moves forward, not diagonally; a file download gets ↓. `Button` and
  `CaretLink` apply this rule themselves; a plain link adds `<ArrowOut />`. A link to
  another site opens a new tab, with `rel="noopener noreferrer"` (`SmartLink`).
  `npm run test:links` holds the rule on every server-rendered link.
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
   backdrop and the showcase crossfade. The one recorded exception to gradient text is
   the /hire hero, from the approved prototype: the glass monogram (the accent family)
   and the handwritten accent (deep cyan to the accent, ≥ 3:1 at every point for large
   text).
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
