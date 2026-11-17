// WCAG 2.2 AA gate. Loads each key route at every viewport, plus the overlay
// states a plain page load never reaches, injects axe-core, and fails (exit 1)
// on any violation of the WCAG 2.2 A/AA rules or of the best-practice rules
// Lighthouse scores (BEST_PRACTICE_RULES). Requires a running server:
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
// axe's best-practice rules that Lighthouse's accessibility score counts, plus
// landmark-unique and region. Lighthouse audits three routes and must score
// 100; running these on every route and state here finds a heading out of
// order (the home showcase shipped an h3 straight after the h1) before that
// budget does. `region` keeps every piece of content inside a landmark, so a
// screen reader's landmark navigation reaches it (the home announcement bar
// once sat outside them all).
const BEST_PRACTICE_RULES = [
  "accesskeys",
  "empty-heading",
  "heading-order",
  "identical-links-same-purpose",
  "image-redundant-alt",
  "landmark-one-main",
  "landmark-unique",
  "region",
  "skip-link",
  "table-duplicate-name",
  "tabindex",
];

// 360px is the narrowest phone the layout supports; 768 exercises the compact
// tablet navigation; 1280 sits above the desktop navigation boundary.
const DESKTOP = { width: 1280, height: 900 };
const TABLET = { width: 768, height: 900 };
const MOBILE = { width: 360, height: 740 };
/** Below this width a flagship holds its long sections behind disclosures (components/ui/show-more.tsx). */
const PHONE_DISCLOSURE_MAX = 760;

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
  "/contact",
  "/about",
  "/uses",
  "/resume",
  "/skills",
  "/privacy",
  "/trust",
  // The flagship case studies: the longest pages, with the media galleries,
  // the recordings and, below 760px, the phone disclosures (ShowMore).
  "/work/bench-discovery",
  "/work/careltc",
  "/route-that-does-not-exist",
  "/dev/components",
];

// The site has one theme (ADR-018): a light canvas, with dark pages and plates
// built into the design rather than chosen by the visitor. So each viewport is
// one pass. open() still asserts the root's data-theme is "light", so a theme
// switch reintroduced without its own pass fails here instead of going unseen.
const PASSES = [
  { device: "desktop", viewport: DESKTOP },
  { device: "tablet", viewport: TABLET },
  { device: "mobile", viewport: MOBILE },
];
const THEME = "light";

/** The assistant panel, found by its name (components/assistant/copy.ts). */
const assistantDialog = (page) => page.getByRole("dialog", { name: /^Ask about/ });

/**
 * Overlay states worth auditing on top of the static routes: focus order and
 * labelling bugs hide in open overlays, which no route load can reach. Above
 * 1000px the Work and About menus are disclosure panels under their triggers,
 * found through the trigger's state. Below it the site menu is a modal sheet
 * (ADR-018, amended 17 Nov 2026): the button and its panel are one dialog,
 * named "Site menu", over an inert page. The assistant is a modal dialog at
 * every width; it is also opened the ways a page offers it, which show that
 * page's own starters and send nothing: "Ask AI about <product>" on a case
 * study and "Ask this site's assistant" on an essay.
 */
function overlaysFor(device) {
  const assistant = {
    label: "assistant panel",
    trigger: (page) => page.getByRole("button", { name: /^Ask this site/ }).first(),
    open: assistantDialog,
  };
  const pageAssistants = [
    {
      label: "assistant panel from a case study's Ask AI (its starters)",
      route: "/work/careltc",
      trigger: (page) => page.getByRole("button", { name: "Ask AI about CareLTC", exact: true }),
      open: assistantDialog,
    },
    {
      label: "assistant panel from an essay's ask button (its starters)",
      route: "/writing/trust-is-not-a-safety-model",
      trigger: (page) => page.getByRole("button", { name: "Ask this site's assistant", exact: true }),
      open: assistantDialog,
    },
  ];
  const navMenu = (id, label) => ({
    label: `${label} menu`,
    trigger: (page) => page.locator(`button[aria-controls="${id}"]`),
    open: (page) => page.locator(`button[aria-controls="${id}"][aria-expanded="true"]`),
  });
  return device === "desktop"
    ? [navMenu("nav-work", "Work"), navMenu("nav-about", "About"), assistant, ...pageAssistants]
    : [
        {
          label: "mobile menu",
          trigger: (page) => page.getByRole("button", { name: "Open menu", exact: true }),
          open: (page) => page.getByRole("dialog", { name: "Site menu", exact: true }),
        },
        assistant,
        ...pageAssistants,
      ];
}

