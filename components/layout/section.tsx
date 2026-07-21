import type { ReactNode } from "react";
import { Container } from "./container";

/**
 * Section — vertical rhythm primitive. `tone` drives the light/dark section
 * rhythm (DESIGN §4). `invert` is a full dark band (Clerk-style): it scopes the
 * dark colour tokens locally so all child components adapt, adds a faint
 * technical texture, and (with `notch`) a graded light↔dark transition edge.
 *
 * Props:
 * - `space` (sm|md|lg) — vertical padding. Pick per section so ADJACENT sections
 *   don't both spend `lg` and stack into a 400px void; `lg` is for the page's
 *   bookends (hero, final close), `md` is the body default, `sm` joins two bands
 *   that belong together.
 * - `tone` (page|subtle|invert)
 * - `wash` — ambient accent radial behind the band (globals.css `.wash`, which
 *   self-adjusts under `.tone-invert`). Use it to give depth to the hero and the
 *   dark bands; NOT on every section — alternating flat/washed is what reads as
 *   rhythm rather than haze.
 * - `aurora` — the multi-hue hero gradient (globals.css `.aurora`): a wide
 *   violet→warm→cyan radial anchored ABOVE the top edge. It is an ALTERNATIVE to
 *   `wash`, never a layer on top of it — both paint an accent radial from the
 *   same corner, so setting both double-paints the same light and the hero goes
 *   muddy. Reserved for a page's opening band.
 * - `notch` (graded edge, defaults on for invert), `bleed`, `id`, `ariaLabel`,
 *   `className`.
 *
 * A11y: `wash` and `aurora` are decorative background paint only — they carry no
 * meaning and are exposed to no assistive technology. Their intensity is
 * tokenised and kept low precisely because body copy sits on top of them; the
 * a11y gate audits contrast on every route in both themes.
 *
 * Performance: all three decorative layers (texture, notch, wash) are painted by
 * the section itself — two pseudos and a background-image, no extra DOM, no
 * client boundary. Nothing here animates.
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
  wash = false,
  aurora = false,
  bleed = false,
  id,
  ariaLabel,
  className = "",
  children,
}: {
  space?: "sm" | "md" | "lg";
  tone?: "page" | "subtle" | "invert";
  notch?: boolean;
  wash?: boolean;
  aurora?: boolean;
  bleed?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const notched = (notch ?? tone === "invert") ? "tone-notch" : "";
  // Mutually exclusive by construction, not by convention: `aurora` wins if a
  // caller passes both, so the two accent radials can never stack.
  const washed = aurora ? "aurora" : wash ? "wash" : "";
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative ${SPACE[space]} ${TONE[tone]} ${notched} ${washed} ${className}`}
    >
      {bleed ? children : <Container className="relative">{children}</Container>}
    </section>
  );
}
