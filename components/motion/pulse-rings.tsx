import type { CSSProperties } from "react";
import { cx } from "@/components/ui/cx";
import styles from "./ambient.module.css";

type RingStyle = CSSProperties &
  Record<"--ring-size" | "--ring-radius" | "--ring-period" | "--ring-delay", string>;

/**
 * PulseRings — slow rings that grow out of a hero mark and fade (prototype
 * `.pulse-ring`: three rings, one every 4s on a 12s cycle). An ambient loop.
 *
 * Place it inside the mark's positioned stage, before the mark; the rings are
 * centred on the stage. Props: `size` (the mark's edge in px, default 196),
 * `radius` (its corner radius in px, default 52), `count` (default 3), `period`
 * (seconds per ring, default 12). The ring colour is the accent at 50%
 * (override with `--ring-color` on the stage).
 *
 * Motion: `transform` and `opacity` only. Reduced motion: the rings are hidden.
 * A11y: decorative (`aria-hidden`).
 */
export function PulseRings({
  size = 196,
  radius = 52,
  count = 3,
  period = 12,
  className,
}: {
  size?: number;
  radius?: number;
  count?: number;
  period?: number;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cx(styles.rings, className)}>
      {Array.from({ length: count }, (_, i) => {
        const style: RingStyle = {
          "--ring-size": `${size}px`,
          "--ring-radius": `${radius}px`,
          "--ring-period": `${period}s`,
          "--ring-delay": `${(i * period) / count}s`,
        };
        return <span key={i} className={styles.ring} style={style} />;
      })}
    </span>
  );
}
