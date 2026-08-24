# Design System — Mubin Attar

> The single source of truth for tokens, type, spacing, components and motion.
> Tokens are defined once in `styles/tokens.css` and consumed **only** through
> Tailwind utilities or `var()` inside a CSS module — no raw hex, px or ms in a
> component. This document explains *why* each value is what it is. **Where a
> value here and a value in `tokens.css` disagree, `tokens.css` wins and this
> document is the bug.**
>
> Current identity: see [ADR-011 — "Evidence paths"](./spec/decisions/ADR-011-evidence-paths-identity.md),
> which supersedes ADR-010. Everything below describes the system as shipped.

---

## 1. Thesis — "Evidence paths"

The site sells one claim: **production AI systems, built to be trusted.** The
visual language exists to make that claim legible before a single word is read.

Three ideas do the work:

- **Light paper, one accent.** The page is a cool near-white; a single violet is
  rationed to action, active state and measured evidence. Colour is a *signal*,
  not decoration — if everything is accented, nothing is.
- **The product is the hero.** The largest object on the homepage is a real
  DBWhisper run, using the agent's actual tool names. Not a terminal, not a
  browser mock-up, not a UI kit filled with placeholder text.
- **Every number carries its method.** No metric renders without a link to how it
  was measured. Enforced in the type system (`content/schema.ts` requires a
  non-empty `method` on every project metric), not by convention.

The quality benchmark is Clerk: hierarchy, whitespace, surface precision,
typographic confidence, restrained motion, deliberate light/dark contrast. What
is *borrowed* is craft. What is **not** borrowed is identity — no logo, name,
copy, illustration, screenshot or product UI. The originality budget is spent on
the artwork and the content, not on avoiding an expected hue (ADR-011).

### The motif

`components/home/evidence-graph.tsx` draws the site's argument: a request routed
through **retrieve → validate → execute → measure**, in a field of routes not
taken, with one branch that ends in a refusal rather than a result. Angular
traces, small nodes, square checkpoints, four faint stage labels.

It appears in exactly two places — behind the hero copy, and behind the closing
CTA. Decorative, so always `aria-hidden`; the four stages it names are stated in
prose in the flagship section, so nothing depends on seeing it.

---

## 2. Colour

The light page is the brand. Dark is used two ways: as a **band** inside the
light page (`.tone-invert`) and as an explicit, remembered **full-page
preference** (`[data-theme="dark"]`). `prefers-color-scheme` is deliberately not
consulted. Both consumers read one `--dark-*` ramp, so a band and the theme
cannot drift apart.

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

Violet `#7624f4` in light, lime `#c8ff00` in dark, and in each theme that accent
carries **everything**: buttons, links, active state, hover answers, gradients,
display lines. An earlier build split dark into "lime for action, violet for
display"; it was overruled, correctly. A visitor does not experience a colour as
a role — they experience two brand colours on one screen.

The one apparent exception is not a second accent. A dark BAND inside the LIGHT
page (`.tone-invert`) keeps the lifted violet `--dark-accent-band` `#a99cff`
(8.3:1), because that band belongs to the light theme's scroll — a lime button
inside it, under a violet button above it, is the same defect mirrored. Inside a
full-dark document that band is just another dark surface, so
`:root[data-theme="dark"] .tone-invert` overrides the accent back to lime. That
override was missing once and shipped visible purple into the dark theme.

Guarded by `npm run test:hue`, which walks 14 routes per theme and fails on any
computed colour outside that theme's accent family. See
[ADR-013 § 4](spec/decisions/ADR-013-openrouter-palette.md).

**Accent budget: ≤2 accent elements per viewport.** The primary button and the
band eyebrow usually spend both.

### Two dark bands, maximum

The homepage has exactly two: the flagship and the closing CTA. A third turns an
alternating rhythm into a stripe pattern. Dark bands have a **clean full-bleed
edge** — the previous "graticule" tick-scale device is retired (ADR-011); a dark
plate does not need a device to announce that it started.

---

## 3. Typography

Two families, one job each: **Geist Sans** for everything the reader reads,
**Geist Mono** for anything that is a value, a label, a tool name or code. Mono is
the site's voice for "this is a measurement".

Newsreader (italic 400, unpreloaded) reaches exactly one component — the
long-form `PullQuote` inside an article body. It ships on no marketing route.

Three fluid steps are solved as `intercept + slope*vw` rather than guessed with a
bare `vw`, so each hits an exact figure at an exact viewport:

| Token | 360px | 768px | 1440px | Used by |
|---|---|---|---|---|
| `--text-display` | 40 | 57 | 84 (cap) | the homepage h1, and nothing else |
| `--text-section` | 32 | 41 | 52 (cap) | every page h1 and section h2 |
| `--text-sub` | 24 | 28 | 32 (cap) | h3 |

The display step is reserved for the hero. Arriving on an index route lands one
step down, so the navigation reads as going a level in. Both are tokens, so the
gap between them is a decision in `tokens.css` rather than two clamps in two
files that happen to differ today.

Display weight is **550**, not 600: at these sizes the heavier weight reads as
generic-bold, and the tighter tracking is what makes a headline read as typeset
rather than enlarged.

Measures: `--width-prose` 68ch for reading, ~46ch for a hero lede, ~42–46ch for
card and band copy.

---

## 4. Layout and spacing

- `--width-container` **1216px**, one measure for the whole site.
- Gutters step **20 → 24 → 32px**. The 20px phone gutter is deliberate: at 360px
  a 24px inset costs 13% of the viewport, which is what turns a two-word headline
  line into a three-line headline.
- Section rhythm: desktop **104–144px**, mobile **72–96px**, slightly asymmetric
  (a little more weight below) so a band reads as a finished plate rather than
  content floating between two equal voids.
