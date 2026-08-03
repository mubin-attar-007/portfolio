# Design System — Mubin Attar

> The single source of truth for tokens, type, spacing, components, and motion.
> Tokens are defined once in `styles/tokens.css` and consumed **only** through
> Tailwind utilities — no raw hex/px/ms in a component. This document explains
> *why* each value is what it is. Where a value and this doc disagree, the value
> in `tokens.css` wins and this doc is the bug.

## 1. Thesis — "Instrumentation, not decoration"

This site is the **readout of a precision instrument**, not a marketing page. Its
subject is *measured behavior* — execution accuracy, fail-closed boundaries,
look-ahead-free-by-construction, "every claim leaves a receipt." So the visual
language is borrowed from **measurement instruments and lab notebooks**: a
calibrated scale, a signal trace, a footnoted number. Never from SaaS product
marketing.

The discipline that follows from the thesis:

- **The paper is quiet so the readings are loud.** Backgrounds, borders, and type
  are near-monochrome; a single signal accent is spent sparingly (≤2 accent
  elements per viewport). Colour is a *reading*, not decoration.
- **Every number carries its method.** No metric renders without a linked
  measurement — enforced in the type system (`content/schema.ts`), not by
  convention.
- **The signature is evidence, not ornament.** One bold element — the live
  DBWhisper workbench — makes the argument; everything around it stays calm.
- **Dark-first, with depth.** The brand renders **dark by default** (an
  instrument console, not a marketing page): near-black surfaces, layered
  elevation, a single soft accent glow behind the hero. Light is a remembered
  preference. Density is deliberate — a working readout, not an airy brochure.

Anti-thesis (explicitly rejected): the previous system was a faithful copy of
clerk.com's palette, easing, and section device. Clerk is an auth company; the
borrowed skin misrepresented an AI-systems engineer and any reviewer could name
the source. The *engineering* bones (token discipline, AA rigor, motion policy)
are kept; the *identity* is re-derived from the thesis above.

## 2. Colour

Three colour contexts, all first-class. **Dark is re-derived, not inverted** —
surfaces and shadows are re-tuned, not flipped. **Dark is now the brand default**
(`<html data-theme="dark">`, kept pre-paint); light is an explicit, remembered
preference (`data-theme="light"`), never auto-applied from `prefers-color-scheme`.
In dark, section rhythm can't lean on a light↔dark band flip, so feature bands
**recess into a deeper well** (`#0d0d10`) marked by the graticule seam; elevation
and hairline borders carry the rest.

### Semantic set (role → token)

| Role | Light | Dark / band |
|---|---|---|
| page background | `--color-bg` `#f7f7f8` | `#131316` |
| subtle band / inline-code bg | `--color-bg-subtle` `#eeeef0` | `#1a1a1f` |
| surface (cards, panels, code) | `--color-surface` `#ffffff` | `#212126` |
| text primary | `--color-ink` `#131316` | `#f7f7f8` |
| text secondary | `--color-ink-secondary` `#5e5f6e` | `#b7b8c2` |
| text tertiary | `--color-ink-tertiary` `#676876` | `#9394a1` |
| hairline border | `--color-border` `#e3e3e8` | `#2f3037` |
| strong border | `--color-border-strong` `#d9d9de` | `#42434d` |
| **accent (signal)** | `--color-accent` **`#0f6e6a`** | **`#5cccc0`** |
| accent hover | `--color-accent-hover` `#0b5754` | `#7ad9cf` |
| text on accent fill | `--color-on-accent` `#ffffff` | `#08201e` |
| accent-tinted bg (rare) | `--color-accent-subtle` `#e7f3f1` | `#10322f` |
| positive / success | `--color-positive` `#15803d` | `#4ade80` |
| negative / danger | `--color-negative` `#b91c1c` | `#f87171` |
| warning | `--color-warning` `#b45309` | `#fbbf24` |
| focus ring | reuses `--color-accent` (2px outline, 2px offset) | reuses `--color-accent` |

The accent is a **deep signal teal** — an oscilloscope trace, a terminal cursor,
the green of a passing check. It is unmistakably not the previous Clerk violet,
and it is on-thesis: teal reads as *measurement / signal*, not *SaaS*. Status
colours are re-scoped inside `.tone-invert` so a Metric or before/after value
dropped into a dark band never renders below AA.

### Measured contrast (WCAG 2.x) — every pair used in the UI

All ratios computed from the tokens above; **AA threshold 4.5:1** for body text,
**3:1** for focus/UI. Nothing in the UI ships below AA.

