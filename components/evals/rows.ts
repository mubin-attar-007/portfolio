import { evalAnchor, evals } from "@/content/evals";
import { projects } from "@/content/projects";
import type { EvalRow } from "@/content/schema";
import { formatDate } from "@/lib/format";

/** Shares at or above this percentage get the high (teal) score tile. */
const HIGH_SHARE = 90;

/**
 * How a result is drawn: a tinted tile only when it IS a share (counts, or a
 * stated percentage). A result that is not a ratio ("0 leaks") stays plain, so
 * the page never implies a percentage the run did not produce.
 */
export type ScoreTone = "high" | "mid" | "plain" | "retired";

/** One registry row, prepared on the server for the client-side filters. */
export type BoardRow = {
  anchor: string;
  /** The project's slug, the filter key (the system name, slugified). */
  project: string;
  system: string;
  benchmark: string;
  metric: string;
  result: string;
  tone: ScoreTone;
  retired: boolean;
  /** The first sentence of the retirement reason (the full text is in the notes). */
  retiredReason?: string;
  date?: string;
  dateLabel?: string;
};

export type ProjectOption = { value: string; label: string };

const slugOf = (system: string): string => system.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function shareOf(row: EvalRow): number | null {
  if (row.score) return (100 * row.score.passed) / row.score.scored;
  const stated = /^(\d+(?:\.\d+)?)%/.exec(row.result);
  return stated ? Number(stated[1]) : null;
}

function toneOf(row: EvalRow): ScoreTone {
  if (row.status === "retired") return "retired";
  const share = shareOf(row);
  if (share === null) return "plain";
  return share >= HIGH_SHARE ? "high" : "mid";
}

const firstSentence = (text: string): string => `${text.split(/(?<=\.)\s/)[0]}`;

export const boardRows: BoardRow[] = evals.map((row) => ({
  anchor: evalAnchor(row),
  project: slugOf(row.system),
  system: row.system,
  benchmark: row.benchmark,
  metric: row.metric,
  result: row.result,
  tone: toneOf(row),
  retired: row.status === "retired",
  retiredReason: row.retired ? firstSentence(row.retired.reason) : undefined,
  date: row.date,
  dateLabel: row.date ? formatDate(row.date) : undefined,
}));

/** Every public project, in the curated order, including any without a row yet. */
export const projectOptions: ProjectOption[] = projects.map((p) => ({
  value: slugOf(p.title),
  label: p.title,
}));
