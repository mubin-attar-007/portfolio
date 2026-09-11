// Collapsed accordion panels can remain in the accessibility tree even when
// CSS clips their height to zero. Check disclosure semantics directly; axe
// alone does not know that four of these named regions should be unavailable.
// BASE_URL=http://127.0.0.1:3200 node scripts/walkthrough-disclosure-audit.mjs
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3200").replace(/\/$/, "");
const STAGES = ["Retrieve", "Generate", "Validate", "Execute", "Evaluate"];
// Restrict the query to the disclosure names, excluding SQL/code regions in
// the adjacent specimen, which legitimately remain exposed.
const STAGE_NAMES = /^(Retrieve|Generate|Validate|Execute|Evaluate)$/;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const results = [];
const browser = await chromium.launch();

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail && !pass ? ` — ${detail}` : ""}`);
}

try {
  for (const theme of ["light", "dark"]) {
    for (const viewport of VIEWPORTS) {
      for (const reducedMotion of ["no-preference", "reduce"]) {
        const context = await browser.newContext({ viewport, reducedMotion });
        try {
          await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => errors.push(error.message));
          await page.goto(`${BASE}/work/dbwhisper#request-walkthrough`, { waitUntil: "networkidle" });
          const prefix = `${theme} ${viewport.width}px ${reducedMotion}`;
          const root = page.locator("#request-walkthrough");
          check(`${prefix}: requested theme and motion preference are active`,
            await page.locator("html").getAttribute("data-theme") === theme
            && await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches) === (reducedMotion === "reduce"));

          const mappings = [];
          for (const name of STAGES) {
            const button = root.getByRole("button", { name, exact: true });
            const region = root.getByRole("region", { name, exact: true, includeHidden: true });
            const controls = await button.getAttribute("aria-controls");
            mappings.push({ name, controls, id: await region.getAttribute("id") });
          }
          check(`${prefix}: all five controls point to their named disclosure region`,
            mappings.every(({ controls, id }) => Boolean(controls) && controls === id)
            && new Set(mappings.map(({ id }) => id)).size === STAGES.length,
            JSON.stringify(mappings));

          for (const name of STAGES) {
            await root.getByRole("button", { name, exact: true }).click();
            const active = root.getByRole("region", { name, exact: true });
            await active.waitFor({ state: "visible" });
            const exposed = await root.getByRole("region", { name: STAGE_NAMES }).evaluateAll((regions) =>
              regions.map((region) => region.getAttribute("aria-label")));
            check(`${prefix} ${name}: only the active stage is exposed to assistive technology`,
              exposed.length === 1 && exposed[0] === name, JSON.stringify(exposed));

            const expanded = [];
            for (const stage of STAGES) {
              expanded.push({ name: stage, value: await root.getByRole("button", { name: stage, exact: true }).getAttribute("aria-expanded") });
            }
            check(`${prefix} ${name}: aria-expanded agrees with the exposed panel`,
              expanded.every((stage) => stage.value === (stage.name === name ? "true" : "false")), JSON.stringify(expanded));
            check(`${prefix} ${name}: the selected disclosure contains readable content`,
              await active.isVisible() && (await active.innerText()).trim().length > 0);
          }
          check(`${prefix}: no browser errors`, errors.length === 0, errors.join(" | "));
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.pass);
console.log(`\n${results.length - failed.length}/${results.length} walkthrough disclosure contracts hold.`);
if (failed.length > 0) {
  console.error(failed.map((result) => `  - ${result.name}: ${result.detail}`).join("\n"));
  process.exitCode = 1;
}
