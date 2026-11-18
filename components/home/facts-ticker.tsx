"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./sections.module.css";

type Fact = { readonly value: string; readonly note: string };

/** How long a set rests before the next wave swaps it out. */
const REST_MS = 3600;

/**
 * FactsTicker — the facts strip moves as the logo row under Clerk's showcase
 * does: two sets of five, swapped slot by slot in a wave from left to right,
 * each fact rising out of a short blur as the one before it lifts away
 * (sections.module.css `.ticker`). It runs only while it can be watched: on
 * screen, in a visible tab, not under the pointer or holding focus, and not
 * paused by its button. Reduced motion: still, with both sets shown.
 *
 * Props: `sets` (content/pages/home.ts FACTS: slot i shows sets[0][i], then
 * sets[1][i]) and the button's two `labels`.
 * A11y: both facts of a slot stay in the accessibility tree (the resting one
 * is only transparent), so a screen reader reads all ten once and hears no
 * change. The button pauses and plays the swap (WCAG 2.2.2); it sits in the
 * strip's padding, so it moves nothing.
 */
export function FactsTicker({
  sets,
  labels,
}: {
  sets: readonly [readonly Fact[], readonly Fact[]];
  labels: { pause: string; play: string };
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<0 | 1>(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [watched, setWatched] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Watched: on screen, in a visible tab.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let onScreen = false;
    const sync = () => setWatched(onScreen && document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      sync();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const running = !reduced && watched && !paused && !held;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setStarted(true);
      setShown((set) => (set === 0 ? 1 : 0));
    }, REST_MS);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <div
      ref={root}
      className={styles.ticker}
      data-started={started ? "" : undefined}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      <ul className={styles.facts}>
        {sets[0].map((first, i) => (
          <li key={first.value} className={styles.slot} style={{ "--i": i } as CSSProperties}>
            {[first, sets[1][i]!].map((fact, set) => (
              <p key={fact.value} className={styles.fact} data-shown={set === shown}>
                {fact.value}
                <small>{fact.note}</small>
              </p>
            ))}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={styles.factsControl}
        aria-label={paused ? labels.play : labels.pause}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? <Play size={12} strokeWidth={2.2} aria-hidden /> : <Pause size={12} strokeWidth={2.2} aria-hidden />}
      </button>
    </div>
  );
}
