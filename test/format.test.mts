// Unit tests for the pure metric/delta helpers (lib/format.ts). Run via:
//   node --import ./test/alias-loader.mjs --test "test/**/*.test.mts"

import test from "node:test";
import assert from "node:assert/strict";

import { parseMetricNumber, deltaTone, deltaArrow } from "../lib/format.ts";

test("parseMetricNumber extracts the leading number", () => {
  assert.equal(parseMetricNumber("45 min"), 45);
  assert.equal(parseMetricNumber("31%"), 31);
  assert.equal(parseMetricNumber("$0.0024"), 0.0024);
  assert.equal(parseMetricNumber("1,204 rows"), 1204);
  assert.equal(parseMetricNumber("-3 pts"), -3);
  assert.equal(parseMetricNumber("read-only ✓"), null);
});

test("deltaTone respects the good-direction", () => {
  assert.equal(deltaTone("45 min", "6 min", "down-good"), "positive");
  assert.equal(deltaTone("31%", "11%", "down-good"), "positive");
  assert.equal(deltaTone("60%", "65%", "up-good"), "positive");
  assert.equal(deltaTone("65%", "60%", "up-good"), "negative");
  assert.equal(deltaTone("6 min", "45 min", "down-good"), "negative");
  assert.equal(deltaTone(undefined, "6 min", "down-good"), "neutral");
  assert.equal(deltaTone("6 min", "6 min", "down-good"), "neutral");
});

test("deltaArrow pairs a glyph with each tone", () => {
  assert.equal(deltaArrow("positive"), "▲");
  assert.equal(deltaArrow("negative"), "▼");
  assert.equal(deltaArrow("neutral"), "→");
});
