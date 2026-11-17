// Deployment smoke test. Points at ANY base URL — a local production server, a
// Vercel preview, or production — and exercises the things a build can break
// that a unit test cannot see.
//
// Deliberately shallow and broad. The a11y, hue and interaction gates go deep
// against a local build; this answers a different question: did the thing that
// actually got deployed come up, and does each surface work in a real browser?
//
//   BASE_URL=http://127.0.0.1:3200 node scripts/smoke.mjs
//   BASE_URL=https://<preview>.vercel.app node scripts/smoke.mjs
//
// Exit 1 on any failure.

import { chromium } from "playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3200").replace(/\/$/, "");
const WALKTHROUGH_URL = `${BASE}/work/dbwhisper#request-walkthrough`;
const results = [];

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail && !pass ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();

// Chrome reports a preload nobody used about three seconds after the load
// event — the stylesheet a viewport-prefetched link preloads is the case this
// catches — so each route stays open past that before its console is read.
const CONSOLE_SETTLE_MS = 4_000;

async function withPage(opts, fn) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  const warnings = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
    else if (m.type() === "warning") warnings.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  try {
    await fn(page, errors, warnings);
  } finally {
    await ctx.close();
  }
}

// ---------------------------------------------------------------- routes
const ROUTES = [
  { path: "/", must: /I ship AI and software inside the customer.s rules/i, name: "homepage" },
  { path: "/work", must: /Work/i, name: "work" },
  { path: "/work/dbwhisper", must: /DBWhisper/i, name: "DBWhisper case study" },
  { path: "/evals", must: /eval/i, name: "evals" },
  { path: "/about", must: /About|engineer/i, name: "about" },
  { path: "/contact", must: /Let.s talk about what you.re building/i, name: "contact" },
  { path: "/writing", must: /Essays, guides and notes/i, name: "writing" },
  // The flagship case studies, linked from the homepage, /work and the nav.
  { path: "/work/bench-discovery", must: /Bench Discovery/, name: "Bench Discovery case study" },
  { path: "/work/careltc", must: /CareLTC/, name: "CareLTC case study" },
  { path: "/resume", must: /Experience|Résumé|Resume/i, name: "resume" },
];

