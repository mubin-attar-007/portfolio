// Unit tests for the frontmatter reader in lib/ai/corpus.ts. The assistant's
// index is built synchronously at module load, so it reads MDX frontmatter
// itself instead of through next-mdx-remote; it must read the forms this repo
// writes and fail loudly on anything else, never drop an entry silently.

import test from "node:test";
import assert from "node:assert/strict";

import { splitFrontmatter } from "../lib/ai/corpus.ts";

test("strings, booleans, numbers and inline lists are read", () => {
  const { data, body } = splitFrontmatter(
    '---\ntitle: "A: colon inside"\ndraft: false\norder: 3\ntopics: ["RAG", "NL→SQL"]\nsource: \'it\'\'s\'\n---\nBody text\n',
    "x.mdx",
  );
  assert.deepEqual(data, { title: "A: colon inside", draft: false, order: 3, topics: ["RAG", "NL→SQL"], source: "it's" });
  assert.equal(body, "Body text\n");
});

test("block lists are read", () => {
  const { data } = splitFrontmatter("---\ntags:\n  - evals\n  - sql\n---\n", "x.mdx");
  assert.deepEqual(data, { tags: ["evals", "sql"] });
});

test("a file without frontmatter is all body", () => {
  assert.deepEqual(splitFrontmatter("Just text", "x.mdx"), { data: {}, body: "Just text" });
});

test("unsupported frontmatter fails loudly, naming the file", () => {
  assert.throws(() => splitFrontmatter("---\nnested:\n  key: value\n---\n", "content/notes/x.mdx"), /content\/notes\/x\.mdx/);
});

test("block lists of flat records are read (the /now page's exploring list)", () => {
  const { data } = splitFrontmatter(
    '---\nupdated: "2026-07-10"\nexploring:\n  - title: "One"\n    body: "First, with: a colon"\n  - title: "Two"\n    body: "Second"\n---\n',
    "now.mdx",
  );
  assert.deepEqual(data, {
    updated: "2026-07-10",
    exploring: [
      { title: "One", body: "First, with: a colon" },
      { title: "Two", body: "Second" },
    ],
  });
});
