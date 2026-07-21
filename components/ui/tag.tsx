import type { ReactNode } from "react";

/**
 * Tag — xs mono metadata chip. Metadata only, never a skills wall (DESIGN §9).
 *
 * Clerk's quiet-chip treatment: a filled surface behind the hairline rather than
 * a transparent outline. On a bg / bg-subtle band that fill is what separates
 * the chip from the page (an outline alone reads as a stray rule); on a white
 * card it resolves to the card colour and the chip stays a hairline, which is
 * the intent. The letter-spacing comes from the --text-xs token, so chips track
 * the same as every other piece of mono microcopy.
 *
 * `whitespace-nowrap` because a status chip that wraps mid-label stops looking
 * like a chip.
 *
 * A11y: presentational text; wrap a group in a labelled list if it conveys a set.
 */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-0.5 font-mono text-xs text-ink-secondary">
      {children}
    </span>
  );
}
