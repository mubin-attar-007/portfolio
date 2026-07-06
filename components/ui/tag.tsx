import type { ReactNode } from "react";

/**
 * Tag — xs mono metadata chip. Metadata only, never a skills wall (DESIGN §9).
 * A11y: presentational text; wrap a group in a labelled list if it conveys a set.
 */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-border px-2 py-0.5 font-mono text-xs text-ink-secondary">
      {children}
    </span>
  );
}
