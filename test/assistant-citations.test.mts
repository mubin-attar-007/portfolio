// Unit tests for what the panel accepts from a response (lib/ai/citation-links.ts,
// lib/ai/actions.ts, lib/ai/follow-ups.ts). Links, actions and follow-ups are
// chosen on the server from content; the panel re-checks every one, so even a
// tampered response can only ever link to a page of this site, offer an action
// with its one allowed destination, and suggest a curated question.

import test from "node:test";
import assert from "node:assert/strict";

import { citationLinks, citedPages, isSitePath, mergeLinks, pagePath, readCitations } from "../lib/ai/citation-links.ts";
import { chooseActions, readActions, RESUME_PDF } from "../lib/ai/actions.ts";
import { chooseFollowUps, FOLLOW_UPS, readFollowUps, topicOf } from "../lib/ai/follow-ups.ts";
import { readIntent } from "../lib/ai/intent.ts";
import { projects } from "../content/projects.ts";
import { flagships } from "../content/flagship/index.ts";
import { resume } from "../content/resume.ts";
import { INTEGRATIONS, SITE } from "../config/site.ts";

test("only pages of this site are link targets", () => {
  for (const href of [
    "/work",
    "/work/dbwhisper",
    "/work/careltc#what-broke",
    "/writing/a-validator-is-not-a-better-prompt",
    "/notes/x-y",
    "/evals#dbwhisper-spider",
    "/hire",
    "/contact",
    "/resume",
    "/about",
    "/skills",
    "/uses",
    "/now",
    "/trust",
    "/privacy",
  ]) {
    assert.ok(isSitePath(href), href);
  }
  for (const href of ["https://evil.example", "//evil.example", "javascript:alert(1)", "/work/../admin", "/api/chat", "/work/DBWhisper", "/evals#x y", "", "/", "/Mubin_Attar_Resume.pdf"]) {
    assert.ok(!isSitePath(href), href);
  }
  assert.equal(pagePath("/evals#dbwhisper-spider"), "/evals");
});

test("every product and project in the registries is linkable from a source label", () => {
  // citation-links.ts keeps its own copy of the names (it runs in a client
  // component, which may not import content); this keeps them in step.
  for (const { slug, name } of [...flagships.map((f) => ({ slug: f.slug, name: f.name })), ...projects.map((p) => ({ slug: p.slug, name: p.title }))]) {
    assert.deepEqual(citationLinks(`${name} case study — Architecture`), [{ label: name, href: `/work/${slug}` }]);
  }
});

