// Interaction contracts for the enhancement pass.
//
// scripts/a11y.mjs proves the DOM is accessible and scripts/screenshot.mjs
// proves nothing overflows. Neither can tell you that the product specimen
// still advances, that content works without JavaScript, or that reduced motion
// yields a useful static state rather than a blank one. This does.
//
//   BASE_URL=http://localhost:3200 node scripts/interaction-audit.mjs
//
// Exit 1 on any failed contract.

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";
// DBWhisper is the flagship: first in the homepage's public-work grid, and the
// case study whose request-path walkthrough is the product specimen below.
const FEATURED_PATH = "/work/dbwhisper";
const WALKTHROUGH_URL = `${BASE}${FEATURED_PATH}#request-walkthrough`;
// The homepage leads with field reports (noindex, but linked and public).
const FIELD_REPORT_PATH = "/work/field/records-triage";
// The homepage's contact path. The email address itself lives on /contact.
const CONTACT_PATH = "/contact";
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

// ------------------------------------------------------- content resilience
// Inspect actual content and its ancestors, not the presence of a particular
// animation component. This catches a faded or hidden section regardless of
// which implementation introduced it, and fails if the content disappears.
function headingVisibility() {
  const headings = Array.from(document.querySelectorAll("main h1, main h2"))
    .filter((el) => !el.closest(".sr-only"));
  const unreadable = headings.filter((heading) => {
    if (heading.getClientRects().length === 0) return true;
    let opacity = 1;
    for (let el = heading; el; el = el.parentElement) {
      const style = getComputedStyle(el);
      opacity *= Number.parseFloat(style.opacity);
      if (style.visibility === "hidden" || style.display === "none") return true;
    }
    return opacity < 0.99;
  }).map((el) => el.textContent?.trim());
  return {
    count: headings.length,
    belowFold: headings.filter((el) => el.getBoundingClientRect().top >= innerHeight).length,
    unreadable,
  };
}

for (const width of [390, 1440]) {
  await withPage({ javaScriptEnabled: false, viewport: { width, height: 900 } }, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    const h1 = page.locator("main h1");
    check(`no JavaScript ${width}px: the page has one visible headline`,
      await h1.count() === 1 && await h1.isVisible());
    const featuredSelector = `main a[href="${FEATURED_PATH}"]`;
    const featured = page.locator(featuredSelector).first();
    check(`no JavaScript ${width}px: the featured case study is reachable`,
      await featured.isVisible());
    check(`no JavaScript ${width}px: a field report is reachable`,
      await page.locator(`main a[href="${FIELD_REPORT_PATH}"]`).first().isVisible());
    check(`no JavaScript ${width}px: the contact page is reachable`,
      await page.locator(`main a[href="${CONTACT_PATH}"]`).first().isVisible());
    const content = await page.evaluate(headingVisibility);
    check(`no JavaScript ${width}px: real sections remain readable`,
      content.count >= 5 && content.unreadable.length === 0, JSON.stringify(content));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`no JavaScript ${width}px: the page fits the viewport`, overflow === 0, `${overflow}px`);
    // A no-JS document still runs CSS entrances. Wait for this link's finite
    // ancestor animations without finishing them or bypassing actionability.
    // Poll from Node: in-page timer callbacks do not resume with JS disabled.
    const runningEntrance = () => page.evaluate((selector) => {
      const target = document.querySelector(selector);
      if (!target) return true;
      for (let element = target; element; element = element.parentElement) {
        const moving = element.getAnimations().some((animation) =>
          animation.playState === "running" &&
          Number.isFinite(animation.effect?.getComputedTiming().endTime));
        if (moving) return true;
      }
      return false;
    }, featuredSelector);
    const entranceDeadline = Date.now() + 1500;
    while (await runningEntrance()) {
      if (Date.now() >= entranceDeadline) throw new Error("Featured-link entrance did not settle within 1500ms");
      await page.waitForTimeout(50);
    }

    // Own the destination wait explicitly: click's implicit pre-navigation
    // wait occasionally remained pending after a successful no-JS navigation.
    await Promise.all([
      page.waitForURL(`${BASE}${FEATURED_PATH}`, { waitUntil: "commit" }),
      featured.click({ noWaitAfter: true }),
    ]);
    const destination = page.locator("main h1#case-study-title");
    await destination.waitFor({ state: "visible" });
    await page.waitForLoadState("load");
    check(`no JavaScript ${width}px: the featured link opens the case study`,
      await destination.isVisible());
    // The specimen is server-rendered: without JavaScript it is a readable first
    // stage, not an empty frame waiting for a script.
    check(`no JavaScript ${width}px: the case-study walkthrough renders its first stage`,
      await page.locator("#request-walkthrough #walkthrough-title").isVisible() &&
        await page.locator("#request-walkthrough #walkthrough-panel-retrieve").isVisible());
  });

  // The email address is one step from every page; without JavaScript the
  // contact page must still hand it over as a working mailto link.
  await withPage({ javaScriptEnabled: false, viewport: { width, height: 900 } }, async (page) => {
    await page.goto(`${BASE}${CONTACT_PATH}`, { waitUntil: "load" });
    check(`no JavaScript ${width}px: the contact page's email link is reachable`,
      await page.locator('main a[href^="mailto:"]').first().isVisible());
  });

  // A field report opens without JavaScript, readable from its headline down.
  await withPage({ javaScriptEnabled: false, viewport: { width, height: 900 } }, async (page) => {
    await page.goto(`${BASE}${FIELD_REPORT_PATH}`, { waitUntil: "load" });
    const content = await page.evaluate(headingVisibility);
    check(`no JavaScript ${width}px: a field report is readable`,
      await page.locator("main h1").count() === 1 && content.count >= 3 && content.unreadable.length === 0,
      JSON.stringify(content));
  });
}

