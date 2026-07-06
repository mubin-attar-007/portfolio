# DESIGN.md — Visual system

Design intent: **an engineering notebook meets a product case study.** Calm, light,
typography-first, generous whitespace. Reference feel: Stripe docs, Linear's marketing
prose pages, Anthropic docs, Vercel's writing — *their restraint, not their branding*.

Premium design isn't louder. It is quieter. The site should disappear; the work remains.

---

## 1. Design tokens (source of truth)

Implemented in `src/styles/tokens.css` using Tailwind v4 `@theme`. Components consume
tokens via Tailwind utilities only. **No raw hex, px, or ms anywhere else.**

### 1.1 Color — light (default theme)

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#FCFCF9` | page background (warm paper, not pure white) |
| `--color-bg-subtle` | `#F5F5F1` | alternate section bands, code inline bg |
| `--color-surface` | `#FFFFFF` | cards, panels, code blocks |
| `--color-ink` | `#1C1C1A` | primary text |
| `--color-ink-secondary` | `#57534E` | supporting text, captions |
| `--color-ink-tertiary` | `#8A857E` | meta labels, timestamps |
| `--color-border` | `#E7E5E1` | hairlines (default) |
| `--color-border-strong` | `#D6D2CC` | inputs, emphasized dividers |
| `--color-accent` | `#1D4ED8` | links, primary button, active nav, focus |
| `--color-accent-hover` | `#1E40AF` | hover state |
| `--color-accent-subtle` | `#EEF3FE` | accent-tinted backgrounds (rare) |
| `--color-positive` | `#15803D` | improved metrics (▼ latency, ▲ accuracy) |
| `--color-negative` | `#B91C1C` | regressions in FailureLog "before" values |
| `--color-warning` | `#B45309` | callout: caution |

### 1.2 Color — dark (user preference via `prefers-color-scheme` + toggle)

`--color-bg #131312` · `--color-bg-subtle #1A1A18` · `--color-surface #1E1E1C` ·
`--color-ink #EDECE8` · `--color-ink-secondary #A8A49D` · `--color-ink-tertiary #7C7871` ·
`--color-border #2C2B28` · `--color-border-strong #3A3934` · `--color-accent #7FA5F5` ·
`--color-accent-hover #9BB8F8` · `--color-accent-subtle #1B2438` ·
positive `#4ADE80` · negative `#F87171` · warning `#FBBF24`.

Dark is a *preference*, not the brand. All screenshots/OG images are produced in light.

### 1.3 Typography

| Token | Value |
|---|---|
| `--font-sans` | `"Geist Sans", "Inter", system-ui, sans-serif` — UI + body |
| `--font-mono` | `"Geist Mono", "JetBrains Mono", ui-monospace, monospace` — code, metrics, meta labels |
| `--font-serif` | `"Newsreader", Georgia, serif` — *display italic only*: essay titles, pull quotes. Never body. |

Load exactly these three, variable, `woff2`, subset latin, `font-display: swap`,
self-hosted via `next/font`. Total font payload ≤ 130 KB.

Type scale (rem / line-height / letter-spacing):

| Token | Size | LH | Tracking | Use |
|---|---|---|---|---|
| `--text-xs` | 0.75 | 1.5 | +0.04em | meta labels (mono, muted) |
| `--text-sm` | 0.875 | 1.6 | 0 | captions, footnotes |
| `--text-base` | 1.0 | 1.7 | 0 | body (max-width 68ch) |
| `--text-lg` | 1.125 | 1.65 | 0 | lede paragraphs |
| `--text-xl` | 1.25 | 1.5 | −0.01em | h4 / card titles |
| `--text-2xl` | 1.5 | 1.4 | −0.015em | h3 |
| `--text-3xl` | 1.875 | 1.3 | −0.02em | h2 / section headings |
| `--text-4xl` | 2.25 | 1.2 | −0.022em | page titles |
| `--text-5xl` | 3.0 | 1.1 | −0.025em | hero (desktop) |
| `--text-6xl` | 3.75 | 1.05 | −0.028em | hero (wide, optional) |

Rules: sentence case for ALL headings. Body max measure **68ch**. Headings max **20ch–28ch**
wrap width. `font-weight`: body 400, medium emphasis 500, headings 550–600 (variable axis).
Numbers in metrics use `--font-mono` with `font-variant-numeric: tabular-nums`.

### 1.4 Spacing

4px base scale (Tailwind default). Section vertical rhythm is deliberate and *varied*:

- `--space-section-sm`: 64px mobile / 96px desktop
- `--space-section-md`: 96px / 128px
- `--space-section-lg`: 128px / 176px (before/after hero and flagship feature)

### 1.5 Radius, borders, elevation

- Radius: `--radius-sm 4px` (tags, inline code) · `--radius-md 8px` (cards, inputs, buttons)
  · `--radius-lg 12px` (figures, terminal frames). Nothing rounder except avatars.
- Depth comes from **hairline borders + background shifts**, not shadows.
- Shadows: `--shadow-none` default; `--shadow-overlay: 0 4px 24px rgb(0 0 0 / 0.08)`
  reserved for menus, dialogs, the assistant panel. Never on static cards.

### 1.6 Motion

- Durations: `--motion-fast 120ms` (hover) · `--motion-base 180ms` · `--motion-slow 240ms` (panels).
- Easing: `--ease-out: cubic-bezier(0.2, 0, 0, 1)`.
- Only `opacity`, `transform`, `color` transition. Entrances: fade + 4px rise, fire once,
  max 3 staggered siblings, 40ms stagger.
