# ADR-002 — Tailwind CSS v4 with CSS-first design tokens

Status: Accepted. Facts updated 2026-11-13 to match the code.

## Context
`design-system.md` demands a strict token system: no hardcoded colors/spacing anywhere,
themable (light default + dark preference), and a future redesign without rewriting
components.

## Decision
Tailwind v4 `@theme` in `styles/tokens.css` defines every token as CSS custom
properties; components use utilities, token-reading arbitrary values
(`rounded-[var(--radius-sm)]`), or `var()` in a CSS module. The site is light-only
(ADR-018); a dark plate, a dark page and the chrome of a dark page re-declare the same
custom properties in one remap block (`.tone-invert`, `[data-surface="dark"]`) —
components never know which surface they are on.

## Alternatives considered
- **CSS Modules + vanilla-extract** — great type-safety, more ceremony, slower iteration solo.
  (Plain CSS modules are still used for section-specific composition, reading tokens via `var()`.)
- **Styled-components/emotion** — runtime cost, against the performance budget.
- **shadcn/ui wholesale** — component styles imported wholesale would fight the design
  system; every visual decision is owned here, with no component-library dependency.

## Consequences
No lint rule enforces "no raw values" (`[#hex]`, `[13px]`) outside `tokens.css`; code
review does, and the recorded exceptions are listed in design-system.md §11.1.
