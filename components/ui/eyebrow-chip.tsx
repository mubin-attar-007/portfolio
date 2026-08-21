import type { ReactNode } from "react";

/**
 * EyebrowChip — the section eyebrow, in the reference's two registers.
 *
 * `text` (the default) is what clerk.com actually sets over every section,
 * light or dark: a plain sentence-case accent line — no mono, no uppercase,
 * no chrome. Measured off the reference crops ("User authentication",
 * "Multi-tenancy"), where an earlier version of this component guessed at
 * mono caps and a bordered pill and read as a stamped template.
 *
 * `pill` survives in exactly one place — the hero identity badge — where a
 * floating caption over the aurora needs its own surface.
 *
 * Mono uppercase remains the register for sub-block labels (`LABEL` in
 * constants/page.ts), matching the reference's own split: their accordion
 * category rows are caps, their section eyebrows are not.
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
      <p className="inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] border border-border bg-surface py-1 pl-2.5 pr-3 text-xs font-medium tracking-[0.01em] text-ink-secondary shadow-[var(--shadow-sm)]">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-[var(--radius-pill)] bg-accent shadow-[0_0_6px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]"
        />
        {children}
      </p>
    );
  }
  return <p className="w-fit text-[0.8125rem] font-medium text-accent">{children}</p>;
}
