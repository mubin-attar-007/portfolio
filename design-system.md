# Design System — Mubin Attar

> The single source of truth for tokens, type, spacing, components, motion and
> the design law (§11). Tokens are defined once in `styles/tokens.css` and
> consumed only through Tailwind utilities, token-reading arbitrary values such
> as `rounded-[var(--radius-sm)]`, or `var()` inside a CSS module — no raw hex,
> px or ms in a component (the recorded exceptions are in §11.1). This document
> explains *why* each value is what it is. **Where a value here and a value in
> `tokens.css` disagree, `tokens.css` wins and this document is the bug.**
>
> Current identity: [ADR-016 — Inspectable engineering](./spec/decisions/ADR-016-inspectable-engineering.md).
> Motion refinement: [ADR-017 — Responsive interaction](./spec/decisions/ADR-017-responsive-interaction.md).
> Both refine [ADR-015](./spec/decisions/ADR-015-personal-platform.md); the palette
> is [ADR-013](./spec/decisions/ADR-013-openrouter-palette.md). Every kept decision
> is indexed in [spec/decisions/README.md](./spec/decisions/README.md).

---

## 1. Thesis — The person, the work, and the evidence

This is Mubin Attar's personal platform as an **Applied AI Engineer**. The site
introduces his work clearly, then offers case studies and measured results for
readers who want depth. The employment title at Sevina remains AI/ML Engineer.

- **Light paper, one accent.** Hierarchy comes from typography, spacing, and
  hairlines. Use colour for actions and state; keep the hero text solid.
- **Identity beside an explanation.** The split hero pairs personal copy with
  a manual DBWhisper boundary inspector. Three curated cases explain a read
  query, a SELECT INTO write, and a missing schema. “Illustrative cases · no
  query is sent” distinguishes them from actual executions.
- **Measurements carry context.** Project metrics require a non-empty method
  in `content/schema.ts`. The inspector footer shows bounded evaluation ratios and
  links to the corresponding record; sample workflow values are labelled
  illustrations, never presented as measured outcomes.

The decorative evidence graph, repeated reliability/registry sections, and
animated tech wall are retired. Case studies, evaluations, and the existing
interactive walkthrough on the DBWhisper case study carry the technical depth.

---

## 2. Colour

The server renders `data-theme="light"`. A pre-paint script restores an explicit
saved dark preference; OS colour preference does not select the initial theme.
Dark is used for the closing contact band (`.tone-invert`) and the remembered
full-page preference (`[data-theme="dark"]`). Both consume the `--dark-*` ramp.

| Token | Light | Dark | Note |
|---|---|---|---|
| `--color-bg` | `#fcfcfe` | `#03080a` | the page |
| `--color-bg-subtle` | `#f4f4f6` | `#060b0d` | alternate bands, wells |
| `--color-surface` | `#ffffff` | `#080d0f` | cards sit brighter than the page |
| `--color-ink` | `#03080a` | `#fcfcfe` | 19.7:1 both themes |
| `--color-ink-secondary` | `#505456` | `#9fa1a3` | 7.5:1 / 7.8:1 |
| `--color-ink-tertiary` | `#676a6c` | `#808284` | 5.3:1 / 5.2:1 |
| `--color-border` | `#e8e9eb` | `#fcfcfe`@10% | hairlines |
| `--color-border-strong` | `#dddddf` | `#fcfcfe`@19% | inputs, emphasised dividers |
| `--color-accent` | `#7624f4` | **`#c8ff00`** | 6.2:1 / 17.0:1 |
| `--color-on-accent` | `#fcfcfe` | `#03080a` | 6.2:1 / 17.0:1 on the fill |
| `--color-ambient` | `#035ade` | — | gradients and data visuals ONLY |

Adapted from openrouter.ai, measured live (ADR-013). The architecture is the
part worth copying: **one ink per theme**, with the whole neutral ramp expressed
as alpha overlays of the opposite colour. That is why the two themes read as one
system rather than as a palette and its inversion. We resolve those overlays to
flat hex — our tokens feed `color-mix()` and gradients that need a real colour,
and their 44% tier measures 3.1:1, a placeholder tier rather than a body-text
one.

### One accent per theme — and the accent belongs to the THEME, not the surface

