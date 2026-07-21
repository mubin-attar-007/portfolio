# Design System

`styles/tokens.css` is the source of truth. Tailwind v4 generates its utilities
from the `@theme` block there, so a token is usable as a utility (`bg-surface`)
and as raw CSS (`var(--color-surface)`) with no config file that can drift.

**Rule: reference token names, never values.** No raw hex, px, or ms in a
component. If a value is needed that no token expresses, add the token.

---

## Color

Light is the default and renders for everyone. Dark is an opt-in override on
`:root[data-theme="dark"]`. See `13_DESIGN_DECISIONS.md`.

| Token | Role |
| --- | --- |
| `--color-bg` | Page background |
| `--color-bg-subtle` | Alternate section bands, inline code background |
| `--color-surface` | Cards, panels, code blocks |
| `--color-ink` | Primary text |
| `--color-ink-secondary` | Supporting text |
| `--color-ink-tertiary` | Metadata, captions |
| `--color-border` | Hairlines |
| `--color-border-strong` | Inputs, emphasized dividers |
| `--color-accent` | Links, primary button, active nav, focus ring |
| `--color-accent-hover` | Accent hover state |
| `--color-on-accent` | Text on an accent fill |
| `--color-accent-subtle` | Accent-tinted background (rare) |
| `--color-positive` | Improved metric |
| `--color-negative` | Regression / before-value |
| `--color-warning` | Caution callout |

Rules:

- **One accent.** `--color-accent` appears in at most two elements per viewport.
- Status colors (`positive` / `negative` / `warning`) carry meaning only. They are
  never decoration and never a second brand color.
- Every foreground/background pairing must clear WCAG AA. `--color-ink-tertiary`
  exists at a value tuned to clear 4.5:1 on both `bg` and `bg-subtle`.
- The accent hue is **settled** (`13_DESIGN_DECISIONS.md`): the Clerk-derived
  purple is the brand, by the owner's decision. Consume the token name anyway —
  three files hold the literal (`tokens.css`, `globals.css` `.tone-invert`,
  `lib/og.tsx`) and any change must touch all three together.

---

## Ambient depth

The page is never a flat slab of one colour. Four utilities carry the depth, all
token-driven and all reduced-motion safe:

| Utility | What it does | Where it belongs |
|---|---|---|
| `.wash` | soft accent radials behind a band | hero + dark bands only — alternating washed/flat IS the rhythm |
| `.spotlight` | cursor-following highlight inside a card | interactive cards only; on static prose it is a false affordance |
| `.lift` | hover raise + shadow | cards that are genuinely links |
| `.sheen` | one highlight pass across a fill | the primary button |
| `.rule-fade` | hairline that fades out at both ends | compact full-bleed strips |

Two rules that are easy to get wrong:

- **Radial placement buys intensity, not alpha.** The wash's dominant light sits
  over the imagery half, never the text column — that is what lets it be strong
  enough to see without eating `--color-ink-tertiary`'s contrast headroom. If the
  depth reads too subtle, move the radial, do not raise `--wash-strength`.
- **Elevation signals clickability.** A static content card stays flat.

---

## Section bands

The site's vertical rhythm is a light page interrupted by dark bands. Driven by
the `tone` prop on `components/layout/section.tsx`:

| `tone` | Renders |
| --- | --- |
| `page` | `--color-bg` — the default |
| `subtle` | `--color-bg-subtle` — a quiet step, no inversion |
| `invert` | `.tone-invert` — dark band |

`.tone-invert` re-declares the color tokens **locally**, so any component placed
inside adapts without knowing it is in a band. Status colors and shadows are
re-declared there too, so a `Metric` cannot render below AA inside a dark band.
`invert` also enables `.tone-notch`, the angular transition edge.

Do not build a component that reads the theme. Read tokens; the band handles it.

---

## Typography

| Token | Family | Use |
| --- | --- | --- |
| `--font-sans` | Geist Sans | UI and body |
| `--font-mono` | Geist Mono | Code, metadata lines, labels |
| `--font-serif` | Newsreader | Italic display only — essay titles, pull-quotes |

The type scale runs `--text-xs` → `--text-7xl`. Each step ships its own
line-height and, from `xl` up, its own negative letter-spacing — larger sizes
tighten, `xs` opens up (`0.04em`) for small-caps-style metadata. Use the Tailwind
size utility (`text-3xl`); the paired metrics come with it, so never set a
one-off `leading-` or `tracking-`.

