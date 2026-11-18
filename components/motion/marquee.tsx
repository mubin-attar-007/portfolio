import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/ui/cx";
import styles from "./marquee.module.css";

type MarqueeStyle = CSSProperties & Record<"--marquee-duration" | "--marquee-delay" | "--marquee-gap", string>;

/**
 * Marquee — one row that scrolls sideways forever (prototype agents section):
 * the children are rendered twice in a track that slides by half its width, so
 * the loop never jumps. An ambient loop, allowed by the motion law.
 *
 * Props:
 * - `duration` — seconds per loop (default 48; the prototype runs rows at 64,
 *   48 and 40). `delay` — seconds, negative to start mid-loop (e.g. -9).
 * - `reverse` — scroll to the right.
 * - `gap` — px between items (default 12).
 * - `fade` — mask the edges (default `true`; pass `false` inside a
 *   `MarqueeGroup`, which masks all its rows at once).
 * - `label` — names the row as a group for screen readers.
 *
 * Behaviour: pauses under the pointer and while focus is inside. Reduced
 * motion: one still, centred copy.
 *
 * A11y: the second copy is `aria-hidden` and `inert`, so screen readers and the
 * Tab key meet each item once. Performance: a server component — CSS only, no JS.
 */
export function Marquee({
  duration = 48,
  delay = 0,
  reverse = false,
  gap = 12,
  fade = true,
  label,
  className,
  children,
}: {
  duration?: number;
  delay?: number;
  reverse?: boolean;
  gap?: number;
  fade?: boolean;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const style: MarqueeStyle = {
    "--marquee-duration": `${duration}s`,
    "--marquee-delay": `${delay}s`,
    "--marquee-gap": `${gap}px`,
  };
  return (
    <div
      role={label ? "group" : undefined}
      aria-label={label}
      className={cx(styles.marquee, fade && styles.fade, className)}
      style={style}
    >
      <div className={cx(styles.track, reverse && styles.reverse)}>
        <div className={styles.set}>{children}</div>
        <div className={cx(styles.set, styles.clone)} aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * MarqueeGroup — stacked marquee rows that share one edge mask and pause
 * together under the pointer (the prototype's three rows of questions). Give
 * each row `fade={false}` and its own `duration`/`delay` so they drift apart.
 *
 * A11y: `label` names the group. Decorative rows can be hidden whole with
 * `decorative` (`aria-hidden`), as the prototype's sample questions are.
 */
export function MarqueeGroup({
  label,
  decorative = false,
  className,
  children,
}: {
  label?: string;
  decorative?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={label && !decorative ? "group" : undefined}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cx(styles.group, styles.fade, className)}
    >
      {children}
    </div>
  );
}
