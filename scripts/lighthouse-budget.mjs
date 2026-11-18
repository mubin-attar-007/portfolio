import { spawn } from "node:child_process";
import { access, cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
// Node strips the types: the limits and the redirect list are read from the
// files the site itself uses, so the gate cannot drift from them.
import { SEO_LIMITS } from "../constants/seo.ts";
import nextConfig from "../next.config.ts";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const LIGHTHOUSE_CLI = resolve(
  PROJECT_ROOT,
  "node_modules",
  "lighthouse",
  "cli",
  "index.js",
);
const STANDALONE_ROOT = resolve(PROJECT_ROOT, ".next", "standalone");
const STANDALONE_SERVER = resolve(STANDALONE_ROOT, "server.js");
const SERVER_TIMEOUT_MS = 120_000;
const COMMAND_TIMEOUT_MS = 120_000;
const ROUTES = [
  { label: "home", path: "/" },
  // A public case study: the one that also carries the boundary inspector.
  { label: "case-study", path: "/work/dbwhisper" },
  { label: "writing", path: "/writing/a-validator-is-not-a-better-prompt" },
];
const TITLE_ROUTES = [
  { path: "/", expected: "Mubin Attar — Applied AI Engineer" },
  { path: "/trust", expected: "Trust · Mubin Attar" },
  { path: "/privacy", expected: "Privacy policy · Mubin Attar" },
];
// Pages that must never be indexed or claim a canonical URL: the component
// preview (ADR-007) and the 404, reached through a path that cannot exist.
// Draft case studies join them at run time (draftCaseStudyRoutes).
const UNINDEXED_ROUTES = [
  { path: "/dev/components", status: 200 },
  { path: "/metadata-gate-missing-page", status: 404 },
];
// Crawlers get blocking metadata in <head>; browsers may receive it streamed.
const CRAWLER = { "user-agent": "Googlebot" };
const CATEGORY_BUDGETS = {
  performance: 0.95,
  accessibility: 1,
  "best-practices": 1,
  seo: 1,
};
const AUDIT_BUDGETS = {
  "largest-contentful-paint": {
    label: "LCP",
    // Re-baselined 2000 → 2500 (ADR-018), then 2500 → 2700 (ADR-020): the
    // lab simulation steps in ~75 ms quanta and swings ~600 ms when react-dom
    // evaluates before the first paint, so a limit at the target failed on
    // noise. 2500 stays the target: a median above it prints a warning, and
    // the performance ≥ 95 floor still bounds LCP. A real regression fails.
    limit: 2_700,
    target: 2_500,
    unit: "ms",
    strict: false,
  },
  "cumulative-layout-shift": {
    label: "CLS",
    limit: 0.05,
    unit: "",
    strict: true,
  },
  "total-blocking-time": {
    label: "TBT",
    limit: 150,
    unit: "ms",
    strict: true,
  },
};

// First-load JavaScript budget (transferred/gzipped bytes) per route
// (design-system.md §9, spec/ENGINEERING.md). The home route carries the one
// client chunk — the workbench — so it gets the larger ceiling; content routes
// stay lean. Enforced from Lighthouse's own resource accounting, so "optimized"
// is never a claim without a number.
const SCRIPT_BYTE_BUDGETS = {
  home: 120 * 1024,
  "case-study": 90 * 1024,
  writing: 90 * 1024,
};

/**
 * Total transferred script bytes for a page. Prefers the `resource-summary`
 * rollup (resourceType "script"); falls back to summing `network-requests`
 * (resourceType "Script"). Returns undefined if neither is available.
 */
function scriptTransferBytes(report) {
  const summary = report.audits?.["resource-summary"]?.details?.items ?? [];
  const rollup = summary.find((item) => item.resourceType === "script");
  if (Number.isFinite(rollup?.transferSize)) return rollup.transferSize;
  const requests = report.audits?.["network-requests"]?.details?.items ?? [];
  const total = requests
    .filter((item) => item.resourceType === "Script")
    .reduce((sum, item) => sum + (Number.isFinite(item.transferSize) ? item.transferSize : 0), 0);
  return total > 0 ? total : undefined;
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function openPort() {
  return new Promise((resolvePort, rejectPort) => {
    const probe = createServer();
    probe.once("error", rejectPort);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        probe.close();
        rejectPort(new Error("Could not allocate a local audit port"));
        return;
      }
      probe.close((error) => {
        if (error) rejectPort(error);
        else resolvePort(address.port);
      });
    });
  });
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function commandResult(command, args, options = {}) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: PROJECT_ROOT,
      env: process.env,
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
      ...options,
    });
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      rejectCommand(
        new Error(`${command} exceeded ${COMMAND_TIMEOUT_MS / 1_000}s`),
      );
    }, COMMAND_TIMEOUT_MS);

    child.stderr.on("data", (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-16_000);
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      rejectCommand(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolveCommand();
        return;
      }
      rejectCommand(
        new Error(
          `${command} exited with code ${code ?? "unknown"}${stderr ? `\n${stderr}` : ""}`,
        ),
      );
    });
  });
}

