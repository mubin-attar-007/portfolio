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
