import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./pill.module.css";

const VARIANT = {
  outline: styles.chipOutline,
  raised: styles.chipRaised,
  soft: styles.chipSoft,
} as const;

/**
 * Chip — a neutral pill for tags, citations and sample questions (prototype
 * `.cite span`, `.chiprow span`). For a status, use `StatusPill`.
 *
 * Props:
 * - `variant` — `outline` (default, a hairline), `raised` (white with the card
 *   shadow, the marquee chips) or `soft` (a sunken fill).
 * - `size` — `sm` (default, 12.5px) or `md` (14px, the marquee chips).
 * - `mono` — set the label in Geist Mono (questions, commands, code).
 * - `dot` — a small violet dot before the label.
 * - `icon` — a 14px icon before the label (decorative; pass `aria-hidden`).
 * - `as` — the element (default `span`; `li` inside a list).
 *
 * Adapts to dark grounds through the colour tokens. A11y: plain text; not
 * interactive (a filter is a button with `aria-pressed`, owned by its page).
 */
export function Chip({
  variant = "outline",
  size = "sm",
  mono = false,
  dot = false,
  icon,
  as: Tag = "span",
  className,
  children,
}: {
  variant?: keyof typeof VARIANT;
  size?: "sm" | "md";
  mono?: boolean;
  dot?: boolean;
  icon?: ReactNode;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cx(
        styles.pill,
        styles.chip,
        styles[size],
        VARIANT[variant],
        mono && styles.mono,
        dot && styles.dot,
        dot && styles.chipDot,
        className,
      )}
    >
      {icon}
      {children}
    </Tag>
  );
}
