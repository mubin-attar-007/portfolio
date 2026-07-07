import type { ReactNode } from "react";

/**
 * Card (quiet) — surface bg, 1px border, radius-md, 24px padding. Hover only
 * shifts the border to strong (title→accent handled by the caller with
 * `group`/`group-hover:text-accent`). NO lift, NO glow, NO scale (DESIGN §3/§9).
 * A11y: presentational container; if the whole card is a link, wrap in <a> and
 * keep a single tab stop.
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
      className={`rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] transition-colors hover:border-border-strong ${className}`}
    >
      {children}
    </Tag>
  );
}
