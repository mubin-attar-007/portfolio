import test from "node:test";
import assert from "node:assert/strict";
import { citationLinks } from "../lib/ai/citation-links.ts";

test("case-study citations lead to the named project", () => {
  assert.deepEqual(citationLinks("DBWhisper case study — Architecture"), [
    { label: "DBWhisper", href: "/work/dbwhisper" },
  ]);
});

test("a source that cites two projects exposes both, not an arbitrary first match", () => {
  assert.deepEqual(
    citationLinks("FAQ — TradePulse — ai/service.py; CrownWager — assistant/services.py"),
    [
      { label: "TradePulse", href: "/work/tradepulse" },
      { label: "CrownWager", href: "/work/crownwager" },
    ],
  );
});

test("career and skills sources point to their published pages", () => {
  assert.deepEqual(citationLinks("Résumé — Sevina Technologies (AI/ML Engineer)"), [
    { label: "Résumé", href: "/resume" },
  ]);
  assert.deepEqual(citationLinks("Skills — LLMs & agents"), [
    { label: "Skills", href: "/skills" },
  ]);
});

test("unknown sources and URL-looking text never become arbitrary navigation", () => {
  for (const source of ["Unpublished source", "javascript:alert(1)", "//outside.example", "https://outside.example"]) {
    assert.deepEqual(citationLinks(source), []);
  }
});
