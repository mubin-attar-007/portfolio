import type { ReactNode } from "react";

/**
 * Card — the quiet surface: `bg-surface`, a 1px border, `radius-md`, 24px
 * padding. Genuinely flat at rest — no shadow, no lift, no glow, no scale.
 *
 * THE RULE THIS COMPONENT ENFORCES: **elevation signals interactivity.** Shadow,
 * hover-lift and the pointer spotlight are the site-wide vocabulary for "this
 * whole surface does something when you click it". A static card that rises when
 * you point at it is a lie about affordance, and it also devalues the signal on
 * the cards that really are links. So depth is opt-in, never the default.
 *
 * Props:
 * - `as` — the rendered element (`div` | `article` | `li`). Default `div`.
 * - `interactive` — set ONLY when the whole card is a single link/button. Adds
 *   a resting `shadow-sm` plus the shared `.lift` + `.spotlight` utilities from
 *   styles/globals.css. Does NOT make the card clickable by itself: the caller
 *   still wraps or renders the link.
 * - `className` — extra classes, applied last.
 *
 * A11y: presentational container. If the whole card is a link, render the link
 * as the card (or wrap it) and keep a single tab stop. `.lift` triggers on
 * `:focus-within` as well as `:hover`, so keyboard users get the same
 * affordance. `.spotlight` is decorative, exposed to no assistive technology.
 *
 * Performance: `.spotlight` only lights when a <Spotlight> ancestor is feeding
 * it `--mx`/`--my`; without one it costs a single never-painted pseudo-element.
 * Both utilities are `prefers-reduced-motion` gated in CSS.
 */
export function Card({
  as: Tag = "div",
  interactive = false,
  className = "",
  children,
}: {
  as?: "div" | "article" | "li";
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const depth = interactive ? "lift spotlight shadow-[var(--shadow-sm)]" : "";
  return (
    <Tag
      className={`rounded-[var(--radius-md)] border border-border bg-surface p-6 transition-colors hover:border-border-strong ${depth} ${className}`}
    >
      {children}
    </Tag>
  );
}
