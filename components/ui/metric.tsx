import type { ReactNode } from "react";
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
}: {
  label: string;
  after: string;
  before?: string;
  direction?: MetricDirection;
  method?: string;
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
      {method ? <p className="max-w-[52ch] text-xs text-ink-tertiary">Method: {method}</p> : null}
    </figure>
  );
}

/** Horizontal group of Metrics (hero of a case study, homepage proof strip). */
export function MetricsRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-x-12 gap-y-6">{children}</div>;
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
