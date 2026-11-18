// Measure motion while it happens, then verify that interaction, readable
// content, and reduced-motion alternatives survive. No snapshot-only checks.
// The contracts are the motion law of ADR-018 and design-system.md §6: the
// arrow-swap caret and the press, the menus, the showcase's tab pill and panel
// crossfade, the marquee and its pauses, the copy-prompt chip, cards and their
// illustrations, the hover moments on /work, a case study and a flagship's
// architecture sketch, the boundary inspector on /work/dbwhisper, that every
// animation resolves to real keyframes and nothing but an ambient loop runs at
// rest on any route, and each reduced-motion alternative. The site has one
// theme, so one pass.
//
//   BASE_URL=http://127.0.0.1:3200 node scripts/motion-audit.mjs
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3200").replace(/\/$/, "");
const results = [];
const apiRequests = [];
const errors = [];
const browser = await chromium.launch();

/**
 * Routes whose stylesheets are scanned for animations that name no @keyframes,
 * and where nothing but an ambient loop may run at rest. /work/tradepulse
 * stands for the case studies whose "How it works" is StickySteps.
 */
const KEYFRAME_ROUTES = [
  "/",
  "/work",
  "/work/dbwhisper",
  "/work/tradepulse",
  "/work/bench-discovery",
  "/work/careltc",
  "/work/signflow",
  "/hire",
  "/about",
  "/contact",
  "/evals",
  "/writing",
  "/writing/trust-is-not-a-safety-model",
  "/notes",
  "/now",
  "/trust",
  "/uses",
  "/skills",
  "/resume",
  "/privacy",
  "/route-that-does-not-exist",
];
/** The ambient loops the motion law allows to run at rest (ADR-018 §5). CSS-module names carry a hash prefix. */
const AMBIENT_LOOP = /(?:^|_)(?:marquee|float|hero-ring)$/;
/** The only properties a menu may transition: paint and compositor work, never layout (design-system.md §6). */
const MENU_PROPERTIES = new Set(["opacity", "transform", "visibility"]);
const CARET_REST = "2px 0px, -8px 0px";
const CARET_SWAPPED = "16px 0px, 2px 0px";

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail && !pass ? ` — ${detail}` : ""}`);
}

async function withPage(options, run) {
  const { permissions, ...contextOptions } = options;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...contextOptions });
  if (permissions) await context.grantPermissions(permissions, { origin: BASE });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`${page.url()}: ${error.message}`));
  await page.route(/\/api(?:\/|\?|$)/, async (route) => {
    apiRequests.push(route.request().url());
    await route.abort();
  });
  // Every animation and transition that starts inside <main>, from the first
  // frame: the hero must never animate in, and nothing may start because the
  // visitor scrolled.
  await page.addInitScript(() => {
    window.__motionLog = [];
    const record = (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("main")) return;
      window.__motionLog.push({
        at: performance.now(),
        kind: event.type,
        name: event.animationName ?? event.propertyName,
        hero: target.matches("#hero-title, #hero-title *, #hero-title + p"),
        target: `${target.tagName.toLowerCase()}${event.pseudoElement ?? ""}`,
      });
    };
    document.addEventListener("animationstart", record, true);
    document.addEventListener("transitionstart", record, true);
  });
  try { await run(page); } finally { await context.close(); }
}

async function open(page, path = "/") {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const theme = await page.locator("html").getAttribute("data-theme");
  if (theme !== "light") throw new Error(`${path}: <html data-theme="${theme}">; the site has one theme (ADR-018)`);
}

/** Wait (up to `cap` ms) until every finite animation on the page has finished. */
async function settle(page, cap = 3000) {
  await page.evaluate(async (limit) => {
    const finite = document.getAnimations().filter((animation) =>
      animation.playState === "running" && animation.effect?.getComputedTiming().iterations !== Infinity);
    await Promise.race([
      Promise.all(finite.map((animation) => animation.finished.catch(() => undefined))),
      new Promise((resolve) => setTimeout(resolve, limit)),
    ]);
  }, cap);
}

const frames = (page, count = 2) => page.evaluate(async (n) => {
  for (let i = 0; i < n; i++) await new Promise(requestAnimationFrame);
}, count);

// The site scrolls smoothly (`scroll-behavior: smooth`), so a Tab, a focus() or
// Playwright's own pre-hover scroll can leave the page moving. A pointer placed
// mid-scroll is carried off its target as the page keeps travelling, and the
// hover under test silently ends. Bring the target into view instantly, then
// wait until the document has held still for several frames before measuring.
async function bringToRest(page, locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.evaluate(() => new Promise((resolve) => {
    const deadline = performance.now() + 3000;
    let last = window.scrollY;
    let still = 0;
    const tick = () => {
      still = window.scrollY === last ? still + 1 : 0;
      last = window.scrollY;
      if (still >= 3 || performance.now() > deadline) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
}

/** Establish keyboard modality (so `:focus-visible` matches), then leave nothing focused or hovered. */
async function neutral(page, locator) {
  await page.keyboard.press("Tab");
  await locator.focus();
  await locator.evaluate((element) => element.blur());
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await bringToRest(page, locator);
}

async function appearance(locator, pseudo) {
  return locator.evaluate((element, pseudoElement) => {
    const style = getComputedStyle(element, pseudoElement ?? undefined);
    const transform = style.transform === "none" ? new DOMMatrix() : new DOMMatrix(style.transform);
    const box = element.getBoundingClientRect();
    return { scale: transform.a, opacity: Number(style.opacity), background: style.backgroundColor, color: style.color,
      shadow: style.boxShadow, visibility: style.visibility, outline: `${style.outlineStyle} ${style.outlineWidth}`,
      mask: style.maskPosition || style.webkitMaskPosition, transformText: style.transform,
      top: box.top + window.scrollY, left: box.left + window.scrollX, width: box.width, height: box.height };
  }, pseudo);
}
/** Same box in page coordinates, so a pixel of incidental page scroll is not read as the text moving. */
const samePlace = (a, b) => Math.abs(a.top - b.top) < 1 && Math.abs(a.left - b.left) < 1
  && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;

/** Running animations and transitions on an element (and, with `subtree`, inside it and on its pseudo-elements). */
const running = (locator, subtree = false) => locator.evaluate((element, deep) => element.getAnimations({ subtree: deep })
  .filter((animation) => animation.playState === "running")
  .map((animation) => ({
    name: animation.transitionProperty ?? animation.animationName ?? "script",
    pseudo: animation.effect?.pseudoElement ?? null,
    iterations: animation.effect?.getComputedTiming().iterations ?? 1,
  })), subtree);

// ---------------------------------------------------------------------------
// Readable content, no scroll reveals, and only the allowed loops at rest
// ---------------------------------------------------------------------------

/** Text in <main> that is not visible at rest. A tab's inactive panel is one click away, not waiting for an observer. */
async function hiddenText(page) {
  return page.evaluate(() => Array.from(document.querySelector("main")
    .querySelectorAll("h1,h2,h3,h4,p,pre,figcaption,blockquote,li,dt,dd"))
    .filter((element) => !element.closest(".sr-only, [role='tabpanel'][hidden]"))
    .filter((element) => {
      for (let node = element; node && node !== document.body; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (Number(style.opacity) < 0.99 || style.visibility === "hidden" || style.display === "none") return true;
      }
      return false;
    })
    .slice(0, 12)
    .map((element) => `${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim().slice(0, 40)}"`));
}

