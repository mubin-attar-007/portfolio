import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";

/**
 * TextLink — the site's ONE "read more" affordance: a small bold label with a
 * tight right-pointing chevron that nudges forward on hover.
 *
 * Why it exists: the same `group inline-flex … ArrowRight … group-hover:translate-x-0.5`
 * block had been retyped in nine places, which meant nine chances for the size,
 * the stroke weight, the gap and the nudge distance to drift apart. One component
 * makes the affordance recognisable — a visitor learns it once and reads it
 * everywhere — and makes retuning it a one-file change.
 *
 * Props:
 * - `href` — destination (a route, or an absolute URL when `external`).
 * - `tone` — `accent` (default) for the primary continue-reading link, `quiet`
 *   for a secondary link that must not spend the band's accent budget (DESIGN §9
 *   caps accent at two elements per viewport, and a section kicker on a dark band
 *   already claims one).
 * - `external` — renders a plain `<a target="_blank">` with an outward arrow
 *   instead of the forward chevron, because the destination leaves the site.
 * - `className` — layout only (margins); never colour or type.
 *
 * A11y: a real link with its label as the accessible name; the glyph is
 * decorative (`aria-hidden`) so it is never announced. Colour is not the only
 * signal — the chevron and the bolder weight distinguish it from body copy, and
 * focus uses the global focus ring. External links carry `rel="noopener
 * noreferrer"` and the arrow glyph is the conventional "opens a new tab" cue.
 *
 * Motion: colour and transform only, at `--motion-fast` (Clerk's dominant
 * interaction duration). The global `prefers-reduced-motion` rule collapses both
 * transitions, so the nudge disappears without a per-component guard.
 */
const TONE: Record<"accent" | "quiet", string> = {
  accent: "text-accent hover:text-accent-hover",
  quiet: "text-ink-secondary hover:text-ink",
};

export function TextLink({
  href,
  tone = "accent",
  external = false,
  className = "",
  children,
}: {
  href: string;
  tone?: "accent" | "quiet";
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  // A NAMED group: these links sit inside cards that are themselves `group`,
  // and an unnamed `group-hover` would fire from the card's hover instead of
  // the link's — the nudge has to mean "you are on the link".
  // `w-fit` is load-bearing, not decoration. A flex item is blockified, so
  // `inline-flex` computes to `flex` and the default `align-items: stretch`
  // makes the link fill the cross axis — inside a COLUMN flex parent
  // (SectionHeading's left-aligned stack, the measured strip below `sm`) the hit
  // area silently spanned the whole 62ch column. `w-fit` pins it to its content
  // and is a no-op in row-flex and block contexts, where the link already
  // shrink-wraps.
  const classes = `group/link inline-flex w-fit items-center gap-1 text-sm font-medium transition-colors duration-fast ease-[var(--ease-out)] ${TONE[tone]} ${className}`;
  const Glyph = external ? ArrowUpRight : ChevronRight;
  const body = (
    <>
      {children}
      <Glyph
        size={14}
        strokeWidth={2.25}
        aria-hidden
        className={`transition-transform duration-fast ease-[var(--ease-out)] ${
          external
            ? "group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            : "group-hover/link:translate-x-0.5"
        }`}
      />
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {body}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {body}
    </Link>
  );
}
