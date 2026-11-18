"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PauseButton } from "@/components/motion/pause-button";
import styles from "./sections.module.css";

/** How far below a column's top a card brought into view for keyboard focus sits: clear of the fade. */
const FOCUS_INSET = 72;

/**
 * Seek a column's drift so the card holding `target` sits wholly inside the
 * column, if it does not already. The drift is a CSS animation over two copies
 * of the column; seeking its current time moves the cards without a jump and
 * without scrolling (the column clips, so focus cannot scroll it either).
 */
function reveal(target: Element) {
  const column = target.closest<HTMLElement>("[data-wall-column]");
  const card = target.closest("li");
  const track = column?.firstElementChild;
  const drift = track?.getAnimations()[0];
  if (!column || !card || !(track instanceof HTMLElement) || !drift) return;
  const frame = column.getBoundingClientRect();
  const box = card.getBoundingClientRect();
  if (box.top >= frame.top + FOCUS_INSET / 2 && box.bottom <= frame.bottom - FOCUS_INSET / 2) return;
  const loop = track.scrollHeight / 2;
  const duration = Number(drift.effect?.getComputedTiming().duration) || 0;
  const offset = Math.min(0, FOCUS_INSET - card.offsetTop);
  const progress = Math.min(Math.max(-offset / loop, 0), 1);
  const reversed = getComputedStyle(track).animationDirection === "reverse";
  // A full loop's time is the next loop's start, so a seek stops 1 ms short of it.
  drift.currentTime = Math.min((reversed ? 1 - progress : progress) * duration, duration - 1);
}

/**
 * WallMotion — the motion controls of the writing wall (writing-wall.tsx; the
 * drift itself is CSS). The drift holds under the pointer, while keyboard
 * focus is inside, and when paused by the button (WCAG 2.2.2); a card focused
 * out of view is brought into view first. Without JavaScript the CSS holds the
 * drift under the pointer.
 *
 * Props: `labels` (the button's two names), `children` (the columns).
 */
export function WallMotion({ labels, children }: { labels: { pause: string; play: string }; children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const wall = useRef<HTMLDivElement>(null);

  const still = paused || hovered || focused;
  useEffect(() => {
    for (const drift of wall.current?.getAnimations({ subtree: true }) ?? []) {
      if (still) drift.pause();
      else drift.play();
    }
  }, [still]);

  return (
    <div className={styles.wallWrap}>
      <div
        ref={wall}
        className={styles.wall}
        data-paused={paused ? "" : undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={(event) => {
          setFocused(true);
          reveal(event.target);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {children}
      </div>
      <PauseButton
        paused={paused}
        onToggle={() => setPaused((value) => !value)}
        labels={labels}
        className={styles.wallControl}
      />
    </div>
  );
}
