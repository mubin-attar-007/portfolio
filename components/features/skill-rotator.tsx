"use client";

import { useEffect, useState } from "react";
import { home } from "@/content/site";

/**
 * SkillRotator — the honest take on Clerk's cycling "trusted by" wall: no
 * customer logos, so a hairline-celled band of the real stack where each cell
 * CROSSFADES through its slice of the tools (phase-offset so they don't swap in
 * lockstep) — Clerk's rotating company section, in our idiom. Pure DOM + a light
 * interval, no library. A11y: the cycle is decorative (aria-hidden); a
 * visually-hidden list carries the full stack; under reduced-motion each cell
 * holds its first tool (no swap, no animation).
 */
const INTERVAL = 2600; // dwell before each swap
const CELLS = 6;

/** One hairline cell that crossfades through its slice of the stack. */
function Cell({ items, delay }: { items: string[]; delay: number }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let iv: ReturnType<typeof setInterval> | undefined;
    const to = setTimeout(() => {
      iv = setInterval(() => setIdx((i) => (i + 1) % items.length), INTERVAL);
    }, delay);
    return () => {
      clearTimeout(to);
      if (iv) clearInterval(iv);
    };
  }, [delay, items.length]);
  // Keyed span → the fade-up animation (globals.css .stack-cell) replays on swap.
  return (
    <span key={idx} className="stack-cell font-mono text-sm text-ink-secondary">
      {items[idx]}
    </span>
  );
}

export function SkillRotator() {
  const cells: string[][] = Array.from({ length: CELLS }, (_, c) =>
    home.stack.filter((_, i) => i % CELLS === c),
  );
  return (
    <div className="border-y border-border bg-bg-subtle">
      <div className="mx-auto flex w-full max-w-[var(--width-container)] flex-col px-6 sm:flex-row sm:items-stretch sm:px-8">
        <p className="flex-none self-center py-5 text-center text-sm text-ink-secondary sm:py-6 sm:pr-8 sm:text-left">
          {home.stackLabel}
        </p>
        <ul className="-mx-6 grid flex-1 grid-cols-3 sm:mx-0 sm:flex" aria-hidden>
          {cells.map((items, c) => (
            <li
              key={c}
              className="flex flex-none items-center justify-center border-t border-border py-4 sm:flex-1 sm:border-t-0 sm:border-l sm:border-border"
            >
              <Cell items={items} delay={c * 420} />
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">Tech stack: {home.stack.join(", ")}.</p>
    </div>
  );
}
