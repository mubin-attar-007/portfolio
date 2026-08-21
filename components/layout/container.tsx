import type { ElementType, ReactNode } from "react";

/**
 * Container — the site's single horizontal-rhythm primitive: centres content at
 * `--width-container` (1216px) with the page gutters.
 *
 * Gutters step 20 → 24 → 32px. The 20px phone gutter is deliberate: at 360px a
 * 24px inset costs 13% of the viewport, which is what turns a two-word headline
 * line into a three-line headline. The measure itself is read from the token, so
 * retuning the page width is one line in tokens.css and every route follows.
 *
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
    <Tag
      className={`mx-auto w-full max-w-[var(--width-container)] px-5 sm:px-6 md:px-8 ${className}`}
    >
      {children}
    </Tag>
  );
}
