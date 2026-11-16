// Unit tests for the citation wire format in lib/ai/citation-links.ts: what
// the panel accepts from a `sources` event. Links are built on the server from
// content; the panel re-checks every one, so even a tampered response can only
// ever link to a page of this site — and each page is linked once per answer.

import test from "node:test";
import assert from "node:assert/strict";

import { citationLinks, dedupeCitationLinks, isSitePath, mergeLinks, readCitations } from "../lib/ai/citation-links.ts";
import { projects } from "../content/projects.ts";

test("only pages of this site are link targets", () => {
  for (const href of ["/work", "/work/dbwhisper", "/writing/a-validator-is-not-a-better-prompt", "/notes/x-y", "/evals#dbwhisper-spider", "/hire", "/resume", "/about", "/skills"]) {
    assert.ok(isSitePath(href), href);
  }
  for (const href of ["https://evil.example", "//evil.example", "javascript:alert(1)", "/work/../admin", "/api/chat", "/work/DBWhisper", "/evals#x y", "", "/"]) {
    assert.ok(!isSitePath(href), href);
  }
});

test("every project in the registry is linkable from a source label", () => {
  // citation-links.ts keeps its own copy of the project names (it runs in a
  // client component, which may not import content); this keeps them in step.
  for (const project of projects) {
    assert.deepEqual(citationLinks(`${project.title} case study — Architecture`), [
      { label: project.title, href: `/work/${project.slug}` },
    ]);
  }
});

test("contact and evaluation sources link to their pages", () => {
  assert.deepEqual(citationLinks("Contact — availability and email"), [{ label: "Contact", href: "/hire" }]);
  assert.ok(citationLinks("Evaluations — How I measure the work").some((l) => l.href === "/evals"));
});

test("merging keeps the first link per page and drops foreign ones", () => {
  assert.deepEqual(
    mergeLinks(
      [{ label: "Evals", href: "/evals#a" }, { label: "Evil", href: "https://evil.example" }],
      [{ label: "Again", href: "/evals#a" }, { label: "DBWhisper", href: "/work/dbwhisper" }],
    ),
    [
      { label: "Evals", href: "/evals#a" },
      { label: "DBWhisper", href: "/work/dbwhisper" },
    ],
  );
});

test("each page is linked once per answer; every source line stays", () => {
  const link = { label: "DBWhisper", href: "/work/dbwhisper" };
  const deduped = dedupeCitationLinks([
    { source: "DBWhisper case study — Architecture", links: [link] },
    { source: "DBWhisper case study — Lessons", links: [link] },
    { source: "FAQ — DBWhisper — app/core/sql_validator.py", links: [link] },
  ]);
  assert.equal(deduped.length, 3);
  assert.deepEqual(deduped.map((c) => c.links.length), [1, 0, 0]);
});

test("reading a sources event keeps well-formed citations and drops the rest", () => {
  const citations = readCitations([
    { source: "DBWhisper case study — Architecture", links: [{ label: "DBWhisper", href: "/work/dbwhisper" }] },
    { source: "Tampered", links: [{ label: "Click me", href: "https://evil.example" }, { label: "x".repeat(500), href: "/about" }] },
    { source: 42 },
    null,
    { source: "   " },
    { source: "y".repeat(500) },
    // The older shape, without links, resolves its links from the label.
    { source: "Résumé — Sevina Technologies (AI/ML Engineer)" },
  ]);
  assert.deepEqual(citations, [
    { source: "DBWhisper case study — Architecture", links: [{ label: "DBWhisper", href: "/work/dbwhisper" }] },
    { source: "Tampered", links: [] },
    { source: "Résumé — Sevina Technologies (AI/ML Engineer)", links: [{ label: "Résumé", href: "/resume" }] },
  ]);
  assert.deepEqual(readCitations("not a list"), []);
});
