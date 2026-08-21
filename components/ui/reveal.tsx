import type { ElementType, ReactNode } from "react";

/**
 * Reveal — a deliberate NO-OP, kept as the record of a decision.
 *
 * Scroll-triggered reveals were built twice and rejected twice. The
 * IntersectionObserver version hid the page body with JS and a full-page
 * capture rendered everything below the proof band blank; the CSS
 * `animation-timeline: view()` version reproduced the same blank frame in
 * stitched captures, because both patterns share one structure: content that
 * is HIDDEN until an engine drives it visible. On a portfolio whose whole
 * argument is that its evidence always renders, a hidden frame is not a motion
 * style — it is a failure mode. Clerk accepts that trade; this site's QA gates
 * (screens sweep, print, reader modes) do not.
 *
 * Entrance choreography therefore lives where it cannot lose content: the
 * load-timed `.reveal` on the hero, and per-element hover and state motion
 * everywhere else. The wrapper stays so the composition in app/page.tsx keeps
 * its seams — if a future engine makes a no-hidden-frame reveal possible, it
 * lands here without touching ten call sites.
 */
export function Reveal({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={className}>{children}</Tag>;
}
