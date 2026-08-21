import type { ReactNode } from "react";

/**
 * EyebrowChip — the section eyebrow as a small bordered pill with a live dot,
 * replacing the bare mono caption on the homepage's major sections.
 *
 * This is one of the details that separates a flagship page from a tidy one:
 * a floating caption says "here is a label", a chip says "this section is a
 * component of a designed system". The dot carries the accent so the text can
 * stay readable secondary ink — the accent budget is spent on one 6px circle,
 * not a whole line of violet capitals.
 *
 * Works on both light and dark bands unchanged: every colour is a token that
 * `.tone-invert` re-scopes.
 *
 * A11y: presentational text — the heading it introduces carries the outline.
 * The dot is aria-hidden.
 */
export function EyebrowChip({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] border border-border bg-surface py-1 pl-2.5 pr-3 font-mono text-xs uppercase tracking-[0.07em] text-ink-secondary shadow-[var(--shadow-sm)]">
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-[var(--radius-pill)] bg-accent shadow-[0_0_6px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]"
      />
      {children}
    </p>
  );
}
