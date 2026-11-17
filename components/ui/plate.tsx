import type { ElementType, ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { cx } from "./cx";
import styles from "./plate.module.css";

/**
 * Plate — the notched dark section (prototype `.plate`): a `#131316` band whose
 * top and bottom edges carry a centred notch, with a faint grid masked under
 * its header.
 *
 * Everything inside renders dark by itself: the plate is a `.tone-invert` scope,
 * so text, cards (`Card`), kickers, pills and buttons read the plate ramp
 * (tokens.css). Centre its `SectionHeader` (`align="center"`), as the prototype does.
 *
 * Props:
 * - `notch` — the notched edges (default `true`); `false` is a plain dark band.
 * - `grid` — the masked grid texture (default `true`).
 * - `contained` — wrap the children in `Container` (default `true`).
 * - `as` — the element (default `section`); `id`, `labelledBy` (the heading's
 *   id) or `label` name the region.
 *
 * Spacing: 104px inside, plus the notch depth (72px on phones). The notch is
 * 44px deep (26px on phones, `--notch`).
 * A11y: a landmark region when labelled. Performance: pure CSS (clip-path).
 */
export function Plate({
  as: Tag = "section",
  id,
  labelledBy,
  label,
  notch = true,
  grid = true,
  contained = true,
  className,
  children,
}: {
  as?: ElementType;
  id?: string;
  labelledBy?: string;
  label?: string;
  notch?: boolean;
  grid?: boolean;
  contained?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={cx("tone-invert", styles.plate, notch ? styles.notched : styles.flat, grid && styles.grid, className)}
    >
      {contained ? <Container className={styles.inner}>{children}</Container> : <div className={styles.inner}>{children}</div>}
    </Tag>
  );
}
