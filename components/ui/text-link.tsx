import type { ReactNode } from "react";
import { CaretLink } from "./caret-link";

/**
 * @deprecated Use `CaretLink`. TextLink keeps its previous API so pages written
 * before the redesign render the new "go" link while they are rebuilt:
 * `tone="accent"` → CaretLink `ink`, `tone="quiet"` → `muted`, and `external`
 * opens a new tab (announced).
 *
 * Props: `href`, `tone` (`accent` | `quiet`), `external`, `className`
 * (layout only), `children`.
 * A11y: a real link whose label is its name; the caret is decorative.
 */
export function TextLink({
  href,
  tone = "accent",
  external = false,
  className,
  children,
}: {
  href: string;
  tone?: "accent" | "quiet";
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <CaretLink href={href} tone={tone === "accent" ? "ink" : "muted"} newTab={external} className={className}>
      {children}
    </CaretLink>
  );
}
