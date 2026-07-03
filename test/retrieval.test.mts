// Grounding proof for the chatbot's retrieval layer. Asserts that for each of
// the 10 representative questions, retrieve() surfaces the expected source and
// the top passage mentions the required terms. Runs with ZERO LLM quota:
//   node --test test/retrieval.test.mts
//
// This is the load-bearing check that the assistant answers from real content.

import test from "node:test";
import assert from "node:assert/strict";

import { retrieve, corpusSize } from "../lib/ai/retrieval.ts";
import { TEST_QUESTIONS } from "../lib/ai/test-questions.ts";

test("corpus ingested a non-trivial number of passages", () => {
  assert.ok(corpusSize() >= 25, `expected >= 25 passages, got ${corpusSize()}`);
});

test("every test question retrieves the expected source + required terms", () => {
  const failures: string[] = [];

  for (const q of TEST_QUESTIONS) {
    const hits = retrieve(q.question, { k: 4 });
    if (hits.length === 0) {
      failures.push(`"${q.question}" → no passages retrieved`);
      continue;
    }

    // Expected source should appear in the TOP passage's source (strongest
    // signal). We check the top hit specifically.
    const top = hits[0];
    if (!top.source.includes(q.expectedSource)) {
      failures.push(
        `"${q.question}" → top source "${top.source}" does not include "${q.expectedSource}"`,
      );
    }

    const topLower = top.text.toLowerCase();
    for (const term of q.mustMention) {
      if (!topLower.includes(term.toLowerCase())) {
        failures.push(`"${q.question}" → top passage missing term "${term}"`);
      }
    }
  }

  assert.equal(
    failures.length,
    0,
    `\n  ${failures.join("\n  ")}\n(${TEST_QUESTIONS.length - failures.length}/${TEST_QUESTIONS.length} clean)`,
  );
});
