// Unit tests for the GEMINI_MODEL parsing in lib/env.ts. The model id is
// interpolated into the Gemini request path, so only a bare model id may pass;
// anything else must fall back to the default. Run via:
//   node --import ./test/alias-loader.mjs --test "test/**/*.test.mts"

import test from "node:test";
import assert from "node:assert/strict";

const DEFAULT = "gemini-3.5-flash-lite";
const original = process.env.GEMINI_MODEL;
let evaluation = 0;

/** Evaluate lib/env.ts afresh with GEMINI_MODEL set to `value` (unset when undefined). */
async function modelFor(value: string | undefined): Promise<string> {
  if (value === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = value;
  // A distinct query string gives a fresh module instance, so the module-level
  // constant is recomputed from the current environment.
  const env = (await import(`../lib/env.ts?evaluation=${evaluation++}`)) as { GEMINI_MODEL: string };
  return env.GEMINI_MODEL;
}

test.after(() => {
  if (original === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = original;
});

test("an unset or blank GEMINI_MODEL uses gemini-3.5-flash-lite", async () => {
  for (const value of [undefined, "", "   "]) {
    assert.equal(await modelFor(value), DEFAULT, `for ${JSON.stringify(value)}`);
  }
});

test("a bare model id is used as given, trimmed", async () => {
  assert.equal(await modelFor("gemini-3.6-flash"), "gemini-3.6-flash");
  assert.equal(await modelFor("  gemini-3.1-flash-lite  "), "gemini-3.1-flash-lite");
});

test("a value that would reshape the request URL falls back to the default", async () => {
  for (const value of [
    "models/gemini-3.6-flash",
    "gemini-3.6-flash:generateContent",
    "gemini-3.6-flash?key=leak",
    "../../v1/files",
    "gemini 3.6 flash",
    "Gemini-3.6-Flash",
    "-gemini",
  ]) {
    assert.equal(await modelFor(value), DEFAULT, `for ${JSON.stringify(value)}`);
  }
});
