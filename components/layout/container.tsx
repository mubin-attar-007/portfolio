import type { ElementType, ReactNode } from "react";

/**
 * Container — the content column: 1200px plus the gutter
 * (`clamp(16px, 3vw, 24px)`), centred; at 1440 content starts at x=120.
 * Props: `as` (default "div"), `className`. Presentational.
 */
export function Container({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[var(--width-container)] px-[var(--gutter)] ${className}`}>{children}</Tag>
  );
}