**Light mode**

| Foreground / Background | Ratio | Grade |
|---|---|---|
| accent `#0f6e6a` / surface `#fff` | 6.07 | AA |
| accent `#0f6e6a` / bg `#f7f7f8` | 5.67 | AA |
| accent `#0f6e6a` / bg-subtle `#eeeef0` | 5.24 | AA |
| white on-accent / accent fill | 6.07 | AA |
| white on-accent / hover fill `#0b5754` | 8.38 | AA |
| ink / accent-subtle `#e7f3f1` (::selection) | 16.3 | AA |
| ink `#131316` / bg `#f7f7f8` | 16.9 | AA |
| ink-secondary `#5e5f6e` / bg | 6.4 | AA |
| ink-tertiary `#676876` / bg-subtle | 4.6 | AA |

**Dark mode / dark band**

| Foreground / Background | Ratio | Grade |
|---|---|---|
| accent `#5cccc0` / dark bg `#131316` | 9.58 | AA |
| accent `#5cccc0` / dark surface `#212126` | 8.28 | AA |
| dark on-accent `#08201e` / accent fill | 8.78 | AA |
| dark on-accent / hover fill `#7ad9cf` | 10.24 | AA |
| ink-dark `#f7f7f8` / accent-subtle `#10322f` | 12.9 | AA |

> Alternative considered and rejected: **Blueprint Cobalt** (`#2456c9` /
> `#7aa7ff`) — passes AA everywhere (6.46 / 7.77) and is a valid engineering
> signal, but blue is the single most common "tech" accent and sits closer to the
> Clerk violet-blue family. Teal is more differentiated and more on-thesis. Cobalt
> stays documented here as the one-line fallback if teal ever clashes with a
> partner brand.

## 3. Typography

Three self-hosted, subset faces (via `next/font/google`, `display: swap`) — kept
from the prior system because the pairing is genuinely strong; only the rationale
is re-stated in thesis terms.

| Face | Token | Role | Thesis reading |
|---|---|---|---|
| **Geist** | `--font-sans` | body, UI, headings | the clean instrument label |
| **Geist Mono** | `--font-mono` | metrics, kickers, code, captions | the **readout** — every number, every measured value |
| **Newsreader** (italic 400) | `--font-serif` | pull-quotes + footer sign-off only | the one human voice in a technical document |

Mono is load-bearing to the thesis: measurements, eval results, and kickers are
all mono, so a *number* always looks like an instrument reading, never like body
copy. Serif appears in exactly one place per page (a pull-quote) — a single human
sentence amid the readings.

Modular scale (`--text-xs` … `--text-7xl`) with per-step size / line-height /
letter-spacing lives in `tokens.css §type scale`. Fluid `clamp()` is applied at
the component layer for display headings (hero, section h2, page h1), with tested
min/max — never unbounded. Body measure caps at `--width-prose: 68ch`. Preload
only the above-the-fold sans; mono and serif are `preload: false`.

## 4. Space, layout, radius, elevation

- **Spacing (dense).** One fluid section-rhythm scale (`--space-section-xs…lg`,
  each a `clamp()`), intentionally **asymmetric** top/bottom. The scale is tuned
  ~25% tighter than a marketing site — a working-instrument rhythm where pages
  read as substantial, not airy. Page-opening rhythm is composed from two tokens
  (`PAGE_HEADER_BAND` + `PAGE_BODY_BAND`). No arbitrary margins.
- **Container:** `--width-container: 1120px`, gutters `px-6 md:px-8`, single
  `Container` primitive.
- **Radius:** `--radius-sm 4px` (tags/inline code) · `--radius-md 8px`
  (cards/inputs/buttons) · `--radius-lg 12px` (figures/frames).
- **Elevation — depth on product surfaces.** `--shadow-surface` (a hairline ring
  + close shadow + wider ambient, re-derived for dark as a top light-line + light
  ring + deep drops) is the standard for panels/cards that stand for a real
  product surface — the workbench, the evidence/architecture panels, the project
  and eval cards. Interactive cards lift a hair and brighten on a fast,
  reduced-motion-safe hover (`--shadow-surface-hover`). `--shadow-sm/md/lg` remain
  for true overlays (dialogs, menus, the assistant panel). One soft ambient accent
  glow (`--glow-accent`, a single radial — never a mesh) sits behind the hero
  workbench to add depth without touching text contrast. Prose blocks and plain
  content stay flat; depth is a signal that something is a *surface*.

