// WCAG 2.2 AA gate. Loads each key route in light + dark, injects axe-core, and
// fails (exit 1) on any violation. Requires a running server:
//
//   npm run build && npm run start -- -p 3200     # or: npm run dev -- -p 3200
//   BASE_URL=http://localhost:3200 npm run test:a11y
//
// Zero network beyond the local server: axe-core is bundled in node_modules.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";
const AXE = readFileSync(
  fileURLToPath(new URL("../node_modules/axe-core/axe.min.js", import.meta.url)),
  "utf8",
);
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const ROUTES = [
  "/",
  "/work",
  "/work/dbwhisper",
  "/writing",
  "/writing/trust-is-not-a-safety-model",
  "/about",
  "/timeline",
  "/resume",
  "/dev/components",
];

async function audit(page, route) {
  await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(400);
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(
    (tags) => axe.run(document, { runOnly: { type: "tag", values: tags } }),
    TAGS,
  );
  return res.violations;
}

let total = 0;
const browser = await chromium.launch();
try {
  for (const scheme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    if (scheme === "dark") await page.emulateMedia({ colorScheme: "dark" });
    for (const route of ROUTES) {
      const v = await audit(page, route);
      total += v.length;
      const tag = `[${scheme}] ${route}`;
      if (v.length === 0) {
        console.log(`✓ ${tag}`);
      } else {
        console.log(`✗ ${tag}: ${v.length} violation(s)`);
        for (const x of v) {
          console.log(`    - ${x.id} (${x.impact}): ${x.help}`);
          for (const n of x.nodes.slice(0, 4)) console.log(`      ${n.target}`);
        }
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`\nTOTAL VIOLATIONS: ${total}`);
process.exit(total === 0 ? 0 : 1);