/** Inject axe-core and return the violations for the page's current state. */
async function runAxe(page) {
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(([tags, extra]) => {
    // The same rules a tag run selects (experimental and deprecated ones stay
    // off), plus the extras.
    const tagged = axe
      .getRules(tags)
      .filter((rule) => !rule.tags.includes("experimental") && !rule.tags.includes("deprecated"));
    const rules = new Set([...tagged.map((rule) => rule.ruleId), ...extra]);
    return axe.run(document, { runOnly: { type: "rule", values: [...rules] } });
  }, [TAGS, BEST_PRACTICE_RULES]);
  return res.violations;
}

/**
 * Wait until every finite animation and transition on the page has finished.
 * Overlays fade in, and axe samples colours as they are painted, so auditing a
 * mid-fade frame reports contrast that no user ever sees once it settles.
 * Infinite animations (a spinner, a pulse) are skipped, and five seconds caps
 * the wait so one runaway transition cannot hang the gate.
 */
async function settleAnimations(page) {
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return animation.playState === "running" && timing && timing.iterations !== Infinity;
    });
    await Promise.race([
      Promise.all(finite.map((animation) => animation.finished.catch(() => undefined))),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function open(page, route, expectedTheme) {
  await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
  const applied = await page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  );
  if (applied !== expectedTheme) {
    throw new Error(
      `theme never applied on ${route}: expected data-theme="${expectedTheme}", got ` +
        `${applied === null ? "no attribute" : `"${applied}"`}. The site has one theme ` +
        `(ADR-018); a second one needs its own audit pass before this gate can trust a run.`,
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

      // The site has no entrance reveals (ADR-018), so nothing readable may
      // start faded: every rendered heading, paragraph and list item in <main>
      // is fully opaque, counting its ancestors' opacity. Decorative subtrees
      // (aria-hidden, inert) and hidden panels are not content.
      const hiddenEntranceContent = Array.from(
        document.querySelectorAll("main :is(h1, h2, h3, p, li)"),
      )
        .filter((element) => element.getClientRects().length > 0)
        .filter((element) => !element.closest('[aria-hidden="true"], [inert], [hidden]'))
        .filter((element) => getComputedStyle(element).visibility !== "hidden")
        .filter((element) => {
          let opacity = 1;
          for (let node = element; node; node = node.parentElement) {
            opacity *= Number.parseFloat(getComputedStyle(node).opacity);
          }
          return opacity < 0.99;
        })
        .slice(0, 10)
        .map((element) => `${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim().slice(0, 30)}"`);

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
        `readable content is faded under reduced motion: ` +
          result.hiddenEntranceContent.join(", "),
      );
    }
    console.log("✓ [reduced motion] / — durations collapsed; no readable content faded");
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

/** What Tab can reach inside a dialog (the menu and the panel trap the same set). */
const TABBABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** A dialog's visible Tab stops, and the index of the one holding focus (-1 when focus is outside it). */
function tabStops(dialog) {
  return dialog.evaluate((root, selector) => {
    const items = Array.from(root.querySelectorAll(selector)).filter((el) => el.getClientRects().length > 0);
    return { count: items.length, focused: items.indexOf(document.activeElement) };
  }, TABBABLE);
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
  const mobilePage = await mobileContext.newPage();

  try {
    await open(mobilePage, "/", "light");
    // The menu is a modal sheet (ADR-018, amended 17 Nov 2026): the button and
    // its panel are one dialog, focus moves to the panel's first link on open,
    // Tab and Shift+Tab cycle inside the dialog and never reach the inert page,
    // and Escape closes it with focus back on the button.
    const trigger = mobilePage.getByRole("button", { name: "Open menu", exact: true });
    await trigger.click();
    const dialog = mobilePage.getByRole("dialog", { name: "Site menu", exact: true });
    await dialog.waitFor();
    const menu = mobilePage.locator("#mobile-menu");
    await menu.waitFor();
    const toggle = mobilePage.getByRole("button", { name: "Close menu", exact: true });
    if ((await toggle.getAttribute("aria-expanded")) !== "true") {
      throw new Error("Mobile menu button does not report aria-expanded=\"true\" when open");
    }
    if ((await dialog.getAttribute("aria-modal")) !== "true") {
      throw new Error("The open mobile menu is not a modal dialog (aria-modal)");
    }
    const firstLink = menu.getByRole("link").first();
    if (!(await focusLandsOn(firstLink))) {
      throw new Error(`Mobile menu did not move focus to its first link on open (focus: ${await describeFocus(mobilePage)})`);
    }
    // On the narrowest phone the open panel ends inside the viewport, and when
    // its groups are taller than that space it scrolls itself, so every link
    // is reachable without the page moving under it (WCAG 1.4.10).
    await settleAnimations(mobilePage);
    const fit = await menu.evaluate((panel) => ({
      bottom: panel.getBoundingClientRect().bottom,
      viewport: window.innerHeight,
      overflows: panel.scrollHeight > panel.clientHeight + 1,
      scrolls: ["auto", "scroll"].includes(getComputedStyle(panel).overflowY),
    }));
    if (fit.bottom > fit.viewport + 1 || (fit.overflows && !fit.scrolls)) {
      throw new Error(`Mobile menu does not fit a ${MOBILE.width}×${MOBILE.height} viewport: ${JSON.stringify(fit)}`);
    }
    // Every stop Tab makes, a full lap and one more, stays inside the dialog,
    // and the lap wraps: Tab from its last control lands on its first, and
    // Shift+Tab from the first lands back on the last.
    const { count } = await tabStops(dialog);
    for (let i = 0; i <= count; i++) {
      await mobilePage.keyboard.press("Tab");
      if ((await tabStops(dialog)).focused === -1) {
        throw new Error(`Tab left the open mobile menu after ${i + 1} press(es) (focus: ${await describeFocus(mobilePage)})`);
      }
    }
    await dialog.evaluate((root, selector) => {
      const items = Array.from(root.querySelectorAll(selector)).filter((el) => el.getClientRects().length > 0);
      items.at(-1)?.focus();
    }, TABBABLE);
    await mobilePage.keyboard.press("Tab");
    const forward = (await tabStops(dialog)).focused;
    await mobilePage.keyboard.press("Shift+Tab");
    const back = (await tabStops(dialog)).focused;
    if (forward !== 0 || back !== count - 1) {
      throw new Error(
        `The mobile menu's Tab cycle does not wrap: Tab from its last control reached stop ${forward}, ` +
          `Shift+Tab from the first reached stop ${back} (expected 0 and ${count - 1} of ${count})`,
      );
    }
    await mobilePage.keyboard.press("Escape");
    await mobilePage.locator("#mobile-menu").waitFor({ state: "detached" });
    if (!(await focusLandsOn(trigger))) {
      throw new Error(`Mobile menu did not return focus to its button on Escape (focus: ${await describeFocus(mobilePage)})`);
    }
    // The panel fades out before visibility flips to hidden; wait for that.
    await settleAnimations(mobilePage);
    const closedLinks = await mobilePage.evaluate(() => {
      const panel = document.querySelector("#site-mobile-nav");
      return panel ? getComputedStyle(panel).visibility : "missing";
    });
    if (closedLinks !== "hidden") {
      throw new Error(`The closed mobile menu panel is ${closedLinks}, so its links stay in the tab order`);
    }

    console.log(
      "✓ [keyboard] / — the mobile menu's modal sheet (focus in, Tab cycles, Escape returns) and the assistant focus trap",
    );
  } finally {
    await mobileContext.close();
  }
}

/**
 * One answer as /api/chat streams it (lib/ai/chat-contract.ts): meta, the
 * text, the cited pages, then the next steps and follow-ups when there are
 * any, then done.
 */
function answerStream({ text, citations, actions = [], followups = [] }) {
  const frame = (event, data) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return [
    frame("meta", { mode: "live", note: null }),
    frame("token", { text }),
    frame("sources", { citations }),
    ...(actions.length > 0 ? [frame("actions", { actions })] : []),
    ...(followups.length > 0 ? [frame("followups", { questions: followups })] : []),
    frame("done", {}),
  ].join("");
}

/** A full answer: a cited page, a next step and curated follow-ups (lib/ai/follow-ups.ts). */
const MOCK_ANSWER = {
  text: "A mocked answer from the site search: DBWhisper checks every statement before it runs.",
  citations: [{ label: "DBWhisper", href: "/work/dbwhisper" }],
  actions: [{ kind: "case-study", label: "Open the case study", href: "/work/dbwhisper" }],
  followups: ["How was DBWhisper deployed?", "What is DBWhisper's Spider score?"],
};

/** A question whose mocked answer is long enough to scroll the transcript. */
const LONG_QUESTION = "What does the validator reject?";
const LONG_TEXT = Array.from(
  { length: 14 },
  (_, i) => `Paragraph ${i + 1} of a long mocked answer: the validator refuses a write, a second statement, and a schema it was not given.`,
).join("\n\n");

/**
 * The assistant's conversation contracts. Sending — by a starter, a follow-up
 * or Ask — never drops focus out of the dialog (WCAG 2.4.3): the control the
 * visitor used may unmount, so focus lands on the question field. An answer's
 * affordances (its cited page, Copy answer, the next steps, the follow-ups and
 * the AI disclosure) and "Jump to latest" are audited as they render. The
 * field's description stays a short hint however long the conversation grows;
 * it used to be the whole transcript, read out on every focus (WCAG 1.3.1).
 * Closing keeps the conversation, and Clear empties it with focus left in the
 * field. /api/chat is mocked: no model, no quota, the same answers every run.
 */
async function auditAssistantConversation(browser) {
  const context = await browser.newContext({ viewport: DESKTOP });
  const page = await context.newPage();
  await page.route("**/api/chat", (route) => {
    const question = route.request().postDataJSON()?.messages?.at(-1)?.content;
    const answer = question === LONG_QUESTION ? { ...MOCK_ANSWER, text: LONG_TEXT } : MOCK_ANSWER;
    return route.fulfill({ status: 200, contentType: "text/event-stream", body: answerStream(answer) });
  });

  const isFocused = (locator) => locator.evaluate((el) => el === document.activeElement);
  let violations = 0;
  const audit = async (label) => {
    await settleAnimations(page);
    const v = await runAxe(page);
    violations += v.length;
    report(`[desktop] / — assistant ${label}`, v);
  };

  try {
    await open(page, "/", "light");
    const launcher = page.getByRole("button", { name: /^Ask this site/ }).first();
    await launcher.click();
    const dialog = page.getByRole("dialog", { name: /^Ask about/ });
    await dialog.waitFor();
    const field = dialog.getByRole("textbox", { name: "Your question" });
    const log = dialog.getByRole("log");
    const answered = () => dialog.locator('[role="log"][aria-busy="false"]').waitFor();

    // A starter, reached and pressed by keyboard alone. Buttons are found by
    // their exact words: once an answer lands, its follow-ups are buttons in a
    // list too, and a question already asked never comes back as a chip.
    const starters = dialog.getByRole("list", { name: "Try a question" }).getByRole("button");
    const starter = ((await starters.first().textContent()) ?? "").trim();
    const firstStarter = dialog.getByRole("button", { name: starter, exact: true });
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

    // The answer's affordances all render before they are audited, so the
    // audit cannot pass on a panel that dropped one.
    const followUps = dialog.getByRole("list", { name: "Ask next" }).getByRole("button");
    const rendered = {
      sources: await dialog.getByRole("list", { name: "Sources" }).getByRole("link").count(),
      copy: await dialog.getByRole("button", { name: "Copy answer", exact: true }).count(),
      nextSteps: await dialog.getByRole("group", { name: "Next steps" }).getByRole("link").count(),
      followUps: await followUps.count(),
      disclosure: await dialog.getByText(/^AI-generated from this site's pages/).count(),
    };
    if (Object.values(rendered).some((count) => count === 0)) {
      throw new Error(`Assistant: an answer's affordance did not render: ${JSON.stringify(rendered)}`);
    }
    await audit("answer open (cited page, Copy answer, next steps, follow-ups, AI disclosure)");

    // A follow-up, pressed by keyboard: it sends its own words, and focus stays in the field.
    const followUpText = ((await followUps.first().textContent()) ?? "").trim();
    const followUp = dialog.getByRole("button", { name: followUpText, exact: true });
    await followUp.focus();
    await page.keyboard.press("Enter");
    await followUp.waitFor({ state: "detached" });
    if (!(await isFocused(field))) {
      throw new Error("Assistant: sending a follow-up dropped focus out of the question field");
    }
    await log.getByText(followUpText, { exact: true }).waitFor();
    await answered();

    // A typed question, sent from the Ask button; its answer is long.
    const typed = LONG_QUESTION;
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
        `Assistant: after three answers the question field's description is ${description.length} ` +
          "characters; it must be a short hint (1–199), never the transcript",
      );
    }

    // Reading back up pauses the follow and offers "Jump to latest"; it is
    // audited, then pressed: the transcript is back at the end and focus,
    // with the button gone, is in the field.
    await log.evaluate((el) => {
      el.scrollTop = 0;
      el.dispatchEvent(new Event("scroll"));
    });
    const jump = dialog.getByRole("button", { name: "Jump to latest", exact: true });
    await jump.waitFor();
    await audit("with Jump to latest");
    await jump.focus();
    await page.keyboard.press("Enter");
    // Every frame of the glide back down: the button must not come back on
    // the way (the reader asked to follow again), and the glide must end.
    const glide = await log.evaluate((el) => new Promise((resolve) => {
      const panel = el.closest('[role="dialog"]');
      const deadline = performance.now() + 2500;
      let reappeared = 0;
      let still = 0;
      let last = -1;
      const tick = () => {
        const shown = Array.from(panel.querySelectorAll("button")).some((b) => b.textContent.trim() === "Jump to latest");
        if (shown) reappeared += 1;
        still = el.scrollTop === last ? still + 1 : 0;
        last = el.scrollTop;
        const end = el.scrollHeight - el.scrollTop - el.clientHeight < 2;
        if ((end && still >= 3) || performance.now() > deadline) resolve({ end, reappeared });
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }));
    if (!glide.end || glide.reappeared > 0 || !(await isFocused(field))) {
      throw new Error(
        `Assistant: Jump to latest ${glide.end ? "reached" : "fell short of"} the end, the button came back ` +
          `in ${glide.reappeared} frame(s) of the glide, and focus is on ${await describeFocus(page)}`,
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
    await starters.first().waitFor();
    if ((await log.getByText(typed, { exact: true }).count()) !== 0) {
      throw new Error("Assistant: Clear left the conversation in place");
    }
    if (!(await isFocused(field))) {
      throw new Error("Assistant: Clear dropped focus out of the question field");
    }

    console.log(
      "✓ [keyboard] / — assistant keeps focus on send (starter, follow-up, Ask, Jump to latest), a short field description, and its conversation",
    );
  } finally {
    await context.close();
  }
  return violations;
}

let total = 0;
const browser = await chromium.launch();
try {
  for (const pass of PASSES) {
    const context = await browser.newContext({ viewport: pass.viewport });
    // Nothing in a route load or an opened overlay may ask the assistant
    // anything: opening it sends no question. Any request is held and failed.
    const sent = [];
    await context.route("**/api/chat", (route) => {
      sent.push(route.request().url());
      return route.abort();
    });
    const page = await context.newPage();
    const prefix = `[${pass.device}]`;

    for (const route of ROUTES) {
      await open(page, route, THEME);
      const v = await runAxe(page);
      total += v.length;
      report(`${prefix} ${route}`, v);
    }

    for (const d of overlaysFor(pass.device)) {
      const route = d.route ?? "/";
      await open(page, route, THEME);
      await d.trigger(page).click();
      await d.open(page).waitFor({ timeout: 10000 });
      // The overlay exists before its entrance finishes; audit the settled state.
      await settleAnimations(page);
      const v = await runAxe(page);
      total += v.length;
      report(`${prefix} ${route} — ${d.label} open`, v);
      await page.keyboard.press("Escape");
    }

    // Below 760px a flagship's long sections wait behind native disclosures
    // (ShowMore), and axe skips whatever a closed <details> hides, so the
    // route pass above never saw them on a phone. Open every one, by its
    // summary as a visitor would, and audit the page again.
    if (pass.viewport.width < PHONE_DISCLOSURE_MAX) {
      for (const route of ["/work/bench-discovery", "/work/careltc"]) {
        await open(page, route, THEME);
        const opened = await page.evaluate(() => {
          const closed = Array.from(document.querySelectorAll("main details:not([open]) > summary"));
          for (const summary of closed) summary.click();
          return closed.length;
        });
        if (opened === 0) {
          throw new Error(`${route}: no closed phone disclosure at ${pass.viewport.width}px, so this audit would see nothing new`);
        }
        await settleAnimations(page);
        const width = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (width > 1) throw new Error(`${route}: ${width}px of horizontal overflow with the phone disclosures open`);
        const v = await runAxe(page);
        total += v.length;
        report(`${prefix} ${route} — all ${opened} phone disclosures open`, v);
      }
    }

    if (sent.length > 0) {
      throw new Error(`${prefix}: opening a page or an overlay sent ${sent.length} request(s) to /api/chat; opening sends nothing`);
    }
    await context.close();
  }
  await auditReducedMotion(browser);
  await auditOverlayKeyboard(browser);
  total += await auditAssistantConversation(browser);
} finally {
  await browser.close();
}

console.log(`\nTOTAL VIOLATIONS: ${total}`);
process.exit(total === 0 ? 0 : 1);
