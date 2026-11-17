import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./phone-frame.module.css";

/**
 * The width a phone frame adds around its screen, as a share of the frame's
 * width, and the status strip above the screen, as a share of the screen's
 * width. Exported so a layout can size a frame from its screen's aspect ratio
 * (`phoneFrameAspect`); phone-frame.module.css sets the same proportions.
 */
const BEZEL = 0.028;
const STATUS = 0.085;

/** The width ÷ height of a whole phone frame around a screen of `width` × `height`. */
export function phoneFrameAspect(width: number, height: number): number {
  const screen = 1 - 2 * BEZEL;
  return 1 / (2 * BEZEL + screen * STATUS + screen * (height / width));
}

/**
 * PhoneFrame — a phone around a mobile capture: a dark body, a status strip
 * with the camera island, and the screen. Every proportion scales with the
 * frame's width (container units), so the caller sets only the width.
 *
 * Props: `children` — the screen (an `<img>` or `<video>` fills it);
 * `className` — size and place the frame.
 *
 * Adapts to dark plates through the colour tokens. A11y: the body, the strip
 * and the island are decorative (`aria-hidden`); describe the capture itself
 * (its alt text, a caption). Performance: no JS.
 */
export function PhoneFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx(styles.phone, className)}>
      <div className={styles.body}>
        <div className={styles.display}>
          <div className={styles.status} aria-hidden="true">
            <span className={styles.island} />
          </div>
          <div className={styles.screen}>{children}</div>
        </div>
      </div>
    </div>
  );
}
