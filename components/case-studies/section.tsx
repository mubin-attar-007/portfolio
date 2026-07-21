import type { ReactNode } from "react";
import { PROSE } from "@/components/mdx/prose";

/**
 * CS — one section of a case study: an anchored heading and a prose column.
 *
 * The heading class comes from `PROSE.h2`, the SAME constant the MDX `h2`
 * renders with. Before this, an essay's `h2` and a case study's `h2` were two
 * hand-typed class strings that had already drifted apart in size and in the
 * space above them, so moving between /writing and /work felt like moving
 * between two different publications. They are now literally the same string.
 *
 * Case-study bodies are hand-authored React, not MDX, so their bare `<p>` and
 * `<strong>` elements can't be mapped through `mdxComponents`. The descendant
 * selectors below stand in for that map. Their values MIRROR `PROSE.p` and
 * `PROSE.strong` and must be changed with them — Tailwind's scanner only sees
 * literal class strings, so these cannot be derived from PROSE at runtime
 * (a generated `[&>p]:mt-4` would never be compiled into the stylesheet).
 * The vertical gap is the flex `gap-4` rather than `PROSE.p`'s `mt-4`, which is
 * the same 1rem — expressed as a gap because these children are a flex column.
 *
 * Wider evidence (diagrams, logs, tables) opts out of the measure itself by
 * being anything other than a direct `<p>` child.
 *
 * A11y: `id` makes each section deep-linkable and gives a table of contents a
 * real target; the scroll margin inside `PROSE.h2` keeps a jumped-to heading
 * clear of the sticky header. The section's own top spacing is left to the
 * heading's `mt-14` so the rhythm is identical to the MDX path — one source of
 * truth for the gap, not two that add up.
 */
export function CS({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 id={id} className={PROSE.h2}>
        {title}
      </h2>
      <div className="flex flex-col gap-4 [&>p]:max-w-[var(--width-prose)] [&>p]:leading-[1.75] [&>p]:text-ink-secondary [&_strong]:font-medium [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}
