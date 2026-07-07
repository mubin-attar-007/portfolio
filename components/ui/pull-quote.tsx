import type { ReactNode } from "react";

/**
 * PullQuote — the ONLY place the serif (Newsreader, italic) appears (DESIGN
 * §1.3). Essays only. A11y: real <blockquote>/<cite>.
 */
export function PullQuote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <blockquote className="my-8 border-l-[length:var(--stripe-width)] border-border-strong pl-6">
      <p className="font-serif text-2xl italic text-ink">{children}</p>
      {cite ? (
        <cite className="mt-2 block font-sans text-sm not-italic text-ink-tertiary">— {cite}</cite>
      ) : null}
    </blockquote>
  );
}