- `prefers-reduced-motion: reduce` → transforms removed, opacity fades ≤ 80ms or none.
- Never: scroll-jacking, parallax, marquees, typing effects, looping ambient animation.

### 1.7 Layout

- Container: max-width **1120px**, padding 24px mobile / 32px desktop.
- Prose column: **68ch** centered within container.
- Grid: 12-col only where needed (work index, homepage features). Prefer single column.
- Breakpoints: 640 / 768 / 1024 / 1280 (Tailwind defaults).

---

## 2. Accent budget (hard rule)

The accent color may appear in at most **two elements per viewport**: links + ONE of
(primary button | active nav item | focused metric delta). Everything else is ink,
muted ink, and hairlines. If a screen feels flat, fix hierarchy with size/weight/space —
never by adding more accent.

---

## 3. Component visual specs (primitives)

- **Button**: primary = accent bg, white text, radius-md, 36px height, no shadow;
  secondary = transparent, 1px border-strong, ink text; ghost = text + underline-on-hover.
  Focus: 2px accent ring, 2px offset. One primary button per viewport.
- **Link**: ink text, `text-decoration underline`, `text-underline-offset 3px`,
  `decoration-color: border-strong` → accent on hover. In-prose links always underlined.
- **Card (quiet)**: surface bg, 1px border, radius-md, padding 24px. Hover: border-strong
  + title→accent. **No lift, no glow, no scale.**
- **Metric**: mono value (2xl–3xl, tabular) · sm muted label · delta arrow in
  positive/negative color · superscript footnote link to method. Never in a colored box.
- **Tag**: xs mono, muted, 1px border, radius-sm — metadata only, never a skills wall.
- **Callout**: bg-subtle, 3px left border (ink / warning / accent for note), radius-sm. No icons required.
- **CodeBlock**: surface bg, 1px border, radius-lg, mono sm, filename header bar (xs mono
  muted + copy button), Shiki theme matching palette (light: `github-light`-derived using tokens).
- **TerminalRecording**: asciinema-player in a radius-lg framed figure with a caption;
  poster frame until interaction; lazy-loaded.
- **SystemDiagram**: white/surface canvas, 1px border nodes (radius-md), 12–13px sans
  labels, orthogonal 1px connectors with small arrowheads, muted ink; hover = border-strong
  + side-panel description; active node label→accent. Looks like excellent technical
  documentation, not a product demo. Fully keyboard-navigable (arrow keys between nodes).
- **DecisionLog / FailureLog / MetricsTable**: table-like, hairline rows, mono numbers,
  generous cell padding, no zebra striping, no colored headers.

---

## 4. Page tempo (rhythm — the anti-"wall of cards" rule)

Adjacent sections must differ in at least one of: background (`bg` vs `bg-subtle`),
density (single feature vs list), or scale (display type vs base type). Never two
card-grids in a row. Homepage tempo:

```
Hero (huge type, lots of air, bg)                    — space-section-lg
Proof strip (one quiet line of 3 mono metrics)       — small, muted
Flagship case study feature (large: diagram + 3 deltas + link)  — bg-subtle band
Two secondary projects (compact list rows, not cards)
"How I think" (3 principles, prose, serif pull-quote allowed)
Selected writing (3 titles + dates, list)            — bg-subtle band
Now / timeline snippet (2–3 lines)
Contact (one sentence + email link + button)         — space-section-lg
Footer (colophon: built-with, source link, llms.txt)
```

---

## 5. Hero spec

- Small mono meta line: name · role · location (xs, tertiary).
- H1: the positioning statement from BRAND_POSITIONING.md. Max 2 lines desktop. 5xl/6xl.
- One supporting paragraph (lg, secondary ink, ≤ 2 sentences) ending with the evidence
  promise: "…every metric on this page links to how it was measured."
- CTAs: primary "Read the flagship case study" · ghost "How I make decisions".
- Optional availability line (xs mono): "Open to {X} — {Location/Remote}".
- **No** image, no animation beyond a single fade-in, no badges, no social icons row.

---

## 6. Imagery

Diagrams > screenshots > photos. Screenshots only inside case studies, always in a
Figure with border + caption, always retina, synthetic data only. Optional single
grayscale-ish portrait on About. No 3D renders, no stock, no AI-generated imagery.

---

## 7. Iconography

Lucide, 16/20px, `stroke-width: 1.5`, ink-secondary. Icons only where they carry meaning
(external-link, copy, menu, close, arrow). Never decorative icon grids.

---

## 8. Accessibility (visual)

Contrast ≥ 4.5:1 body, ≥ 3:1 large text and UI borders on interactive elements. Focus
visible on everything. Hit targets ≥ 24×24px. Never color-only meaning (deltas get ▲▼ + text).

---

## 9. Anti-patterns — BANNED (this section is law)

1. Gradient text, glow, neon, glassmorphism/blur cards.
2. Dark theme as default; "AI dark + electric accent" combos.
3. More than one accent color; accent used as decoration.
4. Uppercase headings or uppercase body; letter-spaced all-caps buttons.
5. Skill-badge walls, logo marquees, star-rating self-assessments ("Python ★★★★★").
6. Card grids as the default layout; borders around everything.
7. Typing animations, particle/mesh/grid backgrounds, spotlight cursors, tilt cards.
8. Scroll-jacking, parallax, autoplaying video, looping animation.
9. Stock imagery, 3D blobs, emoji in headings/UI chrome.
10. Vague superlatives in copy; any metric without a method footnote.
11. Center-aligned long-form text; measures > 75ch.
12. Anything whose only justification is "looks impressive."

Litmus test for every screen: *would this look at home inside excellent technical
documentation?* If not, simplify.