/** Scroll the whole page through the viewport and back, the way a reader would, and return what moved. */
async function scrollThrough(page) {
  return page.evaluate(async () => {
    const start = performance.now();
    const step = Math.max(240, Math.round(innerHeight * 0.7));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((resolve) => setTimeout(resolve, 300));
    return window.__motionLog.filter((entry) => entry.at >= start);
  });
}

async function restContracts(page, label) {
  const heroMotion = await page.evaluate(() => window.__motionLog.filter((entry) => entry.hero));
  const hero = await appearance(page.locator("#hero-title"));
  const before = await hiddenText(page);
  await page.mouse.move(0, 0);
  const scrolled = await scrollThrough(page);
  const after = await hiddenText(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${label}: the hero text is never animated in, nothing is hidden waiting to be revealed, and the page fits`,
    heroMotion.length === 0 && hero.opacity === 1 && before.length === 0 && after.length === 0 && overflow <= 1,
    JSON.stringify({ heroMotion, before, after, overflow }));
  check(`${label}: scrolling the page through starts no animation or transition in <main> (no scroll reveals)`,
    scrolled.length === 0, JSON.stringify(scrolled.slice(0, 8)));

  await settle(page);
  const loops = await page.evaluate(() => document.getAnimations()
    .filter((animation) => animation.playState === "running")
    .map((animation) => ({
      name: animation.animationName ?? animation.transitionProperty ?? "script",
      iterations: animation.effect?.getComputedTiming().iterations,
    })));
  check(`${label}: at rest only the ambient loops run; every finite animation has settled`,
    loops.every((loop) => loop.iterations === Infinity && AMBIENT_LOOP.test(loop.name)), JSON.stringify(loops));
}

// ---------------------------------------------------------------------------
// The marquee (ADR-018 §5: an ambient loop, paused on hover and focus)
// ---------------------------------------------------------------------------

/**
 * Tag the agent section's marquee tracks. A track is found by its structure
 * (a set, then its aria-hidden, inert duplicate), not by its hashed class or
 * its animation, so a dead animation is reported rather than hiding the row.
 */
async function marqueeTracks(page) {
  const count = await page.evaluate(() => {
    const tracks = Array.from(document.querySelectorAll("#agent *")).filter((element) => {
      const sets = Array.from(element.children);
      return sets.length === 2 && sets[1].getAttribute("aria-hidden") === "true" && sets[1].hasAttribute("inert");
    });
    tracks.forEach((track, i) => track.setAttribute("data-audit-track", String(i)));
    return tracks.length;
  });
  return { count, all: page.locator("[data-audit-track]") };
}

const trackState = (tracks) => tracks.evaluateAll((elements) => elements.map((track) => ({
  x: track.getBoundingClientRect().x,
  name: getComputedStyle(track).animationName,
  states: track.getAnimations().map((animation) => animation.playState),
})));

async function marqueeContracts(page) {
  const { count, all } = await marqueeTracks(page);
  const group = page.locator("#agent [data-audit-track]").first().locator("xpath=../..");
  await page.mouse.move(0, 0);
  await bringToRest(page, group);
  const clones = await all.evaluateAll((tracks) => tracks.every((track) => {
    const [set, clone] = track.children;
    return clone.getAttribute("aria-hidden") === "true" && clone.inert && clone.textContent === set.textContent;
  }));
  const first = await trackState(all);
  await page.waitForTimeout(500);
  const later = await trackState(all);
  const alive = count === 3 && first.every((track, i) => track.states.includes("running") && Math.abs(later[i].x - track.x) >= 1);
  check("marquee: every row loops at rest, and its duplicate set is aria-hidden and inert so it is read once",
    alive && clones, JSON.stringify({ count, first, later }));

  const box = await group.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(150);
  const hovered = await trackState(all);
  await page.waitForTimeout(300);
  const hoveredLater = await trackState(all);
  const paused = (states, again) => states.length === 3 && states.every((track, i) =>
    track.states.length > 0 && track.states.every((state) => state === "paused") && Math.abs(again[i].x - track.x) < 0.5);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);
  const resumed = await trackState(all);
  check("marquee: the rows pause under the pointer and resume when it leaves",
    alive && paused(hovered, hoveredLater) && resumed.every((track) => track.states.includes("running")),
    JSON.stringify({ hovered, resumed }));

  // The home rows are decorative and hold nothing focusable, so a focus target
  // is lent to the first row to exercise the focus-within pause every
  // marquee carries (a row of links would rely on it).
  const chip = page.locator('[data-audit-track="0"] > :first-child > :first-child');
  await chip.evaluate((element) => { element.tabIndex = -1; element.focus(); });
  await page.waitForTimeout(150);
  const focused = await trackState(all);
  await page.waitForTimeout(300);
  const focusedLater = await trackState(all);
  await chip.evaluate((element) => { element.blur(); element.removeAttribute("tabindex"); });
  check("marquee: the rows pause while focus is inside them", alive && paused(focused, focusedLater), JSON.stringify(focused));
}

async function reducedMarquee(page) {
  const { count, all } = await marqueeTracks(page);
  const state = await all.evaluateAll((tracks) => tracks.map((track) => {
    const [set, clone] = track.children;
    const row = track.parentElement.getBoundingClientRect();
    const box = set.getBoundingClientRect();
    return { name: getComputedStyle(track).animationName, clone: getComputedStyle(clone).display,
      offCentre: Math.abs((box.left - row.left) - (row.right - box.right)), x: box.x };
  }));
  await page.waitForTimeout(400);
  const later = await all.evaluateAll((tracks) => tracks.map((track) => track.children[0].getBoundingClientRect().x));
  check("reduced: the marquee is one static, centred row (no loop, no duplicate)", count === 3
    && state.every((row, i) => row.name === "none" && row.clone === "none" && row.offCentre <= 2 && Math.abs(later[i] - row.x) < 0.5),
    JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// The showcase: one pill springs between the tabs; the panels crossfade
// ---------------------------------------------------------------------------

const showcase = (page) => page.getByRole("tablist", { name: "Showcase", exact: true });

/**
 * The pill and the panels over `count` frames. With `click`, tab `to` is
 * clicked inside the page first, so the first sample is the first frame after
 * the click however slow the browser round trip is.
 */
async function tabFrames(page, from, to, count = 6, click = false) {
  return showcase(page).evaluate(async (tablist, [a, b, n, press]) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    if (press) {
      tabs[b].click();
      await new Promise(requestAnimationFrame);
    }
    const pill = tablist.querySelector(':scope > span[aria-hidden="true"]');
    const panel = (tab) => document.getElementById(tab.getAttribute("aria-controls"));
    const stage = panel(tabs[0]).parentElement;
    const samples = [];
    for (let i = 0; i < n; i++) {
      const box = pill.getBoundingClientRect();
      samples.push({
        x: box.x, y: box.y,
        selected: tabs[b].getAttribute("aria-selected"),
        pill: pill.getAnimations().filter((x) => x.playState === "running").map((x) => x.transitionProperty),
        arriving: { hidden: panel(tabs[b]).hidden, running: panel(tabs[b]).getAnimations().some((x) => x.playState === "running") },
        leaving: { hidden: panel(tabs[a]).hidden, running: panel(tabs[a]).getAnimations().some((x) => x.playState === "running") },
        stage: stage.getBoundingClientRect().height,
      });
      await new Promise(requestAnimationFrame);
    }
    return samples;
  }, [from, to, count, click]);
}

/** Where the pill is against tab `index`, and which panels are on stage. */
async function tabState(page, index) {
  return showcase(page).evaluate((tablist, i) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const pill = tablist.querySelector(':scope > span[aria-hidden="true"]').getBoundingClientRect();
    const tab = tabs[i].getBoundingClientRect();
    const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
    return {
      aligned: Math.abs(pill.x - tab.x) <= 2 && Math.abs(pill.y - tab.y) <= 2
        && Math.abs(pill.width - tab.width) <= 2 && Math.abs(pill.height - tab.height) <= 2,
      start: { x: pill.x, y: pill.y }, target: { x: tab.x, y: tab.y },
      shown: panels.map((panel, n) => (panel.hidden ? null : n)).filter((n) => n !== null),
      selected: tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"),
      panelMotion: panels.some((panel) => panel.getAnimations().some((x) => x.playState === "running")),
      stageMotion: panels[0].parentElement.getAnimations({ subtree: true }).filter((x) => x.playState === "running").length,
    };
  }, index);
}

const between = (value, a, b) => value > Math.min(a, b) + 1 && value < Math.max(a, b) - 1;

async function showcaseContracts(page, label, width) {
  const tabs = showcase(page).getByRole("tab");
  await bringToRest(page, showcase(page));
  await settle(page);
  const start = await tabState(page, 1);
  const stageBefore = (await tabFrames(page, 0, 1, 1))[0].stage;
  const samples = await tabFrames(page, 0, 1, 6, true);
  const moving = (sample) => between(sample.x, start.start.x, start.target.x) || between(sample.y, start.start.y, start.target.y);
  check(`${label}: the tab pill springs to the chosen tab by transform alone, and the tab is selected from the first frame`,
    samples.some((sample) => moving(sample) && sample.pill.length > 0)
    && samples.every((sample) => sample.selected === "true" && sample.pill.every((property) => property === "transform")),
    JSON.stringify({ start, samples }));
  check(`${label}: the panels crossfade (the old one leaves as the new one arrives) and the stage never changes height`,
    samples.some((sample) => !sample.leaving.hidden && sample.leaving.running && sample.arriving.running)
    && samples.every((sample) => !sample.arriving.hidden) && samples.every((sample) => Math.abs(sample.stage - stageBefore) < 0.5),
    JSON.stringify({ stageBefore, samples }));
  if (width === 1440) {
    // Tab 1 is CareLTC; its panel's front frame carries the sheen ([data-focus]).
    // The visible screen only: each of CareLTC's screens has a front frame.
    const sheen = await page.locator("#showcase-panel-careltc [data-focus]:visible").evaluate((card) => ({
      declared: getComputedStyle(card, "::after").animationName,
      running: card.getAnimations({ subtree: true }).filter((x) => x.playState === "running" && x.effect?.pseudoElement === "::after").length,
    }));
    check("showcase: a sheen sweeps the arriving card", sheen.running > 0, JSON.stringify(sheen));
  }
  await page.waitForTimeout(700);
  const settled = await tabState(page, 1);
  check(`${label}: the pill settles on the chosen tab and only its panel stays on stage`,
    settled.aligned && settled.selected === 1 && settled.shown.length === 1 && settled.shown[0] === 1 && !settled.panelMotion,
    JSON.stringify(settled));

  if (width === 1440) {
    await tabs.nth(2).click();
    await tabs.nth(3).click();
    await tabs.nth(0).click();
    await page.waitForTimeout(800);
    const rapid = await tabState(page, 0);
    check("showcase: after rapid selection the final tab owns the pill and the stage",
      rapid.aligned && rapid.selected === 0 && rapid.shown.length === 1 && rapid.shown[0] === 0 && !rapid.panelMotion,
      JSON.stringify(rapid));

    const from = await tabState(page, 1);
    await tabs.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    const keyed = await tabFrames(page, 0, 1);
    const focused = await tabs.nth(1).evaluate((tab) => tab === document.activeElement);
    check("showcase: an arrow key moves focus and selection, and the pill travels exactly as for a click",
      focused && keyed.every((sample) => sample.selected === "true")
      && keyed.some((sample) => (between(sample.x, from.start.x, from.target.x) || between(sample.y, from.start.y, from.target.y))
        && sample.pill.includes("transform")),
      JSON.stringify({ focused, keyed }));
    await page.waitForTimeout(700);
  }
}

async function reducedShowcase(page) {
  const tabs = showcase(page).getByRole("tab");
  await bringToRest(page, showcase(page));
  await tabs.nth(1).click();
  await frames(page, 4);
  const state = await tabState(page, 1);
  const pill = await showcase(page).locator(':scope > span[aria-hidden="true"]').evaluate((element) =>
    element.getAnimations().filter((x) => x.playState === "running").length);
  check("reduced: the tab pill jumps to the chosen tab and the panels switch at once (no crossfade, no sheen)",
    state.aligned && state.selected === 1 && state.shown.length === 1 && state.shown[0] === 1
    && state.stageMotion === 0 && pill === 0, JSON.stringify({ state, pill }));
}

// ---------------------------------------------------------------------------
// Menus: opacity and a spring, visible from the first frame of opening
// ---------------------------------------------------------------------------

/**
 * Start recording the transitions `panel` runs, with its visibility as each
 * one is created. Events are timed by the browser, so the record does not
 * depend on how quickly this script samples.
 */
const watch = (panel) => panel.evaluate((element) => {
  element.__transitions = [];
  if (element.__watched) return;
  element.__watched = true;
  for (const type of ["transitionrun", "transitionend"]) {
    element.addEventListener(type, (event) => {
      if (event.target !== element) return;
      element.__transitions.push({ type, property: event.propertyName, elapsed: event.elapsedTime,
        visibility: getComputedStyle(element).visibility, opacity: Number(getComputedStyle(element).opacity) });
    });
  }
});
const recorded = (panel) => panel.evaluate((element) => element.__transitions.splice(0));
const runs = (log, property) => log.filter((entry) => entry.type === "transitionrun" && entry.property === property);
const ran = (log, property, seconds) => log.some((entry) => entry.type === "transitionend" && entry.property === property && entry.elapsed >= seconds);
/** It faded and sprang in (not a jump), was visible as the fade began, and moved nothing but opacity and transform. */
const opened = (log) => runs(log, "opacity").some((entry) => entry.visibility === "visible")
  && ran(log, "opacity", 0.1) && ran(log, "transform", 0.1)
  && log.every((entry) => MENU_PROPERTIES.has(entry.property));
/** It faded out while still visible, and only then hid. */
const closing = (log) => runs(log, "opacity").some((entry) => entry.visibility === "visible") && ran(log, "opacity", 0.1);

async function settledMenu(panel) {
  const state = await appearance(panel);
  return { visibility: state.visibility, opacity: state.opacity, transform: state.transformText };
}

async function desktopMenuContracts(page) {
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  const work = nav.getByRole("button", { name: "Work", exact: true });
  const workPanel = page.locator("#nav-work");
  await watch(workPanel);
  await work.click();
  await page.waitForTimeout(400);
  const opening = await recorded(workPanel);
  const open = await settledMenu(workPanel);
  const chevron = await appearance(work.locator("svg"));
  check("desktop menu: opening fades and springs in, visible from its first frame, on opacity and transform only",
    opened(opening) && open.visibility === "visible" && open.opacity === 1 && open.transform === "none"
    && await work.getAttribute("aria-expanded") === "true" && Math.abs(chevron.scale + 1) < 0.01,
    JSON.stringify({ opening, open, chevron: chevron.transformText }));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  const about = nav.getByRole("button", { name: "About", exact: true });
  const aboutPanel = page.locator("#nav-about");
  await page.mouse.move(0, 0);
  await page.keyboard.press("Tab");
  await about.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  const entered = await aboutPanel.evaluate((panel) => panel.contains(document.activeElement)
    && document.activeElement.matches("a"));
  check("desktop menu: Tab from a trigger opened by keyboard moves straight into its panel", entered);
  await page.waitForTimeout(400); // fully open, so the close has a whole fade to show
  await watch(aboutPanel);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const fading = await recorded(aboutPanel);
  const closed = await settledMenu(aboutPanel);
  check("desktop menu: Escape fades the panel out, returns focus to its trigger, and then hides it",
    closing(fading) && closed.visibility === "hidden" && await about.getAttribute("aria-expanded") === "false"
    && await about.evaluate((element) => element === document.activeElement), JSON.stringify({ fading, closed }));

  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await watch(workPanel);
  await work.hover();
  await page.waitForTimeout(400);
  const hoverOpening = await recorded(workPanel);
  const hoverOpen = await settledMenu(workPanel);
  await page.mouse.move(8, 880);
  await page.waitForTimeout(700);
  const hoverClosed = await settledMenu(workPanel);
  check("desktop menu: a fine pointer opens it on hover with the same motion, and leaving closes it",
    opened(hoverOpening) && hoverOpen.opacity === 1 && hoverClosed.visibility === "hidden"
    && await work.getAttribute("aria-expanded") === "false", JSON.stringify({ hoverOpening, hoverOpen, hoverClosed }));
}

async function mobileMenuContracts(page) {
  const button = page.getByRole("button", { name: "Open menu", exact: true });
  // The panel's id changes while it is open (#site-mobile-nav → #mobile-menu); hold the node itself.
  const panel = await page.locator("#site-mobile-nav").elementHandle();
  await watch(panel);
  await button.click();
  await page.waitForTimeout(400);
  const opening = await recorded(panel);
  const open = await panel.evaluate((element) => ({ visibility: getComputedStyle(element).visibility,
    opacity: Number(getComputedStyle(element).opacity), transform: getComputedStyle(element).transform }));
  const toggle = page.getByRole("button", { name: "Close menu", exact: true });
  const lines = await toggle.evaluate((element) => Array.from(element.querySelectorAll("span"))
    .map((line) => new DOMMatrix(getComputedStyle(line).transform).a));
  check("mobile menu: the panel fades and springs in under the bar, visible from its first frame",
    opened(opening) && open.visibility === "visible" && open.opacity === 1 && open.transform === "none",
    JSON.stringify({ opening, open }));
  check("mobile menu: the button's two lines turn into an X", lines.length === 2 && lines.every((a) => Math.abs(a - Math.SQRT1_2) < 0.01),
    JSON.stringify(lines));
  await watch(panel);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const fading = await recorded(panel);
  const closed = await panel.evaluate((element) => getComputedStyle(element).visibility);
  check("mobile menu: Escape fades it out, then hides it, and returns focus to the button",
    closing(fading) && closed === "hidden" && await button.evaluate((element) => element === document.activeElement),
    JSON.stringify({ fading, closed }));
}

async function reducedMenus(page, mobile) {
  const trigger = mobile
    ? page.getByRole("button", { name: "Open menu", exact: true })
    : page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("button", { name: "Work", exact: true });
  const panel = await page.locator(mobile ? "#site-mobile-nav" : "#nav-work").elementHandle();
  const state = () => panel.evaluate((element) => ({ visibility: getComputedStyle(element).visibility,
    opacity: Number(getComputedStyle(element).opacity), transform: getComputedStyle(element).transform,
    running: element.getAnimations().filter((x) => x.playState === "running").length }));
  await trigger.click();
  await frames(page, 4);
  const open = await state();
  await page.keyboard.press("Escape");
  await frames(page, 4);
  const closed = await state();
  check(`reduced: the ${mobile ? "mobile" : "desktop"} menu opens and closes at once`,
    open.visibility === "visible" && open.opacity === 1 && open.transform === "none" && open.running === 0
    && closed.visibility === "hidden" && closed.running === 0, JSON.stringify({ open, closed }));
}

// ---------------------------------------------------------------------------
// Primary navigation: the current route, and feedback that never selects
// ---------------------------------------------------------------------------

async function navigationFeedback(page) {
  const list = page.getByRole("navigation", { name: "Primary", exact: true }).locator(":scope > ul");
  const current = () => list.locator(':scope > li > a[aria-current="page"]').count();
  const homeCurrent = await current();
  await list.getByRole("link", { name: "Evals", exact: true }).click();
  await page.waitForURL(`${BASE}/evals`);
  await page.waitForTimeout(300);
  const active = list.getByRole("link", { name: "Evals", exact: true });
  const target = list.getByRole("link", { name: "Writing", exact: true });
  const rest = await appearance(target);
  const activeStyle = await appearance(active);
  check("desktop nav: the active route alone carries the current state and its pill ground", homeCurrent === 0
    && await current() === 1 && await active.getAttribute("aria-current") === "page"
    && activeStyle.background !== rest.background, JSON.stringify({ activeStyle: activeStyle.background, rest: rest.background }));
  await target.hover();
  await page.waitForTimeout(300);
  const hover = await appearance(target);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await page.keyboard.press("Tab");
  await target.focus();
  await page.waitForTimeout(200);
  const focus = await appearance(target);
  check("desktop nav: hover gives a link the pill ground and keyboard focus its ring, without selecting it",
    hover.background !== rest.background && !focus.outline.startsWith("none") && !/ 0px$/.test(focus.outline)
    && await active.getAttribute("aria-current") === "page" && await target.getAttribute("aria-current") === null,
    JSON.stringify({ rest: rest.background, hover: hover.background, focus: focus.outline }));
  await target.press("Enter");
  await page.waitForURL(`${BASE}/writing`);
  await page.waitForTimeout(300);
  check("desktop nav: activating the focused link transfers the current-page state to its destination",
    await current() === 1 && await target.getAttribute("aria-current") === "page"
    && await active.getAttribute("aria-current") === null);
}

// ---------------------------------------------------------------------------
// The arrow-swap caret and the button press
// ---------------------------------------------------------------------------

async function caretFeedback(page, control, name) {
  await neutral(page, control);
  const caret = control.locator(".caret-swap");
  const label = control.locator(":scope > span:not(.caret-swap)").first();
  const labelled = await label.count() > 0;
  const textBefore = labelled ? await appearance(label) : null;
  const rest = await appearance(caret);
  await control.hover();
  const swapping = await running(caret);
  await page.waitForTimeout(500);
  const hovered = await appearance(caret);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(500);
  await control.focus();
  await page.waitForTimeout(500);
  const focused = await appearance(caret);
  const textAfter = labelled ? await appearance(label) : null;
  check(`${name}: the caret swaps on a spring for hover and for keyboard focus alike, and the label stays put`,
    rest.mask === CARET_REST && Math.abs(rest.opacity - 0.6) < 0.01
    && swapping.some((animation) => animation.name.includes("mask-position"))
    && hovered.mask === CARET_SWAPPED && hovered.opacity === 1 && focused.mask === CARET_SWAPPED && focused.opacity === 1
    && (!labelled || samePlace(textBefore, textAfter)),
    JSON.stringify({ rest: [rest.mask, rest.opacity], swapping, hovered: [hovered.mask, hovered.opacity], focused: [focused.mask, focused.opacity] }));
}

async function pressFeedback(page, button, reduced) {
  await neutral(page, button);
  const url = page.url();
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  if (reduced) await frames(page); else await page.waitForTimeout(400);
  const pressed = await appearance(button);
  // Release away from the control, so the press never becomes a click.
  await page.mouse.move(0, 0);
  await page.mouse.up();
  // A reduced-motion transition still exists for the frame that starts it (0.01ms), so look a few frames on.
  if (reduced) await frames(page, 4);
  const releasing = await running(button);
  await page.waitForTimeout(reduced ? 50 : 450);
  const released = await appearance(button);
  check(`${reduced ? "reduced" : "normal"}: a pressed button squashes to 0.97 and springs back${reduced ? " at once" : ""}`,
    Math.abs(pressed.scale - 0.97) < 0.002 && released.scale === 1 && page.url() === url
    && (reduced ? releasing.length === 0 : releasing.some((animation) => animation.name === "transform")),
    JSON.stringify({ pressed: pressed.scale, releasing, released: released.scale }));
}

async function reducedCaret(page, control) {
  await neutral(page, control);
  const caret = control.locator(".caret-swap");
  await control.hover();
  await frames(page, 4);
  const hovered = await appearance(caret);
  const motion = await running(caret);
  check("reduced: the caret swaps at once", hovered.mask === CARET_SWAPPED && hovered.opacity === 1 && motion.length === 0,
    JSON.stringify({ hovered: [hovered.mask, hovered.opacity], motion }));
  await page.mouse.move(0, 0);
}

// ---------------------------------------------------------------------------
// The copy-prompt chip
// ---------------------------------------------------------------------------

async function chipState(page) {
  return page.getByRole("button", { name: "Copy prompt", exact: true }).evaluate((button) => {
    const chip = button.parentElement;
    const [agents, preview] = chip.querySelectorAll(":scope > span");
    const [copyIcon, checkIcon] = button.querySelectorAll("svg");
    const opacity = (element) => Number(getComputedStyle(element).opacity);
    return {
      preview: opacity(preview),
      stack: Array.from(agents.children).map(opacity),
      label: opacity(button.querySelector("span")),
      copy: opacity(copyIcon),
      tick: opacity(checkIcon),
      shadow: getComputedStyle(chip).boxShadow,
      status: chip.parentElement.querySelector("[aria-live]").textContent.trim(),
      running: chip.getAnimations({ subtree: true }).filter((x) => x.playState === "running").length,
    };
  });
}
const chipAtRest = (s) => s.preview === 0 && s.stack.every((o) => o === 1) && s.label === 1 && s.copy === 0 && s.tick === 0;
const chipUnfolded = (s) => s.preview === 1 && s.stack[0] === 1 && s.stack[1] === 0 && s.stack[2] === 0
  && s.label === 0 && s.copy === 1 && s.tick === 0;

async function copyChipContracts(page) {
  const button = page.getByRole("button", { name: "Copy prompt", exact: true });
  await neutral(page, button);
  const rest = await chipState(page);
  await button.hover();
  const unfolding = await chipState(page);
  await page.waitForTimeout(700);
  const hovered = await chipState(page);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(700);
  const left = await chipState(page);
  await page.keyboard.press("Tab");
  await button.focus();
  await page.waitForTimeout(700);
  const focused = await chipState(page);
  check("copy chip: hover and keyboard focus unfold it alike (the stack folds, the prompt slides in, the label becomes the copy icon)",
    chipAtRest(rest) && unfolding.running > 0 && chipUnfolded(hovered) && hovered.shadow !== rest.shadow
    && chipAtRest(left) && chipUnfolded(focused) && focused.shadow === hovered.shadow,
    JSON.stringify({ rest, hovered, left, focused }));
  await button.press("Enter");
  await page.waitForTimeout(400);
  const copied = await chipState(page);
  const clipboard = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
  check("copy chip: a copy pops the tick and the live region says so; the name stays \"Copy prompt\"",
    copied.tick === 1 && copied.copy === 0 && copied.status !== rest.status && /^Read https?:\/\/\S+\/llms\.txt/.test(clipboard ?? "")
    && await page.getByRole("button", { name: "Copy prompt", exact: true }).count() === 1,
    JSON.stringify({ copied, clipboard: clipboard?.slice(0, 40) }));
  await button.evaluate((element) => element.blur());
  await page.waitForTimeout(2400);
  const reset = await chipState(page);
  check("copy chip: it returns to rest by itself, and the live region to its hint", chipAtRest(reset) && reset.status === rest.status,
    JSON.stringify(reset));

  // A visitor aims at the button and clicks where they aimed. The unfold
  // slides the button to the chip's end, so the whole chip is the copy target
  // (prompt-chip.tsx): whatever comes to rest under the pointer must belong to
  // it, show the pointer cursor, and copy.
  await neutral(page, button);
  const aim = await button.boundingBox();
  const x = aim.x + aim.width / 2;
  const y = aim.y + aim.height / 2;
  await page.mouse.move(x, y);
  await page.waitForTimeout(700);
  const under = await button.evaluate((control, [px, py]) => {
    const element = document.elementFromPoint(px, py);
    const chip = control.parentElement;
    const target = element === control || control.contains(element) ? "the button" : chip.contains(element) ? "the chip" : null;
    return {
      target: target ?? `${element?.tagName.toLowerCase()} (outside the chip)`,
      cursor: element ? getComputedStyle(element).cursor : "none",
    };
  }, [x, y]);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(300);
  const clicked = await chipState(page);
  check("copy chip: a click where the pointer came to rest on the button still copies (the unfold keeps a copy target under it)",
    ["the button", "the chip"].includes(under.target) && under.cursor === "pointer"
    && clicked.tick === 1 && clicked.status !== rest.status, JSON.stringify({ under, status: clicked.status }));
  await page.mouse.move(0, 0);
  await page.waitForTimeout(2400);
}

async function reducedCopyChip(page) {
  const button = page.getByRole("button", { name: "Copy prompt", exact: true });
  await neutral(page, button);
  await button.hover();
  // The unfold moves the button from under the pointer, which ends its own
  // hover a frame later; each change is instant, so a few frames settle it.
  await frames(page, 4);
  const hovered = await chipState(page);
  check("reduced: the copy chip unfolds at once", chipUnfolded(hovered) && hovered.running === 0, JSON.stringify(hovered));
  await page.mouse.move(0, 0);
}

// ---------------------------------------------------------------------------
// Cards: ground, shadow and art lean in; text never moves; illustrations react
// ---------------------------------------------------------------------------

const card = (page, title) => page.getByRole("article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });

async function cardFeedback(page, reduced) {
  const target = card(page, "DBWhisper");
  // By href: the link's name carries a visually hidden ": DBWhisper" suffix.
  const link = target.locator('a[href="/work/dbwhisper"]');
  const art = target.locator(':scope > [aria-hidden="true"] > *').first();
  const title = target.locator("h3");
  await neutral(page, link);
  const rest = await appearance(target);
  const textBefore = await appearance(title);
  await target.hover();
  if (reduced) await frames(page, 4);
  const motion = await running(art);
  await page.waitForTimeout(reduced ? 50 : 1200);
  const hovered = { card: await appearance(target), art: await appearance(art) };
  await page.mouse.move(0, 0);
  await page.waitForTimeout(reduced ? 50 : 1200);
  await link.focus();
  await page.waitForTimeout(reduced ? 50 : 1200);
  const focused = { card: await appearance(target), art: await appearance(art) };
  const textAfter = await appearance(title);
  const prefix = reduced ? "reduced" : "normal";
  check(`${prefix}: a card's hover and keyboard focus inside it give the same deeper shadow and art lean, and its text never moves`,
    hovered.card.shadow !== rest.shadow && focused.card.shadow === hovered.card.shadow
    && hovered.art.scale > 1.02 && hovered.art.scale < 1.03 && Math.abs(focused.art.scale - hovered.art.scale) < 0.001
    && samePlace(textBefore, textAfter) && await link.getAttribute("href") === "/work/dbwhisper"
    && await link.evaluate((element) => document.activeElement === element),
    JSON.stringify({ rest: rest.shadow, hovered: [hovered.card.shadow, hovered.art.scale], focused: [focused.card.shadow, focused.art.scale] }));
  check(`${prefix}: the art leans in ${reduced ? "at once" : "on a transition"}`,
    reduced ? motion.length === 0 : motion.some((animation) => animation.name === "transform"), JSON.stringify(motion));
}

