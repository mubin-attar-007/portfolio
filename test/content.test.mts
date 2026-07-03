// Guards the portfolio's single source of truth (lib/content.ts).
// Every project card feeds real, verifiable links — a dead or malformed
// link on the flagship page is a bug, so we assert the shape here.
//
// Runs on Node's built-in test runner with native TypeScript stripping:
//   node --test test/content.test.mts

import test from "node:test";
import assert from "node:assert/strict";

import { projects, profile } from "../lib/content.ts";

const isHttps = (url: string): boolean => {
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
    for (const field of ["slug", "name", "tagline", "description", "accent"] as const) {
      assert.equal(typeof p[field], "string", `${p.slug || "?"}.${field} must be a string`);
      assert.ok(p[field].trim().length > 0, `${p.slug || "?"}.${field} must be non-empty`);
    }
    assert.ok(Array.isArray(p.highlights) && p.highlights.length > 0, `${p.slug}.highlights must be non-empty`);
    assert.ok(Array.isArray(p.stack) && p.stack.length > 0, `${p.slug}.stack must be non-empty`);
  }
});

test("every project's live + github links are valid https URLs", () => {
  for (const p of projects) {
    assert.ok(isHttps(p.live), `${p.slug}.live must be a valid https URL (got: ${p.live})`);
    assert.ok(isHttps(p.github), `${p.slug}.github must be a valid https URL (got: ${p.github})`);
  }
});

test("project slugs are unique", () => {
  const slugs = projects.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate project slug");
});

test("profile core fields are present", () => {
  for (const field of ["name", "role", "tagline", "ethos"] as const) {
    assert.equal(typeof profile[field], "string");
    assert.ok(profile[field].trim().length > 0, `profile.${field} must be non-empty`);
  }
});
