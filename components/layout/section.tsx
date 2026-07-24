import type { ReactNode } from "react";
import { Container } from "./container";

/**
 * Section — vertical rhythm primitive. `tone` drives the light/dark section
 * rhythm (DESIGN §4). `invert` is a full dark band: it scopes the dark colour
 * tokens locally so every child component adapts.
 *
 * Props:
 * - `space` (sm|md|lg) — vertical padding. Pick per section so ADJACENT sections
 *   don't both spend `lg` and stack into a 400px void; `lg` is for the page's
 *   bookends (hero, final close), `md` is the body default, `sm` joins two bands
 *   that belong together.
 * - `tone` (page|subtle|invert)
 * - `notch` (graded edge, defaults on for invert), `bleed`, `id`, `ariaLabel`,
 *   `className`.
 *
 * Accent gradients, texture grids, and decorative glows are intentionally not
 * available here; hierarchy comes from type, spacing, flat tone changes, and
 * hairlines (DESIGN §9).
 */
/**
 * Vertical rhythm is ASYMMETRIC, matching clerk.com's measured bands: 128px
 * above, 172px below. Two equal paddings make adjacent sections pool into one
 * undifferentiated gap — the extra weight underneath is what closes a section
 * off, so each band reads as a finished plate rather than as content floating
 * between two voids. The hero inverts this (heavier above than below) and sets
 * its own bottom padding at the call site.
 */
const SPACE: Record<"sm" | "md" | "lg", string> = {
  sm: "pt-[var(--space-section-sm)] pb-[var(--space-section-md)]",
  md: "pt-[var(--space-section-md)] pb-[var(--space-section-md-end)]",
  lg: "pt-[var(--space-section-lg)] pb-[var(--space-section-lg-end)]",
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
