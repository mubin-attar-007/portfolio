import type { AnswerNote, ChatTurn } from "@/lib/ai/chat-contract";

/**
 * A short, honest label for a turn that is not a complete live answer — so the
 * UI never dresses a rate-limit notice, a stopped answer or site search up as
 * a live answer. Notes whose text already says it all carry no label.
 */
const NOTE_LABEL: Partial<Record<AnswerNote, string>> = {
  "injection-screened": "declined — out of scope",
  "live-unavailable": "live answers unavailable — site search only",
  "daily-budget-reached": "live answers paused for today — site search only",
  "client-allowance-reached": "live answers paused for today — site search only",
  "rate-limited": "rate limited",
  stopped: "stopped",
  "timed-out": "timed out",
};

/**
 * The label an answer shows above its text, or null for a complete live answer
 * and for notes whose text speaks for itself ("not covered", an input prompt).
 */
export function turnLabel(turn: ChatTurn): string | null {
  const byNote = turn.note ? NOTE_LABEL[turn.note] : undefined;
  if (byNote) return byNote;
  if (turn.mode === "refusal") return "declined — out of scope";
  if (turn.incomplete) return "cut short";
  if (turn.mode === "fallback" && turn.sources && turn.sources.length > 0) return "from site search";
  return null;
}

/**
 * True when the turn is the panel's own failure message rather than an answer:
 * the request failed, was rate limited, or timed out before any text arrived.
 * A timed-out turn that kept part of an answer is that answer, cut short.
 */
export function isFailedTurn(turn: ChatTurn): boolean {
  if (turn.role !== "assistant") return false;
  if (turn.note === "unavailable" || turn.note === "rate-limited") return true;
  return turn.note === "timed-out" && !turn.incomplete;
}

/** A label's tone: caution for a turn that failed or was cut short. */
export function labelTone(turn: ChatTurn): "caution" | "neutral" {
  return isFailedTurn(turn) || turn.incomplete ? "caution" : "neutral";
}