/** The flagship plate's first card (Bench Discovery): its badge's halo breathes while the card is hovered or focused. */
async function illustrationFeedback(page) {
  const target = card(page, "Bench Discovery");
  const link = target.getByRole("link").first();
  const title = target.locator("h3");
  await neutral(page, link);
  const atRest = (await running(target, true)).filter((x) => x.iterations === Infinity);
  const textBefore = await appearance(title);
  const declared = async () => target.evaluate((element) => Array.from(element.querySelectorAll("*"))
    .flatMap((node) => ["::before", "::after"].map((pseudo) => getComputedStyle(node, pseudo).animationName))
    .filter((name) => name !== "none"));
  await target.hover();
  await page.waitForTimeout(200);
  const hovered = (await running(target, true)).filter((x) => x.iterations === Infinity);
  const hoverDeclared = await declared();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(200);
  await link.focus();
  await page.waitForTimeout(200);
  const focused = (await running(target, true)).filter((x) => x.iterations === Infinity);
  const textAfter = await appearance(title);
  check("flagship plate: an illustration plays its loop while its card is hovered or focused, and is still at rest",
    atRest.length === 0 && hovered.length > 0 && focused.length === hovered.length && samePlace(textBefore, textAfter),
    JSON.stringify({ atRest, hovered, focused, declaredOnHover: hoverDeclared }));
}

