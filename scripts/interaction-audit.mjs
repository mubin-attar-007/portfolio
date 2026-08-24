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

// ------------------------------------- specimen: the release-brief contracts
// The contracts above cover selection and keyboard. These cover the run's
// lifecycle plus the two properties that are invisible in a screenshot: what
// assistive technology hears, and whether the panel moves the page.

const activeStage = (page) =>
  page.locator('[aria-expanded="true"]').first().textContent();

await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Retrieve$/ }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Pause preserves the active stage.
  await page.waitForTimeout(3200); // let it advance off stage 1
  const beforePause = await activeStage(page);
  await page.getByRole("button", { name: /^Pause$/ }).click();
  await page.waitForTimeout(3600); // longer than one dwell
  const afterPause = await activeStage(page);
  check(
    "specimen: pause holds the active stage",
    beforePause === afterPause,
    `${beforePause} -> ${afterPause}`,
  );

  // Play resumes from where it stopped rather than restarting.
  await page.getByRole("button", { name: /^Play the run$/ }).click();
  await page.waitForTimeout(3400);
  const afterResume = await activeStage(page);
  check(
    "specimen: resuming continues rather than restarting",
    afterResume !== afterPause && !(afterResume ?? "").includes("Retrieve"),
    `${afterPause} -> ${afterResume}`,
  );
});

// Replay restarts the run, not merely the stage.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const lastStage = page.getByRole("button", { name: /^Evaluate$/ });
  await lastStage.scrollIntoViewIfNeeded();
  await lastStage.click(); // jump to the end, which also stops the run
  await page.waitForTimeout(300);

  const replay = page.getByRole("button", { name: /Replay the run/ });
  check("specimen: the transport becomes Replay at the last stage", (await replay.count()) === 1);

  await replay.click();
  await page.waitForTimeout(300);
  const restarted = await activeStage(page);
  check("specimen: replay returns to stage 1", (restarted ?? "").includes("Retrieve"), restarted ?? "");

  await page.waitForTimeout(3400);
  const advancing = await activeStage(page);
  check(
    "specimen: replay restarts the RUN, not just the stage",
    !(advancing ?? "").includes("Retrieve"),
    advancing ?? "",
  );
});

// A backgrounded tab stops stepping. Playwright cannot truly background a page,
// so drive the exact signal the component listens for.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Retrieve$/ }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const atHide = await activeStage(page);
  await page.waitForTimeout(3600);
  const later = await activeStage(page);
  check("specimen: a hidden tab stops the run", atHide === later, `${atHide} -> ${later}`);
});

// Keyboard focus reaching the rail stops the run, so aria-expanded cannot flip
// underneath the control the visitor is focused on.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Retrieve$/ }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /^Generate$/ }).focus(); // focus WITHOUT activating
  const atFocus = await activeStage(page);
  await page.waitForTimeout(3600);
  const later = await activeStage(page);
  check("specimen: focus on the rail stops the run", atFocus === later, `${atFocus} -> ${later}`);
});

// THE ANNOUNCEMENT CONTRACT. An auto-advancing panel must not narrate itself to
// a screen reader; a visitor-driven change must.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Retrieve$/ }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const liveRegions = await page.evaluate(() => {
    const section = document.querySelector("#walkthrough-title")?.closest("section");
    if (!section) return ["NO SECTION FOUND"];
    return Array.from(
      section.querySelectorAll('[aria-live], [role="status"], [role="alert"]'),
    ).map((el) => `${el.tagName.toLowerCase()}|${el.textContent?.length ?? 0}chars`);
  });
  check(
    "specimen: exactly one live region in the section",
    liveRegions.length === 1,
    JSON.stringify(liveRegions),
  );

  // A live region wrapping the whole panel IS the defect; size is the tell.
  const chars = Number((liveRegions[0] ?? "").match(/\|(\d+)chars/)?.[1] ?? 99999);
  check(
    "specimen: the live region is a one-line status, not the panel",
    chars < 120,
    liveRegions[0] ?? "none",
  );

  // The automatic run leaves it empty — nothing the visitor did not ask for.
  const during = await page.locator('[role="status"]').first().textContent();
  await page.waitForTimeout(3400);
  const after = await page.locator('[role="status"]').first().textContent();
  check(
    "specimen: automatic advancement announces NOTHING",
    (during ?? "").trim() === "" && (after ?? "").trim() === "",
    `"${during}" -> "${after}"`,
  );

  // A visitor-driven change does announce, concisely.
  await page.getByRole("button", { name: /^Validate$/ }).click();
  await page.waitForTimeout(250);
  const announced = (await page.locator('[role="status"]').first().textContent()) ?? "";
  check(
    "specimen: a visitor-driven change IS announced",
    announced.includes("Validate") && announced.length < 60,
    `"${announced}"`,
  );
});

// Zero layout shift, measured two ways: the browser's own layout-shift entries
// across a full unattended run, and the panel's box across every stage.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.getByRole("button", { name: /^Retrieve$/ }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const before = await page.evaluate(() => window.__cls);
  await page.waitForTimeout(14000); // sit through the entire five-stage run
  const after = await page.evaluate(() => window.__cls);
  const delta = after - before;

  // A BUDGET, not zero — and the number is deliberate rather than a shrug.
  //
  // Zero is not reachable for an auto-advancing accordion without changing what
  // the component is. Each advance closes one panel and opens the next, so the
  // stage below the closing one moves up by that panel's height. The list total
  // can be held constant (reserve every panel the tallest box) and the height
  // transition can be removed, but the SIBLING still moves, and CLS scores
  // element movement, not container height. All three variants were measured:
  //
  //   as shipped (animated, natural heights) .......... 0.0265
  //   reserved height via min-height .................. 0.0716  (track snaps)
  //   reserved height + no height transition .......... 0.0386  (192px jump)
  //
  // The shipped version is both the lowest number and the smoother motion, so
  // it stands. 0.05 leaves headroom over the measured 0.0265 while staying well
  // inside the 0.1 "good" threshold, and would still catch a real regression —
  // a panel growing, or a second animated layout property appearing.
  const BUDGET = 0.05;
  check(
    `specimen: a full unattended run stays within the ${BUDGET} shift budget`,
    delta < BUDGET,
    `CLS delta ${delta.toFixed(5)}`,
  );

  const heights = [];
  for (const name of ["Retrieve", "Generate", "Validate", "Execute", "Evaluate"]) {
    await page.getByRole("button", { name: new RegExp(`^${name}$`) }).click();
    await page.waitForTimeout(450);
    heights.push(
      await page.evaluate(() => {
        const section = document.querySelector("#walkthrough-title")?.closest("section");
        const head = section?.querySelector("[class*='specimenHead']");
        return head?.parentElement ? Math.round(head.parentElement.getBoundingClientRect().height) : -1;
      }),
    );
  }
  const spread = Math.max(...heights) - Math.min(...heights);
  check(
    "specimen: the panel is the same height at every stage",
    spread === 0 && heights[0] > 0,
    `heights ${JSON.stringify(heights)} spread ${spread}px`,
  );
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
