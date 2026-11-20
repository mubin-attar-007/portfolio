// The golden set's offline gate (test/fixtures/assistant-golden.ts), inside
// `npm test`, with no quota: every item through the whole pipeline
// (`handleChat`), twice.
//
//   - With a fake model: the outcome (live, declined, not covered), the pages
//     cited, the actions, the forbidden strings in what a visitor sees and in
//     the context, and that the context the model is handed holds every fact a
//     correct answer needs.
//   - Without a key: every answerable item still comes back from site search,
//     citing an expected page, and nothing forbidden is served.
//
// The live eval (`npm run eval:assistant`) scores the model's own answers; it
// needs a key and never runs in CI. The disclosure denylist is private: it is
// checked when `.local/showcase/denylist.txt` exists, and skipped otherwise.

import test from "node:test";
import assert from "node:assert/strict";

import { GOLDEN } from "./fixtures/assistant-golden.ts";
import { fakeOptions, loadDenylist, runItem, scoreItem, wordingFlags, type ItemScore } from "./fixtures/golden-harness.ts";
import { SYSTEM_PROMPT } from "../lib/ai/system-prompt.ts";

const denylist = loadDenylist();

/** One line per failed check, for a readable assertion. */
function describeFailures(scores: readonly ItemScore[]): string[] {
  return scores
    .filter((s) => !s.pass)
    .map((s) => {
      const c = s.checks;
      const why = [
        !c.outcome && `outcome ${s.outcome} (expected ${s.expected})`,
        c.paths === false && `cited ${s.cited.join(", ") || "nothing"}`,
        ...(c.facts ?? []).filter((f) => !f.ok).map((f) => `missing ${f.fact}`),
        ...c.forbidden.map((f) => `forbidden ${f}`),
        ...(c.actions ?? []).filter((a) => !a.ok).map((a) => `no ${a.kind} action`),
        c.citationsGrounded === false && "a citation outside the retrieved passages",
        !c.labels && "an unreadable citation",
      ].filter(Boolean);
      return `${s.id}: ${why.join("; ")}`;
    });
}

test("the golden set is the size and shape the brief sets", () => {
  const byArea = (area: string) => GOLDEN.filter((item) => item.area === area).length;
  assert.equal(byArea("flagship"), 20);
  assert.equal(byArea("public"), 4);
  assert.equal(byArea("hiring"), 11);
  assert.equal(byArea("skills"), 5);
  assert.equal(byArea("writing-evals"), 5);
  assert.equal(byArea("off-topic"), 4);
  assert.equal(byArea("injection"), 4);
  assert.equal(byArea("robustness"), 6);
  assert.equal(byArea("chain"), 3);
  assert.equal(new Set(GOLDEN.map((item) => item.id)).size, GOLDEN.length, "ids are unique");
});

test("offline gate: every golden item, with a fake model", async () => {
  const scores: ItemScore[] = [];
  for (const item of GOLDEN) scores.push(scoreItem(item, await runItem(item, fakeOptions), "fake", denylist));
  assert.deepEqual(describeFailures(scores), []);
});

test("offline gate: every golden item, without a key (site search only)", async () => {
  const scores: ItemScore[] = [];
  for (const item of GOLDEN) {
    const runs = await runItem(item, (capture) => ({ live: false, log: (entry) => capture.logs.push(entry) }));
    scores.push(scoreItem(item, runs, "fallback", denylist));
  }
  assert.deepEqual(describeFailures(scores), []);
});

test("the live eval flags wording a fact check cannot see, and only that", () => {
  const context = "Notice period for full-time roles: 1 month. Trained on games across 2012–24.";
  // The slip that prompted the flag (2026-11-17): a compound the context never uses.
  assert.deepEqual(wordingFlags("His notice period for full-themed roles is 1 month.", context), ['"full-themed" is not in its context']);
  // Compounds the context does use, and numeric ranges, are not flagged.
  assert.deepEqual(wordingFlags("His notice period for full-time roles is 1 month, on games across 2012-24.", context), []);
  // A run of the rules pasted into an answer is flagged once, whole.
  const rules = SYSTEM_PROMPT.split(/\s+/).slice(12, 24).join(" ");
  const flags = wordingFlags(`Sure. ${rules}.`, context);
  assert.equal(flags.length, 1, flags.join("; "));
  assert.match(flags[0]!, /^copied from the rules: /);
  // The sentence rule 5 asks for word for word is the point, not a copy.
  assert.deepEqual(wordingFlags("That isn't on the site — ask Mubin directly.", context), []);
});