Violet `#7624f4` in light and lime `#c8ff00` in dark carry buttons, links, active
state, and hover feedback. The hero headline uses ink and secondary ink, not
an accent gradient. Existing gradient tokens do not authorize decorative use.

The one apparent exception is not a second accent. A dark BAND inside the LIGHT
page (`.tone-invert`) keeps the lifted violet `--dark-accent-band` `#a99cff`
(8.3–8.5:1 on the band's grounds), because that band belongs to the light
theme's scroll — a lime button inside it, under a violet button above it, is the
same defect mirrored. Inside a full-dark document that band is just another dark
surface, so `:root[data-theme="dark"] .tone-invert` overrides the accent back to
lime. That override was missing once and shipped visible purple into the dark
theme.

Guarded by `npm run test:hue`, which walks 14 routes per theme and fails on any
computed colour outside that theme's accent family. See
[ADR-013, decision 4](spec/decisions/ADR-013-openrouter-palette.md).

**Accent budget: ≤2 accent elements per viewport** (the rule is §11.2). Reserve
saturated colour for the primary action, active selection, or linked evidence.

### One closing dark band

The default homepage reserves the dark band for contact. The inspector footer and
writing use subtle light surfaces. Keep clean edges, without notches, ticks,
or decorative transition devices.

---

## 3. Typography

Two families, one job each: **Geist Sans** for everything the reader reads,
**Geist Mono** for anything that is a value, a label, a tool name or code. Mono is
the site's voice for "this is a measurement".

Newsreader (italic 400, unpreloaded) reaches exactly one component — the
long-form `PullQuote` inside an article body. It ships on no marketing route.

Three fluid tokens define display and section scale (rem assumes the browser's
default 16px root):

| Token | Range | Used by |
|---|---|---|
| `--text-display` | 2.75–4.75rem | homepage h1 |
| `--text-section` | 1.75–2.75rem | page h1 and section h2 |
| `--text-sub` | 1.5–2rem | h3 |

The display step is reserved for the hero. Arriving on an index route lands one
step down, so the navigation reads as going a level in. Both are tokens, so the
gap between them is a decision in `tokens.css` rather than two clamps in two
files that happen to differ today.

The homepage headline uses weight **550**, line-height **1.06**, and tight
tracking. The second phrase uses secondary ink and a controlled measure so the
split layout remains readable. Keep headings in sentence case.

Measures: `--width-prose` 68ch for reading, 40ch for the hero lede, 48–58ch for
project-row copy, 44ch for the contact band. Page titles wrap at 20ch
(`PageHeader`) and centred section headings at 24ch.

---

## 4. Layout and spacing

- `--width-container` **1264px**, one measure for the whole site.
- Gutters step **20 → 24 → 32px**. The 20px phone gutter is deliberate: at 360px
  a 24px inset costs 13% of the viewport, which is what turns a two-word headline
  line into a three-line headline.
- Homepage sections, the hero included, use `--space-section-sm` (**48–72px**)
  top and bottom instead of repeatedly spending the largest section band.
  Internal pages retain the shared section scale.
- `--space-section-xs` is **half a header seam**: a page header spends it below
  and the body band under it spends the other half, so the header→content gap is
  one reasoned number rather than two paddings that happen to stack.
- Breakpoints are Tailwind's defaults (640 / 768 / 1024 / 1280 / 1536px);
  `tokens.css` does not override them.

Radii are small on purpose — large radii read as consumer-app chrome, tight
corners read as engineered: `xs 4` (tags, inline code), `sm 6` (buttons, chips),
`md 8` (cards, panels), `lg 12` (product stages, figures), `pill` for status only.

Homepage order: identity and DBWhisper boundary inspector → three project rows →
portrait and employment → essays/current interests → contact. The five-stage
request walkthrough lives on `/work/dbwhisper#request-walkthrough`.

Primary navigation remains Work, Evals, Writing, About, and one contact action
to `/hire`. The footer links to deeper routes; the assistant and theme toggle
are utilities. Keep the full route set accessible without expanding the header.

---

## 5. Surfaces and elevation

Layered and low-opacity: a hairline ring, a close contact shadow, a wide ambient
one. Never a single dramatic black drop.

The hero inspector uses a flat border. Shared project rows, employment, essays,
and current interests are flat and ruled. Keep
elevation for surfaces that need separation, especially overlays;
retained `--shadow-stage` and `--shadow-float` tokens do not imply stacked
decorative panels on the homepage.

**One card treatment.** `PANEL` (`constants/page.ts`) for static panels;
`ProjectCard` (`components/work/project-card.tsx`) for the editorial project row,
shared by the homepage selected work and `/work`. A project's card content lives on the
project in `content/projects.ts`, so two surfaces cannot describe a product
differently.

---

## 6. Motion

Durations are a ladder, not a free choice: `--motion-instant` **120ms** (state
flips) · `--motion-fast` **130ms** (colour, icon nudge) · `--motion-base`
**200ms** (standard) · `--motion-slow` **300ms** (elevation, disclosure) ·
`--motion-reveal` **450ms** (component entrance) · `--motion-section` **560ms**
(section entrance, the slowest thing on the page).

Two curves, and the split is deliberate. `--ease-out`
`cubic-bezier(0.4, 0.36, 0, 1)` is tuned for 130–300ms interaction feedback and
reads abrupt over half a second; `--ease-enter`
`cubic-bezier(0.16, 1, 0.3, 1)` has the long decelerating tail an entrance
wants, so a section *arrives* rather than snaps. `--ease-emphasized` and
`--ease-spring` are the measured reference curves for emphasis and overshoot.
Tailwind reads `--default-transition-*`, so a bare `transition` lands on
`--motion-base` + `--ease-out` without per-element easing.

**Permitted:** feedback follows an interaction or a single initial arrival.
The inspector's native radio selection moves a neutral surface over 300ms;
the selected example and outcome update immediately. Only changed checks receive
a brief background emphasis and icon settle. Unchanged SQL stays stationary.
The inspector never auto-advances or simulates waiting for a network response.

Project image links scale their clipped image to 1.025 on hover or keyboard
focus. The row, text, frame, and permanent case-study label stay in place.
Navigation and writing links use soft neutral hover surfaces, with equivalent
keyboard feedback. Shared links animate underlines and directional arrows;
enabled buttons have a 1px press response and one finite sheen sweep.
Distances use `--motion-nudge` (2px), `--motion-press` (1px), and
`--motion-enter-distance` (8px). No extra motion library is required.

The case-study walkthrough retains its 2800ms stage run; manual selection stops
it. Project rows never lift or scale as a whole.

**Homepage content is always visible.** Whole-section scroll fades and their
`Reveal` wrapper are removed. Do not defer text visibility to an observer or
fade text through low-contrast intermediate states. The hero text and inspector
settle upward by 8px once on arrival, remaining fully opaque throughout, without
delays or scroll observers. This supersedes the homepage entrance behavior in
ADR-014 §1. Interior pages retain their existing
`.reveal` / `.reveal-stagger` entry styles, disabled in print and reduced motion:
a fade and 8px rise, once, with siblings delayed by `--stagger-step` (60ms) through
`stagger(i)` in `constants/page.ts` — never a hand-typed delay in a component.

**Banned:** cursor followers, spotlight-follows-mouse, marquees and logo
carousels, typewriter effects, tilt cards, scroll-jacking, parallax, animated
background noise. The full list is §11.6.

Every non-essential effect must live inside `@media (prefers-reduced-motion:
no-preference)` and have a **designed still pose** — not merely a disabled
animation. `scripts/a11y.mjs` fails the accessibility gate if any computed
animation or transition duration on `/` exceeds **80ms** under reduced motion,
or if any `.reveal` or `.hero-item` element is left below `opacity: 0.99` or
still transformed.

Under reduced motion, the walkthrough keeps every stage selectable without
rendering an automatic-play transport. The hero inspector remains manually
selectable in either motion preference. Its controls are hidden without
JavaScript while the default illustration and links remain visible.

`npm run test:interaction` checks visible state and reduced-motion walkthrough
behavior. `npm run test:motion` samples actual in-flight transitions, their
settled positions, rapid input, keyboard focus, touch affordances, and reduced
motion. Reduced motion keeps the selection indicator at the selected radio;
do not erase a transform used to express state when disabling its transition.

Transitions and keyframe animations run only on paint and compositor
properties — opacity, transform and `translate`, colour, background, border
colour and box-shadow — never on a layout property such as width, height,
margin, padding or grid tracks.

**One recorded exception:** the walkthrough's stage disclosure
(`components/case-studies/walkthrough.module.css`) transitions
`grid-template-rows` (a layout property). Animating to an unknown auto height
otherwise requires JS measurement; the perceived motion is carried by
compositor-driven opacity and translate on the contents. This section is the
record of that exception.

---

## 7. Content law

- No metric without a linked method. `MetricSchema.method` is `.min(1)`.
- No invented measurements, professional outcomes, testimonials, clients, or
  live-availability claims. Illustrative examples and fixtures must be visibly
  identified and must not stand in for evaluation evidence.
- Sample data is labelled **at the point of display**, inside the frame — not in
  a footnote.
- A measurement shown in two places must have **one source**. Homepage ratios
  and walkthrough scores come from `DBWHISPER_GOLDEN` in `content/evals.ts`.
  Include denominator/scope and a link to the method; a bounded test result is
  not a guarantee for all future inputs.
- `content/projects.ts` and `content/resume.ts` are the canonical structured
  sources for pages, retrieval, and PDF generation. Their former JSON duplicates
  are removed; MDX remains the long-form source.

---

## 8. Accessibility

Target **WCAG 2.2 AA**, gated by `scripts/a11y.mjs` across 18 routes × 2 themes ×
3 viewports (1280 / 768 / 360), plus the open mobile menu, the open assistant
panel, the reduced-motion contract and the keyboard focus-trap contract.

Non-negotiables:

- Focus is visible on everything, and it is the accent ring. Never removed.
- **Nothing is carried by colour alone.** A refused path is dashed *and* ends in
  a cross *and* says "Refuse". A selected schema row is tinted *and* full-ink
  *and* has a filled indicator. Proof-band labels are underlined at rest, not on
  hover — a colour-only affordance failed this gate here once already.
- Any horizontally scrollable region needs a tab stop and a name, or a
  keyboard-only reader cannot reach the end of it.
- **No horizontal document overflow** at any tested viewport; the gate throws on
  `scrollWidth > clientWidth + 1`.
- **Touch targets ≥ 44×44px.** The a11y gate runs axe's WCAG 2.2 `target-size`
  rule, which checks only the 24×24px minimum, so the 44px rule is reviewed by
  hand. Control heights are 32 / 38 / 44px (`components/ui/button.tsx`); use the
  44px `lg` size for anything people tap. Known deviations: the 36px header icon
  buttons with 2px gaps on phones, and some 18–34px inline controls.
- **A modal makes the rest of the page `inert`** — not just focus-trapped.
  Trapping `Tab` alone still leaves the document in the accessibility tree, so a
  screen-reader user can walk out of the dialog by virtual cursor. Applied by
  `lib/use-inert-background.ts` to all direct body children except marked modal roots and resource elements, so the portalled
  dialog is never caught by its own boundary.
  Watch the sharp edge: both launchers live in the header, i.e. *inside the
  inerted subtree*, so focus restoration on close must happen **after** the
  boundary is released — restoring in the same tick is a silent no-op that
  strands focus on `<body>`. See
  [ADR-014 § 4](spec/decisions/ADR-014-motion-and-modality.md).
- **Disclosure uses native `<details>`.** Keyboard-operable, announced
  correctly, openable by find-in-page, and prints expanded — for free.

---

## 9. Performance

The CI gate (`scripts/lighthouse-budget.mjs`) fails on performance below 0.95;
accessibility, best-practices or SEO below 1.0; LCP above 2500ms; CLS of 0.05 or
more; TBT of 150ms or more. It prints first-load JavaScript without failing on it.
The budgets themselves are in [ENGINEERING.md §5](spec/ENGINEERING.md), and the
code does not yet meet all of them: route JS, for one, is budgeted at ≤ 120 KB
home and ≤ 90 KB content pages but measured at 167–175 KB.
These are required thresholds, not a report of this revision's results. Record
current measurements with their build, route, and test environment; historical
ADR scores do not certify a later implementation.

Rules that keep it from getting worse:

- **Client components take props; they do not read `content/`.** Importing the
  content layer into a client component drags the eval registry and Zod across the
  boundary. This shipped once during the redesign and cost 290KB.
- Server components by default. Client components are limited to the allowlist
  in [ARCHITECTURE.md §5](spec/ARCHITECTURE.md#5-client-component-allowlist):
  navigation and theme, the assistant, the case-study walkthrough and reading
  outline, the system diagram, list filters, copy buttons, and the finite manual
  hero inspector. Motion adds no network request or dependency. Below-fold
  project images are lazy.
- Product frames declare an aspect ratio so an image cannot resize the layout.
- No remote image or font hosts — CSP is `img-src 'self' blob: data:` and
  `font-src 'self' data:`. Fonts are self-hosted by `next/font`.

---

## 10. Print

`/resume` is a document people print or save as a PDF, and `/work/[slug]` gets
printed by anyone reviewing a case study offline. The print stylesheet lives in
`styles/globals.css` and is written against **landmarks plus one
`data-print="hide"` hook**, not a list of component classes — so a new piece of
chrome is excluded by *being* chrome rather than by someone remembering to add it
to a selector list.

What it does: re-derives the palette to real black on real white (printing the
brand's greys wastes toner and reads washed out), drops the availability bar, the
nav, the footer and the "Download PDF" action, collapses section padding to zero,
forces every `.reveal` element fully opaque, avoids page breaks inside list items
and figures, and spells out external URLs — but only external ones, since
printing "(/work)" after every internal link is noise.

Gated by `npm run test:print`, which emulates print media, asserts the chrome is
gone and nothing printed faded, and writes a real PDF to `.screenshots/`.

---

## 11. Design law

The rules below are not values; they hold whatever the tokens become. They
were carried over from the former `spec/DESIGN.md` (removed on 2026-11-13; in git
history at commit `8949fdf`) with its superseded clauses amended to match the
current code. Litmus test for every screen: *would this look at home inside
excellent technical documentation?* If not, simplify.

### 11.1 Token discipline

- Components consume tokens, never literals: Tailwind utilities, arbitrary values
  that read a token (`rounded-[var(--radius-sm)]`), or `var()` in a CSS module.
  No lint rule enforces this; review does.
- Palette literals outside `tokens.css` exist only where CSS variables cannot be
  read or are not yet applied, and a palette change updates them in the same
  change: `lib/og.tsx` (six Satori literals — nothing tests OG colour), the
  `theme-color` values in `app/layout.tsx` and
  `components/features/theme-toggle.tsx` (asserted by `scripts/smoke.mjs`), and
  the full-dark band grounds and print palette in `styles/globals.css`.
- Open Graph images are light-only.

### 11.2 Accent budget (hard rule)

The accent may appear in at most **two elements per viewport**: links plus ONE
of the primary action, the active selection (for example the current nav item),
or linked evidence. Everything else is ink, secondary ink, and hairlines. If a
screen feels flat, fix hierarchy with size, weight, and space — never by adding
accent. Which accent applies is a property of the theme (§2).

### 11.3 Page tempo

Adjacent sections differ in at least one of: background (`bg`, `bg-subtle`, or
the dark band), density (a single feature versus a list), or scale (display
versus body type). Never two card grids in a row. The current homepage order is
in §4.

### 11.4 Component rules

- **Hero** (`components/home/hero.tsx`): a mono name and role line, a two-part
  headline, one short lede, one primary and one secondary action, and a location
  and experience line, beside the inspector figure. No badges, no social-icon
  row, and no motion beyond the single arrival settle (§6).
- **Buttons** (`components/ui/button.tsx`): variants primary, secondary, subtle
  and ghost. **One primary button per viewport.** Focus is the global 2px accent
  outline at a 2px offset.
- **Links:** in-prose links are ink, underlined at rest with a `border-strong`
  decoration that turns accent on hover (`components/mdx/prose.ts`). The
  "continue" affordance is `TextLink`; its `quiet` tone exists so a secondary
  link does not spend the accent budget.
- **Static cards and project rows stay flat:** no lift, glow, or scale on hover;
  hover changes border or colour only. The one zoom is the clipped image inside a
  project link (§6). `components/ui/card.tsx` still offers an `interactive`
  hover lift; it is used only on `/dev/components`. Elevation is for things that
  float — the assistant panel, the mobile menu — and the primary button.
- **Metric:** a mono, tabular value; a delta pairs an arrow glyph with words;
  never in a coloured box; every metric links to its method.
- **Tag:** an xs mono metadata chip (`--radius-xs`) — metadata only, never a
  skills wall.
- **Callout:** `bg-subtle` with a 3px left stripe (ink, warning, or accent for a
  note). No icon required.
- **CodeBlock:** highlighted by Shiki on the server with the GitHub high-contrast
  light and dark themes, in a figure with a filename bar and a copy button.
- **SystemDiagram:** reads as technical documentation, not a product demo —
  flat nodes (`--radius-md`), orthogonal connectors with rounded elbows, and an
  active state that changes border and label colour only. One tab stop with
  arrow, Home and End navigation; a narration list is the text alternative;
  narrow viewports get a staged HTML map instead of the SVG canvas.
- **DecisionLog / FailureLog / MetricsTable:** table-like, hairline rows, mono
  numbers, generous padding, no zebra striping, no coloured headers.

### 11.5 Imagery and icons

- Diagrams and real product captures. Every capture carries a caption naming
  the surface it shows (`card.caption` in `content/schema.ts`), never an implied
  live result. The portrait (`public/mubin.png`) appears on the homepage and
  `/about`. No stock imagery, 3D renders, or AI-generated imagery.
- Icons come from `lucide-react` and appear only where they carry meaning
  (external link, copy, menu, close, direction, status). Decorative glyphs are
  `aria-hidden`. Never decorative icon grids.

### 11.6 Anti-patterns — banned (this section is law)

1. Gradient text, neon, glassmorphism or blurred cards, and glow as decoration.
   A single soft ambient glow behind a product surface is the most a glow may
   ever be. Sanctioned: the primary button's finite hover sheen (ADR-017) and
   the sticky header's translucent backdrop, the one blurred surface (it is not
   a card).
   Known deviations, recorded as defects or pending decisions rather than
   precedent: the primary button's single-hue fill ramp
   (`--gradient-accent-control`) has no recorded decision; the 2px
   accent-to-ambient top light on the walkthrough specimen
   (`components/case-studies/walkthrough.module.css`) and the inline accent
   radial behind the `/work` page header (`app/work/page.tsx`) break items 1
   and 3 and should be removed. The two-hue `--gradient-accent` and the
   `--glow-accent` / `--glow-ambient` tokens are defined but unused.
2. A full-dark page as the default theme. Light is server-rendered; dark is an
   explicit, remembered choice, and `prefers-color-scheme` is never consulted. A
   dark band (`.tone-invert`) on the light page is not this violation — the
   default homepage uses exactly one, for contact.
3. More than one accent per theme, or accent used as decoration: no second hue,
   no accent gradients, no tinted decorative shapes. The ambient blue
   (`--color-ambient`) is limited to gradients and data visuals.
4. Uppercase headings or uppercase body; letter-spaced all-caps buttons. One
   exception, already in the system: xs mono **kickers** and group labels
   (`LABEL` in `constants/page.ts`) may be uppercase with the token's 0.04em
   tracking (`--text-xs--letter-spacing`). Headings themselves are always
   sentence case. Known deviation: kickers and labels currently use several
   tracking values between 0.025em and 0.07em; consolidate them on the token.
5. Skill-badge walls, logo marquees, star-rating self-assessments ("Python
   ★★★★★"), and client-logo walls of companies never worked for. A stack display
   is permitted only as text and hairlines (no logos), non-looping, decorative
   (`aria-hidden`, with a real text list behind it), and honest about what it
   claims — "tools I use", never "companies I work with".
6. Card grids as the *default* layout. A grid is allowed where the content is
   genuinely parallel and enumerable (a work index, a capability set) — never two
   grids in a row, and never as a substitute for a section with a point to make
   (§11.3).
7. Typing animations, particle, mesh or grid backgrounds, cursor followers and
   spotlight cursors, tilt cards.
8. Scroll-jacking, parallax, looping ambient animation, and video that
   autoplays or has no pause control. Muted, captioned product recordings are
   permitted as evidence: the case-study demos never autoplay, fetch no video
   until played (`preload="none"`; only the poster image is preloaded), and keep
   native controls and a captions track (WCAG 2.2.2).
9. Stock imagery, 3D blobs, emoji in headings or UI chrome.
10. Vague superlatives in copy; any metric without a method.
11. Center-aligned long-form text; measures over 75ch.
12. **Invented or placeholder social proof** — testimonials, quotes, client
    names, or logos that are not real and permissioned. A "sample layout" label
    does not cure it; if it is not real, it does not ship. (Reinforces the
    charter's "honesty over hype".)
13. Anything whose only justification is "looks impressive."
