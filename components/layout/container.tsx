import type { ElementType, ReactNode } from "react";

/**
 * Container — centres content at the --width-container measure with responsive
 * gutters (24px mobile → 32px from md, matching Clerk's page inset).
 * Purpose: the single horizontal-rhythm primitive. The width is read from the
 * token rather than restated here, so retuning the measure is a one-line change
 * in tokens.css and every page follows.
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
