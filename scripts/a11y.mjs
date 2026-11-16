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
  "/about",
  "/uses",
  "/resume",
  "/skills",
  "/privacy",
  "/trust",
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
    trigger: /^Ask this site/,
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

  // Horizontal page scrolling is a responsive-layout failure (WCAG 1.4.10)
  // that axe cannot reliably infer from otherwise valid descendants. Keep
  // intentional code/diagram overflow scoped to their own scroll containers;
  // the document itself must always fit the supported viewport.
  const inlineSize = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  if (inlineSize.scroll > inlineSize.client + 1) {
    throw new Error(
      `horizontal document overflow on ${route}: ` +
        `${inlineSize.scroll}px content in a ${inlineSize.client}px viewport`,
    );
  }
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

// Focus moves a frame or two after a dialog mounts or closes, by design. The
// launchers sit inside the subtree a modal makes `inert`, and focusing one in
// the same tick the boundary is released is a silent no-op (design-system.md
// §8, ADR-014 § 4). Sampling document.activeElement at a single instant
// therefore raced the restore: the same code passed on a pull request and
// failed on main. Each check now waits up to FOCUS_SETTLE_MS for focus to land.
// The contract is unchanged, and a failure says where focus actually is.
const FOCUS_SETTLE_MS = 800;

async function focusLandsOn(locator) {
  const deadline = Date.now() + FOCUS_SETTLE_MS;
  do {
    if (await locator.evaluate((el) => el === document.activeElement).catch(() => false)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  } while (Date.now() < deadline);
  return false;
}

async function describeFocus(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return "<body>";
    const name = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${name ? ` "${name}"` : ""}`;
  });
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
    const launcher = desktopPage.getByRole("button", { name: /^Ask this site/ }).first();
    await launcher.click();
    const dialog = desktopPage.getByRole("dialog", { name: /^Ask about/ });
    await dialog.waitFor();

    const textarea = dialog.getByRole("textbox", { name: "Your question" });
    if (!(await focusLandsOn(textarea))) {
      throw new Error(`Assistant did not focus its question field on open (focus: ${await describeFocus(desktopPage)})`);
    }
    await textarea.fill("What has Mubin shipped?");
    await desktopPage.keyboard.press("Tab");
    const ask = dialog.getByRole("button", { name: "Ask", exact: true });
    if (!(await focusLandsOn(ask))) {
      throw new Error(`Assistant focus trap skipped the newly enabled Ask button (focus: ${await describeFocus(desktopPage)})`);
    }
    await desktopPage.keyboard.press("Tab");
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    if (!(await focusLandsOn(close))) {
      throw new Error(`Assistant focus trap did not wrap to Close (focus: ${await describeFocus(desktopPage)})`);
    }
    await desktopPage.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    if (!(await focusLandsOn(launcher))) {
      throw new Error(`Assistant did not restore focus to its launcher (focus: ${await describeFocus(desktopPage)})`);
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
    if (!(await focusLandsOn(close))) {
      throw new Error(`Mobile menu did not focus its visible Close action (focus: ${await describeFocus(mobilePage)})`);
    }
    await mobilePage.keyboard.press("Shift+Tab");
    const assistant = menu.getByRole("button", { name: /^Ask this site/ });
    if (!(await focusLandsOn(assistant))) {
      throw new Error(`Mobile menu focus trap did not wrap to its final action (focus: ${await describeFocus(mobilePage)})`);
    }
    await mobilePage.keyboard.press("Tab");
    if (!(await focusLandsOn(close))) {
      throw new Error(`Mobile menu focus trap did not wrap back to Close (focus: ${await describeFocus(mobilePage)})`);
    }
    await mobilePage.keyboard.press("Escape");
    await menu.waitFor({ state: "detached" });
    if (!(await focusLandsOn(trigger))) {
      throw new Error(`Mobile menu did not restore focus to its trigger (focus: ${await describeFocus(mobilePage)})`);
    }

    console.log(
      "✓ [keyboard] / — compact mobile menu and dynamic assistant focus traps",
    );
  } finally {
    await mobileContext.close();
  }
}

/**
 * The assistant's conversation contracts. Sending — by a starter or by Ask —
 * never drops focus out of the dialog (WCAG 2.4.3): the control the visitor
 * used may unmount, so focus lands on the question field. The field's
 * description stays a short hint however long the conversation grows; it used
 * to be the whole transcript, read out on every focus (WCAG 1.3.1). Closing
 * keeps the conversation, and Clear empties it with focus left in the field.
 * /api/chat is mocked: no model, no quota, the same answer every run.
 */
async function auditAssistantConversation(browser) {
  const context = await browser.newContext({ viewport: DESKTOP });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("theme", "light");
    } catch {
      // The theme assertion in open() reports storage failures.
    }
  });
  const page = await context.newPage();
  const answer = [
    'event: meta\ndata: {"mode":"fallback"}\n\n',
    'event: token\ndata: {"text":"A mocked answer from the site search."}\n\n',
    'event: sources\ndata: {"citations":[{"source":"DBWhisper case study — Architecture"}]}\n\n',
    "event: done\ndata: {}\n\n",
  ].join("");
  await page.route("**/api/chat", (route) =>
    route.fulfill({ status: 200, contentType: "text/event-stream", body: answer }),
  );

  const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement);

  try {
    await open(page, "/", "light");
    const launcher = page.getByRole("button", { name: /^Ask this site/ }).first();
    await launcher.click();
    const dialog = page.getByRole("dialog", { name: /^Ask about/ });
    await dialog.waitFor();
    const field = dialog.getByRole("textbox", { name: "Your question" });
    const log = dialog.getByRole("log");
    const answered = () => dialog.locator('[role="log"][aria-busy="false"]').waitFor();

    // A starter, reached and pressed by keyboard alone.
    const firstStarter = dialog.getByRole("list").getByRole("button").first();
    const starter = ((await firstStarter.textContent()) ?? "").trim();
    for (let i = 0; i < 8 && !(await isFocused(firstStarter)); i++) {
      await page.keyboard.press("Tab");
    }
    if (!(await isFocused(firstStarter))) {
      throw new Error("Assistant: Tab never reached the first starter question");
    }
    await page.keyboard.press("Enter");
    await firstStarter.waitFor({ state: "detached" });
    if (!(await isFocused(field))) {
      throw new Error("Assistant: sending a starter dropped focus out of the question field");
    }
    await log.getByText(starter, { exact: true }).waitFor();
    await answered();

    // A typed question, sent from the Ask button.
    const typed = "What does the validator reject?";
    await field.fill(typed);
    await page.keyboard.press("Tab");
    if (!(await isFocused(dialog.getByRole("button", { name: "Ask", exact: true })))) {
      throw new Error("Assistant: Tab from the question field did not reach Ask");
    }
    await page.keyboard.press("Enter");
    await log.getByText(typed, { exact: true }).waitFor();
    if (!(await isFocused(field))) {
      throw new Error("Assistant: sending with Ask dropped focus out of the question field");
    }
    await answered();

    const description = await field.evaluate((el) =>
      (el.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent ?? "")
        .join(" ")
        .trim(),
    );
    if (description.length === 0 || description.length >= 200) {
      throw new Error(
        `Assistant: after two answers the question field's description is ${description.length} ` +
          "characters; it must be a short hint (1–199), never the transcript",
      );
    }

    // Closing keeps the conversation; reopening shows it again.
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    await launcher.click();
    await dialog.waitFor();
    if ((await log.getByText(typed, { exact: true }).count()) !== 1) {
      throw new Error("Assistant: closing and reopening the panel lost the conversation");
    }

    // Clear empties it, and focus stays in the dialog, on the field.
    await dialog.getByRole("button", { name: "Clear conversation" }).focus();
    await page.keyboard.press("Enter");
    await dialog.getByRole("list").getByRole("button").first().waitFor();
    if ((await log.getByText(typed, { exact: true }).count()) !== 0) {
      throw new Error("Assistant: Clear left the conversation in place");
    }
    if (!(await isFocused(field))) {
      throw new Error("Assistant: Clear dropped focus out of the question field");
    }

    console.log(
      "✓ [keyboard] / — assistant keeps focus on send, a short field description, and its conversation",
    );
  } finally {
    await context.close();
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
  await auditAssistantConversation(browser);
} finally {
  await browser.close();
}

console.log(`\nTOTAL VIOLATIONS: ${total}`);
process.exit(total === 0 ? 0 : 1);
