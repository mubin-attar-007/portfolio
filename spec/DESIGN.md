# DESIGN.md — Visual system

Design intent: **an engineering notebook with a product-grade surface.** Calm,
typography-first, generous whitespace, evidence in the foreground. Reference feel:
Clerk's marketing pages (the adopted system — see §0), with Stripe docs, Linear, and
Anthropic docs as the restraint reference.

Premium design isn't louder. It is quieter. The site should disappear; the work remains.

---

## 0. Brand system direction (supersedes the earlier neutral-paper palette)

The site is built to **Clerk's craft standard**: a cool near-white page, tactile
elevation, a light page punctuated by dark section-bands, confident type, and calm
motion curves. That direction shipped on `feature/clerk-caliber-pass` and is kept.

The governing constraint comes from `CLAUDE.md`:

> "Never copy designs directly. Understand the design principles and create an original
> implementation."

So the line is drawn at *principles, not artifacts*:

- **Adopted:** the elevation model, band rhythm, spacing confidence, motion character,
  type density — the standard of craft.
- **Not adopted:** Clerk's logo, wordmark, illustrations, copy, or anything implying
  affiliation. Nothing here may suggest a relationship with Clerk.
- **RESOLVED (owner, this session):** keep the accent `#6C47FF` and the Clerk-derived
  palette, and go *further* on depth, effect, and motion. The owner reviewed the
  direction and chose it explicitly: *"follow the clerk's color, style, effect,
  animation etc… i like it."* The values in §1.1 are therefore settled brand law.
  The originality constraint is satisfied at the level that matters — the layouts,
  copy, illustrations, diagrams, and product surfaces are entirely ours; what is
  shared is the craft vocabulary.

Everything else in this document — the accent budget (§2), the page tempo (§4), the
anti-patterns (§9), the evidence rules — survives unaltered. A richer palette raises
the ceiling on craft; it does not license decoration.

---

## 1. Design tokens (source of truth)

Implemented in `src/styles/tokens.css` using Tailwind v4 `@theme`. Components consume
tokens via Tailwind utilities only. **No raw hex, px, or ms anywhere else.**

### 1.1 Color — light (default theme)

> Components must consume the **token names**, never these literals. Three places
> legitimately hold the accent as a literal, because they cannot read CSS custom
> properties: `lib/og.tsx` (Satori), `styles/globals.css` `.tone-invert`, and
> `styles/tokens.css` itself. Any palette change must update all three together.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#F7F7F8` | page background (cool near-white) |
| `--color-bg-subtle` | `#EEEEF0` | alternate section bands, code inline bg |
| `--color-surface` | `#FFFFFF` | cards, panels, code blocks |
| `--color-ink` | `#131316` | primary text |
| `--color-ink-secondary` | `#5E5F6E` | supporting text, captions |
| `--color-ink-tertiary` | `#676876` | meta labels, timestamps (darkened to clear AA on bg + bg-subtle) |
| `--color-border` | `#E3E3E8` | hairlines (default) |
| `--color-border-strong` | `#D9D9DE` | inputs, emphasized dividers |
| `--color-accent` | `#6C47FF` | links, primary button, active nav, focus |
| `--color-accent-hover` | `#5A37E0` | hover state |
| `--color-on-accent` | `#FFFFFF` | text on an accent fill |
| `--color-accent-subtle` | `#F0EDFF` | accent-tinted backgrounds (rare) |
| `--color-positive` | `#15803D` | improved metrics (▼ latency, ▲ accuracy) |
| `--color-negative` | `#B91C1C` | regressions in FailureLog "before" values |
| `--color-warning` | `#B45309` | callout: caution |

### 1.2 Color — dark (user preference via toggle)

`--color-bg #131316` · `--color-bg-subtle #1A1A1F` · `--color-surface #212126` ·
`--color-ink #F7F7F8` · `--color-ink-secondary #B7B8C2` · `--color-ink-tertiary #9394A1` ·
`--color-border #2F3037` · `--color-border-strong #42434D` · `--color-accent #9A7FFF` ·
`--color-accent-hover #B3A0FF` · `--color-accent-subtle #241D47` · `--color-on-accent #131316` ·
positive `#4ADE80` · negative `#F87171` · warning `#FBBF24`.