- `--space-section-xs` is **half a header seam**: a page header spends it below
  and the body band under it spends the other half, so the header→content gap is
  one reasoned number rather than two paddings that happen to stack.

Radii are small on purpose — large radii read as consumer-app chrome, tight
corners read as engineered: `xs 4` (tags, inline code), `sm 6` (buttons, chips),
`md 8` (cards, panels), `lg 12` (product stages, figures), `pill` for status only.

---

## 5. Surfaces and elevation

Layered and low-opacity: a hairline ring, a close contact shadow, a wide ambient
one. Never a single dramatic black drop.

`--shadow-surface` carries an **inset top highlight**, and on a light page that is
the load-bearing part: without it a white panel on a near-white ground reads as a
flat rectangle no matter how much drop shadow it has. `--shadow-stage` adds one
step for the hero product surface; `--shadow-float` is for a card layered *over*
a product surface.

**One card treatment.** `PANEL` (`constants/page.ts`) for static panels;
`ProjectCard` (`components/work/project-card.tsx`) for the one interactive tile,
shared by the homepage bento and `/work`. A project's card content lives on the
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

**Permitted:** opacity/transform reveals (≤16px rise, once), a 4px card lift, a
1.015 product-shot scale, an icon nudge, one slow travelling dash on the hero
motif, the stack wall's dwelling cycle, and the flagship specimen's 2800ms
stage run (which any manual selection stops permanently).

**The section reveal is inverted, and this is a hard rule.** Only elements that
were *below the fold at mount* are ever hidden; anything already on screen is
left alone, and a 1.6s timer unhides everything regardless of what the observer
did. Two earlier implementations hid content up front and revealed on
intersection — both blanked the page body in captures. Content is never hidden
unless JS has already proven, in the same tick, that it can unhide it. See
[ADR-014 § 1](spec/decisions/ADR-014-motion-and-modality.md).

**Two entrance devices, and which one a page gets is a content decision.** The
homepage uses the scroll-triggered `[data-reveal]` because it is a long
argument where sequence is the point. Interior pages use the load-orchestrated
`.reveal` / `.reveal-stagger`, which fires once on arrival regardless of scroll
position — because they are documents, and body copy that fades in under a
reader who is already reading it is a worse experience than no animation at
all. Both are neutralised in print and under reduced motion.

**Banned:** cursor followers, spotlight-follows-mouse, marquees and logo
carousels, typewriter effects, tilt cards, scroll-jacking, parallax, animated
background noise.

Every non-essential effect must live inside `@media (prefers-reduced-motion:
no-preference)` and have a **designed still pose** — not merely a disabled
animation. `scripts/a11y.mjs` fails the build if any computed animation or
transition duration on `/` exceeds **80ms** under reduced motion, or if any
`.reveal` element is left below `opacity: 0.99`.

Three worked examples: the hero's travelling dash is not *rendered at all* under
reduced motion, so it cannot freeze mid-route as an unexplained mark; the stack
wall's timer never starts, so it renders as a static row of five tools; and the
flagship specimen keeps every stage selectable but does not render a transport
at all, because a Play button that cannot play is worse than no button.

`npm run test:interaction` asserts the still poses directly — that nothing is
hidden, that the reveal never arms, and that no inert transport is rendered.

**One recorded exception:** the disclosure panel transitions
`grid-template-rows` (a layout property). Animating to an unknown auto height
otherwise requires JS measurement; the perceived motion is carried by
compositor-driven opacity and translate on the contents. See ADR-011.

---

## 7. Content law

- No metric without a linked method. `MetricSchema.method` is `.min(1)`.
- No invented number, ever — including in the dev component gallery, where every
  fixture value is deliberately impossible (`999`, `00.0%`) and labelled as such,
  because `noindex` is not the same as private.
- No fake logos, testimonials, clients or performance claims. The "trusted by"
  wall is replaced by a **stack wall** of tools that actually ship the four live
  products.
- Sample data is labelled **at the point of display**, inside the frame — not in
  a footnote.
- A number shown in two places must have **one source**. The homepage's
  82% / 100% pair is read through `DBWHISPER_GOLDEN` in `content/evals.ts`, which
  throws at module load if the row is renamed or removed.

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
- Touch targets ≥ 44×44px.
- **A modal makes the rest of the page `inert`** — not just focus-trapped.
  Trapping `Tab` alone still leaves the document in the accessibility tree, so a
  screen-reader user can walk out of the dialog by virtual cursor. Applied by
  `lib/use-inert-background.ts` to `body > header|main|footer`, so the portalled
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

Budgets in `scripts/lighthouse-budget.mjs`: performance ≥ 0.95; accessibility,
best-practices and SEO = 1.0; LCP ≤ 2000ms; CLS < 0.05; TBT < 150ms.

**Honest current state:** accessibility, best-practices and SEO are 100 and CLS is
0.000 on all three measured routes. **Performance and LCP fail, and failed before
the redesign too** — see ADR-011 § Consequences for the measured before/after. The
cause is a pre-existing ~550KB app-router JS payload that delays the webfont swap
defining LCP. This is documented rather than quietly ignored, because the whole
site argues that a number is reported with its method.

Rules that keep it from getting worse:

- **Client components take props; they do not read `content/`.** Importing the
  content layer into a client component drags the eval registry and Zod across the
  boundary. This shipped once during the redesign and cost 290KB.
- Server components by default. The homepage's only client islands are the header
  shell, nav, mobile menu, theme toggle, assistant launcher and the stack wall's
  single timer.
- Product frames declare an aspect ratio so an image cannot resize the layout.
- No remote hosts — CSP is `img-src 'self' blob: data:` and `font-src 'self'
  data:`. Fonts are self-hosted by `next/font`.

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
