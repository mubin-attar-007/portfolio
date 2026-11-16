# ADR-013 — The two-theme palette, adapted from openrouter.ai

Status: **Accepted**; the current palette. It changed the colour values and the
dark-theme accent of the light-first, single-accent identity then in place
(ADR-011, removed 2026-11-13 and in git history at commit `8949fdf`) — not the
layout system or the typographic scale (ADR-012). Facts checked against
`styles/tokens.css` on 2026-11-13.

## Context

The owner asked for the light and dark colour schemes to be adapted from
openrouter.ai, "carefully". As with the Clerk pass, the reference was
**inspected live** rather than eyedropped from screenshots: headless Chromium
against openrouter.ai in both `colorScheme` states, dumping every resolved
CSS custom property plus real computed values off the body, headings, cards and
the primary control (captured to `.screenshots/openrouter/`, local-only and not in
the repository).

## What the measurement showed

Their architecture is the part worth copying, and it is more disciplined than
what we had:

- **One ink per theme.** `#03080a` (a near-black with a faint cyan cast) and
  `#fcfcfe` (a near-white with a faint blue cast). The two themes are literal
  mirrors: light is ink-on-paper, dark is paper-on-ink.
- **The whole neutral ramp is alpha overlays of the opposite colour** —
  `--slate-2` through `--slate-11` are just `#03080a` at 2%…69% in light and
  `#fcfcfe` at 2%…63% in dark. That single rule is why their two themes read as
  one system rather than as a palette and its inversion.
- **Cards sit brighter than the page** in light (`#ffffff` on `#fcfcfe`) and
  one step lighter in dark (`#080d0f` on `#03080a`).
- **The accent switches by theme**: violet `#7624f4` in light, lime `#c8ff00`
  in dark, both at 6px radius / 44px height.

| Measured | Adopted as |
|---|---|
| `--slate-1` `#fcfcfe` / `#03080a` | `--color-bg` / `--dark-bg` |
| `--slate-3` resolved | `--color-bg-subtle` `#f4f4f6` / `--dark-bg-subtle` |
| card ground | `--color-surface` `#ffffff` / `--dark-surface` `#080d0f` |
| `--slate-12` | `--color-ink` `#03080a` / `--dark-ink` `#fcfcfe` |
| ramp @69% / @63% | `--color-ink-secondary` `#505456` / `--dark-ink-secondary` `#9fa1a3` |
| `--slate-6` / `--slate-7` resolved | `--color-border` / `--color-border-strong` |
| light primary `#7624f4` | `--color-accent` |
| dark primary `#c8ff00` | `--dark-accent-theme` |
| `--blue-*` family | `--color-ambient` `#035ade` |

## Decisions

1. **Alpha overlays are resolved to flat hex.** Our tokens feed `color-mix()`
   and gradients that need a real colour, and — measured — their tier-9/10
   (44% alpha) lands at **3.1:1**, which is a placeholder tier, not a body-text
   tier. Our `ink-tertiary` carries 12px mono microcopy, so it takes their ramp
   at ~60% instead: 5.3:1 light, 5.2:1 dark.
2. **Their violet replaces ours, and it is an upgrade.** `#7624f4` measures
   6.2:1 as text on the page against our previous `#6552f0` at 4.9:1, and
   carries the near-white at the same 6.2:1 as a fill.
3. **Two dark accents, because the accent is a property of the THEME, not the
   surface.** A dark BAND inside the light page (`.tone-invert`) keeps the
   lifted violet: those bands are part of the light theme's scroll, and a lime
   button inside one under a violet button above it would read as two brands on
   one page. The lime applies only when the whole document is dark.
4. **The dark theme is single-accent lime. Superseded — see below.**

   *Originally decided:* lime rationed to ACTION, violet kept as the DISPLAY
   voice — lime on buttons, links and active state; the violet gradient on the
   hero accent line, so the two-line headline device stayed continuous across
   themes. The reasoning was that the reference does the same (their `h1` is
   `#fcfcfe`, lime reserved for the primary control and the logomark), and that
   lime on a display line reads acid.

   *Overruled by the owner*, who pointed at the dark hero and the dark
   "Engineered reliability" band and said the violet should not be there. That
   is the correct call and the reasoning above was too clever: a visitor does
   not experience a colour as "the display voice" — they experience two
   different brand colours on one screen. A theme gets one accent.

   So in dark, `--color-accent` resolves to the lime for **everything**,
   gradients and display lines included. The violet survives in exactly one
   place, and it is not a second accent: `--dark-accent-band` is what a dark
   `.tone-invert` band uses **inside the light page**, where the document accent
   is still violet and a lime button under a violet button above it would be the
   same defect in the other direction.

   The defect was invisible to every gate we had — axe checks contrast, the
   screens sweep checks overflow, and neither notices a stray hue. That is why
   `scripts/theme-audit.mjs` (`npm run test:hue`) exists: it walks 14 routes per
   theme and fails on any computed colour outside that theme's accent family.
   Dark allows 55–100° only.
5. **The ambient wash stays cool in dark.** A lime glow behind a lime button is
   muddy, and the reference's dark page runs no coloured wash at all — in dark,
   both `--glow-*` tokens use the ambient blue only. (No component currently
   renders the glow tokens.)
6. **A dark band in the full-dark theme steps UP, not down.** There is no room
   below `#03080a`; the plate reads as raised out of the page rather than sunk
   into it, which is the only direction this ground allows.

## Consequences

- Every pair was computed before shipping, not after. Light: ink 19.7:1,
  secondary 7.5:1, tertiary 5.3:1, accent 6.2:1, all statuses ≥4.9:1. Dark: ink
  19.7:1, secondary 7.8:1, tertiary 5.2:1, lime **17.0:1**, statuses ≥7.3:1.
  Band violet 8.3–8.5:1 on the band's grounds. `scripts/a11y.mjs` re-checks contrast
  across 18 routes × 2 themes × 3 viewports.
- One value was corrected by the measurement rather than by eye: the dark
  chip ground began at `#172109`, where tertiary ink fell to 4.33:1. Deepened
  to `#131b07` (4.58:1) so no component can place valid text on a valid surface
  and fail.
- The scrim and the site's own shadow tints (`--shadow-lg`, `--shadow-btn`,
  `--shadow-surface`, `--shadow-stage`, `--shadow-float`) move with the ink
  (`rgb(23 23 28)` → `rgb(3 8 10)`), because a shadow is the ink at low alpha —
  leaving the old tint would have made depth read as a different light source.
  `--shadow-sm` and `--shadow-md` keep the stacks measured off clerk.com (ADR-012).
- `lib/og.tsx`'s six satori literals move too. Satori cannot read CSS
  variables, and nothing tests their colour — a drift there ships the retired
  identity across every OG image route silently. The other palette literals are
  listed in design-system.md §11.1.
- The browser `theme-color` follows both grounds: `app/layout.tsx` declares the
  light ground and `components/features/theme-toggle.tsx` rewrites it for dark, so
  mobile browser chrome continues the page instead of drawing a seam above it.
