/**
 * Pure metric/delta helpers (tested). No React, no tokens — logic only.
 */

export type MetricDirection = "up-good" | "down-good";
export type DeltaTone = "positive" | "negative" | "neutral";

/** Extract the leading signed number from a metric string ("45 min", "31%", "$0.0024", "1,204"). */
export function parseMetricNumber(v: string): number | null {
  const m = v.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/** Tone of a before→after change, given which direction counts as improvement. */
export function deltaTone(
  before: string | undefined,
  after: string,
  direction: MetricDirection,
): DeltaTone {
  if (before == null) return "neutral";
  const b = parseMetricNumber(before);
  const a = parseMetricNumber(after);
  if (b == null || a == null || b === a) return "neutral";
  const wentUp = a > b;
  const goodWhenUp = direction === "up-good";
  return wentUp === goodWhenUp ? "positive" : "negative";
}

/** Glyph for a tone — always paired with text, never colour-only (a11y §8). */
export function deltaArrow(tone: DeltaTone): string {
  return tone === "positive" ? "▲" : tone === "negative" ? "▼" : "→";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Format an ISO date ("2026-05-20") as "May 2026" — deterministic, no locale/timezone. */
export function formatDate(iso: string): string {
  const [y, m] = iso.split("-");
  const month = MONTHS[Number(m) - 1] ?? "";
  return `${month} ${y}`.trim();
}

/**
 * Format an ISO date ("2026-05-20") as "May 20, 2026" — day precision, deterministic.
 * Used where per-item dates must read distinctly (e.g. product "Updated" lines, F-19),
 * so several items sharing a month don't collapse to one identical string.
 */
export function formatDateFull(iso: string): string {
  const [y, m, d] = iso.split("-");
  const month = MONTHS[Number(m) - 1] ?? "";
  return d ? `${month} ${Number(d)}, ${y}`.trim() : `${month} ${y}`.trim();
}
