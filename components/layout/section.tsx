import type { ReactNode } from "react";
import { Container } from "./container";

/**
 * Section — vertical rhythm primitive. Alternating `tone` drives the
 * "adjacent sections must differ" tempo rule (DESIGN §4).
 * Props: `space` (sm|md|lg section rhythm), `tone` (page|subtle background),
 * `bleed` (skip the inner Container), `id`, `aria-label`, `className`.
 * A11y: renders a <section>; pass `aria-label`/`aria-labelledby` when it needs a name.
 */
const SPACE: Record<"sm" | "md" | "lg", string> = {
  sm: "py-[var(--space-section-sm)]",
  md: "py-[var(--space-section-md)]",
  lg: "py-[var(--space-section-lg)]",
};

export function Section({
  space = "md",
  tone = "page",
  bleed = false,
  id,
  ariaLabel,
  className = "",
  children,
}: {
  space?: "sm" | "md" | "lg";
  tone?: "page" | "subtle";
  bleed?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`${SPACE[space]} ${tone === "subtle" ? "bg-bg-subtle" : "bg-bg"} ${className}`}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
