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

// 360px is the narrowest phone the layout supports; 768 exercises the compact
// tablet navigation; 1280 sits above the desktop navigation boundary.
const DESKTOP = { width: 1280, height: 900 };
const TABLET = { width: 768, height: 900 };
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
  "/skills",
  "/privacy",
  "/trust",
  "/changelog",
  "/route-that-does-not-exist",
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
  { theme: "light", device: "tablet", viewport: TABLET },
  { theme: "dark", device: "tablet", viewport: TABLET },
  { theme: "light", device: "mobile", viewport: MOBILE },
  { theme: "dark", device: "mobile", viewport: MOBILE },
];

/**
 * Overlay states worth auditing on top of the static routes: focus order and
 * labelling bugs hide in open dialogs, which no route load can reach. The
 * The header presents the assistant as a compact icon on narrow screens and a
 * labelled control on desktop; both retain the same accessible name.
 */
function dialogsFor(device) {
  const assistant = {
    label: "assistant panel",
    trigger: /^Ask Friday/,
    dialog: /^Ask about/,
  };
  return device === "desktop"
    ? [assistant]
    : [{ label: "mobile nav drawer", trigger: /^Open menu$/, dialog: /^Menu$/ }, assistant];
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

/**
 * Reduced motion is a runtime contract, not just a source-code convention.
 * Assert that the media query is active, reveal content remains visible, and
 * computed animation/transition durations collapse to the WCAG-safe ceiling.
 */
async function auditReducedMotion(browser) {
  const context = await browser.newContext({
    viewport: MOBILE,
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("theme", "light");
    } catch {
      // The theme assertion in open() reports storage failures.
    }
  });
  const page = await context.newPage();

  try {
    await open(page, "/", "light");
    const result = await page.evaluate(() => {
      const toMilliseconds = (duration) => {
        const value = Number.parseFloat(duration);
        if (!Number.isFinite(value)) return 0;
        return duration.trim().endsWith("ms") ? value : value * 1000;
      };
      const maxDuration = (durations) =>
        Math.max(0, ...durations.split(",").map(toMilliseconds));

      const durationOffenders = Array.from(document.querySelectorAll("*"))
        .map((element) => {
          const style = getComputedStyle(element);
          return {
            selector:
              element.id
                ? `#${element.id}`
                : element.classList.length > 0
                  ? `${element.tagName.toLowerCase()}.${Array.from(element.classList).join(".")}`
                  : element.tagName.toLowerCase(),
            animation: maxDuration(style.animationDuration),
            transition: maxDuration(style.transitionDuration),
          };
        })
        .filter(({ animation, transition }) => animation > 80 || transition > 80)
        .slice(0, 10);

      const hiddenEntranceContent = Array.from(
        document.querySelectorAll(".reveal, .hero-item"),
      )
        .filter((element) => {
          const style = getComputedStyle(element);
          return Number.parseFloat(style.opacity) < 0.99 || style.transform !== "none";
        })
        .slice(0, 10)
        .map((element) => element.tagName.toLowerCase());

      return {
        matches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        durationOffenders,
        hiddenEntranceContent,
      };
    });

    if (!result.matches) {
      throw new Error("prefers-reduced-motion was not active in the reduced-motion context");
    }
    if (result.durationOffenders.length > 0) {
      throw new Error(
        `reduced-motion duration exceeded 80ms: ${JSON.stringify(result.durationOffenders)}`,
      );
    }
    if (result.hiddenEntranceContent.length > 0) {
      throw new Error(
        `entrance content remained hidden under reduced motion: ` +
          result.hiddenEntranceContent.join(", "),
      );
    }
    console.log("✓ [reduced motion] / — durations collapsed; entrance content visible");
  } finally {
    await context.close();
  }
}

async function auditOverlayKeyboard(browser) {
  const desktopContext = await browser.newContext({ viewport: DESKTOP });
  await desktopContext.addInitScript(() => {
    try {
      window.localStorage.setItem("theme", "light");
    } catch {
      // The theme assertion in open() reports storage failures.
    }
  });
  const desktopPage = await desktopContext.newPage();

  try {
    await open(desktopPage, "/", "light");
    const launcher = desktopPage.getByRole("button", { name: /^Ask Friday/ }).first();
    await launcher.click();
    const dialog = desktopPage.getByRole("dialog", { name: /^Ask about/ });
    await dialog.waitFor();

    const textarea = dialog.getByRole("textbox", { name: "Your question" });
    if (!(await textarea.evaluate((el) => el === document.activeElement))) {
      throw new Error("Assistant did not focus its question field on open");
    }
    await textarea.fill("What has Mubin shipped?");
    await desktopPage.keyboard.press("Tab");
    const ask = dialog.getByRole("button", { name: "Ask", exact: true });
    if (!(await ask.evaluate((el) => el === document.activeElement))) {
      throw new Error("Assistant focus trap skipped the newly enabled Ask button");
    }
    await desktopPage.keyboard.press("Tab");
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    if (!(await close.evaluate((el) => el === document.activeElement))) {
      throw new Error("Assistant focus trap did not wrap to Close");
    }
    await desktopPage.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    if (!(await launcher.evaluate((el) => el === document.activeElement))) {
      throw new Error("Assistant did not restore focus to its launcher");
    }
  } finally {
    await desktopContext.close();
  }

  const mobileContext = await browser.newContext({ viewport: MOBILE });
  await mobileContext.addInitScript(() => {
    try {
      window.localStorage.setItem("theme", "light");
    } catch {
      // The theme assertion in open() reports storage failures.
    }
  });
  const mobilePage = await mobileContext.newPage();

  try {
    await open(mobilePage, "/", "light");
    const trigger = mobilePage.getByRole("button", { name: "Open menu", exact: true });
    await trigger.click();
    const menu = mobilePage.getByRole("dialog", { name: "Menu", exact: true });
    await menu.waitFor();
    const box = await menu.boundingBox();
    if (!box || box.height > MOBILE.height * 0.75) {
      throw new Error("Mobile menu is taller than the compact-menu budget");
    }

    const close = menu.getByRole("button", { name: /^Close$/ });
    if (!(await close.evaluate((el) => el === document.activeElement))) {
      throw new Error("Mobile menu did not focus its visible Close action");
    }
    await mobilePage.keyboard.press("Shift+Tab");
    const assistant = menu.getByRole("button", { name: /^Ask Friday/ });
    if (!(await assistant.evaluate((el) => el === document.activeElement))) {
      throw new Error("Mobile menu focus trap did not wrap to its final action");
    }
    await mobilePage.keyboard.press("Tab");
    if (!(await close.evaluate((el) => el === document.activeElement))) {
      throw new Error("Mobile menu focus trap did not wrap back to Close");
    }
    await mobilePage.keyboard.press("Escape");
    await menu.waitFor({ state: "detached" });
    if (!(await trigger.evaluate((el) => el === document.activeElement))) {
      throw new Error("Mobile menu did not restore focus to its trigger");
    }

    console.log(
      "✓ [keyboard] / — compact mobile menu and dynamic assistant focus traps",
    );
  } finally {
    await mobileContext.close();
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
  await auditReducedMotion(browser);
  await auditOverlayKeyboard(browser);
} finally {
  await browser.close();
}

console.log(`\nTOTAL VIOLATIONS: ${total}`);
process.exit(total === 0 ? 0 : 1);
