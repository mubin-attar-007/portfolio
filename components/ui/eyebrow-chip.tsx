import type { ReactNode } from "react";

/**
 * EyebrowChip — the section eyebrow, in the reference's two registers.
 *
 * `pill` (border + surface + glowing dot) is reserved for the hero badge and
 * the dark plates, where a floating caption would sink into the ground.
 * `text` — a bare accent mono line — is every light section's register: the
 * fidelity review found the identical pill stamped on ten sections read as a
 * template, and the reference labels its light sections with plain coloured
 * text, no chrome at all.
 *
 * A11y: presentational text; the heading it introduces carries the outline.
 */
export function EyebrowChip({
  variant = "text",
  children,
}: {
  variant?: "pill" | "text";
  children: ReactNode;
}) {
  if (variant === "pill") {
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
  return (
    <p className="w-fit font-mono text-xs uppercase tracking-[0.07em] text-accent">{children}</p>
  );
}
