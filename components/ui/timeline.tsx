import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./timeline.module.css";

/**
 * Timeline — a dated record in the Clerk changelog pattern: dates on a rail,
 * a dot on a vertical line, the entry beside it. Holds `TimelineEntry` children.
 * From 760px the date takes its own column and sticks while its entry scrolls;
 * below that it sits above the entry.
 *
 * Props: `label` names the list for screen readers ("Changelog").
 * A11y: an ordered list (newest first is the caller's order), one item per entry.
 */
export function Timeline({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ol aria-label={label} className={cx(styles.timeline, className)}>
      {children}
    </ol>
  );
}

/**
 * TimelineEntry — one dated entry.
 *
 * Props: `date` (as displayed, "Nov 16, 2026"), `dateTime` (ISO, for `<time>`),
 * `title` (rendered as `titleAs`, default `h3`), `tags` (e.g. `StatusPill`s or
 * `Chip`s), `id` (an anchor for deep links), `children` (the entry body).
 * A11y: a `<time>` with a machine-readable date; the dot is decorative.
 */
export function TimelineEntry({
  date,
  dateTime,
  title,
  titleAs: Title = "h3",
  tags,
  id,
  className,
  children,
}: {
  date: string;
  dateTime: string;
  title?: ReactNode;
  titleAs?: "h2" | "h3" | "h4";
  tags?: ReactNode;
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <li id={id} className={cx(styles.entry, className)}>
      <span className={styles.dot} aria-hidden="true" />
      <time dateTime={dateTime} className={styles.date}>
        {date}
      </time>
      <div className={styles.content}>
        {title ? <Title className={styles.title}>{title}</Title> : null}
        {tags ? <div className={styles.tags}>{tags}</div> : null}
        {children ? <div className={styles.body}>{children}</div> : null}
      </div>
    </li>
  );
}
