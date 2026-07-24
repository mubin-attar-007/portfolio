import type { ReactNode } from "react";

/**
 * Card — the quiet surface: `bg-surface`, a 1px border, `radius-md`, 24px
 * padding. Genuinely flat at rest — no shadow, no lift, no glow, no scale.
 *
 * Props:
 * - `as` — the rendered element (`div` | `article` | `li`). Default `div`.
 * - `className` — extra classes, applied last.
 *
 * A11y: presentational container. If the whole card is a link, render the link
 * as the card (or wrap it) and keep a single tab stop.
 */
export function Card({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "article" | "li";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={`rounded-[var(--radius-md)] border border-border bg-surface p-6 transition-colors hover:border-border-strong ${className}`}
    >
      {children}
    </Tag>
  );
}
