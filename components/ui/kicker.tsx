import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";

const TONE = {
  accent: "text-accent",
  cyan: "text-plate-cyan",
  ink: "text-ink",
} as const;

/**
 * Kicker — the short line above a title (prototype `.kicker`): 14px, medium,
 * violet. On a dark plate or page it turns the plate violet by itself.
 *
 * Props: `tone` — `accent` (default); `cyan` for a second voice on DARK grounds
 * only (10.6:1 there, unreadable on light); `ink` for a neutral kicker. `as`
 * sets the element (default `p`). No outer margin: `PageHeader` and
 * `SectionHeader` space it, or pass `className="mb-4"` (the prototype's 16px).
 *
 * A11y: plain text, never a heading, so it stays out of the outline.
 */
export function Kicker({
  tone = "accent",
  as: Tag = "p",
  className,
  children,
}: {
  tone?: keyof typeof TONE;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cx("text-kicker", TONE[tone], className)}>{children}</Tag>;
}
