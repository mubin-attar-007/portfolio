import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";

/**
 * Label — the mono caps tag (prototype `.label`, `.menu-label`): Geist Mono
 * 11px, medium, uppercase, 0.1em tracking. Typography, not a form `<label>`.
 * Use it sparingly — a group title in a menu, a section tag on a Careers-style
 * page — as Clerk does.
 *
 * Props: `tone` — `secondary` (default, 5.9:1 on the canvas) or `tertiary`
 * (quieter, 4.6:1); both adapt on dark grounds. `as` sets the element (default
 * `p`; use `h2`/`h3` when the label really titles a group). No outer margin.
 *
 * A11y: real text. Uppercase is a style, so screen readers read the words as written.
 */
export function Label({
  tone = "secondary",
  as: Tag = "p",
  className,
  children,
  id,
}: {
  tone?: "secondary" | "tertiary";
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={cx(
        "font-mono text-label uppercase",
        tone === "secondary" ? "text-ink-secondary" : "text-ink-tertiary",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
