import type { CSSProperties } from "react";
import { CaretLink } from "./caret-link";
import { cx } from "./cx";
import styles from "./stats-row.module.css";

export type Stat = {
  /** What the figure is ("In software engineering"). */
  label: string;
  /** The figure itself ("3.5+ yrs"), from content — never invented. */
  value: string;
  /** Where the figure is backed: its method or its page. */
  source?: { label: string; href: string };
};

type StatsStyle = CSSProperties & Record<"--stats-columns", number>;

/**
 * StatsRow — a row of headline figures (prototype `.stats`): a label over a
 * large number, in equal columns (two from 1000px down).
 *
 * Props: `stats` (label, value, optional `source` link to the method), `align`
 * (`center` default, or `start`).
 * Honesty: every value comes from repo content, and a figure that rests on a
 * measurement carries its `source` (SPEC §2).
 *
 * A11y: a `<dl>` — each label is the term and the figure its description, in
 * reading order. The source is a real link named by its label.
 */
export function StatsRow({
  stats,
  align = "center",
  className,
}: {
  stats: readonly Stat[];
  align?: "center" | "start";
  className?: string;
}) {
  const style: StatsStyle = { "--stats-columns": stats.length };
  return (
    <dl className={cx(styles.stats, align === "center" && styles.center, className)} style={style}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.value}>
            {stat.value}
            {stat.source ? (
              <span className={styles.source}>
                <CaretLink href={stat.source.href} tone="muted" weight="regular">
                  {stat.source.label}
                </CaretLink>
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
