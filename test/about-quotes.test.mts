// The About quote band's lines (content/pages/about.ts `quotes`) are mine, word
// for word: each appears in the essay it links to, and carries that essay's
// title. A quote is never paraphrased into something the essay does not say.
//
//   node --import ./test/alias-loader.mjs --test test/about-quotes.test.mts

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { aboutPage } from "../content/pages/about.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** Straight quotes and apostrophes, single spaces, no Markdown emphasis: the text as read. */
const plain = (text: string): string =>
  text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();

test("each line on the About quote band is in its essay, word for word, under the essay's own title", () => {
  assert.ok(aboutPage.quotes.length >= 2, "a carousel needs more than one line");
  for (const quote of aboutPage.quotes) {
    const slug = quote.essay.href.replace(/^\/writing\//, "");
    const source = readFileSync(join(ROOT, "content", "writing", `${slug}.mdx`), "utf8");
    const title = /^title:\s*"([^"]+)"/m.exec(source)?.[1];
    assert.equal(quote.essay.label, title, `${slug}: the label is the essay's title`);
    assert.ok(plain(source).includes(plain(quote.text)), `"${quote.text}" is not in ${slug}.mdx`);
  }
});
