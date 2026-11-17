// Unit tests for the assistant's open request and turn labels
// (components/assistant/open-assistant.ts, components/assistant/turn-status.ts).

import test from "node:test";
import assert from "node:assert/strict";

import { ASSISTANT_OPEN_EVENT, requestedQuestion } from "../components/assistant/open-assistant.ts";
import { isFailedTurn, labelTone, turnLabel } from "../components/assistant/turn-status.ts";
import { MAX_MESSAGE_CHARS, type ChatTurn } from "../lib/ai/chat-contract.ts";

const open = (detail: unknown) => new CustomEvent(ASSISTANT_OPEN_EVENT, { detail });

test("an open request carries its question, trimmed", () => {
  assert.equal(requestedQuestion(open({ question: "  What is DBWhisper?  " })), "What is DBWhisper?");
});

test("a question longer than the field's limit is capped", () => {
  const q = requestedQuestion(open({ question: "a".repeat(MAX_MESSAGE_CHARS + 50) }));
  assert.equal(q?.length, MAX_MESSAGE_CHARS);
});

test("an untrusted or empty detail carries no question", () => {
  assert.equal(requestedQuestion(new Event(ASSISTANT_OPEN_EVENT)), null);
  for (const detail of [null, undefined, "hi", 42, {}, { question: 7 }, { question: "   " }]) {
    assert.equal(requestedQuestion(open(detail)), null, `detail ${JSON.stringify(detail)}`);
  }
});

const turn = (t: Partial<ChatTurn>): ChatTurn => ({ id: "1", role: "assistant", content: "x", ...t });

test("a complete live answer carries no label", () => {
  assert.equal(turnLabel(turn({ mode: "live" })), null);
  assert.equal(labelTone(turn({ mode: "live" })), "neutral");
});

test("non-live turns are labelled honestly", () => {
  assert.equal(turnLabel(turn({ note: "rate-limited" })), "rate limited");
  assert.equal(turnLabel(turn({ mode: "refusal" })), "declined — out of scope");
  assert.equal(turnLabel(turn({ mode: "live", incomplete: true })), "cut short");
  assert.equal(
    turnLabel(turn({ mode: "fallback", sources: [{ source: "Evaluations", links: [{ label: "Evals", href: "/evals" }] }] })),
    "from site search",
  );
  assert.equal(turnLabel(turn({ mode: "fallback", sources: [] })), null);
  assert.equal(turnLabel(turn({ note: "not-covered" })), null, "a note whose text speaks for itself");
});

test("failed turns are the panel's own failure, not an answer", () => {
  assert.equal(isFailedTurn(turn({ note: "unavailable" })), true);
  assert.equal(isFailedTurn(turn({ note: "rate-limited" })), true);
  assert.equal(isFailedTurn(turn({ note: "timed-out" })), true);
  assert.equal(isFailedTurn(turn({ note: "timed-out", incomplete: true })), false, "kept part of an answer");
  assert.equal(isFailedTurn(turn({ role: "user", note: "unavailable" })), false);
  assert.equal(labelTone(turn({ note: "unavailable" })), "caution");
  assert.equal(labelTone(turn({ mode: "live", incomplete: true })), "caution");
});
