import type { ReactNode } from "react";

/**
 * CS — a case-study section: an anchored h2 and a prose column (68ch). Wider
 * evidence blocks (tables, logs, diagrams) opt out of the measure themselves.
 */
export function CS({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-14">
      <h2 id={id} className="scroll-mt-24 text-2xl text-ink">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 [&>p]:max-w-[var(--width-prose)] [&>p]:text-ink-secondary [&_strong]:font-medium [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}