await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  const content = await page.evaluate(headingVisibility);
  check("homepage: below-fold sections are readable immediately, before scrolling",
    content.belowFold >= 3 && content.unreadable.length === 0, JSON.stringify(content));
});

// ------------------------------------------------------- product specimen
await withPage({}, async (page) => {
  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
  const rail = page.getByRole("button", { name: /^Retrieve$/ });
  await rail.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // The run starts on arrival and advances on its own.
  const first = await page
    .locator('#request-walkthrough [aria-expanded="true"]')
    .first()
    .textContent();
  await page.waitForTimeout(3400);
  const second = await page
    .locator('#request-walkthrough [aria-expanded="true"]')
    .first()
    .textContent();
  check("specimen: the run advances once the section is reached", first !== second, `${first} -> ${second}`);

  // A manual selection takes over from the run.
  await page.getByRole("button", { name: /^Validate$/ }).click();
  await page.waitForTimeout(3400);
  const held = await page.locator('#request-walkthrough [aria-expanded="true"]').first().textContent();
  check("specimen: selecting a stage stops the run", (held ?? "").includes("Validate"), held ?? "");

  // Keyboard reaches every stage.
  await page.getByRole("button", { name: /^Retrieve$/ }).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(250);
  const viaKeyboard = await page.locator('#request-walkthrough [aria-expanded="true"]').first().textContent();
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
  page.locator('#request-walkthrough [aria-expanded="true"]').first().textContent();

await withPage({}, async (page) => {
  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
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
  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
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
  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
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
  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
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
  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
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
  const during = await page.locator('#request-walkthrough [role="status"]').textContent();
  await page.waitForTimeout(3400);
  const after = await page.locator('#request-walkthrough [role="status"]').textContent();
  check(
    "specimen: automatic advancement announces NOTHING",
    (during ?? "").trim() === "" && (after ?? "").trim() === "",
    `"${during}" -> "${after}"`,
  );

  // A visitor-driven change does announce, concisely.
  await page.getByRole("button", { name: /^Validate$/ }).click();
  await page.waitForTimeout(250);
  const announced = (await page.locator('#request-walkthrough [role="status"]').textContent()) ?? "";
  check(
    "specimen: a visitor-driven change IS announced",
    announced.includes("Validate") && announced.length < 60,
    `"${announced}"`,
  );
});

// Zero layout shift, measured two ways: the browser's own layout-shift entries
// across a full unattended run, and the panel's box across every stage.
await withPage({}, async (page) => {
  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
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

  const content = await page.evaluate(headingVisibility);
  check("reduced motion: the homepage sections are readable", content.count >= 5 && content.unreadable.length === 0,
    JSON.stringify(content));

  await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Retrieve$/ }).scrollIntoViewIfNeeded();
  const initial = await page.locator('#request-walkthrough [aria-expanded="true"]').first().textContent();
  await page.waitForTimeout(3400);
  const held = await page.locator('#request-walkthrough [aria-expanded="true"]').first().textContent();
  check("reduced motion: the specimen does not advance by itself", initial === held, `${initial} -> ${held}`);

  // The specimen must still be usable, just not self-advancing.
  await page.getByRole("button", { name: /^Execute$/ }).click();
  await page.waitForTimeout(200);
  const stage = await page.locator('#request-walkthrough [aria-expanded="true"]').first().textContent();
  check("reduced motion: stages still selectable", (stage ?? "").includes("Execute"), stage ?? "");

  const transport = await page.getByRole("button", { name: /Play the run|Pause/ }).count();
  check("reduced motion: no inert transport is rendered", transport === 0, `${transport} controls`);
});