**The brand default is the light page carrying dark section-bands** (`tone="invert"`),
not a light-mode variant — the alternation is the identity and renders identically
regardless of OS setting. Full-dark is an explicit, remembered visitor choice
(`[data-theme="dark"]` via the toggle); the site deliberately does not auto-switch on
`prefers-color-scheme`, because the band rhythm *is* the design. All OG images are
produced in light.

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
- Depth comes primarily from **hairline borders + background shifts**. Elevation is the
  exception, not the texture.
- Elevation set (ratified with §0 — Clerk's tactile model): `--shadow-sm` / `--shadow-md`
  / `--shadow-lg`, each a hairline ring + a soft drop, plus `--shadow-btn` (inset top
  highlight) for the primary button only. `--shadow-overlay` aliases `--shadow-lg` for
  menus, dialogs, the assistant panel.
- **Rule that survives:** static content cards stay flat — border + background only. A
  card may not gain a shadow, lift, or scale on hover; hover is border-strong + title→accent.
  Elevation is reserved for things that genuinely float (overlays, the primary button).

### 1.6 Motion

- Durations: `--motion-fast 140ms` (hover) · `--motion-base 200ms` · `--motion-slow 300ms`
  (panels) · `--motion-reveal 600ms` (scroll entrance fades).
- Easing (Clerk's curves, ratified §0): `--ease-out: cubic-bezier(0.4, 0.36, 0, 1)` is the
  default for everything — Tailwind's base transition is wired to it, so a bare
  `transition` settles on the one curve. `--ease-emphasized: cubic-bezier(0.33, 1, 0.68, 1)`
  for entrance reveals. `--ease-spring` exists for rare accent moments; overshoot on more
  than one element per viewport reads as toy, so treat it as a scalpel.
- Only `opacity`, `transform`, `color`, `border-color` transition.
- Entrances: fade + ≤ 8px rise, fire **once**, max **4** staggered siblings, stagger from
  the `--stagger-step` token — never a hand-typed delay in a component.
- `prefers-reduced-motion: reduce` → transforms removed, opacity fades ≤ 80ms or none.
  Every animated component must honor it; this is not optional and is a11y-gated.
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
2. A full-dark page as the default theme. (Dark **section-bands** on a light page are the
   ratified brand rhythm — §1.2 — and are not this violation. The distinction: the page
   is light and bands punctuate it; the page is never dark end-to-end unless the visitor
   explicitly chose it.)
3. More than one accent color; accent used as decoration. The accent is `--color-accent`
   and nothing else — no second hue, no accent gradients, no tinted decorative shapes.
4. Uppercase headings or uppercase body; letter-spaced all-caps buttons. (One exception,
   already in the system: the xs mono **kicker** above a section heading may be uppercase
   with `0.04em` tracking. Headings themselves are always sentence case.)
5. Skill-badge walls, logo marquees, star-rating self-assessments ("Python ★★★★★"),
   and **client-logo walls of companies you have not worked for**. A stack display is
   permitted only if it is: text/hairline (no logos), non-looping, keyboard-irrelevant
   (decorative, `aria-hidden` with a real text list behind it), and honest about what it
   claims — "tools I use," never "companies I work with."
6. Card grids as the *default* layout. A card grid is allowed where the content is
   genuinely parallel and enumerable (a work index, a capability set) — never two grids
   in a row, and never as a substitute for a real section with a point to make (§4 tempo
   still governs).
7. Typing animations, particle/mesh/grid backgrounds, spotlight cursors, tilt cards.
8. Scroll-jacking, parallax, autoplaying video **with sound or without a pause control**,
   looping ambient animation. Muted, captioned product demos are permitted as evidence;
   they must not autoplay above the fold and must be pausable (WCAG 2.2.2).
9. Stock imagery, 3D blobs, emoji in headings/UI chrome.
10. Vague superlatives in copy; any metric without a method footnote.
11. Center-aligned long-form text; measures > 75ch.
12. **Invented or placeholder social proof** — testimonials, quotes, client names, or
    logos that are not real and permissioned. A "sample layout" label does not cure it;
    if it isn't real, it doesn't ship. (Reinforces PROJECT_CHARTER "honesty over hype".)
13. Anything whose only justification is "looks impressive."

Litmus test for every screen: *would this look at home inside excellent technical
documentation?* If not, simplify.
