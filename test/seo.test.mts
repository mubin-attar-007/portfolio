// Search and social metadata (lib/seo.ts, lib/excerpt.ts): titles fit a results
// page, descriptions are the author's own words cut where a sentence ends —
// never a tag list — and every page states its own canonical URL, social card
// and feeds. The built pages are checked again by `npm run test:metadata`.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { SITE } from "../config/site.ts";
import { SEO_LIMITS } from "../constants/seo.ts";
import { projects } from "../content/projects.ts";
import { CONTENT_SLUG } from "../lib/content-slug.ts";
import { firstParagraph, fitDescription } from "../lib/excerpt.ts";
import { absoluteUrl, documentTitle, OG_LOCALE, pageMetadata, SITE_FEED, TITLE_SUFFIX } from "../lib/seo.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const { titleMax, descriptionMin, descriptionMax } = SEO_LIMITS;

/** The title a browser tab shows for `title`, after the root template. */
function shownTitle(title: string): string {
  const resolved = documentTitle(title);
  return typeof resolved === "string" ? `${resolved}${TITLE_SUFFIX}` : resolved.absolute;
}

/** One quoted frontmatter scalar, or undefined. */
function field(front: string, key: string): string | undefined {
  const raw = new RegExp(`^${key}:\\s*(".*")\\s*$`, "m").exec(front)?.[1];
  return raw === undefined ? undefined : (JSON.parse(raw) as string);
}

/** Published entries of a collection, read as files (the loader compiles React). */
function published(dir: "writing" | "notes"): { slug: string; source: string; front: string }[] {
  return readdirSync(join(ROOT, "content", dir))
    .filter((file) => file.endsWith(".mdx") && CONTENT_SLUG.test(file.slice(0, -4)))
    .map((file) => {
      const source = readFileSync(join(ROOT, "content", dir, file), "utf8").replace(/\r\n?/g, "\n");
      return { slug: file.slice(0, -4), source, front: /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? "" };
    })
    .filter((entry) => !/^draft:\s*true\s*$/m.test(entry.front));
}

test("a description that fits is used whole", () => {
  const text = "Two SQL queries can be spelled differently and return exactly the same rows.";
  assert.equal(fitDescription(text), text);
});

test("a long description keeps whole sentences and stays within the limit", () => {
  const first = "A Sharpe ratio is meaningless without the risk-free rate it assumed — change the rate and the number moves.";
  const text = `${first} Most backtests quietly pick one, often zero, and never say so, which is exactly the habit this note is about.`;
  const fitted = fitDescription(text);
  assert.equal(fitted, first);
  assert.ok(fitted.length <= descriptionMax);
});

test("a question mark inside a quotation does not end the sentence", () => {
  const first = 'The tempting place to check "does this user own this row?" is the route handler.';
  const text = `${first} It's also the easy place to forget — one new endpoint without the check and you've leaked another tenant's data.`;
  assert.equal(fitDescription(text), first);
});

