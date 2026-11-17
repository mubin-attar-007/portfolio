// Keeps public/llms.txt — a hand-written file served as-is to AI readers —
// complete and truthful. It must list every published page, project, essay,
// note and evaluation row; link a demo only while the site links one; carry
// the same role, availability and contact as config/site.ts; and quote no
// figure the registry does not hold (test/evidence.test.mts checks the
// figures themselves). When this fails, update the file; nothing generates it.
//
//   node --test test/llms-txt.test.mts

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { evalAnchor, evals, formatRatio } from "../content/evals.ts";
import { flagships } from "../content/flagship/index.ts";
import { USAGE } from "../content/flagship/shared.ts";
import { projects } from "../content/projects.ts";
import { CONTENT_SLUG } from "../lib/content-slug.ts";
import { SITE, STATUS } from "../config/site.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const LLMS = readFileSync(join(ROOT, "public", "llms.txt"), "utf8").replace(/\r\n?/g, "\n");
const LINES = LLMS.split("\n");
const url = (path: string): string => `${SITE.url}${path}`;

/** True when the file links `href` as a markdown link target. */
const links = (href: string): boolean => LLMS.includes(`](${href})`);

/** Published entries of one MDX collection — slug and title, drafts excluded. */
function published(dir: "writing" | "notes"): { slug: string; title: string }[] {
  return readdirSync(join(ROOT, "content", dir))
    .filter((file) => file.endsWith(".mdx") && CONTENT_SLUG.test(file.slice(0, -4)))
    .map((file) => {
      const source = readFileSync(join(ROOT, "content", dir, file), "utf8").replace(/\r\n?/g, "\n");
      const front = /^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? "";
      const title = /^title:\s*(".*")\s*$/m.exec(front)?.[1];
      assert.ok(title, `content/${dir}/${file} has a quoted title`);
      return { slug: file.slice(0, -4), title: JSON.parse(title) as string, draft: /^draft:\s*true\s*$/m.test(front) };
    })
    .filter((entry) => !entry.draft);
}

/** Top-level app folders that publish no page: the API, and the noindex preview (ADR-007). */
const UNPUBLISHED = new Set(["api", "dev"]);

/**
 * The static pages and feeds the app serves, read from the app directory, so a
 * new page is required here the day it is added: a folder with a page.tsx is a
 * page, a `*.xml` folder with a route.ts is a feed, and app/sitemap.ts is
 * /sitemap.xml. Dynamic segments are the collections the tests below check.
 */
function staticRoutes(): string[] {
  const routes: string[] = [];
  const walk = (dir: string, path: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith("[") || (path === "" && UNPUBLISHED.has(entry.name))) continue;
        walk(join(dir, entry.name), `${path}/${entry.name}`);
      } else if ((entry.name === "page.tsx" && path !== "") || (entry.name === "route.ts" && path.endsWith(".xml"))) {
        routes.push(path);
      }
    }
  };
  walk(join(ROOT, "app"), "");
  if (existsSync(join(ROOT, "app", "sitemap.ts"))) routes.push("/sitemap.xml");
  return routes.sort();
}

test("it names the role, the availability line, the notice period and the contact routes", () => {
  assert.ok(LLMS.startsWith(`# ${SITE.name} — ${SITE.role}\n`), "the H1 is the name and SITE.role");
  assert.ok(LLMS.includes(STATUS.text), "the availability line matches STATUS.text");
  assert.ok(
    LINES.includes(`- Notice period for full-time roles: ${STATUS.noticePeriod}.`),
    "the notice period line matches STATUS.noticePeriod",
  );
  assert.ok(LLMS.includes(SITE.email), "the contact email matches SITE.email");
  assert.ok(links(url(STATUS.href)), "the contact route is linked");
});

test("it links every static page and feed the app serves", () => {
  const routes = staticRoutes();
  assert.ok(routes.includes("/work") && routes.includes("/rss.xml"), `the app directory was read: ${routes.join(", ")}`);
  const missing = routes.filter((path) => !links(url(path)));
  assert.deepEqual(missing, [], `public/llms.txt is missing: ${missing.join(", ")}`);
  assert.ok(links(url("/Mubin_Attar_Resume.pdf")), "the résumé PDF is linked");
});

