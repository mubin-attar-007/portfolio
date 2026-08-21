import type { ReactNode } from "react";
import Link from "next/link";
import { deltaArrow, deltaTone, type DeltaTone, type MetricDirection } from "@/lib/format";

/**
 * Metric — a mono tabular value, an optional before→after delta (arrow + text +
 * positive/negative colour), and its measurement method. Never in a coloured
 * box (DESIGN §3). A11y: the delta pairs an arrow glyph with words, never colour
 * alone; method text satisfies "every metric links to how it was measured".
 */
const TONE: Record<DeltaTone, string> = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-ink-secondary",
};

export function Metric({
  label,
  after,
  before,
  direction = "down-good",
  method,
  methodHref,
}: {
  label: string;
  after: string;
  before?: string;
  direction?: MetricDirection;
  method?: string;
  methodHref?: string;
}) {
  const tone = deltaTone(before, after, direction);
  return (
    <figure className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-3xl tabular-nums text-ink">{after}</span>
        {before ? (
          <span className={`font-mono text-sm ${TONE[tone]}`}>
            {deltaArrow(tone)} from {before}
          </span>
        ) : null}
      </div>
      <figcaption className="text-sm text-ink-secondary">{label}</figcaption>
      {method ? (
        <p className="max-w-[52ch] text-xs text-ink-tertiary">
          Method:{" "}
          {methodHref ? (
            <Link href={methodHref} className="link-underline text-ink-secondary">
              {method}
            </Link>
          ) : (
            method
          )}
        </p>
      ) : null}
    </figure>
  );
}

/** Horizontal group of Metrics — a loose row, for use inside prose. */
export function MetricsRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-x-12 gap-y-6">{children}</div>;
}

/**
 * MetricCards — the pull-out metric block at the top of a case study.
 *
 * A case study opens by asking the reader to spend ten minutes. The numbers that
 * justify that have to read as objects, not as a run of text: the previous
 * `MetricsRow` set them as bare figures in the flow, so the three claims a
 * write-up rests on looked like a caption.
 *
 * Each card is the site's one panel treatment. The value is mono and tabular,
 * the label sits under it, and the method line is a LINK to the chapter that
 * derives it — the content law rendered as an affordance rather than a footnote.
 *
 * A11y: a `<dl>`, because that is what this is — terms and their values. The
 * card `<div>` is the DIRECT child of the `<dl>` and contains exactly one `<dt>`
 * and one `<dd>`; anything deeper is invalid (axe: `dlitem` /
 * `definition-list`), which is why the method line lives INSIDE the `<dt>`
 * rather than as a third sibling. `flex-col-reverse` puts the value on top
 * visually while the DOM keeps term-before-value, so a screen reader never
 * announces "0" as the term.
 */
export function MetricCards({
  metrics,
  methodHref,
}: {
  metrics: readonly { label: string; value: string; method: string }[];
  methodHref?: string;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex flex-col-reverse rounded-[var(--radius-md)] border border-border bg-surface p-5 shadow-[var(--shadow-surface)]"
        >
          <dt className="mt-1.5 text-sm leading-snug text-ink-secondary">
            {m.label}
            <span className="mt-4 block border-t border-border pt-3 text-xs leading-relaxed text-ink-tertiary">
              {methodHref ? (
                <Link href={methodHref} className="link-underline text-ink-secondary">
                  How this was measured
                </Link>
              ) : (
                <span className="text-ink-secondary">Method</span>
              )}
              {" — "}
              {m.method}
            </span>
          </dt>
          <dd className="font-mono text-[1.75rem] leading-none tabular-nums tracking-[-0.03em] text-ink">
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Tabular metrics with a required method column. Hairline rows, no zebra, no colour headers. */
export function MetricsTable({
  rows,
}: {
  rows: { label: string; value: string; method: string }[];
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-strong text-left">
            <th className="py-2 pr-6 font-mono text-xs font-medium uppercase text-ink-tertiary">Metric</th>
            <th className="py-2 pr-6 font-mono text-xs font-medium uppercase text-ink-tertiary">Value</th>
            <th className="py-2 font-mono text-xs font-medium uppercase text-ink-tertiary">Method</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border">
              <td className="py-3 pr-6 text-ink">{r.label}</td>
              <td className="py-3 pr-6 font-mono tabular-nums text-ink">{r.value}</td>
              <td className="py-3 text-ink-secondary">{r.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
