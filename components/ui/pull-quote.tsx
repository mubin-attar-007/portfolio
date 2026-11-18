import type { ReactNode } from "react";

/**
 * PullQuote — the essay's one emphasised line: Geist at the sub-heading size,
 * set tight, on a violet rule. Essays only.
 *
 * A11y: a real `<blockquote>`, with `<cite>` for the attribution.
 */
export function PullQuote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <blockquote className="my-10 max-w-[var(--width-prose)] border-l-2 border-accent pl-6">
      <p className="text-[1.375rem] leading-[1.45] font-medium tracking-[-0.015em] text-balance text-ink">
        {children}
      </p>
      {cite ? (
        <cite className="mt-3 block text-sm not-italic text-ink-tertiary">{cite}</cite>
      ) : null}
    </blockquote>
  );
}