// ------------------------------------------------------- eval registry
// The registry is a table: each row states its result, and its Method link
// lands on the full method further down the page. The method is one click
// away, never withheld; the filters narrow the rows without hiding the count.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/evals`, { waitUntil: "networkidle" });
  const registry = page.getByRole("table", { name: /^Evaluation registry/ });
  const rows = registry.locator("tbody tr");
  const rowCount = await rows.count();
  check("evals: the registry lists its rows", rowCount > 0, `${rowCount} rows`);

  // Every row carries its finding in the row itself.
  const findings = await rows.evaluateAll((trs) =>
    trs.map((tr) => Array.from(tr.cells).map((cell) => (cell.textContent ?? "").trim())));
  const bare = findings.filter((cells) => cells.length < 5 || cells.slice(1, 5).some((text) => text === ""));
  check("evals: every row states its project, metric, result and scope", rowCount > 0 && bare.length === 0,
    JSON.stringify(bare));

  // A row's Method link lands on that method, and the method is shown in full.
  const method = registry.getByRole("link", { name: /^Method: / }).first();
  const href = (await method.getAttribute("href")) ?? "";
  await method.click();
  await page.waitForTimeout(400);
  const landed = await page.evaluate((hash) => {
    const target = hash.startsWith("#") ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (!target) return { found: false };
    const box = target.getBoundingClientRect();
    return {
      found: true,
      hash: location.hash,
      inView: box.top < innerHeight && box.bottom > 0,
      words: (target.textContent ?? "").trim().split(/\s+/).length,
    };
  }, href);
  check("evals: a row's Method link lands on its method", landed.found && landed.hash === href && landed.inView,
    `${href} ${JSON.stringify(landed)}`);
  check("evals: the method behind a row is shown in full", landed.found && landed.words > 40,
    JSON.stringify(landed));

  // The filters narrow the table and say how many rows they show.
  const status = page.getByRole("radiogroup", { name: "Status" });
  const counter = page.getByText(/^Showing \d+ of \d+ results?$/);
  const countBefore = (await counter.textContent()) ?? "";
  await status.getByRole("radio", { name: "All" }).check();
  await page.waitForTimeout(250);
  const allRows = await rows.count();
  const countAll = (await counter.textContent()) ?? "";
  await status.getByRole("radio", { name: "Retired" }).check();
  await page.waitForTimeout(250);
  const retiredRows = await rows.count();
  const countRetired = (await counter.textContent()) ?? "";
  check("evals: the status filter narrows the registry and updates its count",
    allRows > rowCount && retiredRows > 0 && retiredRows < allRows &&
      countAll !== countBefore && countRetired.startsWith(`Showing ${retiredRows} `),
    `current ${rowCount} (${countBefore}) · all ${allRows} (${countAll}) · retired ${retiredRows} (${countRetired})`);
});

// ------------------------------------------------------- header + menu
// The header is a floating pill in a sticky band (ADR-018). The pill stays in
// reach however far the page scrolls, and the band around it is click-through,
// so content scrolling past either side of the pill stays clickable.
await withPage({}, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 1600));
  await page.waitForTimeout(400);
  const pill = await page.evaluate(() => {
    const nav = document.querySelector('header nav[aria-label="Primary"]');
    if (!nav) return null;
    const box = nav.getBoundingClientRect();
    // A point in the band, level with the pill but outside it.
    const x = Math.max(2, Math.floor(box.left / 2));
    const y = Math.round(box.top + box.height / 2);
    const hit = box.left > 4 ? document.elementFromPoint(x, y) : null;
    return {
      scrolled: Math.round(scrollY),
      top: Math.round(box.top),
      bottom: Math.round(box.bottom),
      besidePillHitsHeader: hit ? hit.closest("header") !== null : null,
    };
  });
  check("header: the nav pill stays in view after scrolling",
    pill !== null && pill.scrolled > 0 && pill.top >= 0 && pill.bottom <= 120, JSON.stringify(pill));
  check("header: the band beside the pill is click-through",
    pill !== null && pill.besidePillHitsHeader === false, JSON.stringify(pill));
});