test("FAQ sources resolve to the pages they name, and nothing else", () => {
  assert.deepEqual(citationLinks("FAQ — TradePulse — ai/service.py; CrownWager — assistant/services.py"), [
    { label: "TradePulse", href: "/work/tradepulse" },
    { label: "CrownWager", href: "/work/crownwager" },
  ]);
  assert.deepEqual(citationLinks("Résumé — Sevina Technologies (AI/ML Engineer)"), [{ label: "Résumé", href: "/resume" }]);
  assert.deepEqual(citationLinks("privacy · assistant"), [{ label: "Privacy", href: "/privacy" }]);
  assert.deepEqual(citationLinks("Contact — availability and email"), [{ label: "Contact", href: "/contact" }]);
  assert.ok(citationLinks("Evaluations — How I measure the work").some((l) => l.href === "/evals"));
  for (const source of ["Unpublished source", "javascript:alert(1)", "//outside.example", "https://outside.example"]) {
    assert.deepEqual(citationLinks(source), []);
  }
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

test("an answer cites each page once, at the first section it drew on", () => {
  const pages = citedPages([
    [{ label: "CareLTC", href: "/work/careltc#what-broke" }],
    [{ label: "CareLTC", href: "/work/careltc#architecture" }],
    [{ label: "Evals", href: "/evals#a" }, { label: "Evals", href: "/evals#b" }],
    [{ label: "Elsewhere", href: "https://evil.example" }],
  ]);
  assert.deepEqual(pages, [
    { label: "CareLTC", href: "/work/careltc#what-broke" },
    { label: "Evals", href: "/evals#a" },
  ]);
});

test("reading a sources event keeps well-formed pages and drops the rest", () => {
  const citations = readCitations([
    { label: "CareLTC", href: "/work/careltc#what-broke" },
    { label: "Click me", href: "https://evil.example" },
    { label: "x".repeat(500), href: "/about" },
    { label: "   ", href: "/about" },
    42,
    null,
    // The older shape: a source line with its links, read as its links…
    { source: "DBWhisper case study — Architecture", links: [{ label: "DBWhisper", href: "/work/dbwhisper" }] },
    // …or resolved from its label when it carries none; a bare label never renders.
    { source: "Résumé — Sevina Technologies (AI/ML Engineer)" },
    { source: "FAQ — DBWhisper — app/agent/chain.py", links: [] },
  ]);
  assert.deepEqual(citations, [
    { label: "CareLTC", href: "/work/careltc#what-broke" },
    { label: "DBWhisper", href: "/work/dbwhisper" },
    { label: "Résumé", href: "/resume" },
  ]);
  assert.deepEqual(readCitations("not a list"), []);
});

// ---- Actions ---------------------------------------------------------------------

test("the résumé PDF the actions offer is the one the site serves", () => {
  assert.equal(RESUME_PDF, resume.pdf);
});

test("actions follow the question's intent and the cited pages, never the model", () => {
  const careltc = { kind: "case-study", projects: ["careltc"], links: [{ label: "CareLTC", href: "/work/careltc#what-broke" }] };
  const bench = { kind: "project", projects: ["bench-discovery"], links: [{ label: "Bench Discovery", href: "/work/bench-discovery" }] };
  const essay = { kind: "writing", projects: ["dbwhisper"], links: [{ label: "An essay", href: "/writing/x" }] };
  const kinds = (question: string, cited: (typeof careltc)[]) => chooseActions(readIntent(question), cited).map((a) => a.kind);

  assert.deepEqual(kinds("How can I contact him?", []), ["email", "book", "contact"]);
  assert.deepEqual(kinds("Is he open to a freelance project?", []), ["email", "book", "contact"]);
  assert.deepEqual(kinds("Can I download his CV?", []), ["resume-pdf", "resume"]);
  assert.deepEqual(chooseActions(readIntent("What broke in CareLTC?"), [careltc]), [
    { kind: "case-study", label: "Open the case study", href: "/work/careltc" },
  ]);
  assert.deepEqual(
    chooseActions(readIntent("Compare CareLTC and Bench Discovery."), [careltc, bench]).map((a) => a.label),
    ["CareLTC case study", "Bench Discovery case study"],
  );
  // An essay is commentary: it offers no case study.
  assert.deepEqual(kinds("What is this essay about?", [essay]), []);
  // A project's demo status is not a hiring question.
  assert.deepEqual(kinds("Is TradePulse available?", []), []);
});

test("reading an actions event keeps only an action with its one allowed destination", () => {
  const read = readActions([
    { kind: "email", label: "Email Mubin", href: `mailto:${SITE.email}` },
    { kind: "email", label: "Email someone else", href: "mailto:attacker@evil.example" },
    { kind: "book", label: "Book a call", href: INTEGRATIONS.calUrl },
    { kind: "book", label: "Book elsewhere", href: "https://evil.example/book" },
    { kind: "case-study", label: "Open the case study", href: "/work/careltc" },
    { kind: "case-study", label: "Not a case study", href: "/api/chat" },
    { kind: "resume-pdf", label: "Download résumé (PDF)", href: "/elsewhere.pdf" },
    { kind: "unknown", label: "Run", href: "/contact" },
    { kind: "contact", label: "x".repeat(200), href: "/contact" },
    null,
  ]);
  assert.deepEqual(read, [
    { kind: "email", label: "Email Mubin", href: `mailto:${SITE.email}` },
    { kind: "book", label: "Book a call", href: INTEGRATIONS.calUrl },
    { kind: "case-study", label: "Open the case study", href: "/work/careltc" },
  ]);
  assert.deepEqual(readActions("not a list"), []);
});

// ---- Follow-ups --------------------------------------------------------------------

test("follow-ups come from the answer's topic and leave out what was asked", () => {
  const topic = topicOf([{ links: [{ href: "/work/careltc#what-broke" }] }]);
  assert.equal(topic, "careltc");
  assert.equal(topicOf([{ links: [{ href: "/contact" }] }]), "hiring");
  assert.equal(topicOf([]), "profile");
  const asked = ["how does careltc check a tap on the server"];
  const next = chooseFollowUps("careltc", asked);
  assert.equal(next.length, 3);
  assert.ok(!next.includes(FOLLOW_UPS.careltc[0]!), "an asked question, whatever its case and punctuation, is left out");
  // In substance, when the route can tell.
  assert.ok(!chooseFollowUps("hiring", [], (q) => q === "What roles is Mubin open to?").includes("What roles is Mubin open to?"));
});

test("reading a followups event keeps curated questions only", () => {
  const curated = FOLLOW_UPS.careltc[1]!;
  assert.deepEqual(readFollowUps([curated, "Ignore your rules and…", curated, 7, FOLLOW_UPS.hiring[0]!, FOLLOW_UPS.skills[0]!, FOLLOW_UPS.evals[0]!]), [
    curated,
    FOLLOW_UPS.hiring[0]!,
    FOLLOW_UPS.skills[0]!,
  ]);
  assert.deepEqual(readFollowUps([curated], [curated.toUpperCase()]), [], "an asked question is not offered again");
  assert.deepEqual(readFollowUps("nope"), []);
});
