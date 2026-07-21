"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { home } from "@/content/site";
import {
  BAND_CELL,
  BAND_CELL_Y,
  BAND_ROW,
  BAND_RULE_SM,
  BAND_RULE_SM_AFTER,
} from "@/constants/bands";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * SkillRotator — the honest take on Clerk's cycling "trusted by" wall: no
 * customer logos, so a hairline-celled band of the real stack where each cell
 * CROSSFADES through its slice of the tools (phase-offset so they don't swap in
 * lockstep). It names tools rather than companies, which is the point — it is a
 * claim we can actually back. Pure DOM + a light interval, no library.
 *
 * Why every tool is in the DOM at once. Each cell renders all of its tools
 * stacked in one grid area and lights only the active one. That buys two things
 * the previous keyed-remount version could not have: a genuine crossfade (the
 * outgoing word fades out while the incoming one rises in, instead of a hard cut
 * followed by a fade), and a cell that is permanently as wide as its widest
 * tool, so the hairline grid stops twitching on every swap. The strip is also
 * masked at both ends (`.mask-fade-x`), so the row dissolves into the page
 * rather than being sliced off by the container edge.
 *
 * Geometry comes from `constants/bands.ts`, shared with the proof strip directly
 * above: same gutters, same cell height, same kind of hairline. The two bands are
 * adjacent, and sharing those three measurements is what makes them read as one
 * ruled block instead of two strips that happen to be stacked.
 *
 * Props: none. The stack and its label come from `content/site.ts`.
 *
 * A11y: the cycle is decorative (`aria-hidden`) and a visually-hidden list
 * carries the full stack, so the masked ends can never cost a reader a tool. The
 * band auto-updates for far longer than five seconds, so WCAG 2.2.2 requires a
 * pause control — the quiet toggle beside the label, which is keyboard-operable
 * and clears the 24×24 target minimum. Under reduced-motion nothing moves, so no
 * control is offered and each cell holds its first tool.
 *
 * Performance: one interval per cell writing one piece of state; the crossfade
 * itself is opacity/transform only, so swaps stay off the layout path.
 */
const INTERVAL = 2600; // dwell before each swap
const CELLS = 6;
const PHASE = 420; // stagger between cells, so they never swap in lockstep

/** One hairline cell that crossfades through its slice of the stack. */
function Cell({ items, delay, running }: { items: string[]; delay: number; running: boolean }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!running) return;
    let iv: ReturnType<typeof setInterval> | undefined;
    const to = setTimeout(() => {
      iv = setInterval(() => setIdx((i) => (i + 1) % items.length), INTERVAL);
    }, delay);
    return () => {
      clearTimeout(to);
      if (iv) clearInterval(iv);
    };
  }, [delay, items.length, running]);
  return (
    <span className="grid">
      {items.map((item, i) => (
        <span
          key={item}
          className={`stack-item font-mono text-sm ${
            i === idx ? "stack-item-on text-ink" : "text-ink-secondary"
          }`}
        >
          {item}
        </span>
      ))}
    </span>
  );
}

export function SkillRotator() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const running = !reduced && !paused;
  const cells: string[][] = Array.from({ length: CELLS }, (_, c) =>
    home.stack.filter((_, i) => i % CELLS === c),
  );
  return (
    // White ground + border-BOTTOM only: Clerk's trust wall is one crisp white
    // ruled block, and the screenshot diff showed our grey band splitting the
    // pair into two unrelated strips. The proof strip directly above already
    // draws `border-y`, so its bottom hairline IS this band's top rule — drawing
    // our own would stack into a 2px line (the two bands are siblings; borders
    // don't collapse).
    <div className="border-b border-border bg-surface">
      <div className={`${BAND_ROW} flex flex-col sm:flex-row sm:items-stretch`}>
        {/* The label's rule is TRAILING, not leading on the first stack cell:
            the stack row is masked at both ends, and a mask erases the element's
            own border along with its content. Drawing it here keeps the
            label↔stack boundary crisp while the row still dissolves.
            `sm:pl-0`: once this is the row's leading cell, its own padding would
            double the page gutter and push the label out of line with the
            sections above and below. */}
        <div
          className={`${BAND_CELL} ${BAND_RULE_SM_AFTER} flex flex-none items-center justify-center gap-2 sm:justify-start sm:pl-0`}
        >
          <p className="text-sm text-ink-secondary">{home.stackLabel}</p>
          {reduced ? null : (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume the rotating stack" : "Pause the rotating stack"}
              // h-7/w-7 clears the 24×24 minimum target size (WCAG 2.5.8)
              className="icon-btn inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-tertiary hover:text-ink"
            >
              {paused ? (
                <Play size={11} strokeWidth={1.8} aria-hidden />
              ) : (
                <Pause size={11} strokeWidth={1.8} aria-hidden />
              )}
            </button>
          )}
        </div>
        <ul className="mask-fade-x grid flex-1 grid-cols-3 sm:flex" aria-hidden>
          {cells.map((items, c) => (
            // Mobile wraps six cells into two rows of three, so the rule there is
            // horizontal; from `sm` they are one row and it turns vertical.
            <li
              key={c}
              className={`${BAND_CELL_Y} ${BAND_RULE_SM} flex flex-none items-center justify-center px-2 sm:flex-1`}
            >
              <Cell items={items} delay={c * PHASE} running={running} />
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">Tech stack: {home.stack.join(", ")}.</p>
    </div>
  );
}
