// Measure motion while it happens, then verify that interaction, readable
// content, and reduced-motion alternatives survive. No snapshot-only checks.
// BASE_URL=http://127.0.0.1:3200 node scripts/motion-audit.mjs
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3200").replace(/\/$/, "");
const results = [];
const apiRequests = [];
const errors = [];
const browser = await chromium.launch();
const root = (page) => page.locator("#boundary-inspector");
const choose = (page, name) => root(page).getByRole("group", { name: "Inspect a query boundary", exact: true }).getByText(name, { exact: true }).click();
const capture = (page) => page.getByRole("link", { name: "View case study: TradePulse", exact: true });

function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail && !pass ? ` — ${detail}` : ""}`);
}

async function withPage(options, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(/\/api(?:\/|\?|$)/, async (route) => {
    apiRequests.push(route.request().url());
    await route.abort();
  });
  await page.addInitScript(() => {
    window.__arrivalMotion = [];
    document.addEventListener("animationstart", (event) => {
      if (event.target instanceof Element && event.target.closest('section[aria-labelledby="home-title"]')) {
        window.__arrivalMotion.push({ name: event.animationName, opacity: getComputedStyle(event.target).opacity });
      }
    });
  });
  try { await run(page); } finally { await context.close(); }
}

async function open(page, theme) {
  await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  if (await page.locator("html").getAttribute("data-theme") !== theme) throw new Error(`Theme did not apply: ${theme}`);
}

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

async function frames(page) {
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

async function appearance(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const transform = style.transform === "none" ? new DOMMatrix() : new DOMMatrix(style.transform);
    const box = element.getBoundingClientRect();
    return { scale: transform.a, x: transform.e, y: transform.f, border: style.borderColor,
      opacity: Number(style.opacity), background: style.backgroundColor, color: style.color,
      translate: style.translate, top: box.top, left: box.left, width: box.width, height: box.height };
  });
}

async function captureFeedback(page, reduced) {
  const link = capture(page);
  await link.scrollIntoViewIfNeeded();
  await link.locator("img").evaluate((image) => image.decode());
  await page.keyboard.press("Tab"); // establish keyboard modality before measuring
  await link.focus();
  await link.evaluate((element) => element.blur());
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await bringToRest(page, link);
  const card = page.getByRole("article", { name: "TradePulse", exact: true });
  const text = card.locator("h3");
  const baseline = await appearance(link);
  const textBefore = await appearance(text);
  await link.hover();
  const hoverAnimations = await link.locator("img").evaluate((image) => image.getAnimations().map((animation) => animation.playState));
  await page.waitForTimeout(400);
  const hovered = await appearance(link.locator("img"));
  const hoverBorder = (await appearance(link)).border;
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await link.focus();
  await page.waitForTimeout(400);
  const focused = await appearance(link.locator("img"));
  const focusBorder = (await appearance(link)).border;
  const textAfter = await appearance(text);
  check(`${reduced ? "reduced" : "normal"}: capture hover and keyboard focus give equivalent feedback`,
    Math.abs(hovered.scale - focused.scale) < 0.001 && hoverBorder === focusBorder && hoverBorder !== baseline.border);
  check(`${reduced ? "reduced" : "normal"}: capture motion respects the preference and leaves row text fixed`,
    (reduced ? hovered.scale === 1 && focused.scale === 1 : hovered.scale > 1.02 && hovered.scale < 1.03 && hoverAnimations.includes("running"))
    && Math.abs(textBefore.top - textAfter.top) < 1 && Math.abs(textBefore.left - textAfter.left) < 1);
  check(`${reduced ? "reduced" : "normal"}: caption and destination remain visible and usable`,
    await card.locator("figcaption").isVisible() && await link.locator('span[aria-hidden="true"]').isVisible()
    && await link.getAttribute("href") === "/work/tradepulse"
    && await link.evaluate((element) => document.activeElement === element));
}

async function sharedControlFeedback(page) {
  const button = page.getByRole("link", { name: "Explore my work", exact: true });
  await button.scrollIntoViewIfNeeded();
  await page.keyboard.press("Tab");
  await button.focus();
  await button.evaluate((element) => element.blur());
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await bringToRest(page, button);
  const sample = () => button.evaluate(async (element) => {
    const samples = [];
    for (let frame = 0; frame < 4; frame++) {
      await new Promise(requestAnimationFrame);
      const sheen = getComputedStyle(element, "::after").transform;
      const arrow = getComputedStyle(element.querySelector("svg")).transform;
      samples.push({
        sheenX: sheen === "none" ? 0 : new DOMMatrix(sheen).e,
        arrowY: arrow === "none" ? 0 : new DOMMatrix(arrow).f,
        finiteRunning: element.getAnimations({ subtree: true }).some((animation) =>
          animation.playState === "running" && animation.effect.getTiming().iterations === 1),
      });
    }
    return samples;
  });
  await button.hover();
  const hoverSamples = await sample();
  await page.waitForTimeout(400);
  const hoverArrow = await appearance(button.locator("svg"));
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await button.focus();
  const focusSamples = await sample();
  await page.waitForTimeout(400);
  const focusArrow = await appearance(button.locator("svg"));
  check("shared button: hover and keyboard focus each animate one forward sheen", [hoverSamples, focusSamples].every((samples) =>
    samples.at(-1).sheenX > samples[0].sheenX && samples.some((entry) => entry.finiteRunning)), JSON.stringify({ hoverSamples, focusSamples }));
  check("shared button: directional arrow feedback agrees for hover and focus and then settles",
    hoverArrow.y > 0 && Math.abs(hoverArrow.x) < 0.01 && Math.abs(hoverArrow.y - focusArrow.y) < 0.01
    && await button.evaluate((element) => element.getAnimations({ subtree: true }).every((animation) => animation.playState !== "running"))
    && await button.getAttribute("href") === "#selected-work",
    JSON.stringify({ hoverArrow: { x: hoverArrow.x, y: hoverArrow.y }, focusArrow: { x: focusArrow.x, y: focusArrow.y } }));
}

async function writingFeedback(page) {
  const link = page.locator('section[aria-labelledby="writing-title"] a[href^="/writing/"]').first();
  await link.scrollIntoViewIfNeeded();
  await page.keyboard.press("Tab");
  await link.focus();
  await link.evaluate((element) => element.blur());
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await bringToRest(page, link);
  const text = link.locator(":scope > span");
  const before = await appearance(text);
  const arrowBefore = await appearance(link.locator("svg"));
  await link.hover();
  const animated = await link.locator("svg").evaluate((element) => element.getAnimations().some((animation) => animation.playState === "running"));
  await page.waitForTimeout(400);
  const hoverArrow = await appearance(link.locator("svg"));
  const hoverText = await appearance(text);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await link.focus();
  await page.waitForTimeout(400);
  const focusArrow = await appearance(link.locator("svg"));
  const focusText = await appearance(text);
  check("writing row: the arrow animates toward its destination with equivalent hover and focus feedback", animated
    && hoverArrow.x > 0 && hoverArrow.y < 0 && hoverArrow.color !== arrowBefore.color
    && Math.abs(hoverArrow.x - focusArrow.x) < 0.01 && Math.abs(hoverArrow.y - focusArrow.y) < 0.01
    && hoverArrow.color === focusArrow.color,
    JSON.stringify({ animated, hoverArrow: { x: hoverArrow.x, y: hoverArrow.y }, focusArrow: { x: focusArrow.x, y: focusArrow.y } }));
  check("writing row: title, summary, and metadata stay fixed and the focused link remains usable",
    [hoverText, focusText].every((state) => Math.abs(state.top - before.top) < 1 && Math.abs(state.left - before.left) < 1
      && Math.abs(state.width - before.width) < 1 && Math.abs(state.height - before.height) < 1)
    && await link.evaluate((element) => document.activeElement === element && element.pathname.startsWith("/writing/")));
}

async function navigationFeedback(page) {
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  const homeCurrent = await nav.locator('[aria-current="page"]').count();
  await nav.getByRole("link", { name: "Work", exact: true }).click();
  await page.waitForURL(`${BASE}/work`);
  await page.waitForTimeout(300);
  const active = nav.getByRole("link", { name: "Work", exact: true });
  const activeRule = await appearance(active.locator('span[aria-hidden="true"]'));
  check("desktop nav: the active route alone retains its selected rule", homeCurrent === 0
    && await nav.locator('[aria-current="page"]').count() === 1 && await active.getAttribute("aria-current") === "page"
    && activeRule.opacity === 1 && activeRule.scale === 1);
  const target = nav.getByRole("link", { name: "Writing", exact: true });
  await target.hover();
  const indicator = target.locator('span[aria-hidden="true"]');
  const animated = await indicator.evaluate((element) => element.getAnimations().some((animation) => animation.playState === "running"));
  await page.waitForTimeout(300);
  const hover = await appearance(indicator);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await page.keyboard.press("Tab");
  await target.focus();
  await page.waitForTimeout(300);
  const focus = await appearance(indicator);
  check("desktop nav: hover and keyboard focus reveal the same neutral rule without selecting a different route", animated
    && hover.opacity === 1 && focus.opacity === 1 && hover.scale === 1 && focus.scale === 1
    && hover.background === focus.background && hover.background !== activeRule.background
    && await active.getAttribute("aria-current") === "page" && await target.getAttribute("aria-current") === null);
  await target.press("Enter");
  await page.waitForURL(`${BASE}/writing`);
  check("desktop nav: activating the focused link transfers the current-page state to its destination",
    await nav.locator('[aria-current="page"]').count() === 1 && await target.getAttribute("aria-current") === "page"
    && await active.getAttribute("aria-current") === null);
}

try {
  for (const theme of ["light", "dark"]) {
    for (const width of [390, 768, 1440]) {
      await withPage({ viewport: { width, height: 900 } }, async (page) => {
        await open(page, theme);
        const label = `${theme} ${width}px`;
        const idle = await page.evaluate(() => {
          const main = document.querySelector("main");
          const hidden = Array.from(main.querySelectorAll("h1,h2,h3,p,pre,figcaption"))
            .filter((element) => !element.closest(".sr-only"))
            .filter((element) => {
              for (let node = element; node; node = node.parentElement) {
                const style = getComputedStyle(node);
                if (Number(style.opacity) < 0.99 || style.visibility === "hidden" || style.display === "none") return true;
              }
              return false;
            }).length;
          return { arrivals: window.__arrivalMotion, hidden,
            running: main.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
        });
        check(`${label}: arrival is finite, content stays readable, and the idle page fits`,
          idle.arrivals.length >= 2 && idle.arrivals.every((entry) => Number(entry.opacity) === 1)
          && idle.hidden === 0 && idle.running === 0 && idle.overflow <= 1, JSON.stringify(idle));
        const start = await position(page, "write");
        await choose(page, "Hidden write");
        const samples = await frames(page);
        check(`${label}: the selection glides while the new decision is already active`,
          samples.some((sample) => sample.x > start.x + 1 && sample.x < start.target - 1 && sample.animations.some((animation) => animation.state === "running"))
          && samples.every((sample) => sample.selected === "write" && sample.displayed === "write"), JSON.stringify(samples));
        await page.waitForTimeout(650);
        const settled = await position(page, "write");
        check(`${label}: the indicator settles on the selected radio`, aligned(settled), JSON.stringify(settled));

        if (theme === "light" && width === 1440) {
          await choose(page, "Read query");
          await choose(page, "No schema");
          await choose(page, "Hidden write");
          await page.waitForTimeout(650);
          check("rapid selection: the final choice owns the result and indicator", aligned(await position(page, "write"))
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
          check("schema change: unchanged SQL retains its node and receives no animation", !changes.sqlChanged && changes.sqlAnimations === 0
            && await originalSql.evaluate((node) => node === document.querySelector("#boundary-inspector pre code")), JSON.stringify(changes));
          check("schema change: only the enrolled-schema check receives animated emphasis", changes.rows.length === 1
            && /Enrolled schema/.test(changes.rows[0].text) && changes.rows[0].animations.some((animation) => animation.state === "running"), JSON.stringify(changes));
          await page.waitForTimeout(650);
          await captureFeedback(page, false);
          await sharedControlFeedback(page);
          await writingFeedback(page);
          await navigationFeedback(page);
        }
      });
    }
  }

  for (const theme of ["light", "dark"]) {
    await withPage({ reducedMotion: "reduce" }, async (page) => {
      await open(page, theme);
      await choose(page, "No schema");
      await page.waitForTimeout(80);
      const running = await root(page).evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length);
      check(`${theme} reduced: selection jumps to the correct state without running animations`, running === 0
        && aligned(await position(page, "schema")) && await root(page).locator('[data-boundary-case="schema"]').count() === 1);
      await captureFeedback(page, true);
      const button = page.getByRole("link", { name: "Explore my work", exact: true });
      await button.hover();
      await page.waitForTimeout(80);
      const arrow = await appearance(button.locator("svg"));
      await page.mouse.move(0, 0);
      await page.keyboard.press("Tab");
      await button.focus();
      await page.waitForTimeout(80);
      const focusedArrow = await appearance(button.locator("svg"));
      check(`${theme} reduced: button arrows remain stationary on hover and keyboard focus`,
        arrow.scale === 1 && arrow.x === 0 && arrow.y === 0 && focusedArrow.scale === 1 && focusedArrow.x === 0 && focusedArrow.y === 0);
    });
  }

  await withPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, async (page) => {
    await open(page, "light");
    const captures = page.locator("#selected-work figure");
    const visibility = await captures.evaluateAll((figures) => figures.map((figure) =>
      Array.from(figure.querySelectorAll('figcaption,a > span[aria-hidden="true"]')).every((element) => {
        const style = getComputedStyle(element);
        return element.getClientRects().length > 0 && Number(style.opacity) === 1 && style.visibility === "visible";
      })));
    check("touch: every project caption and capture destination is visible before interaction", visibility.length === 3 && visibility.every(Boolean));
  });
  check("motion interactions make no API requests and raise no browser errors", apiRequests.length === 0 && errors.length === 0,
    JSON.stringify({ apiRequests, errors }));
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.pass);
console.log(`\n${results.length - failed.length}/${results.length} motion contracts hold.`);
if (failed.length) process.exitCode = 1;