// Below 1000px the site menu is a disclosure, not a modal (components/layout/
// mobile-menu.tsx): the panel opens under the bar while the page stays live.
// It closes on Escape (focus back on its button), a tap outside, choosing a
// link, and the window widening past the breakpoint.
const MENU_PANEL = "#mobile-menu";
const openMobileMenu = async (page) => {
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.locator(MENU_PANEL).waitFor({ state: "visible" });
  await page.waitForTimeout(300); // the panel's entrance
};

await withPage({ viewport: { width: 390, height: 844 } }, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await openMobileMenu(page);
  const toggle = page.getByRole("button", { name: "Close menu", exact: true });
  check("mobile menu: opens", await page.locator(MENU_PANEL).isVisible() &&
    await toggle.getAttribute("aria-expanded") === "true");
  check("mobile menu: it is a disclosure, not a second modal",
    await page.getByRole("dialog").count() === 0 &&
      await page.locator("main").evaluate((el) => !el.closest("[inert]") && !el.inert));
  check("mobile menu: the page behind it keeps scrolling", await page.evaluate(() =>
    document.body.style.overflow !== "hidden" && document.documentElement.style.overflow !== "hidden"));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  check("mobile menu: Escape closes it", (await page.locator(MENU_PANEL).count()) === 0);
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  check("mobile menu: focus returns to the trigger", focused === "Open menu", focused ?? "none");
});

await withPage({ viewport: { width: 390, height: 844 } }, async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await openMobileMenu(page);
  // A point on the page itself, below the panel and on no control, so the tap
  // does nothing but land outside. The URL must not change either, so a tap
  // that hit a menu link cannot pass this.
  const outside = await page.evaluate((selector) => {
    const box = document.querySelector(selector)?.getBoundingClientRect();
    if (!box) return null;
    for (let y = Math.ceil(box.bottom) + 8; y < innerHeight - 4; y += 8) {
      for (const x of [24, Math.round(innerWidth / 2), innerWidth - 24]) {
        const hit = document.elementFromPoint(x, y);
        const control = "a, button, input, select, textarea, label, summary, header, " +
          "[role=button], [role=link], [role=tab], [role=option], [role=radio], [role=checkbox], [role=switch]";
        if (hit && !hit.closest(control)) {
          return { x, y };
        }
      }
    }
    return null;
  }, MENU_PANEL);
  const before = page.url();
  if (outside) await page.mouse.click(outside.x, outside.y);
  await page.waitForTimeout(400);
  check("mobile menu: a tap outside closes it",
    outside !== null && page.url() === before && (await page.locator(MENU_PANEL).count()) === 0,
    outside ? page.url() : "the open panel leaves no page below it to tap");

  await openMobileMenu(page);
  const link = page.locator(MENU_PANEL).getByRole("link", { name: "Evals" }).first();
  await Promise.all([page.waitForURL("**/evals"), link.click()]);
  await page.waitForTimeout(400);
  check("mobile menu: choosing a link navigates and closes it",
    (await page.locator(MENU_PANEL).count()) === 0, page.url());

  await openMobileMenu(page);
  await page.setViewportSize({ width: 1280, height: 844 });
  await page.waitForTimeout(400);
  check("mobile menu: widening past the breakpoint closes it", (await page.locator(MENU_PANEL).count()) === 0);
});

