// Verifies the print stylesheet on the routes people actually print.
//
// Emulates print media, asserts the site chrome is gone and no entrance
// animation left content faded out, then writes a real PDF to .screenshots/ so
// the pagination can be eyeballed.
//
//   BASE_URL=http://localhost:3200 node scripts/print-check.mjs

import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";
const OUT = fileURLToPath(new URL("../.screenshots", import.meta.url));
const ROUTES = (process.env.ROUTES ?? "/resume").split(",").filter(Boolean);

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const failures = [];

for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(300);

  const report = await page.evaluate(() => {
    const visible = (sel) =>
      Array.from(document.querySelectorAll(sel)).filter(
        (el) => getComputedStyle(el).display !== "none",
      ).length;

    const faded = Array.from(document.querySelectorAll(".reveal, .reveal-stagger > *")).filter(
      (el) => {
        const s = getComputedStyle(el);
        return Number.parseFloat(s.opacity) < 0.99 || s.transform !== "none";
      },
    ).length;

    return {
      header: visible("body > header"),
      footer: visible("body > footer"),
      chrome: visible('[data-print="hide"]'),
      faded,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      inkColor: getComputedStyle(document.body).color,
    };
  });

  const problems = [];
  if (report.header > 0) problems.push("site header still prints");
  if (report.footer > 0) problems.push("site footer still prints");
  if (report.chrome > 0) problems.push(`${report.chrome} [data-print="hide"] element(s) still print`);
  if (report.faded > 0) problems.push(`${report.faded} entrance element(s) printed faded or transformed`);
  if (report.bodyBg !== "rgb(255, 255, 255)") problems.push(`body background is ${report.bodyBg}, not white`);
  if (report.inkColor !== "rgb(0, 0, 0)") problems.push(`body ink is ${report.inkColor}, not black`);

  const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
  await page.pdf({ path: path.join(OUT, `${slug}__print.pdf`), format: "A4", printBackground: false });

  if (problems.length > 0) {
    failures.push({ route, problems });
    console.error(`✗ ${route}\n    - ${problems.join("\n    - ")}`);
  } else {
    console.log(`✓ ${route} — chrome excluded, ink black on white, nothing faded`);
  }
}

await browser.close();
console.log(`PDFs written to .screenshots/`);
if (failures.length > 0) process.exitCode = 1;
