import type { ReactNode } from "react";

/**
 * BeforeAfter — side-by-side v1 vs v2 (or old vs new). Stacks on mobile.
 * A11y: each panel is labelled; meaning is carried by the "Before"/"After"
 * headings, not colour.
 */
export function BeforeAfter({
  before,
  after,
  label,
}: {
  before: ReactNode;
  after: ReactNode;
  label?: string;
}) {
  return (
    <div className="my-6">
      {label ? <p className="mb-2 font-mono text-xs uppercase text-ink-tertiary">{label}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-border bg-bg-subtle p-4">
          <p className="mb-2 font-mono text-xs uppercase text-ink-tertiary">Before</p>
          <div className="text-sm text-ink-secondary">{before}</div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
          <p className="mb-2 font-mono text-xs uppercase text-ink-tertiary">After</p>
          <div className="text-sm text-ink">{after}</div>
        </div>
      </div>
    </div>
  );
}
