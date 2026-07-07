import type { ReactNode } from "react";
import { Container } from "./container";

/**
 * Section — vertical rhythm primitive. `tone` drives the light/dark section
 * rhythm (DESIGN §4). `invert` is a full dark band (Clerk-style): it scopes the
 * dark colour tokens locally so all child components adapt, adds a faint
 * technical texture, and (with `notch`) an angular light↔dark transition edge.
 * Props: `space` (sm|md|lg), `tone` (page|subtle|invert), `notch` (angular edge,
 * defaults on for invert), `bleed`, `id`, `aria-label`, `className`.
 */
const SPACE: Record<"sm" | "md" | "lg", string> = {
  sm: "py-[var(--space-section-sm)]",
  md: "py-[var(--space-section-md)]",
  lg: "py-[var(--space-section-lg)]",
};

const TONE: Record<"page" | "subtle" | "invert", string> = {
  page: "bg-bg",
  subtle: "bg-bg-subtle",
  invert: "tone-invert",
};

export function Section({
  space = "md",
  tone = "page",
  notch,
  bleed = false,
  id,
  ariaLabel,
  className = "",
  children,
}: {
  space?: "sm" | "md" | "lg";
  tone?: "page" | "subtle" | "invert";
  notch?: boolean;
  bleed?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const notched = (notch ?? tone === "invert") ? "tone-notch" : "";
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative ${SPACE[space]} ${TONE[tone]} ${notched} ${className}`}
    >
      {bleed ? children : <Container className="relative">{children}</Container>}
    </section>
  );
}
