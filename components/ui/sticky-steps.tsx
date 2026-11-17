"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";
import styles from "./sticky-steps.module.css";

export type StickyStep = {
  /** A stable key (and nothing else); defaults to the index. */
  id?: string;
  title: string;
  /** The step's explanation. Carry the meaning here: the media illustrates it. */
  body: ReactNode;
  /** The illustration for this step: a diagram, a frame, a still. Non-interactive. */
  media: ReactNode;
};

/** The band, 45–50% down the viewport, where a step becomes the active one. */
const ACTIVE_BAND = "-45% 0px -50% 0px";

/**
 * StickySteps — "how it works" as numbered steps beside a sticky media frame
 * (the Clerk product page). As each step scrolls through the middle of the
 * viewport its number lights up and the frame crossfades to its media.
 *
 * Props: `steps` (title, body, media), `label` (names the list), `titleAs`
 * (`h3` default), `className`.
 *
 * Layout: from 1000px, steps left and a sticky frame right (`--sticky-top`
 * under the nav); below, each step's media sits under its text and there is no
 * frame. Each step's media is rendered twice (inline and in the frame), and CSS
 * shows one per breakpoint, so pass light media (images lazy-load; videos stay
 * `preload="none"`).
 *
 * A11y: an ordered list in reading order; the visible numbers are decorative
 * (the list numbers itself). The frame mirrors the inline media and is
 * `aria-hidden` and `inert`; at any width a screen reader meets each media once
 * at most. Focusing inside a step makes it active.
 * Motion: opacity and a short rise with a soft spring; instant under reduced
 * motion. Never a scroll reveal: every step's text is always visible.
 *
 * Styling hook: the active step's `<li>` and its frame pane carry
 * `data-active`, so media can key a hover moment to the one in view
 * (`.steps:hover [data-active] …`, as the case study's flow pane does). The
 * frame is inert, so a hover moment keys on the root, never the frame.
 */
export function StickySteps({
  steps,
  label,
  titleAs: Title = "h3",
  className,
}: {
  steps: readonly StickyStep[];
  label?: string;
  titleAs?: "h2" | "h3" | "h4";
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = Array.from(listRef.current?.children ?? []).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    if (items.length === 0 || typeof IntersectionObserver === "undefined") return;
    const inBand = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = items.indexOf(entry.target as HTMLElement);
          if (entry.isIntersecting) inBand.add(index);
          else inBand.delete(index);
        }
        // Two steps can share the band at a boundary: the later one has arrived.
        if (inBand.size > 0) setActive(Math.max(...inBand));
      },
      { rootMargin: ACTIVE_BAND },
    );
    for (const item of items) observer.observe(item);
    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <div className={cx(styles.root, className)}>
      <ol ref={listRef} className={styles.list} aria-label={label}>
        {steps.map((step, i) => (
          <li
            key={step.id ?? i}
            className={styles.step}
            data-active={i === active ? "" : undefined}
            onFocus={() => setActive(i)}
          >
            <span className={styles.number} aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <Title className={styles.title}>{step.title}</Title>
              <div className={styles.body}>{step.body}</div>
            </div>
            <div className={styles.inlineMedia}>{step.media}</div>
          </li>
        ))}
      </ol>
      <div className={styles.stage} aria-hidden="true" inert>
        <div className={styles.frame}>
          {steps.map((step, i) => (
            <div key={step.id ?? i} className={styles.pane} data-active={i === active ? "" : undefined}>
              {step.media}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
