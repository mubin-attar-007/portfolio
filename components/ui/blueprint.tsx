import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./blueprint.module.css";

/**
 * RuleX — a horizontal hairline that fades out before both edges (prototype
 * `.rule-x`). Use it across a frame or between Careers-style blocks.
 * Decorative (`aria-hidden`); for a real thematic break use `<hr>`.
 */
export function RuleX({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("rule-fade", className)} />;
}

/**
 * DotBand — a 24px band of 1px dots on a 4px grid (prototype `.dotband`): the
 * texture between blueprint blocks. Decorative (`aria-hidden`).
 */
export function DotBand({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx(styles.dotband, className)} />;
}

/**
 * Frame — the blueprint frame (prototype `.frame`): a centred column with
 * hairline rules on its left and right edges, 1010px wide (`narrow`: 592px, the
 * letter column). On phones it keeps the page gutter outside its rules.
 *
 * Props: `width` (`default` | `narrow`), `padded` (32px inside each rule, 20px on
 * phones — the prototype's `.frame-in`), `as` (default `div`).
 * A11y: presentational; it renders whatever element `as` names.
 */
export function Frame({
  width = "default",
  padded = false,
  as: Tag = "div",
  className,
  children,
}: {
  width?: "default" | "narrow";
  padded?: boolean;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cx(styles.frame, width === "narrow" && styles.narrow, padded && styles.padded, className)}>
      {children}
    </Tag>
  );
}
