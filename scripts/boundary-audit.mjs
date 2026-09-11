// Homepage boundary-inspector contracts. The illustration must distinguish a
// read, a SELECT INTO write, and a missing schema without executing a request.
// BASE_URL=http://127.0.0.1:3200 node scripts/boundary-audit.mjs
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3200").replace(/\/$/, "");
const AXE = readFileSync(new URL("../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const CASES = [
  {
    id: "read", name: "Read query", outcome: "eligible", verdict: /Eligible for read-only execution/i,
    checks: [
      ["Single statement", "pass", /\bPass\b/],
      ["Read-only statement", "pass", /\bPass\b/],
      ["Enrolled schema", "pass", /\bMatched\b/],
    ],
  },
  {
    id: "write", name: "Hidden write", outcome: "refused", verdict: /Refused before execution/i,
    checks: [
      ["Single statement", "pass", /\bPass\b/],
      ["Read-only statement", "fail", /Write detected/i],
      ["Enrolled schema", "unknown", /Not reached/i],
    ],
  },
  {
    id: "schema", name: "No schema", outcome: "refused", verdict: /Refused before execution/i,
    checks: [
      ["Single statement", "pass", /\bPass\b/],
      ["Read-only statement", "pass", /\bPass\b/],
      ["Enrolled schema", "fail", /Unavailable/i],
    ],
  },
];
const results = [];
const browser = await chromium.launch();

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail && !pass ? ` — ${detail}` : ""}`);
}

const inspector = (page) => page.locator("#boundary-inspector");
const choices = (page) => inspector(page).getByRole("group", { name: "Inspect a query boundary", exact: true });
const radio = (page, name) => choices(page).getByRole("radio", { name, exact: true });
// Click the visible native label: the radio itself may use a clipped custom UI.
const choose = (page, name) => choices(page).getByText(name, { exact: true }).click();

async function withPage(options, run) {
  const context = await browser.newContext({ viewport: VIEWPORTS[2], ...options });
  const page = await context.newPage();
  const errors = [];
  const apiRequests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  // Abort accidental execution, retaining the attempt as a failed contract.
  // This audit must never need a live model or database.
  await page.route(/\/api(?:\/|\?|$)/, async (route) => {
    apiRequests.push(`${route.request().method()} ${route.request().url()}`);
    await route.abort();
  });
  try {
    await run(page);
    check("boundary session: no API request was attempted", apiRequests.length === 0, apiRequests.join(" | "));
    check("boundary session: no browser errors", errors.length === 0, errors.join(" | "));
  } finally {
    await context.close();
  }
}

async function checkExample(page, example, label, readSql, interactive = true) {
  const root = inspector(page);
  const panel = root.locator(`[data-boundary-case="${example.id}"]`);
  await panel.waitFor({ state: "visible" });
  const decision = root.getByRole("region", { name: "Boundary result", exact: true });
  const text = (await decision.innerText()).trim();
  check(`${label}: decision matches the selected boundary`,
    await decision.getAttribute("data-outcome") === example.outcome && example.verdict.test(text), text);

  const sql = (await panel.locator("pre > code").innerText()).trim();
  check(`${label}: a SQL illustration remains readable`, sql.length > 0 && await panel.locator("pre > code").isVisible());
  if (example.id === "write") {
    check(`${label}: the apparent SELECT exposes its INTO write`,
      /^SELECT\b[\s\S]*\bINTO\s+orders_copy\b[\s\S]*\bFROM\s+orders\b/i.test(sql), sql);
  } else {
    check(`${label}: the candidate is a SELECT without an INTO write`,
      /^SELECT\b/i.test(sql) && !/\bINTO\b/i.test(sql), sql);
  }
  if (example.id === "schema") {
    check(`${label}: schema absence changes the decision for the same query`, sql === readSql, sql);
  }

  const checks = root.getByRole("list", { name: "Illustrated validator checks", exact: true });
  check(`${label}: all three validator checks remain visible`,
    await checks.getByRole("listitem").count() === 3 && await checks.isVisible());
  for (const [name, state, result] of example.checks) {
    const row = checks.getByRole("listitem").filter({ hasText: name });
    const text = await row.innerText();
    check(`${label}: ${name} reports the correct check result`,
      await row.getAttribute("data-check-state") === state && result.test(text), text);
  }
  check(`${label}: exactly one example is exposed`, await root.locator("[data-boundary-case]").count() === 1);
  if (interactive) {
    const selected = await choices(page).locator('input[type="radio"]:checked').count();
    check(`${label}: radio selection agrees with the result`, selected === 1 && await radio(page, example.name).isChecked());
  } else {
    check(`${label}: selection controls are not exposed without JavaScript`, await choices(page).count() === 0);
  }
  return sql;
}

async function checkOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  check(`${label}: no horizontal page overflow`, dimensions.scroll <= dimensions.width + 1, JSON.stringify(dimensions));
}

try {
  for (const theme of ["light", "dark"]) {
    for (const viewport of VIEWPORTS) {
      await withPage({ viewport }, async (page) => {
        await page.addInitScript((preference) => localStorage.setItem("theme", preference), theme);
        await page.goto(BASE, { waitUntil: "networkidle" });
        const prefix = `${theme} ${viewport.width}px`;
        check(`${prefix}: the requested theme is active`, await page.locator("html").getAttribute("data-theme") === theme);
        const root = inspector(page);
        check(`${prefix}: first render does not announce an unsolicited change`,
          (await root.getByRole("status").textContent() ?? "").trim() === "");
        await page.addScriptTag({ content: AXE });
        let readSql;
        for (const example of CASES) {
          await choose(page, example.name);
          const label = `${prefix} ${example.name}`;
          const sql = await checkExample(page, example, label, readSql);
          if (example.id === "read") readSql = sql;
          await checkOverflow(page, label);
          const violations = await page.evaluate((tags) =>
            window.axe.run(document, { runOnly: { type: "tag", values: tags } }).then((result) => result.violations), TAGS);
          check(`${label}: zero WCAG 2.2 AA violations`, violations.length === 0,
            JSON.stringify(violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))));
          if (example.id !== "read") {
            const announcement = (await root.getByRole("status").textContent() ?? "").trim();
            check(`${label}: a concise status announces the chosen result`,
              announcement.length > 0 && announcement.length < 160 && /refus/i.test(announcement), announcement);
          }
        }
      });
    }
  }

  await withPage({}, async (page) => {
    await page.goto(BASE, { waitUntil: "networkidle" });
    const nativeGroup = await choices(page).evaluate((group) => {
      const inputs = Array.from(group.querySelectorAll("input[type=radio]"));
      return group.tagName === "FIELDSET" && inputs.length === 3
        && inputs.every((input) => input.name !== "" && input.name === inputs[0].name)
        && new Set(inputs.map((input) => input.value)).size === 3;
    });
    check("keyboard: the choices form one native radio group", nativeGroup);
    await radio(page, "Read query").focus();
    for (const [key, name] of [
      ["ArrowRight", "Hidden write"], ["ArrowRight", "No schema"],
      ["ArrowRight", "Read query"], ["ArrowLeft", "No schema"],
      ["ArrowUp", "Hidden write"], ["ArrowDown", "No schema"],
    ]) {
      await page.keyboard.press(key);
      const selected = radio(page, name);
      check(`keyboard: ${key} selects and focuses ${name}`,
        await selected.isChecked() && await selected.evaluate((element) => document.activeElement === element));
      await inspector(page).locator(`[data-boundary-case="${CASES.find((example) => example.name === name).id}"]`).waitFor();
    }
    const focusVisible = await radio(page, "No schema").evaluate((input) => {
      const candidates = [input, input.nextElementSibling, ...Array.from(input.labels ?? []), input.parentElement].filter(Boolean);
      return candidates.some((element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 1
          && style.outlineColor !== "transparent" && style.outlineColor !== "rgba(0, 0, 0, 0)";
        return box.width >= 24 && box.height >= 24 && (outline || style.boxShadow !== "none");
      });
    });
    check("keyboard: the focused choice has a visible focus indicator", focusVisible);
    await page.keyboard.press("Tab");
    check("keyboard: Tab exits the radio group", await choices(page).evaluate((group) => !group.contains(document.activeElement)));

    const link = inspector(page).locator('a[href="/work/dbwhisper#request-walkthrough"]');
    check("boundary: the full walkthrough is reachable from its illustration", await link.isVisible());
    await link.click();
    await page.waitForURL("**/work/dbwhisper#request-walkthrough");
    check("boundary: the deep link reaches the five-stage case-study walkthrough",
      await page.locator("#request-walkthrough #walkthrough-title").isVisible()
      && await page.locator("#request-walkthrough button[aria-expanded]").count() === 5);
  });

  await withPage({ reducedMotion: "reduce" }, async (page) => {
    await page.goto(BASE, { waitUntil: "networkidle" });
    check("reduced motion: the preference is active", await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches));
    let readSql;
    for (const example of CASES) {
      await choose(page, example.name);
      const sql = await checkExample(page, example, `reduced motion ${example.name}`, readSql);
      if (example.id === "read") readSql = sql;
    }
    const durations = await inspector(page).evaluate((root) => {
      const milliseconds = (value) => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000);
      return [root, ...root.querySelectorAll("*")].flatMap((element) => {
        const style = getComputedStyle(element);
        return [...style.animationDuration.split(","), ...style.transitionDuration.split(",")].map(milliseconds);
      });
    });
    check("reduced motion: inspector animations and transitions stay within 80ms", durations.every((duration) => duration <= 80));
  });

  for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
    await withPage({ javaScriptEnabled: false, viewport }, async (page) => {
      await page.goto(BASE, { waitUntil: "load" });
      await checkExample(page, CASES[0], `no JavaScript ${viewport.width}px`, undefined, false);
      const root = inspector(page);
      const explanation = await root.innerText();
      check(`no JavaScript ${viewport.width}px: the illustration explains its execution limit`,
        /illustrat/i.test(explanation) && /no query is sent/i.test(explanation));
      check(`no JavaScript ${viewport.width}px: the full walkthrough remains linked`,
        await root.locator('a[href="/work/dbwhisper#request-walkthrough"]').isVisible());
      await checkOverflow(page, `no JavaScript ${viewport.width}px`);
      await page.goto(`${BASE}/work/dbwhisper#request-walkthrough`, { waitUntil: "load" });
      const walkthrough = page.locator("#request-walkthrough");
      check(`no JavaScript ${viewport.width}px: the relocated walkthrough retains its default stage`,
        await walkthrough.locator("#walkthrough-title").isVisible()
        && await walkthrough.getByRole("button", { name: "Retrieve", exact: true }).getAttribute("aria-expanded") === "true");
    });
  }
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.pass);
console.log(`\n${results.length - failed.length}/${results.length} boundary contracts hold.`);
if (failed.length > 0) {
  console.error(failed.map((result) => `  - ${result.name}: ${result.detail}`).join("\n"));
  process.exitCode = 1;
}
