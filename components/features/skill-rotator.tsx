"use client";

import { useEffect, useState } from "react";
import { home } from "@/content/site";

/**
 * SkillRotator — the engineering-honest take on Clerk's "trusted by" logo wall.
 * We have no customer logos, so we rotate the real stack instead, rebuilt with
 * Clerk's exact *technique*: a row of fixed columns, each a mask-faded window
 * over a vertical stack that slides up one item at a time (translateY), columns
 * phase-offset so they don't flip in lockstep. Pure DOM + a light interval — no
 * library. A11y: the animation is decorative (aria-hidden); a visually-hidden
 * list carries the full stack. Motion pauses under prefers-reduced-motion
 * (columns render their first item, statically).
 */
const ROW_REM = 2.75; // window height === each item's height (so a step = one row)
const INTERVAL = 2600; // dwell before each advance
const DURATION = 560; // slide duration
const COLS = 4;

/** One masked column that vertically cycles its own slice of the stack. */
function SlotColumn({ items, delay }: { items: string[]; delay: number }) {
  const loop = [...items, items[0]]; // duplicate the first for a seamless wrap
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let iv: ReturnType<typeof setInterval> | undefined;
    const to = setTimeout(() => {
      iv = setInterval(() => setIndex((i) => i + 1), INTERVAL);
    }, delay);
    return () => {
      clearTimeout(to);
      if (iv) clearInterval(iv);
    };
  }, [delay]);

  // Land on the appended duplicate → snap back to 0 with no transition (the
  // frame is visually identical), then restore the transition next paint.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  function onEnd(e: React.TransitionEvent) {
    if (e.propertyName === "transform" && index === items.length) {
      setAnimate(false);
      setIndex(0);
    }
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: `${ROW_REM}rem`,
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)",
        maskImage:
          "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)",
      }}
      aria-hidden
      role="presentation"
    >
      <ul
        className="grid"
        onTransitionEnd={onEnd}
        style={{
          transform: `translateY(-${index * ROW_REM}rem)`,
          transition: animate ? `transform ${DURATION}ms var(--ease-emphasized)` : "none",
        }}
      >
        {loop.map((s, i) => (
          <li
            key={i}
            className="flex items-center justify-center font-mono text-sm text-ink-secondary"
            style={{ height: `${ROW_REM}rem` }}
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillRotator() {
  const columns: string[][] = Array.from({ length: COLS }, (_, c) =>
    home.stack.filter((_, i) => i % COLS === c),
  );
  return (
    <div className="border-y border-border bg-bg-subtle">
      <div className="mx-auto flex w-full max-w-[var(--width-container)] flex-col px-6 sm:flex-row sm:items-stretch sm:px-8">
        <p className="flex-none self-center py-5 text-center text-sm text-ink-secondary sm:py-6 sm:pr-10 sm:text-left">
          {home.stackLabel}
        </p>
        <ul className="-mx-6 grid flex-1 grid-cols-2 sm:mx-0 sm:flex">
          {columns.map((items, c) => (
            <li
              key={c}
              className="flex flex-none items-center justify-center border-t border-border py-4 sm:flex-1 sm:border-t-0 sm:border-l sm:border-border"
            >
              <SlotColumn items={items} delay={c * 650} />
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">Tech stack: {home.stack.join(", ")}.</p>
    </div>
  );
}