// --------------------------------------------------- modal inert boundary
// A dialog that only traps Tab still leaves the page behind it in the
// accessibility tree and in the audit's contrast sample. `inert` is what makes
// the scrim a real boundary; these contracts prove it is applied AND released.
// The assistant is the site's one modal, at every width (the mobile menu is a
// disclosure, covered above), so it is checked at both.
for (const modal of [
  { name: "assistant", viewport: { width: 1440, height: 900 } },
  { name: "assistant (390px)", viewport: { width: 390, height: 844 } },
].map((m) => ({
  ...m,
  open: async (page) => {
    await page.getByRole("button", { name: /^Ask this site/ }).first().click();
    await page.getByRole("dialog", { name: /^Ask about/ }).waitFor();
    await page.waitForTimeout(600);
  },
  launcher: /^Ask this site/,
}))) {
  await withPage({ viewport: modal.viewport }, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await modal.open(page);

    const inert = await page.evaluate(() =>
      Array.from(document.body.children)
        .filter((el) => el instanceof HTMLElement && !el.matches("[data-modal-root],script,style,link"))
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

    const locked = await page.evaluate(() =>
      document.body.style.overflow === "hidden" && document.documentElement.style.overflow === "hidden",
    );
    check(`${modal.name}: background scrolling is locked`, locked);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);

    const released = await page.evaluate(() =>
      Array.from(document.body.children)
        .filter((el) => el instanceof HTMLElement && !el.matches("[data-modal-root],script,style,link"))
        .every((el) => el.inert !== true && el.getAttribute("aria-hidden") !== "true"),
    );
    check(`${modal.name}: closing releases the boundary`, released);
    check(`${modal.name}: closing releases the scroll lock`, await page.evaluate(() =>
      document.body.style.overflow !== "hidden" && document.documentElement.style.overflow !== "hidden",
    ));

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

// The assistant opening closes the menu first, so the visitor never has an open
// panel left behind a modal — whether the shortcut or the menu's own Ask row
// opened it.
for (const via of ["the shortcut", "the menu's Ask row"]) {
  await withPage({ viewport: { width: 390, height: 844 } }, async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await openMobileMenu(page);
    if (via === "the shortcut") {
      await page.keyboard.press("Control+k");
    } else {
      await page.locator(MENU_PANEL).getByRole("button", { name: /^Ask/ }).click();
    }
    const assistant = page.getByRole("dialog", { name: /^Ask about/ });
    await assistant.waitFor();
    await page.waitForTimeout(400);
    check(`assistant from ${via}: the menu closes and exactly one dialog opens`,
      await page.getByRole("dialog").count() === 1 && await page.locator(MENU_PANEL).count() === 0);
    check(`assistant from ${via}: the modal retains its boundary`,
      await page.locator("main").evaluate((el) => el.inert || el.closest("[inert]") !== null));
    await page.keyboard.press("Escape");
    await assistant.waitFor({ state: "detached" });
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.tagName);
    check(`assistant from ${via}: focus returns to a live control`,
      focused !== "BODY" && focused !== undefined, focused ?? "none");
  });
}

// A delayed mocked response reproduces typing the next question while busy.
// No live model request or quota is needed to test the complete UI path.
await withPage({}, async (page) => {
  let requests = 0;
  let releaseResponse;
  const responseReady = new Promise((resolve) => { releaseResponse = resolve; });
  const payload = [
    'event: meta\ndata: {"mode":"fallback"}\n\n',
    'event: token\ndata: {"text":"The validator checks the generated SQL before execution."}\n\n',
    'event: sources\ndata: {"citations":[{"source":"DBWhisper case study — Architecture"}]}\n\n',
    'event: done\ndata: {}\n\n',
  ].join("");
  await page.route("**/api/chat", async (route) => {
    requests += 1;
    await responseReady;
    await route.fulfill({ status: 200, contentType: "text/event-stream", body: payload });
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Ask this site/ }).first().click();
  const question = page.getByRole("textbox", { name: "Your question" });
  await question.fill("How does DBWhisper validate SQL?");
  const requested = page.waitForRequest("**/api/chat");
  await question.press("Enter");
  await requested;
  await page.getByRole("log").locator('[aria-busy="true"]').waitFor();
  const nextQuestion = "What happens if the validator rejects it?";
  await question.fill(nextQuestion);
  await question.press("Enter");
  check("assistant: Enter while busy preserves the next draft", await question.inputValue() === nextQuestion);
  check("assistant: Enter while busy starts no second request", requests === 1, `${requests} requests`);
  releaseResponse();
  const citation = page.getByRole("dialog").getByRole("link", { name: "DBWhisper" });
  await citation.waitFor();
  // Ask is never `disabled` (a focused button that becomes disabled drops focus
  // to <body>); it reports its state through aria-disabled instead.
  await page.waitForFunction(() => {
    const ask = document.querySelector('#assistant-panel-dialog button[type="submit"]');
    return ask !== null && ask.getAttribute("aria-disabled") !== "true";
  });
  check("assistant: completion preserves the next draft and unlocks sending", await question.inputValue() === nextQuestion);
  check("assistant: the cited project is a usable same-site link", await citation.getAttribute("href") === "/work/dbwhisper");
  await citation.click();
  await page.waitForURL("**/work/dbwhisper");
  check("assistant: reading a source closes the dialog", await page.getByRole("dialog").count() === 0);
});

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} interaction contracts hold.`);
if (failed.length > 0) {
  console.error(`\nFAILED:\n${failed.map((f) => `  - ${f.name}: ${f.detail}`).join("\n")}`);
  process.exitCode = 1;
}