Measure: `--width-prose` (68ch) for reading columns, `--width-container` (1120px)
for page width.

---

## Spacing

Section rhythm is three fluid tokens, consumed through `space` on `<Section>`:

| Token | Range |
| --- | --- |
| `--space-section-sm` | 76 → 112px |
| `--space-section-md` | 112 → 152px |
| `--space-section-lg` | 152 → 208px |

They are `clamp()` values, so vertical rhythm scales continuously with viewport
width rather than jumping at breakpoints. Everything smaller than section rhythm
uses Tailwind's default spacing scale. Breakpoints are Tailwind's defaults —
none are overridden.

---

## Radius and borders

| Token | Use |
| --- | --- |
| `--radius-sm` | Tags, inline code |
| `--radius-md` | Cards, inputs, buttons |
| `--radius-lg` | Figures, terminal frames, overlays |
| `--stripe-width` | Accent left-rule on callouts and pull-quotes |

---

## Elevation

| Token | Use |
| --- | --- |
| `--shadow-sm` | Resting card |
| `--shadow-md` | Raised / hover |
| `--shadow-lg` | Overlays, menus, dialogs |
| `--shadow-btn` | Primary button (inset top highlight + drop) |
| `--shadow-overlay` | Alias of `--shadow-lg` |
| `--drop-node` | `filter` for diagram node lift |

Each is a composite: a hairline ring, an optional inset highlight, and a soft
drop. Dark and `.tone-invert` re-declare all of them, since the light shadows
disappear against dark surfaces.

---

## Motion

| Token | Value / role |
| --- | --- |
| `--motion-fast` | Micro-feedback |
| `--motion-base` | Default for all transitions |
| `--motion-slow` | Larger state changes |
| `--motion-reveal` | Scroll entrance fade-up |
| `--ease-out` | Primary curve — smooth settle |
| `--ease-emphasized` | Reveals — gentle overshoot |
| `--ease-spring` | Accent moments — back-out overshoot |

`--default-transition-duration` and `--default-transition-timing-function` are set
from these, so every bare `transition` utility already lands on the base duration
and the primary curve. Named utilities `duration-fast` / `duration-base` /
`duration-slow` exist so a component never has to write a raw millisecond value.

**Known drift:** seven call sites still use Tailwind's numeric scale
(`duration-200`, `duration-500`) — `ui/button.tsx`, `layout/logo-link.tsx`,
`features/faq.tsx`, `features/note-list.tsx`, `features/writing-list.tsx`,
`features/capability-grid.tsx`, `app/page.tsx`. They should move to the named
utilities. Do not add new ones.

Rules:

- Animate `opacity`, `transform`, and color only.
- Every animation respects `prefers-reduced-motion`. `globals.css` collapses all
  durations under `reduce`, and any rule with a hidden start state (`.reveal`,
  `.hero-item`) is wrapped in `prefers-reduced-motion: no-preference` so it can
  never leave content invisible.
- No animation library — CSS plus one `IntersectionObserver`.

---

## Components

| Component | Variants |
| --- | --- |
| `ui/button.tsx` | `variant`: primary, secondary, ghost · `size`: sm, md, lg |
| `layout/section.tsx` | `tone`: page, subtle, invert · `space`: sm, md, lg · `notch` |
| `ui/card.tsx`, `ui/tag.tsx`, `ui/callout.tsx`, `ui/metric.tsx` | single form each |

Only one primary button per viewport. `buttonVariants()` is exported so a
`next/link` can take button styling without nesting an `<button>` in an `<a>`.

There is no input component and no badge component — `ui/tag.tsx` covers labeling.
Add either only when a real use case arrives.

---

## Layering

No z-index tokens. The stack is small enough to read literally, and stays that
way:

| Layer | Value |
| --- | --- |
| In-flow raised content | `z-10` |
| Sticky header, mobile launcher | `z-40` |
| Overlays: assistant panel, mobile nav | `z-50` |

If a fourth layer is needed, tokenize the scale rather than adding a number.

---

## Focus

`:focus-visible` uses a global accent ring defined in `globals.css`. Never remove
it and never override it per component. Every interactive element must be
keyboard operable with a visible focus state and an accessible name.
