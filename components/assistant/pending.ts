// -----------------------------------------------------------------------------
// What the panel does while an answer is pending: how long it waits, and when
// it says the answer is slow. A module of its own so the timings can be tested
// against the route's (test/assistant-open.test.mts) without a browser.
// -----------------------------------------------------------------------------

import type { ChatTurn } from "@/lib/ai/chat-contract";
import { ASSISTANT_COPY } from "./copy";

/**
 * The panel stops waiting for an answer after this long. Longer than the
 * platform's limit on one request (maxDuration, 30 s, in app/api/chat/route.ts),
 * so the panel never gives up on an answer the server can still send; the
 * server's own timeouts end first and send their fallback.
 */
export const CLIENT_TIMEOUT_MS = 32_000;

/**
 * No text this long after a question was sent: the pending line changes from
 * "Searching the site" to "Taking longer than usual". After the hedge (3.5 s)
 * has had its chance, well before the server gives up on a first token (12 s).
 */
export const SLOW_AFTER_MS = 5_000;

/** The timer functions the cue runs on: the browser's, or a test's. */
type Timers = {
  setTimeout: (callback: () => void, ms: number) => unknown;
  clearTimeout: (handle: unknown) => void;
};

/** One pending answer's slow-state timer. */
export type SlowAnswerCue = {
  /** The first text arrived: the answer is not slow, whatever the clock says next. */
  arrived(): void;
  /** The request ended: stop the timer. */
  cancel(): void;
};

/**
 * Call `onSlow` once if no text has arrived SLOW_AFTER_MS after the question
 * was sent. `arrived()` or `cancel()` before then stops it.
 */
export function slowAnswerCue(
  onSlow: () => void,
  timers: Timers = {
    setTimeout: (callback, ms) => globalThis.setTimeout(callback, ms),
    clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
  },
): SlowAnswerCue {
  let handle: unknown = timers.setTimeout(() => {
    handle = null;
    onSlow();
  }, SLOW_AFTER_MS);
  const stop = () => {
    if (handle === null) return;
    timers.clearTimeout(handle);
    handle = null;
  };
  return { arrived: stop, cancel: stop };
}

/**
 * The pending line under an answer that has no text yet: "Searching the site…",
 * or once it is slow "Taking longer than usual…". Null as soon as text arrives
 * or the answer ends, so the first token replaces it.
 */
export function pendingLine(turn: Pick<ChatTurn, "streaming" | "content">, slow: boolean): string | null {
  if (!turn.streaming || turn.content) return null;
  return `${slow ? ASSISTANT_COPY.slow : ASSISTANT_COPY.searching}…`;
}
