"use client";

import { useState, type CSSProperties } from "react";
import { PauseButton } from "@/components/motion/pause-button";
import styles from "./evaluate.module.css";

/** A small seeded generator, so the server and the browser draw the same lines. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COUNT = 44;
/** Most lines are faint white; a few carry the accent or the ambient cyan. */
const TONES = ["white", "white", "white", "white", "white", "violet", "cyan"] as const;

const random = seeded(20261118);
const LINES = Array.from({ length: COUNT }, (_, i) => ({
  left: (((i + random() * 0.8) / COUNT) * 100).toFixed(2),
  length: 40 + Math.round(random() * 120),
  seconds: (7 + random() * 9).toFixed(2),
  delay: (-random() * 16).toFixed(2),
  rest: Math.round(random() * 520),
  tone: TONES[Math.floor(random() * TONES.length)]!,
}));

/**
 * Rain — the falling lines behind /evaluate's hero (as behind the hero of
 * Clerk's MCP page): thin vertical strokes drifting down at their own pace,
 * mostly faint white with a few in the accent and the cyan. An ambient loop on
 * `transform` alone, with its own pause button (WCAG 2.2.2). Reduced motion:
 * the lines stand still where they fell, and the button goes.
 * A11y: the lines are decorative (`aria-hidden`).
 */
export function Rain({ labels }: { labels: { pause: string; play: string } }) {
  const [paused, setPaused] = useState(false);
  return (
    <>
      <div className={styles.rain} data-paused={paused ? "" : undefined} aria-hidden="true">
        {LINES.map((line, i) => (
          <span
            key={i}
            data-tone={line.tone}
            style={
              {
                left: `${line.left}%`,
                height: `${line.length}px`,
                animationDuration: `${line.seconds}s`,
                animationDelay: `${line.delay}s`,
                "--rest": `${line.rest}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <PauseButton
        paused={paused}
        onToggle={() => setPaused((value) => !value)}
        labels={labels}
        tone="dark"
        className={styles.rainControl}
      />
    </>
  );
}
