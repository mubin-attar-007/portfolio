// Guards the projects content (content/projects.ts) — the source of truth for
// the work index + case-study headers. A dead link or a metric without a method
// is a content-law violation, so we assert the shape here.
//
//   node --test test/content.test.mts

import test from "node:test";
import assert from "node:assert/strict";

import { projects, featuredProject } from "../content/projects.ts";

const isHttps = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
};

test("there are exactly 4 live projects", () => {
  assert.equal(projects.length, 4);
});

test("every project has non-empty required text fields", () => {
  for (const p of projects) {
    for (const field of ["slug", "title", "summary", "status", "role", "timeline"] as const) {
      assert.equal(typeof p[field], "string", `${p.slug || "?"}.${field} must be a string`);
      assert.ok(p[field].trim().length > 0, `${p.slug || "?"}.${field} must be non-empty`);
    }
    assert.ok(Array.isArray(p.systems) && p.systems.length > 0, `${p.slug}.systems must be non-empty`);
    assert.ok(Array.isArray(p.metrics) && p.metrics.length > 0, `${p.slug}.metrics must be non-empty`);
  }
});

test("every metric has a method footnote (content law)", () => {
  for (const p of projects) {
    for (const m of p.metrics) {
      assert.ok(typeof m.label === "string" && m.label.trim().length > 0, `${p.slug} metric missing label`);
      assert.ok(typeof m.value === "string" && m.value.trim().length > 0, `${p.slug}.${m.label} missing value`);
      assert.ok(
        typeof m.method === "string" && m.method.trim().length > 0,
        `${p.slug}.${m.label} must state its method`,
      );
    }
  }
});

test("every project's live + repo links are valid https URLs", () => {
  for (const p of projects) {
    assert.ok(isHttps(p.links.live), `${p.slug}.links.live must be https (got: ${p.links.live})`);
    assert.ok(isHttps(p.links.repo), `${p.slug}.links.repo must be https (got: ${p.links.repo})`);
  }
});

test("project slugs are unique", () => {
  const slugs = projects.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate project slug");
});

test("exactly one project is featured (the flagship)", () => {
  const featured = projects.filter((p) => p.featured);
  assert.equal(featured.length, 1, "there must be exactly one featured project");
  assert.equal(featuredProject.slug, featured[0]!.slug, "featuredProject must be the featured one");
});