test("it lists every flagship case study with its usage figure, in the approved wording only", () => {
  for (const flagship of flagships) {
    const line = LINES.find((l) => l.startsWith(`- [${flagship.name}](${url(`/work/${flagship.slug}`)})`));
    assert.ok(line, `${flagship.name}: listed under its case study`);
    assert.ok(line.includes(USAGE[flagship.slug].sentence), `${flagship.name}: "${USAGE[flagship.slug].sentence}"`);
    // In use, never "in daily use": no fact supports "daily".
    assert.doesNotMatch(line, /\bdaily\b/i, `${flagship.name}: no "daily"`);
  }
  // The figures the owner replaced on 17 Nov 2026.
  for (const stale of ["5 clients", "10 desktop users", "200–300", "200-300", "5 admins"]) {
    assert.ok(!LLMS.toLowerCase().includes(stale.toLowerCase()), `no "${stale}"`);
  }
});

test("it frames the role as the site does (Applied AI Engineer), never under a retired title", () => {
  assert.doesNotMatch(LLMS, /forward[- ]deployed|\bFDE\b/i);
});

test("it lists every project with its case study and source", () => {
  for (const p of projects) {
    assert.ok(links(url(`/work/${p.slug}`)), `${p.title}: case study`);
    assert.ok(p.links.repo && LLMS.includes(p.links.repo), `${p.title}: source`);
    if (p.links.live) assert.ok(LLMS.includes(p.links.live), `${p.title}: its deployed demo`);
  }
});

test("it links a deployed demo only while the site links it", () => {
  const demos = new Set(projects.flatMap((p) => (p.links.live ? [p.links.live] : [])));
  const hosted = [...LLMS.matchAll(/https:\/\/[a-z0-9.-]+\.(?:vercel\.app|hf\.space)[^\s)]*/g)]
    .map(([href]) => href.replace(/\/$/, ""))
    .filter((href) => !href.startsWith(SITE.url));
  const stray = hosted.filter((href) => !demos.has(href));
  assert.deepEqual(stray, [], `a demo the site no longer links (it is down, or was never linked): ${stray.join(", ")}`);
});

test("it links only the profiles the site itself links", () => {
  const allowed = new Set<string>([...Object.values(SITE.socials), ...projects.flatMap((p) => (p.links.repo ? [p.links.repo] : []))]);
  const profiles = [...LLMS.matchAll(/https:\/\/(?:www\.)?(?:github\.com|linkedin\.com|huggingface\.co|leetcode\.com|x\.com|twitter\.com)[^\s)]*/g)].map(([href]) => href);
  const stray = profiles.filter((href) => !allowed.has(href));
  assert.deepEqual(stray, [], `not in SITE.socials or a project record: ${stray.join(", ")}`);
});

test("it lists every published essay, guide and note under its title", () => {
  for (const { slug, title } of published("writing")) {
    assert.ok(LLMS.includes(`[${title}](${url(`/writing/${slug}`)})`), `writing: ${slug}`);
  }
  for (const { slug, title } of published("notes")) {
    assert.ok(LLMS.includes(`[${title}](${url(`/notes/${slug}`)})`), `note: ${slug}`);
  }
});

test("it lists every dated evaluation row, with its result or, if retired, without one", () => {
  for (const row of evals) {
    const anchor = `${url("/evals")}#${evalAnchor(row)}`;
    const line = LINES.find((l) => l.includes(`](${anchor})`));
    assert.ok(line, `${row.system} / ${row.benchmark}: linked at ${anchor}`);
    if (row.date) assert.ok(line.includes(row.date), `${row.benchmark}: dated ${row.date}`);
    if (row.status === "retired") {
      assert.match(line, /\bretired\b/i, `${row.benchmark}: says it is retired`);
      assert.doesNotMatch(line.replace(/\d{4}-\d{2}-\d{2}/g, ""), /\d+\s*(?:\/|of)\s*\d+|\d\s*%/, `${row.benchmark}: quotes no retired figure`);
    } else {
      const figure = row.score ? formatRatio(row.score) : row.result.split(" · ")[0]!;
      assert.ok(line.includes(figure), `${row.benchmark}: quotes ${figure}`);
    }
  }
});