## 5. Section-transition device — the "graticule seam"

Replaces the previous Clerk chamfered "notch" (a light plate overhanging the dark
band). The new device is **on-thesis**: where a light section meets a dark band,
the boundary is drawn as a **calibration scale** — a hairline baseline carrying
evenly-spaced short tick marks, like a ruler edge or an oscilloscope graticule.

- Implementation: `.tone-invert` band gets a top (and, for a page-closing band,
  bottom) pseudo-element painting `repeating-linear-gradient(90deg, tick 0 1px,
  transparent 1px var(--graticule-step))` over a 1px baseline rule; tick colour is
  a faint accent/border mix. No `clip-path` chamfer.
- `--graticule-step` (token) sets tick spacing; a `@media (max-width: 640px)`
  tightens it on mobile.
- Purely static — no motion, so `prefers-reduced-motion` is irrelevant; it never
  clips content, so it composes with `content-visibility`.

Rationale: the chamfer said "product plate" (Clerk). The graticule says "measured
axis" — it makes the boundary between two sections read like a scale on an
instrument, which is the site's whole argument.

## 6. Motion

- **No animation library.** Motion is CSS plus, where JS is unavoidable, one
  `IntersectionObserver`. Only `opacity / transform / colour / border-color`
  transition — never a layout property.
- **One curve, everywhere.** `--ease-out: cubic-bezier(0.4, 0.36, 0, 1)` at
  `--motion-base 200ms` is wired into Tailwind's base transition, so every bare
  `transition` settles on the one curve (uniform motion = one careful hand).
  `--ease-emphasized` and `--ease-spring` exist as scalpels for accent moments.
- **Durations:** micro 120–200ms · transitions 200–320ms · orchestrated ≤600ms.
  Nothing blocks the reader; body copy never fades in.
- **Entrance system (`.reveal` / `.reveal-stagger`):** a once-only fade + ≤8px
  rise on section wrappers (never on prose), staggered by `--i × --stagger-step`,
  wrapped in `@media (prefers-reduced-motion: no-preference)`. Under reduced
  motion the content is simply present — no movement, no loss.
- **Banned:** scroll-jacking, parallax, marquees, typing effects, looping ambient
  animation, cursor followers.

## 7. Components & states

Primitives live in `components/ui/` (server, stateless). Every interactive element
has all five states designed; loading/empty/error exist for anything that can be
slow, empty, or fail.

- **Button** (`ui/button.tsx`): `primary` (accent fill) · `secondary` (hairline
  border) · `ghost` (underline-on-hover) × `sm/md/lg` (32/36/44px). States:
  default · hover (`bg-accent-hover`) · active (1px press) · focus-visible (global
  ring) · disabled (`opacity-50`, no pointer) · **loading** (`aria-busy`, spinner).
- **Card / Callout / Tag / Metric / MetricsTable / CodeBlock (Shiki, build-time) /
  Figure / PullQuote / BeforeAfter / CheckList / SectionHeading / PageHeader /
  TextLink / BoundaryMark** — one panel treatment (`PANEL`), one "read more"
  affordance (`TextLink`), one framed-object treatment (`FIGURE`).
- **Loading / empty / error:** the assistant panel (empty state with starter
  prompts, streaming/busy with `aria-live`/`aria-busy`, graceful error). Route
  errors: `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`.
- **Live gallery:** `app/dev/components` (noindex) renders every primitive in every
  state, both themes — the kitchen-sink review surface.

## 8. Signature element — the DBWhisper workbench

Exactly one memorable thing (brief §5.3). On the home hero, a real natural-language
question runs through the live pipeline: **Query → Agent trace → Eval**. The
reader watches retrieve → generate → validate (fail-closed) → execute, then sees
the eval reading attached (82% golden-set · 100% fail-closed refusals). It is the
most characteristic thing in this engineer's world — an AI system that shows its
boundaries and its measured behaviour — and it is spent in one place. Everything
around it stays quiet.

## 9. Enforcement

- If a value is not in the token system, it does not appear in a component.
  Token-system violations are listed or fixed in the QA report.
- Accent budget: ≤2 accent elements per viewport.
- Content law: no metric without a `method` footnote (Zod, build-time).
- CI gates: `tsc --noEmit`, ESLint, unit tests, **axe (WCAG 2.2 AA, all routes ×
  light/dark × 3 widths + overlays + reduced-motion)**, Lighthouse budgets, and a
  first-load-JS byte budget.
