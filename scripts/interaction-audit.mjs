// Interaction contracts for the enhancement pass.
//
// scripts/a11y.mjs proves the DOM is accessible and scripts/screenshot.mjs
// proves nothing overflows. Neither can tell you that the product specimen
// still advances, that a reveal actually revealed, or that reduced motion
// yields a useful static state rather than a blank one. This does.
//
//   BASE_URL=http://localhost:3200 node scripts/interaction-audit.mjs
//
// Exit 1 on any failed contract.

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";
const results = [];

const browser = await chromium.launch();

/** Record one contract. */
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail && !pass ? ` — ${detail}` : ""}`);
}

async function withPage(opts, fn) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...opts,
  });
  const page = await ctx.newPage();
  try {
    await fn(page);
  } finally {
    await ctx.close();
  }
}

// ---------------------------------------------------------------- reveals
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  // Nothing above the fold may ever be armed — that is the rule the whole
  // reveal design rests on.
  const armedAboveFold = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-reveal]")).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && !el.hasAttribute("data-inview");
    }).length,
  );
  check("reveal: nothing above the fold is hidden", armedAboveFold === 0, `${armedAboveFold} armed`);

  // After scrolling the page the way a reader does, everything is visible.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page.waitForTimeout(900);
  const stillHidden = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll("[data-reveal]")).filter(
        (el) => Number.parseFloat(getComputedStyle(el).opacity) < 0.99,
      ).length,
  );
  check("reveal: every section is visible after a read-through", stillHidden === 0, `${stillHidden} faded`);
});

// The safety valve must unhide even if the observer never fires.
await withPage({}, async (page) => {
  await page.addInitScript(() => {
    // Neuter the observer entirely: arming still happens, revealing must not
    // depend on it.
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  const hidden = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll("[data-reveal]")).filter(
        (el) => Number.parseFloat(getComputedStyle(el).opacity) < 0.99,
      ).length,
  );
  check("reveal: content survives a dead IntersectionObserver", hidden === 0, `${hidden} stuck hidden`);
});

// ------------------------------------------------------- product specimen
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const rail = page.getByRole("button", { name: /^Retrieve$/ });
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // The run starts on arrival and advances on its own.
  const first = await page
    .locator('[aria-expanded="true"]')
    .first()
    .textContent();
  await page.waitForTimeout(3400);
  const second = await page
    .locator('[aria-expanded="true"]')
    .first()
    .textContent();
  check("specimen: the run advances once the section is reached", first !== second, `${first} -> ${second}`);

  // A manual selection takes over from the run.
  await page.getByRole("button", { name: /^Validate$/ }).click();
  await page.waitForTimeout(3400);
  const held = await page.locator('[aria-expanded="true"]').first().textContent();
  check("specimen: selecting a stage stops the run", (held ?? "").includes("Validate"), held ?? "");

  // Keyboard reaches every stage.
  await page.getByRole("button", { name: /^Retrieve$/ }).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(250);
  const viaKeyboard = await page.locator('[aria-expanded="true"]').first().textContent();
  check("specimen: stages are keyboard-operable", (viaKeyboard ?? "").includes("Retrieve"), viaKeyboard ?? "");

  // The transport pauses.
  const transport = page.getByRole("button", { name: /Play the run|Pause|Replay the run/ });
  check("specimen: a transport control exists", (await transport.count()) > 0);
});

// ------------------------------------------------------- reduced motion
await withPage({ reducedMotion: "reduce" }, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const hidden = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll("[data-reveal], .reveal")).filter(
        (el) => Number.parseFloat(getComputedStyle(el).opacity) < 0.99,
      ).length,
  );
  check("reduced motion: nothing is hidden", hidden === 0, `${hidden} faded`);

  const armed = await page.locator("[data-reveal]").count();
  check("reduced motion: the reveal never arms", armed === 0, `${armed} armed`);

  // The specimen must still be usable, just not self-advancing.
  await page.getByRole("button", { name: /^Execute$/ }).click();
  await page.waitForTimeout(200);
  const stage = await page.locator('[aria-expanded="true"]').first().textContent();
  check("reduced motion: stages still selectable", (stage ?? "").includes("Execute"), stage ?? "");

  const transport = await page.getByRole("button", { name: /Play the run|Pause/ }).count();
  check("reduced motion: no inert transport is rendered", transport === 0, `${transport} controls`);
});

// ------------------------------------------------------- eval disclosure
await withPage({}, async (page) => {
  await page.goto(`${BASE}/evals`, { waitUntil: "networkidle" });
  const details = page.locator("details").first();
  check("evals: methodology is a native disclosure", (await page.locator("details").count()) > 0);

  // textContent returns collapsed content too, so VISIBILITY is the only
  // honest measure of a disclosure.
  const body = details.locator("p").last();
  const hiddenWhenClosed = !(await body.isVisible());
  await details.locator("summary").click();
  await page.waitForTimeout(200);
  const shownWhenOpen = await body.isVisible();
  check("evals: expanding reveals the full method", hiddenWhenClosed && shownWhenOpen,
    `closed-hidden=${hiddenWhenClosed} open-shown=${shownWhenOpen}`);

  // A closed row must still state what was measured — the method is collapsed,
  // never withheld.
  const summaryText = await details.locator("summary").textContent();
  check("evals: a closed row still carries its finding", (summaryText ?? "").trim().length > 40);
});

// ------------------------------------------------------- header + menu
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const before = await page.locator("header > div").first().getAttribute("data-scrolled");
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(400);
  const after = await page.locator("header > div").first().getAttribute("data-scrolled");
  check("header: state changes after scrolling", before === null && after !== null);
});

await withPage({ viewport: { width: 390, height: 844 } }, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(300);
  check("mobile menu: opens", await page.getByRole("dialog", { name: "Menu" }).isVisible());
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  check("mobile menu: Escape closes it", (await page.getByRole("dialog", { name: "Menu" }).count()) === 0);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  check("mobile menu: focus returns to the trigger", focused === "Open menu", focused ?? "none");
});

// --------------------------------------------------- modal inert boundary
// A dialog that only traps Tab still leaves the page behind it in the
// accessibility tree and in the audit's contrast sample. `inert` is what makes
// the scrim a real boundary; these contracts prove it is applied AND released.
for (const modal of [
  {
    name: "assistant",
    open: async (page) => {
      await page.getByRole("button", { name: /Ask this site/ }).first().click();
      await page.waitForTimeout(600);
    },
    launcher: /Ask this site/,
  },
  {
    name: "mobile menu",
    viewport: { width: 390, height: 844 },
    open: async (page) => {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.waitForTimeout(400);
    },
    launcher: /Open menu/,
  },
]) {
  await withPage(modal.viewport ? { viewport: modal.viewport } : {}, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await modal.open(page);

    const inert = await page.evaluate(() =>
      ["header", "main", "footer"]
        .flatMap((sel) => Array.from(document.querySelectorAll(`body > ${sel}`)))
        .map((el) => el.inert === true || el.getAttribute("aria-hidden") === "true"),
    );
    check(
      `${modal.name}: the page behind it is inert`,
      inert.length > 0 && inert.every(Boolean),
      JSON.stringify(inert),
    );

    // The dialog itself must NOT be caught by its own boundary.
    const dialogReachable = await page
      .getByRole("dialog")
      .first()
      .evaluate((el) => !el.closest("[inert]"));
    check(`${modal.name}: the dialog itself stays reachable`, dialogReachable);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);

    const released = await page.evaluate(() =>
      ["header", "main", "footer"]
        .flatMap((sel) => Array.from(document.querySelectorAll(`body > ${sel}`)))
        .every((el) => el.inert !== true && el.getAttribute("aria-hidden") !== "true"),
    );
    check(`${modal.name}: closing releases the boundary`, released);

    // The regression the boundary can cause: focus restored INTO an element
    // that is still inert is silently dropped on <body>.
    const focused = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.tagName,
    );
    check(
      `${modal.name}: focus returns to a live launcher`,
      modal.launcher.test(focused ?? ""),
      focused ?? "none",
    );
  });
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} interaction contracts hold.`);
if (failed.length > 0) {
  console.error(`\nFAILED:\n${failed.map((f) => `  - ${f.name}: ${f.detail}`).join("\n")}`);
  process.exitCode = 1;
}
