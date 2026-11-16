// Guards the published evidence. content/evals.ts writes every evaluation
// figure down once; these tests fail when a surface quotes a figure that was
// retired, when code retypes a registry figure instead of reading it, or when
// static text (MDX, captions, llms.txt — which cannot import the registry)
// quotes one that disagrees with it. They also hold the copy rules that a
// figure-free page can still break: the superseded job title and the
// lowercased acronym.
//
//   node --test test/evidence.test.mts

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CROWNWAGER_EVIDENCE,
  DBWHISPER_EVIDENCE,
  evals,
  formatRatio,
  publishedEvals,
} from "../content/evals.ts";
import { about } from "../content/site.ts";
import { SITE } from "../config/site.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** Repo-relative paths of the files under `dir` with one of `extensions`. */
function filesUnder(dir: string, extensions: readonly string[]): string[] {
  const out: string[] = [];
  const walk = (abs: string) => {
    for (const name of readdirSync(abs)) {
      const path = join(abs, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (extensions.includes(extname(name))) out.push(relative(ROOT, path).replace(/\\/g, "/"));
    }
  };
  walk(join(ROOT, dir));
  return out;
}

const read = (file: string): string => readFileSync(join(ROOT, file), "utf8");

/** The registry itself — the one file allowed to write a figure down. */
const REGISTRY = "content/evals.ts";

/** Code that renders pages, cards, the PDF and the assistant: it must read figures, never type them. */
const CODE = [
  ...filesUnder("app", [".ts", ".tsx"]),
  ...filesUnder("components", [".ts", ".tsx"]),
  ...filesUnder("config", [".ts"]),
  ...filesUnder("content", [".ts"]),
  ...filesUnder("lib", [".ts", ".tsx"]),
  "scripts/resume-document.mts",
  "scripts/build-resume-pdf.mts",
].filter((file) => file !== REGISTRY);

/** Text served or indexed as written, which therefore has to quote the registry exactly. */
const STATIC = [
  ...filesUnder("content", [".mdx", ".json"]),
  ...filesUnder("public/demos", [".vtt"]),
  "public/llms.txt",
];

/**
 * Figures DBWhisper's own claim audit withdrew (golden set: 18/22 exact, 21/22
 * lenient, 4/4 refused, the 22/22 baseline) and the scale claims it deleted.
 */
const RETIRED = [
  /\b(?:18|21|22)\s*(?:\/|of)\s*22\b/,
  /\b4\s*(?:\/|of)\s*4\b/,
  /\b(?:82|95)\s*%/,
  /100\s*%\s*fail-closed/i,
  /hundreds of tables/i,
  /large databases/i,
  /with many tables/i,
  /beyond toy (?:schemas|databases)/i,
];

test("no page, caption, or file quotes a figure DBWhisper's audit retired", () => {
  const hits: string[] = [];
  for (const file of [...CODE, ...STATIC, REGISTRY]) {
    const text = read(file);
    for (const pattern of RETIRED) {
      const match = pattern.exec(text);
      if (match) hits.push(`${file}: "${match[0]}"`);
    }
  }
  assert.deepEqual(hits, [], `retired figures or scale claims are still published:\n${hits.join("\n")}`);
});

test("a retired registry row keeps its reason and audit but publishes no figure", () => {
  const retired = evals.filter((e) => e.status === "retired");
  assert.ok(retired.length > 0, "the withdrawn golden-set run stays listed, as a retired row");
  for (const row of retired) {
    assert.ok(row.retired?.reason, `${row.benchmark}: a retired row says why`);
    assert.match(row.retired?.link ?? "", /^https:\/\/github\.com\/.+\/blob\/[0-9a-f]{40}\//, `${row.benchmark}: the audit is linked at a fixed commit`);
    assert.equal(row.score, undefined, `${row.benchmark}: a retired row has no score`);
    assert.doesNotMatch(`${row.result} ${row.note ?? ""}`, /\d+\s*(?:\/|of)\s*\d+|\d\s*%/, `${row.benchmark}: no figure in the retired row`);
  }
  assert.ok(!publishedEvals.some((e) => e.status === "retired"), "publishedEvals excludes retired rows");
});

/** Registry figures as the pages print them. Code must read these, never retype them. */
const REGISTRY_FIGURES = [
  DBWHISPER_EVIDENCE.policy.ratio,
  DBWHISPER_EVIDENCE.spider.ratio,
  DBWHISPER_EVIDENCE.spider.share,
  CROWNWAGER_EVIDENCE.cv.result,
  CROWNWAGER_EVIDENCE.cv.mean,
  CROWNWAGER_EVIDENCE.baseRate,
  CROWNWAGER_EVIDENCE.holdout.accuracy,
  CROWNWAGER_EVIDENCE.holdout.rocAuc,
  CROWNWAGER_EVIDENCE.holdout.logLoss,
];

test("code reads evaluation figures from the registry instead of retyping them", () => {
  const hits: string[] = [];
  for (const file of CODE) {
    const text = read(file);
    for (const figure of REGISTRY_FIGURES) {
      if (text.includes(figure)) hits.push(`${file}: "${figure}"`);
    }
  }
  assert.deepEqual(hits, [], `import the figure from content/evals.ts instead:\n${hits.join("\n")}`);
});

/** Every N/M a static surface may print: a scored row's counts, or its floor over the full sample. */
const PUBLISHED_RATIOS = new Set(
  publishedEvals.flatMap((e) =>
    e.score
      ? [formatRatio(e.score), ...(e.score.sampled ? [`${e.score.passed}/${e.score.sampled}`] : [])]
      : [],
  ),
);
/** Every "mean ± spread" a static surface may print. */
const PUBLISHED_SPREADS = new Set(publishedEvals.map((e) => e.result).filter((r) => r.includes("±")));

test("static text quotes registry figures exactly", () => {
  const hits: string[] = [];
  for (const file of STATIC) {
    // A URL can hold a slash between digits that is not a ratio, and a split
    // ("an 80/20 hold-out") is method notation, not a result.
    const text = read(file).replace(/https?:\/\/\S+/g, "");
    for (const [ratio] of text.matchAll(/\b\d+\/\d+\b(?!\s+(?:hold-out|split))/g)) {
      if (!PUBLISHED_RATIOS.has(ratio)) hits.push(`${file}: "${ratio}" is not a registry ratio`);
    }
    for (const [spread] of text.matchAll(/\d+(?:\.\d+)?%\s*±\s*\d+(?:\.\d+)?%/g)) {
      if (!PUBLISHED_SPREADS.has(spread)) hits.push(`${file}: "${spread}" is not a registry result`);
    }
  }
  assert.deepEqual(hits, [], `static text disagrees with content/evals.ts:\n${hits.join("\n")}`);
});

test("the superseded job title appears nowhere on the site", () => {
  // The brand role is SITE.role ("Applied AI Engineer"); the employment title
  // is "AI/ML Engineer" at Sevina. "AI Software Engineer" was retired (ADR-015).
  const hits = [...CODE, ...STATIC, REGISTRY].filter((file) => /AI Software Engineer/i.test(read(file)));
  assert.deepEqual(hits, [], `use SITE.role (or the employment title) instead:\n${hits.join("\n")}`);
});

test("the role reads correctly inside a sentence", () => {
  assert.equal(SITE.roleInSentence.toLowerCase(), SITE.role.toLowerCase(), "the two forms name one role");
  assert.match(SITE.roleInSentence, /\bAI\b/, "the acronym stays capitalised");
  for (const paragraph of about.body) {
    assert.doesNotMatch(paragraph, /\bai\b/, `a lowercased "ai" in /about: ${paragraph.slice(0, 60)}…`);
  }
  const lowered = CODE.filter((file) => /\brole\.toLowerCase\(\)/.test(read(file)));
  assert.deepEqual(lowered, [], `use SITE.roleInSentence instead of lowercasing the role:\n${lowered.join("\n")}`);
});