async function waitForServer(baseUrl) {
  const deadline = Date.now() + SERVER_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      await response.body?.cancel();
      if (response.status < 500) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  throw new Error(`Production server did not become ready at ${baseUrl}`);
}

async function stopServer(server) {
  if (!server || server.exitCode !== null) return;

  if (process.platform === "win32") {
    await commandResult(
      "taskkill",
      ["/pid", String(server.pid), "/T", "/F"],
      { env: process.env },
    ).catch(() => undefined);
    return;
  }

  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolveExit) => server.once("exit", resolveExit)),
    new Promise((resolveWait) => setTimeout(resolveWait, 5_000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

function startServer(port) {
  const server = spawn(
    process.execPath,
    [STANDALONE_SERVER],
    {
      cwd: STANDALONE_ROOT,
      env: {
        ...process.env,
        HOSTNAME: "127.0.0.1",
        PORT: String(port),
      },
      windowsHide: true,
      stdio: ["ignore", "ignore", "inherit"],
    },
  );
  server.once("error", (error) => {
    console.error(`Could not start the production server: ${error.message}`);
  });
  return server;
}

async function stageStandaloneAssets() {
  await Promise.all([
    cp(
      resolve(PROJECT_ROOT, ".next", "static"),
      resolve(STANDALONE_ROOT, ".next", "static"),
      { recursive: true, force: true },
    ),
    cp(resolve(PROJECT_ROOT, "public"), resolve(STANDALONE_ROOT, "public"), {
      recursive: true,
      force: true,
    }),
  ]);
}

function attribute(tag, name) {
  const match = tag.match(
    new RegExp(`${name}=(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return match?.[1] ?? match?.[2];
}

/** Text as a reader sees it: the entities React writes into attributes, decoded. */
function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function metaTags(html, key) {
  return (html.match(/<meta\b[^>]*>/gi) ?? []).filter(
    (candidate) =>
      attribute(candidate, "property") === key ||
      attribute(candidate, "name") === key,
  );
}

function metaContent(html, key) {
  const tag = metaTags(html, key)[0];
  const content = tag ? attribute(tag, "content") : undefined;
  return content === undefined ? undefined : decodeEntities(content);
}

function linkTags(html, rel) {
  return (html.match(/<link\b[^>]*>/gi) ?? []).filter(
    (candidate) => attribute(candidate, "rel") === rel,
  );
}

function documentTitle(html) {
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  return title === undefined ? undefined : decodeEntities(title);
}

/** One address however it is spelled: "https://x.app" and "https://x.app/" agree. */
function sameUrl(a, b) {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return false;
  }
}

/** Every tag an indexed page carries exactly once. */
const REQUIRED_META = [
  "description",
  "og:title",
  "og:description",
  "og:site_name",
  "og:locale",
  "og:type",
  "og:image:alt",
  "og:image:width",
  "og:image:height",
  "twitter:card",
  "twitter:title",
  "twitter:description",
];

/** Why a social image would not show, or undefined when it serves an image. */
async function imageProblem(url, baseUrl, expectedOrigin, expectedPath, served) {
  if (!url) return "missing";
  const parsed = new URL(url);
  if (parsed.origin !== expectedOrigin) return `not same-origin (${url})`;
  if (parsed.pathname !== expectedPath) return `is ${parsed.pathname}; expected ${expectedPath}`;
  const local = new URL(`${parsed.pathname}${parsed.search}`, baseUrl).href;
  if (!served.has(local)) {
    const response = await fetch(local, { headers: { "user-agent": "Slackbot 1.0" } });
    const contentType = response.headers.get("content-type") ?? "";
    await response.body?.cancel();
    served.set(
      local,
      response.ok && contentType.startsWith("image/")
        ? undefined
        : `${parsed.pathname}${parsed.search} returned ${response.status} ${contentType || "without a content type"}`,
    );
  }
  return served.get(local);
}

/**
 * One sitemap URL, checked as a crawler reads it: it serves, names itself as
 * its canonical URL and og:url, carries a complete social card whose image
 * loads, advertises the RSS feed, has one h1, fits a results page (the limits
 * in constants/seo.ts), and its structured data parses.
 */
async function pageProblems(loc, baseUrl, served) {
  const url = new URL(loc);
  const response = await fetch(new URL(url.pathname, baseUrl), { headers: CRAWLER });
  if (response.status !== 200) return [`returned ${response.status}`];
  const html = await response.text();
  const problems = [];

  if (url.protocol !== "https:") problems.push(`is advertised as ${loc}; expected an HTTPS URL`);
  const canonicals = linkTags(html, "canonical").map((tag) => attribute(tag, "href"));
  if (canonicals.length !== 1 || !sameUrl(canonicals[0], loc)) {
    problems.push(`canonical is ${canonicals.join(", ") || "missing"}; expected ${loc}`);
  }
  const ogUrl = metaContent(html, "og:url");
  if (!ogUrl || !sameUrl(ogUrl, loc)) {
    problems.push(`og:url is ${ogUrl ?? "missing"}; expected ${loc}`);
  }
  for (const key of REQUIRED_META) {
    const count = metaTags(html, key).length;
    if (count !== 1) problems.push(`${count === 0 ? "missing" : `${count} copies of`} ${key}`);
  }
  const feeds = linkTags(html, "alternate").filter(
    (tag) => attribute(tag, "type") === "application/rss+xml",
  );
  if (feeds.length === 0) problems.push("advertises no RSS feed");

  const headings = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (headings !== 1) problems.push(`has ${headings} h1 elements; expected 1`);

  const title = documentTitle(html) ?? "";
  if (title === "" || title.length > SEO_LIMITS.titleMax) {
    problems.push(`title is ${title.length} characters ("${title}"); at most ${SEO_LIMITS.titleMax}`);
  }
  const description = metaContent(html, "description") ?? "";
  if (
    description.length < SEO_LIMITS.descriptionMin ||
    description.length > SEO_LIMITS.descriptionMax
  ) {
    problems.push(
      `description is ${description.length} characters; expected ${SEO_LIMITS.descriptionMin}–${SEO_LIMITS.descriptionMax} ("${description}")`,
    );
  }

  const structured = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  if (structured.length === 0) problems.push("has no structured data");
  for (const [, json] of structured) {
    try {
      JSON.parse(json);
    } catch (error) {
      problems.push(`structured data does not parse (${error.message})`);
    }
  }

  const expectedImage = `${url.pathname.replace(/\/$/, "")}/opengraph-image`;
  for (const key of ["og:image", "twitter:image"]) {
    const problem = await imageProblem(
      metaContent(html, key),
      baseUrl,
      url.origin,
      expectedImage,
      served,
    );
    if (problem) problems.push(`${key} ${problem}`);
  }
  return problems;
}

/**
 * Case studies that are linked from /work but not in the sitemap: drafts the
 * owner has not published. They must resolve, stay out of search, and name no
 * URL as theirs, like the routes above. Found from the live links rather than
 * listed here, so publishing one (which adds it to the sitemap) moves it to the
 * sitemap checks with no change to this gate. There are none today: the field
 * reports that were drafts became the published flagship case studies
 * (/work/bench-discovery, /work/careltc), and their old addresses redirect.
 */
async function draftCaseStudyRoutes(baseUrl, locs) {
  const listed = new Set(locs.map((loc) => new URL(loc).pathname));
  const response = await fetch(new URL("/work", baseUrl), { headers: CRAWLER });
  const html = await response.text();
  const linked = new Set([...html.matchAll(/href="(\/work(?:\/[a-z0-9-]+)+)"/g)].map((match) => match[1]));
  return [...linked].filter((path) => !listed.has(path)).map((path) => ({ path, status: 200 }));
}

/** The preview route, the 404 and draft case studies are never indexed, and never name a URL as theirs. */
async function unindexedProblems(baseUrl, routes) {
  const problems = [];
  for (const route of routes) {
    const response = await fetch(new URL(route.path, baseUrl), { headers: CRAWLER });
    const html = await response.text();
    const robots = metaTags(html, "robots").map((tag) => attribute(tag, "content")).join(", ");
    if (response.status !== route.status) {
      problems.push(`${route.path}: returned ${response.status}; expected ${route.status}`);
    }
    if (!/\bnoindex\b/i.test(robots)) {
      problems.push(`${route.path}: robots is "${robots || "missing"}"; expected noindex`);
    }
    if (linkTags(html, "canonical").length > 0) problems.push(`${route.path}: declares a canonical URL`);
    const ogUrl = metaContent(html, "og:url");
    if (ogUrl) problems.push(`${route.path}: declares og:url ${ogUrl}`);
  }
  return problems;
}

/** The exact titles a few pages are known by. */
async function titleProblems(baseUrl) {
  const problems = [];
  for (const route of TITLE_ROUTES) {
    const response = await fetch(new URL(route.path, baseUrl), { headers: CRAWLER });
    const title = response.ok ? documentTitle(await response.text()) : undefined;
    if (title !== route.expected) {
      problems.push(`title: ${route.path} is ${title ?? `missing (${response.status})`}; expected ${route.expected}`);
    }
  }
  return problems;
}

/**
 * Every permanent redirect in next.config.ts answers with 308 (or 301) to its
 * destination, never a 404, and is not advertised in the sitemap.
 */
async function redirectProblems(baseUrl, sitemapXml) {
  const problems = [];
  const redirects = (await nextConfig.redirects()).filter((redirect) => redirect.permanent);
  for (const { source, destination } of redirects) {
    const response = await fetch(new URL(source, baseUrl), { redirect: "manual" });
    await response.body?.cancel();
    const location = response.headers.get("location") ?? "";
    if (response.status !== 308 && response.status !== 301) {
      problems.push(`redirect: ${source} returned ${response.status}; expected a permanent redirect to ${destination}`);
    } else if (new URL(location, baseUrl).pathname !== destination) {
      problems.push(`redirect: ${source} points at ${location || "nothing"}; expected ${destination}`);
    }
    if (sitemapXml.includes(`${source}</loc>`)) {
      problems.push(`sitemap: redirected route ${source} must not be advertised`);
    }
  }
  return problems;
}

/** Freshness comes only from dated content, never from the build. */
function freshnessProblems(sitemapXml) {
  const entries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  const aboutEntry = entries.find((item) => item.includes("/about</loc>"));
  const workEntry = entries.find((item) => item.includes("/work</loc>"));
  const problems = [];
  if (!aboutEntry || aboutEntry.includes("<lastmod>")) {
    problems.push("sitemap: static About route must not claim build-time freshness");
  }
  if (!workEntry?.includes("<lastmod>")) {
    problems.push("sitemap: Work index must inherit freshness from project content");
  }
  return problems;
}

/**
 * The metadata gate (`npm run test:metadata`): every sitemap URL, the unindexed
 * routes, the known titles, the redirects, and sitemap freshness. Every problem
 * is collected before it fails, so one run lists all of them.
 */
async function verifyMetadata(baseUrl) {
  const sitemapResponse = await fetch(new URL("/sitemap.xml", baseUrl));
  if (!sitemapResponse.ok) {
    throw new Error(`sitemap: route returned ${sitemapResponse.status}`);
  }
  const sitemapXml = await sitemapResponse.text();
  if (!sitemapXml.includes("<urlset")) {
    throw new Error("sitemap: response is not a sitemap document");
  }
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (locs.length === 0) throw new Error("sitemap: lists no URLs");

  const problems = [];
  const served = new Map();
  for (const loc of locs) {
    for (const problem of await pageProblems(loc, baseUrl, served)) {
      problems.push(`${new URL(loc).pathname}: ${problem}`);
    }
  }
  const unindexed = [...UNINDEXED_ROUTES, ...(await draftCaseStudyRoutes(baseUrl, locs))];
  problems.push(...(await unindexedProblems(baseUrl, unindexed)));
  problems.push(...(await titleProblems(baseUrl)));
  problems.push(...(await redirectProblems(baseUrl, sitemapXml)));
  problems.push(...freshnessProblems(sitemapXml));

  if (problems.length > 0) {
    throw new Error(`Metadata gate: ${problems.length} problem${problems.length === 1 ? "" : "s"}\n- ${problems.join("\n- ")}`);
  }
  console.log(
    `Metadata gate: PASS (${locs.length} sitemap URLs; ${unindexed.length} unindexed routes; ${TITLE_ROUTES.length} exact titles; redirects; freshness)`,
  );
}

async function resolveChromePath() {
  if (process.env.CHROME_PATH) return;
  try {
    const { chromium } = await import("playwright");
    const executable = chromium.executablePath();
    await access(executable);
    process.env.CHROME_PATH = executable;
  } catch {
    // Lighthouse will fall back to Chrome's standard install locations.
  }
}

async function runLighthouse(url, reportPath) {
  let commandError;
  try {
    await commandResult(process.execPath, [
      LIGHTHOUSE_CLI,
      url,
      "--quiet",
      "--output=json",
      `--output-path=${reportPath}`,
      "--form-factor=mobile",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
    ]);
  } catch (error) {
    commandError = error;
  }

  try {
    // On Windows, Chrome can keep its temporary profile locked for a moment
    // after Lighthouse has finished and written a valid report. That cleanup
    // race must not discard the completed audit.
    return JSON.parse(await readFile(reportPath, "utf8"));
  } catch {
    throw commandError ?? new Error(`Lighthouse did not write ${reportPath}`);
  }
}

function auditMedian(reports, auditId) {
  const values = reports
    .map((report) => report.audits?.[auditId]?.numericValue)
    .filter((value) => Number.isFinite(value));
  if (values.length !== reports.length) {
    throw new Error(`${auditId}: Lighthouse did not return a numeric value`);
  }
  return median(values);
}

function evaluateRoute(route, reports) {
  const failures = [];
  const scores = {};
  for (const [category, minimum] of Object.entries(CATEGORY_BUDGETS)) {
    const score = median(
      reports.map((report) => report.categories[category].score),
    );
    scores[category] = score;
    if (score < minimum) {
      failures.push(
        `${category} ${(score * 100).toFixed(0)} < ${(minimum * 100).toFixed(0)}`,
      );
    }
  }

  const audits = {};
  for (const [auditId, budget] of Object.entries(AUDIT_BUDGETS)) {
    const value = auditMedian(reports, auditId);
    audits[auditId] = value;
    const failed = budget.strict ? value >= budget.limit : value > budget.limit;
    if (failed) {
      failures.push(
        `${budget.label} ${value.toFixed(2)}${budget.unit} ${budget.strict ? ">=" : ">"} ${budget.limit}${budget.unit}`,
      );
    } else if (budget.target !== undefined && value > budget.target) {
      console.warn(`::warning::${route.label}: ${budget.label} ${value.toFixed(0)}${budget.unit} is over its ${budget.target}${budget.unit} target (limit ${budget.limit}${budget.unit}); see ADR-020.`);
    }
  }

  // First-load JS byte report (median across runs). ADVISORY, not a hard gate:
  // the measured transfer is framework-dominated (the same shared chunks load on
  // routes with zero page-specific client JS) and depends on the serving
  // environment's compression, so a hard threshold here would red-CI on a
  // pre-existing floor rather than on a real regression. We always PRINT the
  // number (measure, don't claim) and flag when it exceeds the aspirational
  // budget, but do not fail the build on it. Driving first-load JS toward the
  // budget is a dedicated optimization task.
  let jsSummary = "";
  const scriptBudget = SCRIPT_BYTE_BUDGETS[route.label];
  if (scriptBudget) {
    const values = reports
      .map((report) => scriptTransferBytes(report))
      .filter((value) => Number.isFinite(value));
    if (values.length === reports.length) {
      const bytes = median(values);
      const kb = bytes / 1024;
      const over = bytes > scriptBudget;
      jsSummary = ` JS=${kb.toFixed(0)}KB${over ? ` (⚠ over ${(scriptBudget / 1024).toFixed(0)}KB target)` : ""}`;
    }
  }

  const categorySummary = Object.entries(scores)
    .map(([name, score]) => `${name}=${Math.round(score * 100)}`)
    .join(" ");
  const auditSummary = Object.entries(audits)
    .map(([id, value]) => {
      const budget = AUDIT_BUDGETS[id];
      return `${budget.label}=${value.toFixed(budget.unit ? 0 : 3)}${budget.unit}`;
    })
    .join(" ");
  console.log(`${route.label}: ${categorySummary} ${auditSummary}${jsSummary}`);
  console.log(`  ${observedSummary(reports)}`);
  return failures;
}

/**
 * ADVISORY, per run: what the unthrottled trace that Lantern simulates from
 * observed. Lantern charges LCP for every request that finished before the
 * observed LCP, so when a budget fails this says whether the page grew or the
 * paint came later than the scripts. Prints only; decides nothing.
 */
function observedSummary(reports) {
  const runs = reports.map((report) => {
    const metrics = report.audits?.metrics?.details?.items?.[0] ?? {};
    const lcp = metrics.observedLargestContentfulPaint;
    const requests = report.audits?.["network-requests"]?.details?.items ?? [];
    const done = requests.filter((item) => Number.isFinite(item.networkEndTime) && item.networkEndTime <= lcp);
    const scripts = requests.filter((item) => item.resourceType === "Script");
    const doneScripts = done.filter((item) => item.resourceType === "Script");
    const kb = (items) => (items.reduce((sum, item) => sum + (item.transferSize ?? 0), 0) / 1024).toFixed(0);
    // Main-thread tasks of 10 ms or more around the paint. Lantern leaves a
    // script out only when its long evaluation starts after the observed LCP,
    // so this shows on which side of the paint the bootstrap fell.
    const tasks = (report.audits?.["main-thread-tasks"]?.details?.items ?? [])
      .filter((task) => task.duration >= 10 && task.startTime <= lcp + 150)
      .map((task) => `${Math.round(task.startTime)}+${Math.round(task.duration)}`);
    const ends = (type) => requests.filter((item) => item.resourceType === type).map((item) => Math.round(item.networkEndTime));
    const span = (values) => (values.length ? `${Math.min(...values)}–${Math.max(...values)}` : "–");
    return `FCP/LCP ${Math.round(metrics.observedFirstContentfulPaint)}/${Math.round(lcp)}ms, ${done.length} requests ${kb(done)}KB done by LCP (scripts ${doneScripts.length}/${scripts.length}, ${kb(doneScripts)}KB; CSS done ${span(ends("Stylesheet"))}ms, scripts ${span(ends("Script"))}ms), tasks≥10ms ${tasks.join(" ") || "none"}`;
  });
  return `observed: ${runs.join(" | ")}`;
}

async function main() {
  const metadataOnly = process.argv.includes("--metadata-only");
  const runs = Math.min(positiveInteger(process.env.LIGHTHOUSE_RUNS, 3), 5);
  const suppliedBaseUrl = process.env.LIGHTHOUSE_BASE_URL;
  const port = process.env.LIGHTHOUSE_PORT
    ? positiveInteger(process.env.LIGHTHOUSE_PORT, await openPort())
    : await openPort();
  const baseUrl = suppliedBaseUrl ?? `http://127.0.0.1:${port}`;
  const reportDirectory = await mkdtemp(
    join(tmpdir(), "portfolio-lighthouse-"),
  );
  let server;

  try {
    await resolveChromePath();
    if (!suppliedBaseUrl) {
      await access(resolve(PROJECT_ROOT, ".next", "BUILD_ID")).catch(() => {
        throw new Error(
          "No production build found. Run `npm run build` before `npm run test:lighthouse`.",
        );
      });
      await stageStandaloneAssets();
      server = startServer(port);
    }
    await waitForServer(baseUrl);
    await verifyMetadata(baseUrl);
    if (metadataOnly) {
      console.log("Metadata release gate: PASS");
      return;
    }

    const allFailures = [];
    for (const route of ROUTES) {
      const reports = [];
      for (let run = 1; run <= runs; run += 1) {
        const reportPath = join(
          reportDirectory,
          `${route.label}-${run}.json`,
        );
        reports.push(
          await runLighthouse(new URL(route.path, baseUrl).href, reportPath),
        );
      }
      const failures = evaluateRoute(route, reports);
      allFailures.push(
        ...failures.map((failure) => `${route.label}: ${failure}`),
      );
    }

    if (allFailures.length > 0) {
      throw new Error(`Lighthouse budget failures:\n- ${allFailures.join("\n- ")}`);
    }
    console.log(`Lighthouse budget gate: PASS (${runs} run${runs === 1 ? "" : "s"} per route)`);
  } finally {
    await stopServer(server);
    await rm(reportDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
