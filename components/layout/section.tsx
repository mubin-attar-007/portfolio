import type { ReactNode } from "react";
import { Container } from "./container";

/**
 * Section — the vertical-rhythm primitive.
 *
 * `space` picks the band's padding. Pick per section so two ADJACENT bands don't
 * both spend `lg` and stack into a dead screen: `lg` is for a page's bookends
 * (hero, closing CTA), `md` is the body default, `sm` joins two bands that
 * belong together, `xs` is half a header seam.
 *
 * The rhythm is slightly ASYMMETRIC — a little more weight below than above — so
 * a band reads as a finished plate rather than as content floating between two
 * equal voids. It is far tighter than the previous 128/172 pair, which produced
 * genuinely blank screens between sections.
 *
 * `tone="invert"` is a full dark band: it scopes the dark ramp locally
 * (`.tone-invert`, globals.css) so every token-driven child adapts with no
 * per-component dark variant. The homepage spends at most two of these.
 *
 * The old `notch` prop and its graticule seam are gone. The device drew a
 * tick-scale at every light↔dark boundary; it read as instrument chrome and
 * competed with the content it framed. A dark plate does not need a device to
 * announce that it started.
 *
 * Accent gradients, texture grids and decorative glows are intentionally not
 * available here. Hierarchy comes from type, spacing, flat tone changes and
 * hairlines; the one ambient-light treatment belongs to the three motif
 * surfaces, which own it themselves.
 */
const SPACE: Record<"xs" | "sm" | "md" | "lg", string> = {
  xs: "pt-[var(--space-section-xs)] pb-[var(--space-section-xs)]",
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
  bleed = false,
  id,
  ariaLabel,
  ariaLabelledBy,
  className = "",
  children,
}: {
  space?: "xs" | "sm" | "md" | "lg";
  tone?: "page" | "subtle" | "invert";
  bleed?: boolean;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={`relative ${SPACE[space]} ${TONE[tone]} ${className}`}
    >
      {bleed ? children : <Container className="relative">{children}</Container>}
    </section>
  );
}
