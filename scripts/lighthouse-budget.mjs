import { spawn } from "node:child_process";
import { access, cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

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
  { label: "flagship", path: "/work/dbwhisper" },
  { label: "writing", path: "/writing/a-validator-is-not-a-better-prompt" },
];
const TITLE_ROUTES = [
  { path: "/", expected: "Mubin Attar — AI Software Engineer" },
  { path: "/trust", expected: "Trust · Mubin Attar" },
  { path: "/changelog", expected: "Changelog · Mubin Attar" },
  { path: "/privacy", expected: "Privacy policy · Mubin Attar" },
];
const CATEGORY_BUDGETS = {
  performance: 0.95,
  accessibility: 1,
  "best-practices": 1,
  seo: 1,
};
const AUDIT_BUDGETS = {
  "largest-contentful-paint": {
    label: "LCP",
    limit: 2_000,
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

function metaContent(html, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const tag = tags.find(
    (candidate) =>
      attribute(candidate, "property") === key ||
      attribute(candidate, "name") === key,
  );
  return tag ? attribute(tag, "content") : undefined;
}

function canonicalUrl(html) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  const tag = tags.find((candidate) => attribute(candidate, "rel") === "canonical");
  return tag ? attribute(tag, "href") : undefined;
}

function documentTitle(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1];
}

async function verifyImage(
  url,
  baseUrl,
  canonicalOrigin,
  expectedPath,
  label,
) {
  if (!url) throw new Error(`${label}: missing social image`);
  const parsed = new URL(url);
  if (parsed.origin !== canonicalOrigin) {
    throw new Error(`${label}: social image must be same-origin (${url})`);
  }
  if (parsed.pathname !== expectedPath) {
    throw new Error(
      `${label}: social image is ${parsed.pathname}; expected ${expectedPath}`,
    );
  }

  const localImageUrl = new URL(`${parsed.pathname}${parsed.search}`, baseUrl);
  const response = await fetch(localImageUrl, {
    headers: { "user-agent": "Slackbot 1.0" },
  });
  const contentType = response.headers.get("content-type") ?? "";
  await response.body?.cancel();
  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(
      `${label}: ${parsed.pathname}${parsed.search} returned ${response.status} ${contentType || "without a content type"}`,
    );
  }
}

async function verifySocialPreviews(baseUrl) {
  for (const route of ROUTES) {
    const pageUrl = new URL(route.path, baseUrl).href;
    const response = await fetch(pageUrl, {
      headers: { "user-agent": "Slackbot 1.0" },
    });
    if (!response.ok) {
      throw new Error(`${route.label}: ${pageUrl} returned ${response.status}`);
    }
    const html = await response.text();
    const openGraphImage = metaContent(html, "og:image");
    const twitterImage = metaContent(html, "twitter:image");
    const canonical = canonicalUrl(html);
    const actualCanonical = canonical ? new URL(canonical) : undefined;
    const expectedPath = new URL(route.path, baseUrl).pathname.replace(/\/$/, "");
    const expectedImagePath =
      route.path === "/"
        ? "/opengraph-image"
        : `${route.path.replace(/\/$/, "")}/opengraph-image`;

    for (const key of [
      "og:title",
      "og:description",
      "og:site_name",
      "og:image:alt",
      "og:image:width",
      "og:image:height",
      "twitter:title",
      "twitter:description",
    ]) {
      if (!metaContent(html, key)) {
        throw new Error(`${route.label}: missing ${key}`);
      }
    }
    if (
      !actualCanonical ||
      actualCanonical.protocol !== "https:" ||
      actualCanonical.pathname.replace(/\/$/, "") !== expectedPath
    ) {
      throw new Error(
        `${route.label}: canonical is ${canonical ?? "missing"}; expected an HTTPS URL ending in ${expectedPath || "/"}`,
      );
    }
    await verifyImage(
      openGraphImage,
      baseUrl,
      actualCanonical.origin,
      expectedImagePath,
      route.label,
    );
    await verifyImage(
      twitterImage,
      baseUrl,
      actualCanonical.origin,
      expectedImagePath,
      route.label,
    );
  }

  for (const route of TITLE_ROUTES) {
    const response = await fetch(new URL(route.path, baseUrl), {
      headers: { "user-agent": "Googlebot" },
    });
    if (!response.ok) {
      throw new Error(`title: ${route.path} returned ${response.status}`);
    }
    const title = documentTitle(await response.text());
    if (title !== route.expected) {
      throw new Error(
        `title: ${route.path} is ${title ?? "missing"}; expected ${route.expected}`,
      );
    }
  }

  const talksResponse = await fetch(new URL("/talks", baseUrl), {
    headers: { "user-agent": "Googlebot" },
  });
  if (!talksResponse.ok) {
    throw new Error(`talks: route returned ${talksResponse.status}`);
  }
  const talksHtml = await talksResponse.text();
  const talksRobots = metaContent(talksHtml, "robots") ?? "";
  if (!talksRobots.includes("noindex")) {
    throw new Error("talks: empty route must emit a noindex directive");
  }

  const sitemapResponse = await fetch(new URL("/sitemap.xml", baseUrl));
  if (!sitemapResponse.ok) {
    throw new Error(`sitemap: route returned ${sitemapResponse.status}`);
  }
  const sitemapXml = await sitemapResponse.text();
  if (!sitemapXml.includes("<urlset")) {
    throw new Error("sitemap: response is not a sitemap document");
  }
  if (sitemapXml.includes("/talks</loc>")) {
    throw new Error("sitemap: empty Talks route must not be advertised");
  }
  const sitemapEntries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
    (match) => match[1],
  );
  const aboutEntry = sitemapEntries.find((item) =>
    item.includes("/about</loc>"),
  );
  const workEntry = sitemapEntries.find((item) => item.includes("/work</loc>"));
  if (!aboutEntry || aboutEntry.includes("<lastmod>")) {
    throw new Error(
      "sitemap: static About route must not claim build-time freshness",
    );
  }
  if (!workEntry?.includes("<lastmod>")) {
    throw new Error(
      "sitemap: Work index must inherit freshness from project content",
    );
  }

  console.log("Social preview gate: PASS (home, flagship, writing)");
  console.log("Metadata-title gate: PASS (home, Trust, Changelog, Privacy)");
  console.log(
    "Indexing/freshness gate: PASS (Talks excluded; content dates are honest)",
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
  console.log(`${route.label}: ${categorySummary} ${auditSummary}`);
  return failures;
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
    await verifySocialPreviews(baseUrl);
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
