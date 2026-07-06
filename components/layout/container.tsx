import type { ElementType, ReactNode } from "react";

/**
 * Container — centers content at the 1120px measure with responsive gutters.
 * Purpose: the single horizontal-rhythm primitive.
 * Props: `as` (element, default "div"), `className`, `children`.
 * A11y: presentational; renders whatever landmark `as` specifies.
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
    <Tag className={`mx-auto w-full max-w-[var(--width-container)] px-6 md:px-8 ${className}`}>
      {children}
    </Tag>
  );
}
