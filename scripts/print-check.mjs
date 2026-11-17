// Verifies the print stylesheet on the routes people actually print.
//
// Emulates print media and asserts the site chrome is gone, no text in the
// page prints faded, and every line of text prints dark enough to read on
// white (the print palette in styles/globals.css maps the screen tokens to
// black and greys). Then writes a real PDF to .screenshots/ so the pagination
// can be eyeballed.
//
//   BASE_URL=http://localhost:3200 node scripts/print-check.mjs

import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";
const OUT = fileURLToPath(new URL("../.screenshots", import.meta.url));
const ROUTES = (process.env.ROUTES ?? "/resume").split(",").filter(Boolean);

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const failures = [];

for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(300);

  const report = await page.evaluate(() => {
    const visible = (sel) =>
      Array.from(document.querySelectorAll(sel)).filter(
        (el) => getComputedStyle(el).display !== "none",
      ).length;

    // Every rendered element in <main> that carries its own text.
    const texts = Array.from(document.querySelectorAll("main *")).filter(
      (el) =>
        el.getClientRects().length > 0 &&
        getComputedStyle(el).visibility !== "hidden" &&
        Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()),
    );
    const describe = (el) =>
      `${el.tagName.toLowerCase()} "${(el.textContent ?? "").trim().slice(0, 30)}"`;

    // Opacity multiplies down the tree, so a faded ancestor fades its text.
    const faded = texts
      .filter((el) => {
        let opacity = 1;
        for (let node = el; node; node = node.parentElement) {
          opacity *= Number.parseFloat(getComputedStyle(node).opacity);
        }
        return opacity < 0.99;
      })
      .map(describe);

    // WCAG contrast of the text colour on the white page. A 1px canvas paints
    // the computed colour over white, so any colour syntax the browser
    // serialises (rgb(), color(srgb …), oklch()) and any alpha resolve alike.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const onWhite = (colour) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillStyle = colour;
      ctx.fillRect(0, 0, 1, 1);
      return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
    };
    const luminance = (channel) => {
      const c = channel / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const faint = texts
      .filter((el) => {
        const [r, g, b] = onWhite(getComputedStyle(el).color);
        const l = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);
        return 1.05 / (l + 0.05) < 4.5;
      })
      .map(describe);

    return {
      header: visible("body > header"),
      footer: visible("body > footer"),
      chrome: visible('[data-print="hide"]'),
      texts: texts.length,
      faded,
      faint,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      inkColor: getComputedStyle(document.body).color,
    };
  });

  const problems = [];
  if (report.header > 0) problems.push("site header still prints");
  if (report.footer > 0) problems.push("site footer still prints");
  if (report.chrome > 0) problems.push(`${report.chrome} [data-print="hide"] element(s) still print`);
  if (report.texts === 0) problems.push("no text found in <main>; the checks below would pass on nothing");
  if (report.faded.length > 0) {
    problems.push(`${report.faded.length} text element(s) print faded: ${report.faded.slice(0, 4).join(", ")}`);
  }
  if (report.faint.length > 0) {
    problems.push(`${report.faint.length} text element(s) print below 4.5:1 on white: ${report.faint.slice(0, 4).join(", ")}`);
  }
  if (report.bodyBg !== "rgb(255, 255, 255)") problems.push(`body background is ${report.bodyBg}, not white`);
  if (report.inkColor !== "rgb(0, 0, 0)") problems.push(`body ink is ${report.inkColor}, not black`);

  const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
  await page.pdf({ path: path.join(OUT, `${slug}__print.pdf`), format: "A4", printBackground: false });

  if (problems.length > 0) {
    failures.push({ route, problems });
    console.error(`✗ ${route}\n    - ${problems.join("\n    - ")}`);
  } else {
    console.log(`✓ ${route} — chrome excluded, ink black on white, ${report.texts} text elements unfaded and legible`);
  }
}

await browser.close();
console.log(`PDFs written to .screenshots/`);
if (failures.length > 0) process.exitCode = 1;
