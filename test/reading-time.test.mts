// Unit tests for the reading-time estimator (lib/reading-time.ts). Run via:
//   node --import ./test/alias-loader.mjs --test "test/**/*.test.mts"

import test from "node:test";
import assert from "node:assert/strict";

import { countWords, readingMinutes } from "../lib/reading-time.ts";

test("countWords counts plain prose", () => {
  assert.equal(countWords("one two three four five"), 5);
  assert.equal(countWords("  padded   with   whitespace  "), 3);
  assert.equal(countWords(""), 0);
  assert.equal(countWords("   \n  "), 0);
});

test("countWords ignores frontmatter", () => {
  const source = ["---", "title: A post about nothing at all", "draft: false", "---", "body words here"].join("\n");
  assert.equal(countWords(source), 3);
});

test("countWords ignores fenced code and inline code", () => {
  const source = ["real words here", "```ts", "const x = someVeryLongIdentifier(1, 2, 3);", "```", "and `inline()` too"].join("\n");
  // "real words here" (3) + "and" + "too" (2) = 5
  assert.equal(countWords(source), 5);
});

test("countWords keeps prose inside JSX but drops the tags", () => {
  assert.equal(countWords('<Callout tone="warn">two words</Callout>'), 2);
});

test("countWords keeps a link label and drops its target", () => {
  assert.equal(countWords("see [the validator](https://example.com/a/b) now"), 4);
});

test("countWords does not let markdown punctuation split words", () => {
  assert.equal(countWords("## A heading"), 2);
  assert.equal(countWords("**bold** and _italic_"), 3);
});

test("readingMinutes floors a non-empty body at one minute", () => {
  assert.equal(readingMinutes("a few words"), 1);
  assert.equal(readingMinutes(""), 0);
  assert.equal(readingMinutes("```ts\nonly();\n```"), 0);
});

test("readingMinutes scales at 220 words per minute", () => {
  assert.equal(readingMinutes(Array(220).fill("word").join(" ")), 1);
  assert.equal(readingMinutes(Array(660).fill("word").join(" ")), 3);
  assert.equal(readingMinutes(Array(1100).fill("word").join(" ")), 5);
});
