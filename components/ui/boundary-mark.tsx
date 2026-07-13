/**
 * BoundaryMark — the personal logomark: a checkmark set inside a bracket pair
 * ("[✓]") — the validated, fail-closed boundary that is the through-line of the
 * work: a deterministic gate drawn *around* the thing it guards. Pure monochrome
 * line-art that inherits `currentColor`, so it stays on the single-accent budget
 * and adapts to light/dark bands. Reused as the wordmark prefix and the favicon
 * (app/icon.svg), and available as the section marker for safety content.
 *
 * @param size  edge length in px (default 18)
 * @param className  utility classes (e.g. a `text-*` color)
 * A11y: decorative by default (`aria-hidden`) — the adjacent wordmark text
 * carries the accessible name; never the sole label for an interactive control.
 */
export function BoundaryMark({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {/* left + right brackets — the boundary */}
      <path d="M9 4H6v16h3" />
      <path d="M15 4h3v16h-3" />
      {/* the check it guards — validated, fail-closed */}
      <path d="m9.5 12.2 1.9 2 3-3.9" />
    </svg>
  );
}
