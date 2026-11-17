import Link from "next/link";
import { deltaArrow, deltaTone, type DeltaTone, type MetricDirection } from "@/lib/format";

/**
 * Metric — a value, an optional before→after delta (arrow + words + colour), and
 * the method behind it (prototype `.metric`). Never in a coloured box.
 *
 * Props: `label`, `after` (the value), `before`, `direction` (`down-good` |
 * `up-good`), `method`, `methodHref`.
 * A11y: the delta pairs an arrow and words with its colour, never colour alone;
 * the method text satisfies "every metric links to how it was measured".
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
        <span className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-ink">{after}</span>
        {before ? (
          <span className={`text-sm font-medium ${TONE[tone]}`}>
            {deltaArrow(tone)} from {before}
          </span>
        ) : null}
      </div>
      <figcaption className="text-sm text-ink-secondary">{label}</figcaption>
      {method ? (
        <p className="max-w-[52ch] text-[0.8125rem] text-ink-tertiary">
          Method:{" "}
          {methodHref ? (
            <Link href={methodHref} prefetch={false} className="link-underline text-ink-secondary">
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

/**
 * MetricCards — the pull-out metric block at the top of a case study: the
 * numbers a write-up rests on, as cards (the bento card surface).
 *
 * A11y: a `<dl>`; each card `<div>` is the direct child of the `<dl>` and holds
 * one `<dt>` and one `<dd>` (axe `dlitem`), so the method line lives inside the
 * `<dt>`. `flex-col-reverse` shows the value on top while the DOM keeps
 * term-before-value.
 */
export function MetricCards({
  metrics,
  methodHref,
}: {
  metrics: readonly { label: string; value: string; method: string }[];
  methodHref?: string;
}) {
  return (
    <dl className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex flex-col-reverse rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-card)]"
        >
          <dt className="mt-1.5 text-sm leading-snug text-ink-secondary">
            {m.label}
            <span className="mt-4 block border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-ink-tertiary">
              {methodHref ? (
                <Link href={methodHref} prefetch={false} className="link-underline text-ink-secondary">
                  How this was measured
                </Link>
              ) : (
                <span className="text-ink-secondary">Method</span>
              )}
              {" — "}
              {m.method}
            </span>
          </dt>
          <dd className="text-[1.75rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-ink">
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
            <th className="py-2 pr-6 text-[0.8125rem] font-medium text-ink-tertiary">Metric</th>
            <th className="py-2 pr-6 text-[0.8125rem] font-medium text-ink-tertiary">Value</th>
            <th className="py-2 text-[0.8125rem] font-medium text-ink-tertiary">Method</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border">
              <td className="py-3 pr-6 text-ink">{r.label}</td>
              <td className="py-3 pr-6 font-medium tabular-nums text-ink">{r.value}</td>
              <td className="py-3 text-ink-secondary">{r.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
