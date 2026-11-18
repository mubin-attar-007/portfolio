// The home page's showcase (content/pages/home.ts SHOWCASE): every screen of a
// flagship names two captures its product has, and no screen repeats another;
// the hiring screen quotes the assistant's own replies, each for the gap the
// assistant reads in that question; and every product has more than one screen.
//
//   node --import ./test/alias-loader.mjs --test test/home-showcase.test.mts

import test from "node:test";
import assert from "node:assert/strict";

import { benchDiscovery } from "../content/flagship/bench-discovery.ts";
import { careltc } from "../content/flagship/careltc.ts";
import { flagshipCapture } from "../content/flagship/index.ts";
import { signflow } from "../content/flagship/signflow.ts";
import { SHOWCASE } from "../content/pages/home.ts";
import { GAP_OPENING } from "../lib/ai/hiring-gaps.ts";
import { readIntent } from "../lib/ai/intent.ts";

const FLAGSHIP_SCREENS = [
  [benchDiscovery, SHOWCASE.views.benchDiscovery],
  [careltc, SHOWCASE.views.careltc],
  [signflow, SHOWCASE.views.signflow],
] as const;

test("each flagship screen shows two of its product's own captures, and no capture twice", () => {
  for (const [flagship, views] of FLAGSHIP_SCREENS) {
    const shown = views.flatMap((view) => view.captures.map((name) => flagshipCapture(flagship, name).src));
    assert.equal(new Set(shown).size, shown.length, `${flagship.slug}: a capture appears on two screens`);
  }
});

test("every product in the showcase has a tab and more than one screen, each with its own id", () => {
  for (const [product, views] of Object.entries(SHOWCASE.views)) {
    assert.ok(product in SHOWCASE.tabs, `${product}: no tab`);
    assert.ok(views.length > 1, `${product}: one screen needs no pills`);
    assert.equal(new Set(views.map((view) => view.id)).size, views.length, `${product}: two screens share an id`);
  }
});

test("the hiring screen's replies are the assistant's own, for the gap it reads in each question", () => {
  for (const question of SHOWCASE.hiring.questions) {
    assert.equal(readIntent(question.question).gap, question.gap, `"${question.question}" is not read as ${question.gap}`);
    assert.equal(question.answer, GAP_OPENING[question.gap]);
  }
});