for (const route of ROUTES) {
  await withPage({}, async (page, errors, warnings) => {
    const res = await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
    const status = res?.status() ?? 0;
    const body = await page.textContent("body");
    const h1 = await page.locator("h1").count();
    check(
      `${route.name}: 200, has an h1, and renders its own copy`,
      status === 200 && h1 >= 1 && route.must.test(body ?? ""),
      `status=${status} h1=${h1} copy=${route.must.test(body ?? "")}`,
    );
    await page.waitForTimeout(CONSOLE_SETTLE_MS);
    check(`${route.name}: no console errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
    // ENGINEERING §2: zero console warnings in production, too.
    check(`${route.name}: no console warnings`, warnings.length === 0, warnings.slice(0, 2).join(" | "));
  });
}

// ------------------------------------------------------------------ theme
// One theme (ADR-018): the light canvas, with dark pages built into the design.
// There is no toggle and nothing is stored, so a visitor's device can never
// put the site in a state the gates did not audit.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const state = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute("data-theme"),
    scheme: getComputedStyle(document.documentElement).colorScheme,
    bg: getComputedStyle(document.body).backgroundColor,
    chrome: document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
    toggle: document.querySelectorAll('button[aria-label*="theme" i]').length,
  }));
  check(
    "the light canvas renders for every visitor",
    state.theme === "light" && state.bg === "rgb(247, 247, 248)",
    JSON.stringify(state),
  );
  check("color-scheme is light (native UI, scrollbars)", state.scheme === "light", state.scheme);
  check("browser chrome matches the canvas", state.chrome === "#f7f7f8", state.chrome ?? "none");
  check("there is no theme toggle", state.toggle === 0, `${state.toggle} toggle(s)`);
});

// A dark page sets its own browser chrome, so the address bar continues it.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  const chrome = await page.evaluate(
    () => document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
  );
  check("a dark page (/about) moves the browser chrome to its canvas", chrome === "#0f0f12", chrome ?? "none");
});

// ---------------------------------------------------------- assistant modal
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Ask this site/ }).first().click();
  await page.waitForTimeout(900);
  check("assistant: the panel opens", await page.getByRole("dialog").first().isVisible());

  const inert = await page.evaluate(() =>
    ["header", "main", "footer"]
      .flatMap((s) => Array.from(document.querySelectorAll(`body > ${s}`)))
      .every((el) => el.inert === true || el.getAttribute("aria-hidden") === "true"),
  );
  check("assistant: the page behind it is inert", inert);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
  check("assistant: Escape closes it and focus returns to the launcher", /Ask this site/.test(focused), focused);
});

// -------------------------------------------------------- mobile navigation
await withPage({ viewport: { width: 390, height: 844 } }, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(500);
  // A modal sheet under the bar (ADR-018, amended 17 Nov 2026): the button and
  // the panel are one dialog. Its contract in depth is test:a11y and
  // test:interaction; this only asks whether the deployed menu works.
  const menu = page.locator("#mobile-menu");
  check("mobile nav: opens", await menu.isVisible());

  const links = await menu.getByRole("link").count();
  check("mobile nav: carries the primary links", links >= 4, `${links} links`);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
  check("mobile nav: Escape closes it and restores focus", /Open menu/.test(focused), focused);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("mobile nav: no horizontal overflow at 390px", overflow <= 1, `${overflow}px`);
});

// ------------------------------------------------------------ reduced motion
await withPage({ reducedMotion: "reduce" }, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const faded = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll("main h1, main h2"))
        .filter((el) => !el.closest(".sr-only"))
        .filter((heading) => {
          if (heading.getClientRects().length === 0) return true;
          for (let el = heading; el; el = el.parentElement) {
            const style = getComputedStyle(el);
            if (Number.parseFloat(style.opacity) < 0.99 || style.visibility === "hidden") return true;
          }
          return false;
        }).length,
  );
  check("reduced motion: no content is left hidden", faded === 0, `${faded} faded`);

  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
  const transport = await page.getByRole("button", { name: /Play the run|Pause/ }).count();
  check("reduced motion: the specimen renders no inert transport", transport === 0, `${transport}`);

  await page.getByRole("button", { name: /^Validate$/ }).click();
  await page.waitForTimeout(300);
  const open = await page.locator('#request-walkthrough [aria-expanded="true"]').first().textContent();
  check("reduced motion: the specimen is still fully usable", (open ?? "").includes("Validate"), open ?? "");
});

// ------------------------------------------------------------------ the rest
await withPage({}, async (page) => {
  await page.goto(`${BASE}/evals`, { waitUntil: "networkidle" });
  // The registry: each row links to its method section on the same page.
  const method = page.getByRole("link", { name: /^Method:/ }).first();
  const target = ((await method.getAttribute("href")) ?? "").split("#")[1] ?? "";
  await method.click();
  await page.waitForTimeout(600);
  const landed = target
    ? await page.evaluate((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top < innerHeight && r.bottom > 0;
      }, target)
    : false;
  check("evals: a result's method link lands on its method", landed, `#${target}`);
});

for (const path of ["/sitemap.xml", "/robots.txt", "/rss.xml"]) {
  const res = await fetch(`${BASE}${path}`);
  check(`${path} is served`, res.ok, `status ${res.status}`);
}

// ------------------------------------------------------ social cards (OG)
// A dynamic OG route may draw a card only for a real entry. An unknown slug
// once rendered 200 image/png, uncached, so anyone could loop unique URLs to
// burn function CPU and stamp arbitrary text onto a branded card; an encoded
// `../` also read a file from outside its collection. The real entry for each
// collection comes from the sitemap, so renaming content never breaks this.
const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

for (const collection of ["work", "notes", "writing"]) {
  const real = sitemapPaths.find((path) => path.startsWith(`/${collection}/`));
  if (!real) {
    check(`/${collection}: a published entry is listed in the sitemap`, false, "none found");
    continue;
  }
  const card = await fetch(`${BASE}${real}/opengraph-image`);
  const type = card.headers.get("content-type") ?? "";
  check(`${real}/opengraph-image: 200 image/png`, card.status === 200 && type.startsWith("image/png"),
    `status=${card.status} type=${type}`);

  const unknown = await fetch(`${BASE}/${collection}/does-not-exist/opengraph-image`);
  check(`/${collection}/does-not-exist/opengraph-image: 404`, unknown.status === 404, `status ${unknown.status}`);

  // The live traversal: `..%2F` re-entering the collection named a real file.
  const escape = `..%2F${collection}%2F${real.split("/").pop()}`;
  const traversal = await fetch(`${BASE}/${collection}/${escape}/opengraph-image`);
  check(`/${collection}/${escape}/opengraph-image: 404`, traversal.status === 404, `status ${traversal.status}`);
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} smoke checks pass against ${BASE}`);
if (failed.length > 0) {
  console.error(`\nFAILED:\n${failed.map((f) => `  - ${f.name}: ${f.detail}`).join("\n")}`);
  process.exitCode = 1;
}
