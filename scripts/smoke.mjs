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
const results = [];

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail && !pass ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();

async function withPage(opts, fn) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  try {
    await fn(page, errors);
  } finally {
    await ctx.close();
  }
}

// ---------------------------------------------------------------- routes
const ROUTES = [
  { path: "/", must: /Production AI systems/i, name: "homepage" },
  { path: "/work", must: /Work/i, name: "work" },
  { path: "/work/dbwhisper", must: /DBWhisper/i, name: "DBWhisper case study" },
  { path: "/evals", must: /eval/i, name: "evals" },
  { path: "/about", must: /About|engineer/i, name: "about" },
  { path: "/resume", must: /Experience|Résumé|Resume/i, name: "resume" },
];

for (const route of ROUTES) {
  await withPage({}, async (page, errors) => {
    const res = await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
    const status = res?.status() ?? 0;
    const body = await page.textContent("body");
    const h1 = await page.locator("h1").count();
    check(
      `${route.name}: 200, has an h1, and renders its own copy`,
      status === 200 && h1 >= 1 && route.must.test(body ?? ""),
      `status=${status} h1=${h1} copy=${route.must.test(body ?? "")}`,
    );
    check(`${route.name}: no console errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
  });
}

// ------------------------------------------------------------ dark theme
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const state = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute("data-theme"),
    scheme: getComputedStyle(document.documentElement).colorScheme,
    bg: getComputedStyle(document.body).backgroundColor,
    chrome: document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
  }));
  check(
    "dark theme is the default for a first-time visitor",
    state.theme === "dark" && state.bg === "rgb(3, 8, 10)",
    JSON.stringify(state),
  );
  check("color-scheme follows the theme (native UI, scrollbars)", state.scheme === "dark", state.scheme);
  check("browser chrome matches the default ground", state.chrome === "#03080a", state.chrome ?? "none");

  // And the visitor can still get to light, with the chrome following.
  await page.getByRole("button", { name: /Switch to light theme/i }).click();
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute("data-theme"),
    chrome: document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
    stored: localStorage.getItem("theme"),
  }));
  check(
    "the toggle reaches light, persists it, and moves the chrome with it",
    after.theme === "light" && after.stored === "light" && after.chrome === "#fcfcfe",
    JSON.stringify(after),
  );
});

// A returning visitor who chose light stays light.
await withPage({}, async (page) => {
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  check("a stored light preference survives a reload", theme === "light", theme ?? "none");
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
  check("mobile nav: opens", await page.getByRole("dialog", { name: "Menu" }).isVisible());

  const links = await page.getByRole("dialog", { name: "Menu" }).getByRole("link").count();
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
      Array.from(document.querySelectorAll("[data-reveal], .reveal, .reveal-stagger > *")).filter(
        (el) => Number.parseFloat(getComputedStyle(el).opacity) < 0.99,
      ).length,
  );
  check("reduced motion: no content is left hidden", faded === 0, `${faded} faded`);

  const transport = await page.getByRole("button", { name: /Play the run|Pause/ }).count();
  check("reduced motion: the specimen renders no inert transport", transport === 0, `${transport}`);

  await page.getByRole("button", { name: /^Validate$/ }).click();
  await page.waitForTimeout(300);
  const open = await page.locator('[aria-expanded="true"]').first().textContent();
  check("reduced motion: the specimen is still fully usable", (open ?? "").includes("Validate"), open ?? "");
});

// ------------------------------------------------------------------ the rest
await withPage({}, async (page) => {
  await page.goto(`${BASE}/evals`, { waitUntil: "networkidle" });
  const details = page.locator("details").first();
  const bodyText = details.locator("p").last();
  const closed = !(await bodyText.isVisible());
  await details.locator("summary").click();
  await page.waitForTimeout(250);
  check("evals: the method disclosure expands", closed && (await bodyText.isVisible()));
});

for (const path of ["/sitemap.xml", "/robots.txt", "/rss.xml"]) {
  const res = await fetch(`${BASE}${path}`);
  check(`${path} is served`, res.ok, `status ${res.status}`);
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} smoke checks pass against ${BASE}`);
if (failed.length > 0) {
  console.error(`\nFAILED:\n${failed.map((f) => `  - ${f.name}: ${f.detail}`).join("\n")}`);
  process.exitCode = 1;
}