/** A home writing card: the title link covers the card, so the whole card is one target. */
async function writingFeedback(page) {
  const link = page.locator('section[aria-labelledby="writing-title"] li a').first();
  const item = link.locator("xpath=ancestor::li[1]");
  const summary = item.locator("p").first();
  await neutral(page, link);
  const rest = { link: await appearance(link), item: await appearance(item), text: await appearance(summary) };
  await link.hover();
  await page.waitForTimeout(450);
  const hovered = { link: await appearance(link), item: await appearance(item) };
  await page.mouse.move(0, 0);
  await page.waitForTimeout(450);
  await link.focus();
  await page.waitForTimeout(450);
  const focused = { link: await appearance(link), item: await appearance(item), text: await appearance(summary) };
  check("writing card: hover and keyboard focus give the same feedback (the deeper shadow and the accent title)",
    hovered.item.shadow !== rest.item.shadow && hovered.link.color !== rest.link.color
    && focused.item.shadow === hovered.item.shadow && focused.link.color === hovered.link.color,
    JSON.stringify({ rest: rest.link.color, hovered: hovered.link.color, focused: focused.link.color }));
  check("writing card: the title, summary and category stay fixed and the focused link stays usable",
    samePlace(rest.text, focused.text) && samePlace(rest.link, focused.link)
    && await link.evaluate((element) => document.activeElement === element && /^\/(writing|notes)\//.test(element.pathname)));
}

// ---------------------------------------------------------------------------
// The boundary inspector (/work/dbwhisper)
// ---------------------------------------------------------------------------

const root = (page) => page.locator("#boundary-inspector");
const choose = (page, name) => root(page).getByRole("group", { name: "Inspect a query boundary", exact: true }).getByText(name, { exact: true }).click();

async function position(page, value) {
  return root(page).evaluate((element, selected) => {
    const indicator = element.querySelector("[data-selection-indicator]");
    const label = element.querySelector(`input[value="${selected}"]`).closest("label");
    const a = indicator.getBoundingClientRect();
    const b = label.getBoundingClientRect();
    return { x: a.x, target: b.x, width: a.width, targetWidth: b.width };
  }, value);
}
const aligned = (box) => Math.abs(box.x - box.target) <= 2 && Math.abs(box.width - box.targetWidth) <= 2;

async function inspectorFrames(page) {
  return root(page).evaluate(async (element) => {
    const samples = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(requestAnimationFrame);
      const indicator = element.querySelector("[data-selection-indicator]");
      samples.push({
        x: indicator.getBoundingClientRect().x,
        selected: element.querySelector("input:checked").value,
        displayed: element.querySelector("[data-boundary-case]").getAttribute("data-boundary-case"),
        animations: indicator.getAnimations().map((animation) => ({
          state: animation.playState, progress: animation.effect.getComputedTiming().progress,
        })),
      });
    }
    return samples;
  });
}

async function inspectorContracts(page, label, width) {
  await bringToRest(page, root(page));
  const start = await position(page, "write");
  await choose(page, "Hidden write");
  const samples = await inspectorFrames(page);
  check(`${label}: the inspector's selection glides while the new decision is already active`,
    samples.some((sample) => sample.x > start.x + 1 && sample.x < start.target - 1 && sample.animations.some((animation) => animation.state === "running"))
    && samples.every((sample) => sample.selected === "write" && sample.displayed === "write"), JSON.stringify(samples));
  await page.waitForTimeout(650);
  const settled = await position(page, "write");
  check(`${label}: the inspector's indicator settles on the selected radio`, aligned(settled), JSON.stringify(settled));
  if (width !== 1440) return;

  await choose(page, "Read query");
  await choose(page, "No schema");
  await choose(page, "Hidden write");
  await page.waitForTimeout(650);
  check("inspector, rapid selection: the final choice owns the result and indicator", aligned(await position(page, "write"))
    && await root(page).locator('[data-boundary-case="write"]').count() === 1);
  await choose(page, "Read query");
  await page.waitForTimeout(650);
  const originalSql = await root(page).locator("pre code").elementHandle();
  await choose(page, "No schema");
  const changes = await root(page).evaluate((element) => ({
    rows: Array.from(element.querySelectorAll("li[data-changed]")).map((row) => ({
      text: row.textContent, animations: row.getAnimations({ subtree: true }).map((animation) => ({ state: animation.playState, pseudo: animation.effect.pseudoElement })),
    })),
    sqlChanged: element.querySelector("pre code").hasAttribute("data-changed"),
    sqlAnimations: element.querySelector("pre code").getAnimations().length,
  }));
  check("inspector, schema change: unchanged SQL retains its node and receives no animation", !changes.sqlChanged && changes.sqlAnimations === 0
    && await originalSql.evaluate((node) => node === document.querySelector("#boundary-inspector pre code")), JSON.stringify(changes));
  check("inspector, schema change: only the enrolled-schema check receives animated emphasis", changes.rows.length === 1
    && /Enrolled schema/.test(changes.rows[0].text) && changes.rows[0].animations.some((animation) => animation.state === "running"), JSON.stringify(changes));
}

// ---------------------------------------------------------------------------
// Ambient loops elsewhere, and their reduced-motion alternatives
// ---------------------------------------------------------------------------

const loopsOn = (page) => page.evaluate(() => document.getAnimations()
  .filter((animation) => animation.playState === "running")
  .map((animation) => animation.animationName ?? animation.transitionProperty ?? "script"));
/** The pulse rings, found by the animation they declare (they are aria-hidden spans with hashed classes). */
const ringState = (page) => page.evaluate(() => Array.from(document.querySelectorAll("main span"))
  .filter((element) => /(?:^|_)hero-ring$/.test(getComputedStyle(element).animationName))
  .map((element) => element.getClientRects().length > 0));

/** Running infinite animations in a locator's subtree, pseudo-elements included, by name. */
const loopsIn = (target) => target.evaluate((element) => element.getAnimations({ subtree: true })
  .filter((animation) => animation.playState === "running" && animation.effect?.getComputedTiming().iterations === Infinity)
  .map((animation) => `${animation.animationName ?? animation.transitionProperty ?? "script"}${animation.effect?.pseudoElement ?? ""}`));

/** With nothing hovered or focused, the loops that are not ambient (ADR-018 §5): there must be none. */
async function idleLoops(page) {
  await page.mouse.move(0, 0);
  await settle(page);
  const names = await loopsIn(page.locator(":root"));
  return names.filter((name) => !AMBIENT_LOOP.test(name.replace(/::.*$/, "")));
}

/**
 * Hover moments beyond the home page (ADR-018 §5): each loops only while its
 * card or frame is hovered, and stops when the pointer leaves. `area` is where
 * the loop runs when it is not inside the hovered element: a case study's
 * sticky frame is inert, so the steps are hovered and the frame beside them
 * plays.
 */
const HOVER_MOMENTS = [
  { name: "the flagship-card halo on /work", route: "/work", target: (page) => page.locator("#flagship article").first() },
  {
    name: "the flow wire in a case study's steps",
    route: "/work/tradepulse",
    target: (page) => page.locator("#how-it-works ol").first(),
    area: (page) => page.locator("#how-it-works"),
  },
  {
    name: "the pulse on a flagship's architecture sketch",
    route: "/work/bench-discovery",
    target: (page) => page.locator("#architecture figure").first(),
  },
];

async function hoverMoments(page, reduced) {
  const results = [];
  for (const moment of HOVER_MOMENTS) {
    await open(page, moment.route);
    const target = moment.target(page);
    const area = moment.area ? moment.area(page) : target;
    await page.mouse.move(0, 0);
    await bringToRest(page, target);
    await settle(page);
    const rest = await loopsIn(area);
    await target.hover();
    await page.waitForTimeout(250);
    const hovered = await loopsIn(area);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    const left = await loopsIn(area);
    results.push({ name: moment.name, rest, hovered, left });
  }
  const still = (result) => result.rest.length === 0 && result.left.length === 0;
  check(reduced
    ? "reduced: no hover moment loops, on /work, a case study or a flagship"
    : "hover moments loop only under the pointer: the /work flagship-card halo, a case study's flow wire, a flagship sketch's pulse",
  results.every((result) => still(result) && (reduced ? result.hovered.length === 0 : result.hovered.length > 0)),
  JSON.stringify(results));
}

/**
 * Every animation a loaded stylesheet names, against the @keyframes the page
 * defines. A `var()` is resolved against :root, where the shared keyframes are
 * named (`--kf-*`, globals.css): a module must reference a global keyframe that
 * way, because the CSS-module transform renames a bare name to a local one that
 * matches nothing. An unset `--kf-*` is reported as it is written.
 */
async function undefinedKeyframes(page) {
  return page.evaluate(() => {
    const KEYWORDS = new Set(["none", "infinite", "linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start",
      "step-end", "normal", "reverse", "alternate", "alternate-reverse", "forwards", "backwards", "both", "running",
      "paused", "initial", "inherit", "unset", "revert", "revert-layer", "auto"]);
    /** Split on `sep` outside parentheses. */
    const split = (text, sep) => {
      const parts = [];
      let depth = 0;
      let part = "";
      for (const char of text) {
        if (char === "(") depth++;
        if (char === ")") depth--;
        if (depth === 0 && (sep === " " ? /\s/.test(char) : char === sep)) { parts.push(part); part = ""; } else part += char;
      }
      parts.push(part);
      return parts.map((p) => p.trim()).filter(Boolean);
    };
    const rootStyle = getComputedStyle(document.documentElement);
    /** The names a value could be animating: its idents, with each var() resolved against :root. */
    const namesIn = (value, depth = 0) => split(value, " ").flatMap((token) => {
      const reference = /^var\(\s*(--[\w-]+)\s*(?:,(.*))?\)$/s.exec(token);
      if (reference) {
        const resolved = rootStyle.getPropertyValue(reference[1]).trim() || (reference[2] ?? "").trim();
        if (resolved && depth < 4) return namesIn(resolved, depth + 1);
        // Any other custom property may be set on the element itself (a duration, a delay).
        return reference[1].startsWith("--kf-") ? [token] : [];
      }
      return /^(?:-?[A-Za-z_][\w-]*|"[^"]*"|'[^']*')$/.test(token) && !KEYWORDS.has(token) ? [token] : [];
    });
    const defined = new Set();
    const used = new Map();
    const note = (name, selector) => { if (!used.has(name)) used.set(name, selector); };
    const visit = (rules) => {
      for (const rule of rules) {
        if (rule instanceof CSSKeyframesRule) defined.add(rule.name);
        if (rule.style) {
          const selector = rule.selectorText ?? "";
          for (const property of ["animation-name", "animation"]) {
            for (const layer of split(rule.style.getPropertyValue(property), ",")) {
              for (const name of namesIn(layer)) note(name, selector);
            }
          }
        }
        if (rule.cssRules) visit(rule.cssRules);
      }
    };
    for (const sheet of document.styleSheets) {
      try { visit(sheet.cssRules); } catch { /* a cross-origin sheet: none are expected */ }
    }
    return [...used].filter(([name]) => !defined.has(name.replace(/^["']|["']$/g, ""))).map(([name, selector]) => `${name} (${selector})`);
  });
}

try {
  for (const width of [390, 768, 1440]) {
    const label = `${width}px`;
    await withPage({ viewport: { width, height: 900 } }, async (page) => {
      await open(page, "/");
      await restContracts(page, label);
      await showcaseContracts(page, label, width);
      if (width === 1440) {
        await marqueeContracts(page);
        await desktopMenuContracts(page);
        await caretFeedback(page, page.getByRole("link", { name: "Get in touch", exact: true }), "button");
        await caretFeedback(page, page.locator("#public").getByRole("link", { name: "All case studies", exact: true }), "caret link");
        await pressFeedback(page, page.getByRole("link", { name: "Get in touch", exact: true }), false);
        await cardFeedback(page, false);
        await illustrationFeedback(page);
        await writingFeedback(page);
        await navigationFeedback(page);
      }
      if (width === 390) await mobileMenuContracts(page);
    });
    await withPage({ viewport: { width, height: 900 } }, async (page) => {
      await open(page, "/work/dbwhisper");
      await inspectorContracts(page, label, width);
    });
  }

  await withPage({ permissions: ["clipboard-read", "clipboard-write"] }, async (page) => {
    await open(page, "/");
    await copyChipContracts(page);
  });

  await withPage({}, async (page) => {
    const missing = [];
    const restless = [];
    for (const route of KEYFRAME_ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      for (const entry of await undefinedKeyframes(page)) if (!missing.includes(entry)) missing.push(entry);
      for (const name of await idleLoops(page)) restless.push(`${route}: ${name}`);
    }
    check("every animation a stylesheet names resolves to @keyframes the page defines", missing.length === 0,
      `${missing.length} unresolved: ${missing.join("; ")}`);
    check("on every route, only the ambient loops run at rest (a hover moment never loops unhovered)", restless.length === 0,
      restless.join("; "));
    await hoverMoments(page, false);

    await open(page, "/hire");
    const hire = await loopsOn(page);
    const rings = await ringState(page);
    await open(page, "/about");
    const about = await loopsOn(page);
    check("ambient loops run at rest: the pulse rings and the float on /hire, the float on /about",
      rings.length === 3 && rings.every(Boolean) && hire.filter((name) => /(?:^|_)hero-ring$/.test(name)).length === 3
      && hire.some((name) => /(?:^|_)float$/.test(name)) && about.some((name) => /(?:^|_)float$/.test(name)),
      JSON.stringify({ hire, rings, about }));
  });

  await withPage({ reducedMotion: "reduce" }, async (page) => {
    await open(page, "/");
    await settle(page, 500);
    const homeLoops = await loopsOn(page);
    check("reduced: nothing loops on the home page", homeLoops.length === 0, JSON.stringify(homeLoops));
    await reducedMarquee(page);
    await reducedShowcase(page);
    await reducedMenus(page, false);
    await reducedCaret(page, page.getByRole("link", { name: "Get in touch", exact: true }));
    await pressFeedback(page, page.getByRole("link", { name: "Get in touch", exact: true }), true);
    await reducedCopyChip(page);
    await cardFeedback(page, true);
    await open(page, "/work/dbwhisper");
    await bringToRest(page, root(page));
    await choose(page, "No schema");
    await page.waitForTimeout(80);
    const inspectorMotion = await root(page).evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length);
    check("reduced: the inspector's selection jumps to the correct state without running animations", inspectorMotion === 0
      && aligned(await position(page, "schema")) && await root(page).locator('[data-boundary-case="schema"]').count() === 1);
    await open(page, "/hire");
    const hire = await loopsOn(page);
    const rings = await ringState(page);
    await open(page, "/about");
    const about = await loopsOn(page);
    check("reduced: the pulse rings disappear and every loop stops on /hire and /about",
      rings.length === 3 && rings.every((shown) => !shown) && hire.length === 0 && about.length === 0,
      JSON.stringify({ hire, rings, about }));
    await hoverMoments(page, true);
  });

  await withPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" }, async (page) => {
    await open(page, "/");
    await reducedMenus(page, true);
  });

  await withPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, async (page) => {
    await open(page, "/");
    // The caret rests at 0.6 opacity by design and brightens on hover; it only
    // has to be there. Everything else in a card must be fully shown.
    const hiddenUntilHover = await page.locator("main article").evaluateAll((cards) => cards.flatMap((item) =>
      Array.from(item.querySelectorAll("h3, p, a, .caret-swap")).filter((element) => {
        if (element.closest(".sr-only")) return false;
        if (element.getClientRects().length === 0) return true;
        for (let node = element; node && node !== item.parentElement; node = node.parentElement) {
          const style = getComputedStyle(node);
          const floor = node === element && node.matches(".caret-swap") ? 0.5 : 0.99;
          if (style.visibility !== "visible" || Number(style.opacity) < floor) return true;
        }
        return false;
      }).map((element) => `${item.querySelector("h3")?.textContent.trim()}: ${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim().slice(0, 30)}"`)));
    const cards = { flagship: await page.locator("#flagship article").count(), public: await page.locator("#public article").count() };
    check("touch: every card's title, copy and destinations are visible before any interaction",
      cards.flagship > 0 && cards.public > 0 && hiddenUntilHover.length === 0, JSON.stringify({ cards, hiddenUntilHover }));
  });
  check("motion interactions make no API requests and raise no browser errors", apiRequests.length === 0 && errors.length === 0,
    JSON.stringify({ apiRequests, errors }));
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.pass);
console.log(`\n${results.length - failed.length}/${results.length} motion contracts hold.`);
if (failed.length) process.exitCode = 1;
