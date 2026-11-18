import type { CSSProperties, ElementType, ReactNode } from "react";
import { cx } from "@/components/ui/cx";
import styles from "./ambient.module.css";

type FloatStyle = CSSProperties & Record<"--float" | "--float-duration", string>;

/**
 * Float — a slow vertical drift for a hero mark (prototype `.glass`: 10px over
 * 6s; `.obsidian`: 7px over 8s). An ambient loop, allowed by the motion law.
 *
 * Props: `distance` (px it rises, default 10), `duration` (seconds per cycle,
 * default 6), `as` (default `div`).
 * Motion: animates `translate` only. Reduced motion: still.
 * A11y: a presentational wrapper; whatever it holds keeps its own semantics.
 */
export function Float({
  distance = 10,
  duration = 6,
  as: Tag = "div",
  className,
  children,
}: {
  distance?: number;
  duration?: number;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const style: FloatStyle = { "--float": `${-distance}px`, "--float-duration": `${duration}s` };
  return (
    <Tag className={cx(styles.float, className)} style={style}>
      {children}
    </Tag>
  );
}
