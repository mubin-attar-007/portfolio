import type { ReactNode } from "react";

/**
 * Card — an elevated product surface: `bg-surface`, a 1px border, `radius-md`,
 * 24px padding, and the layered `--shadow-surface` depth. Interactive cards lift
 * a hair and brighten on hover (a crisp, fast transition — reduced-motion-safe).
 *
 * Props:
 * - `as` — the rendered element (`div` | `article` | `li`). Default `div`.
 * - `interactive` — whether to add the hover lift (default true).
 * - `className` — extra classes, applied last.
 *
 * A11y: presentational container. If the whole card is a link, render the link
 * as the card (or wrap it) and keep a single tab stop.
 */
export function Card({
  as: Tag = "div",
  interactive = true,
  className = "",
  children,
}: {
  as?: "div" | "article" | "li";
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const hover = interactive
    ? "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-surface-hover)]"
    : "";
  return (
    <Tag
      className={`rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-surface)] transition-[box-shadow,transform,border-color] duration-fast ease-[var(--ease-out)] ${hover} ${className}`}
    >
      {children}
    </Tag>
  );
}
