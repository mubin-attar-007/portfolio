import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./browser-frame.module.css";

/**
 * BrowserFrame — window chrome around product footage (the Clerk product-page
 * frame): a light title bar with three dots and a centred URL pill, over a
 * view that holds an image, a video or a mock UI.
 *
 * Props: `url` — the address shown in the pill (e.g. "dbwhisper.vercel.app");
 * omit it for an empty pill. `children` — the footage; a direct `<img>` or
 * `<video>` child fills the width.
 *
 * Adapts to dark plates through the colour tokens. A11y: the title bar is
 * decorative (`aria-hidden`); describe the footage itself (alt text, captions,
 * a `<figcaption>` around the frame). A mock UI with numbers must say
 * "Illustrative sample · synthetic data" inside the frame (SPEC §2).
 * Performance: no JS; videos inside should be `preload="none"` with a poster.
 */
export function BrowserFrame({
  url,
  className,
  children,
}: {
  url?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.frame, className)}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots}>
          <span />
          <span />
          <span />
        </span>
        <span className={styles.url}>{url ?? " "}</span>
        <span />
      </div>
      <div className={styles.view}>{children}</div>
    </div>
  );
}
