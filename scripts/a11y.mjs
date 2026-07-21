// WCAG 2.2 AA gate. Loads each key route in every theme × viewport combination,
// plus the overlay states a plain page load never reaches, injects axe-core, and
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

// 2.2 tags included deliberately: the suite claims WCAG 2.2 AA, and without
// wcag22a/wcag22aa the 2.2-only rules (e.g. target-size) never run.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

// 360px is the narrowest phone the layout supports; 1280 is the desktop
// breakpoint above every `md:` rule. Auditing only the latter left every
// mobile-only control (hamburger, thumb-zone launcher) unaudited.
const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 360, height: 740 };

const ROUTES = [
  "/",
  "/work",
  "/work/dbwhisper",
  "/writing",
  "/writing/trust-is-not-a-safety-model",
  "/notes",
  "/notes/six-providers-one-interface",
  "/now",
  "/evals",
  "/hire",
  "/talks",
  "/about",
  "/timeline",
  "/uses",
  "/resume",
  "/dev/components",
];

// The app deliberately ignores prefers-color-scheme and switches on a
// [data-theme] attribute seeded from localStorage (app/layout.tsx). Emulating
// the media query therefore audited nothing — the dark palette was never seen.
// Each pass seeds localStorage before any page script runs and then ASSERTS the
// attribute actually landed, so this can never silently no-op again.
const PASSES = [
  { theme: "light", device: "desktop", viewport: DESKTOP },
  { theme: "dark", device: "desktop", viewport: DESKTOP },
  { theme: "light", device: "mobile", viewport: MOBILE },
  { theme: "dark", device: "mobile", viewport: MOBILE },
];

/**
 * Overlay states worth auditing on top of the static routes: focus order and
 * labelling bugs hide in open dialogs, which no route load can reach. The
 * launcher differs by breakpoint (the header trigger is hidden below md, the
 * thumb-zone launcher above it), so each device gets its own list.
 */
function dialogsFor(device) {
  const assistant = {
    label: "assistant panel",
    trigger: device === "mobile" ? /^Ask about my work/ : /^Ask Friday/,
    dialog: /^Ask about/,
  };
  return device === "mobile"
    ? [{ label: "mobile nav drawer", trigger: /^Open menu$/, dialog: /^Menu$/ }, assistant]
    : [assistant];
}

/** Inject axe-core and return the violations for the page's current state. */
async function runAxe(page) {
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(
    (tags) => axe.run(document, { runOnly: { type: "tag", values: tags } }),
    TAGS,
  );
  return res.violations;
}

async function open(page, route, expectedTheme) {
  await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
  const applied = await page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  );
  if (applied !== expectedTheme) {
    throw new Error(
      `theme never applied on ${route}: expected data-theme="${expectedTheme}", got ` +
        `${applied === null ? "no attribute" : `"${applied}"`}. The dark pass would ` +
        `have audited the light palette — fix the seeding before trusting this run.`,
    );
  }
  // let on-load entrance animations (e.g. the hero) settle before auditing, so
  // contrast is checked on the state users see, not a mid-fade frame
  await page.waitForTimeout(1300);
}

function report(tag, violations) {
  if (violations.length === 0) {
    console.log(`✓ ${tag}`);
    return;
  }
  console.log(`✗ ${tag}: ${violations.length} violation(s)`);
  for (const v of violations) {
    console.log(`    - ${v.id} (${v.impact}): ${v.help}`);
    for (const n of v.nodes.slice(0, 4)) console.log(`      ${n.target}`);
  }
}

let total = 0;
const browser = await chromium.launch();
try {
  for (const pass of PASSES) {
    const context = await browser.newContext({ viewport: pass.viewport });
    // Runs before any page script, so the layout's pre-paint theme script reads
    // it and applies [data-theme] on the very first paint — exactly as it does
    // for a returning visitor who chose a theme.
    await context.addInitScript((theme) => {
      try {
        window.localStorage.setItem("theme", theme);
      } catch {
        // private-mode / storage-disabled: the assertion below will catch it
      }
    }, pass.theme);
    const page = await context.newPage();
    const prefix = `[${pass.theme} ${pass.device}]`;

    for (const route of ROUTES) {
      await open(page, route, pass.theme);
      const v = await runAxe(page);
      total += v.length;
      report(`${prefix} ${route}`, v);
    }

    for (const d of dialogsFor(pass.device)) {
      await open(page, "/", pass.theme);
      await page.getByRole("button", { name: d.trigger }).first().click();
      await page.getByRole("dialog", { name: d.dialog }).waitFor({ timeout: 10000 });
      const v = await runAxe(page);
      total += v.length;
      report(`${prefix} / — ${d.label} open`, v);
      await page.keyboard.press("Escape");
    }

    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`\nTOTAL VIOLATIONS: ${total}`);
process.exit(total === 0 ? 0 : 1);
