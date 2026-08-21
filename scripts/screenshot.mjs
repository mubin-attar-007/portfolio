// Responsive screenshot + overflow sweep. Companion to scripts/a11y.mjs: that
// gate proves the DOM is accessible, this one shows what it looks like and
// fails on the two defects a static audit cannot see — horizontal overflow and
// runtime console errors.
//
// Requires a running server:
//   npm run build && node .next/standalone/server.js       # PORT=3200
//   BASE_URL=http://localhost:3200 node scripts/screenshot.mjs
//
// Output lands in .screenshots/ (gitignored), named <route>__<theme>__<width>.png.
//
//   ROUTES=/,/work    limit the sweep
//   THEMES=light,dark limit the themes
//   FULL=1            capture the whole page rather than the first viewport

import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";
const OUT = fileURLToPath(new URL("../.screenshots", import.meta.url));
const FULL = process.env.FULL === "1";

const DEFAULT_ROUTES = [
  "/",
  "/work",
  "/work/dbwhisper",
  "/writing",
  "/notes",
  "/evals",
  "/about",
  "/hire",
  "/resume",
  "/now",
  "/uses",
  "/trust",
];

// The six widths the design is specified at. 360 is the narrowest phone the
// layout supports; 1920 proves the container stops growing.
const VIEWPORTS = [
  { name: "360", width: 360, height: 740 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const routes = (process.env.ROUTES ?? DEFAULT_ROUTES.join(",")).split(",").filter(Boolean);
const themes = (process.env.THEMES ?? "light,dark").split(",").filter(Boolean);

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const problems = [];
let shots = 0;

for (const theme of themes) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    // The app ignores prefers-color-scheme and switches on a [data-theme]
    // attribute seeded from localStorage, so the theme has to be planted before
    // any page script runs.
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem("theme", t);
      } catch {
        /* storage disabled — the page falls back to the light default */
      }
    }, theme);

    for (const route of routes) {
      const page = await ctx.newPage();
      const consoleErrors = [];
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(m.text());
      });
      page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);

      // Horizontal overflow, with the offending elements named. Reporting only
      // "the page is 16px too wide" costs an afternoon; naming the node that
      // sticks out costs one line.
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        const culprits = [];
        if (de.scrollWidth > de.clientWidth + 1) {
          for (const el of document.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (r.right > de.clientWidth + 1 || r.left < -1) {
              const cls =
                typeof el.className === "string" && el.className
                  ? `.${el.className.split(/\s+/).slice(0, 3).join(".")}`
                  : "";
              culprits.push(`${el.tagName.toLowerCase()}${cls} [${Math.round(r.left)}…${Math.round(r.right)}]`);
            }
            if (culprits.length > 5) break;
          }
        }
        return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, culprits };
      });

      if (overflow.scrollWidth > overflow.clientWidth + 1) {
        problems.push({ route, theme, viewport: vp.name, ...overflow });
      }
      if (consoleErrors.length > 0) {
        problems.push({ route, theme, viewport: vp.name, consoleErrors });
      }

      const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
      await page.screenshot({
        path: path.join(OUT, `${slug}__${theme}__${vp.name}.png`),
        fullPage: FULL,
      });
      shots += 1;
      await page.close();
    }
    await ctx.close();
  }
}

await browser.close();

console.log(`${shots} screenshots written to .screenshots/`);
if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):\n${JSON.stringify(problems, null, 2)}`);
  process.exitCode = 1;
} else {
  console.log("No horizontal overflow and no console errors at any tested width.");
}
