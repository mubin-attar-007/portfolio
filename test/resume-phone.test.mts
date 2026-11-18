// The phone number is published in the résumé PDF and nowhere else (owner,
// 17 Nov 2026). The PDF is a document a recruiter chooses to download; the
// site's pages, llms.txt and JSON-LD are read by anything that crawls them.
// The number lives in scripts/resume-document.mts, held only in parts, so the
// PDF is the one place it appears whole. These tests prove the PDF carries it,
// as text and as a tel: link, and that no file in the repository does: no page
// source, content module, config, library, script, test, doc or public text
// file, however its digits are spaced or punctuated.
//
//   node --import ./test/alias-loader.mjs --test test/resume-phone.test.mts

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { PHONE, RESUME_PDF_PATH, renderResumeHtml } from "../scripts/resume-document.mts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** The number's ten national digits, with any spacing or punctuation between them. */
const NATIONAL = PHONE.href.replace(/\D/g, "").slice(-10);
const PHONE_PATTERN = new RegExp(NATIONAL.split("").join("[\\s().-]*"));

/**
 * Everything the site's pages, metadata, JSON-LD, feeds and assistant are built
 * from, plus the scripts, tests and docs that sit beside them in the public repo.
 */
const SOURCE_DIRS = ["app", "components", "config", "constants", "content", "lib", "styles", "scripts", "test", "spec"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".js", ".mjs", ".json", ".md", ".mdx", ".css"]);
/** Files under public/ that are served as text, exactly as written. */
const PUBLIC_TEXT_EXTENSIONS = new Set([".txt", ".xml", ".json", ".html", ".md", ".vtt", ".svg", ".webmanifest", ".js", ".css", ".csv"]);

/** Absolute paths of the files under `dir` whose extension is in `extensions`. */
function filesUnder(dir: string, extensions: ReadonlySet<string>): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path, extensions);
    return extensions.has(extname(name)) ? [path] : [];
  });
}

test("the pattern finds the number however it is written", () => {
  // Built from the number itself, so this file never spells it out.
  const [first, rest] = [NATIONAL.slice(0, 5), NATIONAL.slice(5)];
  const [area, exchange, line] = [NATIONAL.slice(0, 3), NATIONAL.slice(3, 6), NATIONAL.slice(6)];
  const ways = [PHONE.display, PHONE.href, NATIONAL, `${first}-${rest}`, `(${area}) ${exchange}-${line}`, `${area}.${exchange}.${line}`];
  for (const written of ways) {
    assert.match(written, PHONE_PATTERN, `a positive control: "${written}"`);
  }
  assert.doesNotMatch("7038 770 37", PHONE_PATTERN, "a negative control: a different number");
});

test("the résumé PDF carries the phone number, as text and as a tel: link", () => {
  const html = renderResumeHtml();
  assert.ok(html.includes(PHONE.display), "the document shows the number");
  assert.ok(html.includes(`href="${PHONE.href}"`), "and links it");
  const pdf = readFileSync(RESUME_PDF_PATH).toString("latin1");
  assert.ok(pdf.includes(`/URI (${PHONE.href})`), "the committed PDF links it — run `npm run build:resume`");
});

test("no page source, content module or public text file carries the number", () => {
  const sources = SOURCE_DIRS.flatMap((dir) => filesUnder(join(ROOT, dir), SOURCE_EXTENSIONS));
  const rootDocs = readdirSync(ROOT).filter((name) => extname(name) === ".md").map((name) => join(ROOT, name));
  const publicText = filesUnder(join(ROOT, "public"), PUBLIC_TEXT_EXTENSIONS);
  assert.ok(publicText.some((file) => file.endsWith("llms.txt")), "public/llms.txt is among the files checked");
  assert.ok(sources.some((file) => file.endsWith(join("content", "resume.ts"))), "content/resume.ts is among the files checked");
  assert.ok(sources.some((file) => file.endsWith(join("scripts", "resume-document.mts"))), "the PDF's own module is among the files checked");
  assert.ok(rootDocs.some((file) => file.endsWith("README.md")), "README.md is among the files checked");

  const carriers = [...sources, ...rootDocs, ...publicText]
    .filter((file) => PHONE_PATTERN.test(readFileSync(file, "utf8")))
    .map((file) => relative(ROOT, file).replace(/\\/g, "/"));
  assert.deepEqual(carriers, [], `the phone number appears whole only in the PDF:\n${carriers.join("\n")}`);
});
