// Unit tests for lib/ai/role-fit.ts: a pasted job description's requirements,
// each matched to the site passage closest to it, and the comparison served
// when no model can write one.

import test from "node:test";
import assert from "node:assert/strict";

import {
  evidencePassages,
  matchRequirements,
  MAX_REQUIREMENTS,
  requirementsOf,
  roleFitFallback,
} from "../lib/ai/role-fit.ts";

const BULLETED = [
  "Applied AI Engineer (LLM Applications)",
  "About the role",
  "We're looking for an Applied AI Engineer to build and ship LLM-powered features for our customers.",
  "Responsibilities",
  "- Design, build and deploy retrieval-augmented generation (RAG) systems in production",
  "- Build evaluation pipelines and guardrails for model output",
  "Requirements",
  "- 3+ years of experience with Python or TypeScript",
  "- Familiarity with Kubernetes and Terraform",
  "- Strong understanding of SQL and PostgreSQL",
  "We offer a competitive salary, visa sponsorship and relocation support.",
].join("\n");

const EXPECTED = [
  "Design, build and deploy retrieval-augmented generation (RAG) systems in production",
  "Build evaluation pipelines and guardrails for model output",
  "3+ years of experience with Python or TypeScript",
  "Familiarity with Kubernetes and Terraform",
  "Strong understanding of SQL and PostgreSQL",
];

test("a bulleted description gives its items, in order, without the title, the company's voice or the employer's terms", () => {
  assert.deepEqual(requirementsOf(BULLETED), EXPECTED);
});

test("the same description flattened to one line, as the route's guard sends it, gives the same requirements", () => {
  assert.deepEqual(requirementsOf(BULLETED.replace(/\s+/g, " ").trim()), EXPECTED);
});

test("prose with inline headings gives its clauses", () => {
  const prose =
    "Applied AI Engineer. About the role: we're looking for an engineer to ship LLM features. " +
    "Requirements: 3+ years of experience with Python or TypeScript; experience with LLM APIs; familiarity with Kubernetes. " +
    "We offer a competitive salary and visa sponsorship.";
  assert.deepEqual(requirementsOf(prose), [
    "3+ years of experience with Python or TypeScript",
    "experience with LLM APIs",
    "familiarity with Kubernetes",
  ]);
});

test("at most eight requirements, each once", () => {
  const many = Array.from({ length: 12 }, (_, i) => `- Experience with framework number ${i} in production`).join("\n");
  assert.equal(requirementsOf(many).length, MAX_REQUIREMENTS);
  assert.deepEqual(requirementsOf("- Experience with Python and Go\n- Experience with Python and Go\n- Build APIs on AWS daily"), [
    "Experience with Python and Go",
    "Build APIs on AWS daily",
  ]);
});

test("a requirement whose words the site never uses has no passage; one it covers has its closest page", () => {
  const [kubernetes, postgres, python, evals] = matchRequirements([
    "Familiarity with Kubernetes and Terraform",
    "Strong understanding of SQL and PostgreSQL",
    "3+ years of experience with Python or TypeScript",
    "Build evaluation pipelines and guardrails for model output",
  ]);
  assert.equal(kubernetes!.passage, null);
  assert.ok(postgres!.passage, "PostgreSQL is in his stack");
  assert.equal(python!.passage?.id, "skills-languages");
  // A withdrawn result is never evidence of a skill.
  assert.ok(evals!.passage && !evals!.passage.retired, evals!.passage?.id);
});

test("a comparison cites the résumé first, then each matched page once", () => {
  const items = matchRequirements(["Strong understanding of SQL and PostgreSQL", "Strong understanding of SQL and PostgreSQL", "Familiarity with Kubernetes"]);
  const ids = evidencePassages(items).map((p) => p.id);
  assert.equal(ids[0], "resume-document");
  assert.equal(new Set(ids).size, ids.length);
});

test("without a model, the comparison lists each requirement with its closest page, said to be site search", () => {
  const text = roleFitFallback(matchRequirements(["Familiarity with Kubernetes", "3+ years of experience with Python or TypeScript"]));
  assert.match(text, /^Live answers aren't available right now/);
  assert.match(text, /not a judgement of fit/);
  assert.match(text, /\n- Familiarity with Kubernetes: not on the site/);
  assert.match(text, /\n- 3\+ years of experience with Python or TypeScript: closest page, Skills/);
});