test("when no whole sentence is long enough, the words that fit end in an ellipsis", () => {
  const text = `Short opener. ${"An unusually long second sentence keeps going ".repeat(5)}until it ends.`;
  const fitted = fitDescription(text);
  assert.ok(fitted.endsWith("…"), fitted);
  assert.ok(fitted.length <= descriptionMax && fitted.length >= descriptionMin, `${fitted.length}`);
  assert.doesNotMatch(fitted, /[\s,;:—(]…$/, "no dangling joiner before the ellipsis");
});

test("firstParagraph reads the opening prose as plain text", () => {
  const source = [
    "---",
    'title: "A note"',
    "---",
    "",
    "## A heading",
    "",
    'import { Callout } from "x";',
    "",
    "Run **ruff** and `date_trunc(...)` in [DBWhisper](/work/dbwhisper), _less often_ than snake_case_names suggest.",
    "",
    "Second paragraph.",
  ].join("\r\n");
  assert.equal(
    firstParagraph(source),
    "Run ruff and date_trunc(...) in DBWhisper, less often than snake_case_names suggest.",
  );
  assert.equal(firstParagraph("---\ntitle: x\n---\n\n<Figure />\n"), "");
});

test("documentTitle drops the suffix rather than cut the page's own name", () => {
  assert.equal(documentTitle("Work"), "Work");
  const long = "Enforce tenancy in the repository layer, not the route";
  assert.deepEqual(documentTitle(long), { absolute: long });
  const fits = "x".repeat(titleMax - TITLE_SUFFIX.length);
  assert.equal(documentTitle(fits), fits, "exactly at the limit keeps the suffix");
  assert.deepEqual(documentTitle(`${fits}x`), { absolute: `${fits}x` });
});

test("pageMetadata gives a page its own canonical URL, complete social card, and the site feed", () => {
  const m = pageMetadata({ path: "/about", title: "About", description: "What the page holds." });
  const url = absoluteUrl("/about");
  assert.equal(url, `${SITE.url}/about`);
  assert.equal(m.alternates?.canonical, url);
  assert.deepEqual(m.alternates?.types?.["application/rss+xml"], [SITE_FEED]);
  assert.deepEqual(m.openGraph, {
    siteName: SITE.name,
    locale: OG_LOCALE,
    url,
    description: "What the page holds.",
    type: "website",
    title: `About — ${SITE.name}`,
  });
  assert.equal(m.title, "About");
});

test("an article's card is titled by the article and carries its facts", () => {
  const m = pageMetadata({
    path: "/notes/a-note",
    title: "A note",
    description: "d",
    article: { publishedTime: "2026-01-02", tags: ["evals"] },
    social: { description: "card" },
    feeds: [{ url: `${SITE.url}/writing/feed.xml`, title: "Writing" }],
  });
  assert.equal(m.alternates?.canonical, `${SITE.url}/notes/a-note`);
  assert.deepEqual(m.alternates?.types?.["application/rss+xml"], [
    SITE_FEED,
    { url: `${SITE.url}/writing/feed.xml`, title: "Writing" },
  ]);
  assert.ok(m.openGraph && "type" in m.openGraph && m.openGraph.type === "article");
  assert.equal(m.openGraph.title, "A note");
  assert.equal(m.openGraph.description, "card");
  assert.deepEqual(
    { publishedTime: m.openGraph.publishedTime, tags: m.openGraph.tags, authors: m.openGraph.authors },
    { publishedTime: "2026-01-02", tags: ["evals"], authors: [SITE.name] },
  );
});

test("an absolute title is the whole title, on the page and on its card", () => {
  const home = `${SITE.name} — ${SITE.role}`;
  const m = pageMetadata({ path: "/", title: { absolute: home }, description: SITE.description });
  assert.deepEqual(m.title, { absolute: home });
  assert.equal(m.openGraph?.title, home);
  assert.equal(m.alternates?.canonical, `${SITE.url}/`);
});

test("every published note has a title and a description that fit a results page", () => {
  const notes = published("notes");
  assert.ok(notes.length > 0);
  for (const note of notes) {
    const title = field(note.front, "title");
    assert.ok(title, `${note.slug}: a quoted title`);
    assert.ok(shownTitle(title).length <= titleMax, `${note.slug}: "${shownTitle(title)}"`);
    // noteDescription (lib/notes.ts): the author's summary, else the opening sentences.
    const description = field(note.front, "summary") ?? fitDescription(firstParagraph(note.source));
    assert.ok(
      description.length >= descriptionMin && description.length <= descriptionMax,
      `${note.slug}: ${description.length} characters — "${description}"`,
    );
    assert.doesNotMatch(description, /^A short note on /, `${note.slug}: described by its tags`);
  }
});

test("every essay, case study and the site itself fit a results page", () => {
  for (const essay of published("writing")) {
    const title = field(essay.front, "title") ?? "";
    const summary = field(essay.front, "summary") ?? "";
    assert.ok(shownTitle(title).length <= titleMax, `${essay.slug}: "${shownTitle(title)}"`);
    assert.ok(summary.length >= descriptionMin && summary.length <= descriptionMax, `${essay.slug}: ${summary.length}`);
  }
  for (const project of projects) {
    assert.ok(shownTitle(`${project.title} — case study`).length <= titleMax, project.slug);
    assert.ok(project.summary.length >= descriptionMin, `${project.slug}: ${project.summary.length}`);
  }
  assert.ok(SITE.description.length >= descriptionMin && SITE.description.length <= descriptionMax);
});
