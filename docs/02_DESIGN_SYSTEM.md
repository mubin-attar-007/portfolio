# Design system

`styles/tokens.css` is the source of truth. Tailwind v4 exposes the `@theme`
tokens as utilities and the same values remain available through CSS custom
properties.

Reference token names, never copied values. If the system does not express a
needed value, add or revise a token instead of creating a one-off.

## Direction

The brand is calm, light, typography-first, and evidence-led. Hierarchy comes
from type, space, flat tone changes, and hairlines.

The non-negotiable visual exclusions in `spec/DESIGN.md` §9 apply everywhere:

- no gradient text, glow, glassmorphism, spotlight cursor, texture grid, or
  decorative accent shape;
- no hover lift, scale, or shadow on cards;
- no typing, marquee, parallax, or looping ambient animation;
- no badge wall or card grid used as a substitute for editorial structure.

## Color

Light is the default. Dark is an explicit visitor preference on
`:root[data-theme="dark"]`.

| Token | Role |
| --- | --- |
| `--color-bg` | Page background |
| `--color-bg-subtle` | Alternate flat section band and inline code |
| `--color-surface` | Cards, panels, figures, code |
| `--color-ink` | Primary text |
| `--color-ink-secondary` | Supporting text |
| `--color-ink-tertiary` | Metadata and captions |
| `--color-border` | Hairlines |
| `--color-border-strong` | Inputs and emphasized dividers |
| `--color-accent` | Links, one primary action, active state, focus |
| `--color-positive` | Verified positive status or delta |
| `--color-negative` | Verified negative status or delta |
| `--color-warning` | Caution state |

Rules:

- One accent hue. Links plus at most one leading accent action/state per
  viewport.
- Status colors carry meaning only.
- Every foreground/background pair must pass WCAG AA.
- Static surfaces use flat token colors. Accent is not background decoration.

## Section bands

`components/layout/section.tsx` owns the page rhythm:

| `tone` | Result |
| --- | --- |
| `page` | Default light page |
| `subtle` | Quiet flat background step |
| `invert` | Dark band with locally scoped tokens |

`.tone-invert` changes the token scope so child components adapt without reading
the theme. A dark band is a structural tempo change, not a gradient or texture.

## Typography

| Token | Family | Use |
| --- | --- | --- |
| `--font-sans` | Geist Sans | UI, body, headings |
| `--font-mono` | Geist Mono | Code, metrics, metadata, kickers |
| `--font-serif` | Newsreader | Rare italic pull quote |

- Headings are sentence case and generally weight 550–600.
- Body measure is `--width-prose` (68ch).
- Page container is `--width-container` (1120px).
- Metrics use mono tabular numerals and link to a method section.
- Kicker text is quiet metadata; it does not spend the accent budget.

## Spacing

Section rhythm is fluid:

| Token | Range |
| --- | --- |
| `--space-section-sm` | 64 → 96px |
| `--space-section-md` | 96 → 128px |
| `--space-section-lg` | 128 → 176px |

The homepage intentionally uses a shorter editorial tempo than the old
demonstration-heavy version: hero, proof, flagship, selected systems, principles,
writing, now, contact.

## Radius and borders

| Token | Use |
| --- | --- |
| `--radius-sm` | Tags and inline code |
| `--radius-md` | Cards, inputs, buttons |
| `--radius-lg` | Figures and true overlays |
| `--stripe-width` | Callout left rule |

The values are 4 / 8 / 12px. Nothing becomes a pill except a genuinely circular
status marker or avatar. Borders and background steps provide the default depth.

## Elevation

Static content stays flat. The shadow tokens exist for elements that genuinely
float:

| Token | Use |
| --- | --- |
| `--shadow-overlay` | Mobile menu and assistant dialog |
| `--shadow-lg` | Overlay implementation token |
| `--shadow-sm`, `--shadow-md` | Reserved compatibility tokens; not card styling |

Buttons, cards, diagrams, figures, and the sticky header do not gain decorative
shadows.

## Motion

Motion is short and interaction-triggered:

- `--motion-fast`: micro feedback;
- `--motion-base`: ordinary state change;
- `--motion-slow`: panel state change;
- `--ease-out`: shared curve;
- `--motion-reduced`: global reduced-motion collapse.

Content paints immediately. There is no root scroll observer, entrance staging,
typing effect, or looping diagram motion. Transitions are limited to color,
border-color, opacity, and small control transforms where they communicate state.

## Core components

| Component | Contract |
| --- | --- |
| `ui/button.tsx` | Flat primary, bordered secondary, text ghost |
| `ui/card.tsx` | Flat surface + border + radius-md |
| `ui/metric.tsx` | Mono value, label, delta, linked method |
| `ui/page-header.tsx` | Shared immediate-paint route header |
| `layout/section.tsx` | Tone and vertical rhythm |
| `layout/header.tsx` | Solid sticky bar, no blur or pill shell |
| `layout/mobile-nav.tsx` | Compact modal menu with explicit Close |
| `diagrams/system-diagram.tsx` | Flat nodes; mobile staged map; keyboard navigation |

Only one primary action should lead a viewport. A `next/link` may use
`buttonVariants()` without nesting a button.

## Layering

| Layer | Value |
| --- | --- |
| Sticky header | `z-40` |
| Assistant and mobile-menu overlays | `z-50` |

## Focus and accessibility

The global `:focus-visible` ring is mandatory. Interactive targets need an
accessible name, visible keyboard state, and practical touch size. Mobile dialogs
trap and restore focus, close on Escape, lock document scroll, and honor reduced
motion.
