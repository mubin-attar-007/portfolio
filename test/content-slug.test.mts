// Unit tests for the content-slug guard (lib/content-slug.ts) — the check that
// stops a URL segment from naming a file outside its MDX collection. Run via:
//   node --import ./test/alias-loader.mjs --test "test/**/*.test.mts"

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { CONTENT_SLUG, contentFilePath } from "../lib/content-slug.ts";

const EXT = ".mdx";
const NOTES = path.join(process.cwd(), "content", "notes");
const REAL = "every-deploy-gated-by-ci";

const assertRejected = (slugs: string[]) => {
  for (const slug of slugs) {
    assert.equal(contentFilePath(NOTES, slug, EXT), null, `must reject ${JSON.stringify(slug)}`);
  }
};

test("a kebab-case slug resolves to its file inside the collection root", () => {
  assert.equal(contentFilePath(NOTES, REAL, EXT), path.join(NOTES, `${REAL}${EXT}`));
});

test("every authored entry stays reachable under its own file name", () => {
  for (const dir of ["writing", "notes"]) {
    const root = path.join(process.cwd(), "content", dir);
    const files = fs.readdirSync(root).filter((file) => file.endsWith(EXT));
    assert.ok(files.length > 0, `content/${dir} has entries`);
    for (const file of files) {
      const slug = file.slice(0, -EXT.length);
      assert.match(slug, CONTENT_SLUG, `content/${dir}/${file} must be named as a slug`);
      assert.equal(contentFilePath(root, slug, EXT), path.join(root, file));
    }
  }
});

test("parent-directory traversal is rejected", () => {
  assertRejected([
    `../notes/${REAL}`,
    `../writing/${REAL}`,
    "..",
    "../../package",
    `a/../../${REAL}`,
    `./${REAL}`,
    `notes/${REAL}`,
  ]);
});

test("URL-encoded traversal is rejected, including double encoding", () => {
  assertRejected([
    `..%2Fnotes%2F${REAL}`,
    `%2e%2e%2fnotes%2f${REAL}`,
    `%2E%2E%2F%2E%2E%2Fpackage`,
    `..%5Cnotes%5C${REAL}`,
    `..%252Fnotes%252F${REAL}`,
  ]);
});

test("backslash traversal is rejected", () => {
  assertRejected([`..\\notes\\${REAL}`, "..\\..\\package", `notes\\..\\..\\${REAL}`]);
});

test("absolute paths are rejected", () => {
  assertRejected([
    "/etc/passwd",
    "C:\\Windows\\win.ini",
    "C:/Windows/win.ini",
    "\\\\server\\share\\secret",
    path.join(NOTES, REAL),
  ]);
});

test("an empty or blank slug is rejected", () => {
  assertRejected(["", " ", "\n", "\t"]);
});

test("characters outside the slug alphabet are rejected", () => {
  assertRejected([
    "Every-Deploy-Gated-By-CI",
    `${REAL}${EXT}`,
    "under_score",
    "with space",
    "nul\0byte",
    "trailing-newline\n",
  ]);
});

test("the containment check holds even when the slug itself is well-formed", () => {
  // Only a hostile extension can push a valid slug outside the root; the
  // assertion behind the pattern must still catch it.
  assert.equal(contentFilePath(NOTES, REAL, `/../../${REAL}${EXT}`), null);
});

test("a root given relatively or with a trailing separator resolves the same file", () => {
  const expected = path.join(NOTES, `${REAL}${EXT}`);
  assert.equal(contentFilePath(path.join("content", "notes"), REAL, EXT), expected);
  assert.equal(contentFilePath(`${NOTES}${path.sep}`, REAL, EXT), expected);
});
