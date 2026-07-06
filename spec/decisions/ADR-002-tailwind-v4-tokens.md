# ADR-002 — Tailwind CSS v4 with CSS-first design tokens

Status: Accepted

## Context
DESIGN.md demands a strict token system: no hardcoded colors/spacing anywhere, themable
(light default + dark preference), and a future redesign without rewriting components.

## Decision
Tailwind v4 `@theme` in `src/styles/tokens.css` defines every token as CSS custom
properties; components use utilities only. Dark theme = overriding custom properties
under `[data-theme="dark"]` — components never know which theme they're in.

## Alternatives considered
- **CSS Modules + vanilla-extract** — great type-safety, more ceremony, slower iteration solo.
- **Styled-components/emotion** — runtime cost, against the performance budget.
- **shadcn/ui wholesale** — component styles imported wholesale would fight DESIGN.md;
  we take its patterns (Radix primitives where needed) but own every visual decision.

## Consequences
A lint rule / review check enforces "no arbitrary values" (`[#hex]`, `[13px]`) outside tokens.css.
