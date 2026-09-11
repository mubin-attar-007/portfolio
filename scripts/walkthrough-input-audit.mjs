// Exercise first interaction before the arrival observer gets its callback.
// BASE_URL=http://127.0.0.1:3200 node scripts/walkthrough-input-audit.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3200";
const WALKTHROUGH_URL = `${BASE}/work/dbwhisper#request-walkthrough`;
const browser = await chromium.launch();
const results = [];
function check(name, pass) {
  results.push({ name, pass });
  console.log(`${pass ? "✓" : "✗"} ${name}`);
}

try {
  for (const interaction of ["click", "focus"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    try {
      const page = await context.newPage();
      await page.addInitScript(() => {
        const NativeObserver = window.IntersectionObserver;
        window.IntersectionObserver = class extends NativeObserver {
          constructor(callback, options) {
            super((entries, observer) => {
              if (options?.threshold === 0.35 && entries.some((entry) => entry.isIntersecting)) {
                window.releaseWalkthroughArrival = () => callback(entries, observer);
              } else {
                callback(entries, observer);
              }
            }, options);
          }
        };
      });
      await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
      const selected = page.getByRole("button", { name: /^Validate$/ });
      if (interaction === "click") await selected.click();
      else await selected.focus();
      await page.waitForFunction(() => typeof window.releaseWalkthroughArrival === "function");
      const stageBefore = await page.locator('#request-walkthrough button[aria-expanded="true"]').textContent();
      await page.evaluate(() => window.releaseWalkthroughArrival());
      await page.waitForTimeout(3200);
      const stageAfter = await page.locator('#request-walkthrough button[aria-expanded="true"]').textContent();
      check(`first ${interaction}: delayed arrival cannot restart autoplay`,
        await page.getByRole("button", { name: "Play the run", exact: true }).count() === 1 && stageBefore === stageAfter);
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({ viewport: { width: 844, height: 390 } });
  try {
    const page = await context.newPage();
    await page.goto(WALKTHROUGH_URL, { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("button", { name: /^Validate$/ }).click();
    await page.waitForTimeout(400);
    check("landscape resize: choosing Validate pauses playback",
      await page.getByRole("button", { name: "Play the run", exact: true }).count() === 1);
  } finally {
    await context.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.pass);
console.log(`${results.length - failed.length}/${results.length} first-interaction checks pass.`);
if (failed.length > 0) process.exitCode = 1;
