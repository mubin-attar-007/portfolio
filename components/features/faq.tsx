"use client";

import { useState } from "react";
import { home } from "@/content/site";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * Faq — Clerk's accordion device, adapted to a personal-brand FAQ. One panel
 * open at a time.
 *
 * The device: hairline-separated rows, a mono label, and a small circular
 * marker on the left that is a HOLLOW RING when closed and a FILLED accent disc
 * when open. The marker changes SHAPE, not only colour, so the open state does
 * not depend on colour perception (WCAG 1.4.1) — and the revealed answer is
 * itself the primary visual confirmation.
 *
 * Deviation from Clerk, on purpose: their labels are all-caps because they are
 * two-word feature names. Ours are full sentences, and long strings set in caps
 * are both harder to read and banned outright by DESIGN.md §9 ("uppercase
 * headings"). The mono face, the tracking, the marker and the hairlines carry
 * the same visual signature without that cost.
 *
 * Motion: the height still animates via grid-rows 0fr→1fr, and that is a
 * deliberate keep. Animating to an UNKNOWN auto height means animating a layout
 * property or measuring in JS, and grid-rows is the least-bad of those — exact,
 * measurement-free, and only one short panel is ever in flight. What was
 * costing frames was `transition-all` on the container; it now transitions the
 * one property it means to, and the perceived motion is carried by an
 * opacity+translate fade on the answer, which runs on the compositor. Both live
 * in globals.css (.faq-panel / .faq-answer) and collapse under reduced motion.
 *
 * A11y: each question is a <button> with aria-expanded controlling its panel;
 * the panel is a region labelled by the button. `data-open` is a styling hook
 * only — aria-expanded remains the single source of truth for state.
 */
export function Faq() {
  const { faq } = home;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto w-full max-w-[var(--width-prose)]">
      {/* The shared band header at the `compact` scale, not a hand-rolled third
          variant: this band closes a group (see app/page.tsx), and its header
          must read as the same object as every other section top — same kicker
          treatment, same kicker→heading gap — or the FAQ looks bolted on. */}
      <SectionHeading size="compact" kicker={faq.kicker}>
        {faq.title}
      </SectionHeading>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {faq.items.map((item, i) => {
          const on = open === i;
          return (
            <li key={item.q}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-q-${i}`}
                  className="group flex w-full items-start gap-3 py-5 text-left"
                >
                  {/* Marker geometry is deliberate: 12px disc + 12px gap = the
                      24px the answer is indented by, so the label and the answer
                      share one text edge. `mt-2` optically centres it on the
                      first line of the label rather than its box. */}
                  <span
                    aria-hidden
                    className={`mt-2 h-3 w-3 shrink-0 rounded-full border transition-colors duration-base ${
                      on
                        ? "border-accent bg-accent"
                        : "border-ink-tertiary bg-transparent group-hover:border-accent"
                    }`}
                  />
                  <span
                    className={`font-mono text-base tracking-[0.01em] transition-colors duration-base ${
                      on ? "text-accent" : "text-ink group-hover:text-accent"
                    }`}
                  >
                    {item.q}
                  </span>
                </button>
              </h3>
              {/* `inert` when closed is load-bearing, not belt-and-braces.
                  Collapsing with grid-template-rows:0fr + overflow-hidden hides
                  the answer VISUALLY but leaves it in the accessibility tree, so
                  a screen reader would read all six answers straight through
                  while every button claims aria-expanded="false". `inert` is what
                  actually removes the closed panel from the a11y tree and from
                  the tab order, and unlike `hidden`/`display:none` it does not
                  break the height transition. */}
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                data-open={on ? "" : undefined}
                inert={!on}
                className="faq-panel grid"
                style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="faq-answer max-w-[60ch] pb-5 pl-6 text-ink-secondary">{item.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
