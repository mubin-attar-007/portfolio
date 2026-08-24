// Hue audit. Walks every route in a given theme and reports any computed
// colour whose hue falls outside that theme's allowed accent families.
//
// This exists because a stray accent is invisible to every other gate: axe
// checks contrast, the screens sweep checks overflow, and neither notices that
// one section is violet inside a lime theme. That defect shipped once.
//
//   BASE_URL=http://localhost:3200 node scripts/theme-audit.mjs
//   THEME=light node scripts/theme-audit.mjs
//
// Exit 1 on any offender.

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";
const THEME = process.env.THEME ?? "dark";

const ROUTES = (
  process.env.ROUTES ??
  "/,/work,/work/dbwhisper,/writing,/writing/a-validator-is-not-a-better-prompt,/notes,/evals,/about,/hire,/resume,/now,/uses,/trust,/skills"
)
  .split(",")
  .filter(Boolean);

/**
 * Allowed accent hue windows per theme, in degrees.
 *
 * dark  — lime only (~65-95°). Violet (~250-290°) is the specific regression
 *         this guards: the dark theme is single-accent.
 * light — violet (~250-285°) plus the ambient blue (~200-250°) that appears in
 *         gradients and data visuals.
 *
 * Neutrals are exempt (see CHROMA_FLOOR). Product SCREENSHOTS are exempt —
 * they are photographs of other apps, not our palette — as is `.shiki` syntax
 * highlighting, which is a semantic system of its own: keywords, strings and
 * functions are expected to be polychrome, and collapsing them into one hue
 * would cost real code readability.
 */
const ALLOWED = {
  dark: [[55, 100]],
  light: [
    [245, 290],
    [195, 250],
  ],
};

/**
 * Semantic status hues, allowed in BOTH themes in addition to the accent
 * families above. These are not accents — they carry meaning (live, measured,
 * regressed, caution) and sit deliberately outside the brand family so they
 * cannot be mistaken for one. Kept as a separate list so the audit stays a real
 * guard on accent drift rather than a list of everything currently on the page.
 */
const STATUS = [
  [150, 185], // positive — emerald
  [0, 20],    // negative — red
  [25, 50],   // warning — amber
];
/**
 * Neutral test, by CHROMA (max-min across RGB) rather than HSL saturation.
 * At near-black, HSL inflates saturation — our #0d1214 surface computes s=0.21
 * while being visually pure grey — so a saturation floor flagged every dark
 * panel. Chroma is luminance-independent: 7 is neutral, 72 is a colour.
 */
const CHROMA_FLOOR = 28;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.addInitScript((t) => {
  try {
    localStorage.setItem("theme", t);
  } catch {
    /* storage disabled — the page falls back to its default */
  }
}, THEME);

const offenders = [];

for (const route of ROUTES) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const found = await page.evaluate(
    ({ allowed, status, chromaFloor }) => {
      const hsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l = (max + min) / 2;
        if (max === min) return [0, 0, l];
        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        let h;
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
        return [h * 360, s, l];
      };

      // Every colour token inside one CSS value: rgb(), rgba(), #hex.
      const coloursIn = (value) => {
        const out = [];
        if (!value || value === "none") return out;
        for (const m of value.matchAll(/rgba?\(([^)]+)\)/g)) {
          const n = m[1].split(/[,/\s]+/).map(Number).filter((x) => !Number.isNaN(x));
          if (n.length >= 3) out.push([n[0], n[1], n[2], n[3] ?? 1]);
        }
        for (const m of value.matchAll(/#([0-9a-f]{6})\b/gi)) {
          const h = m[1];
          out.push([
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
            1,
          ]);
        }
        return out;
      };

      const inAllowed = (h) =>
        allowed.some(([lo, hi]) => h >= lo && h <= hi) ||
        status.some(([lo, hi]) => h >= lo && h <= hi);
      const hits = [];

      for (const el of document.querySelectorAll("*")) {
        // Screenshots are photographs of other products, not our palette.
        if (el.closest("img, video, picture, .shiki, [data-hue-exempt]")) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        const s = getComputedStyle(el);
        const props = {
          color: s.color,
          backgroundColor: s.backgroundColor,
          backgroundImage: s.backgroundImage,
          borderTopColor: s.borderTopColor,
          borderLeftColor: s.borderLeftColor,
          fill: s.fill,
          stroke: s.stroke,
          boxShadow: s.boxShadow,
          outlineColor: s.outlineColor,
        };

        for (const [prop, value] of Object.entries(props)) {
          for (const [cr, cg, cb, ca] of coloursIn(value)) {
            if (ca < 0.12) continue; // effectively invisible
            const chroma = Math.max(cr, cg, cb) - Math.min(cr, cg, cb);
            if (chroma < chromaFloor) continue; // neutral
            const [h] = hsl(cr, cg, cb);
            if (inAllowed(h)) continue;
            const cls =
              typeof el.className === "string" && el.className
                ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
                : "";
            hits.push({
              el: `${el.tagName.toLowerCase()}${cls}`.slice(0, 70),
              prop,
              rgb: `rgb(${Math.round(cr)},${Math.round(cg)},${Math.round(cb)})`,
              hue: Math.round(h),
            });
            if (hits.length > 40) return hits;
          }
        }
      }
      return hits;
    },
    { allowed: ALLOWED[THEME], status: STATUS, chromaFloor: CHROMA_FLOOR },
  );

  // Collapse to unique element+property+colour so one repeated card is one row.
  const seen = new Set();
  const unique = found.filter((f) => {
    const k = `${f.el}|${f.prop}|${f.rgb}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (unique.length > 0) offenders.push({ route, hits: unique });
  console.log(`${unique.length === 0 ? "✓" : "✗"} [${THEME}] ${route}${unique.length ? ` — ${unique.length} off-hue` : ""}`);
  await page.close();
}

await browser.close();

if (offenders.length > 0) {
  console.error(
    `
OFF-HUE for the ${THEME} theme (accent ${JSON.stringify(ALLOWED[THEME])}, status ${JSON.stringify(STATUS)}):`,
  );
  for (const o of offenders) {
    console.error(`\n  ${o.route}`);
    for (const h of o.hits.slice(0, 10)) {
      console.error(`    ${h.hue}° ${h.rgb}  ${h.prop}  ${h.el}`);
    }
  }
  process.exitCode = 1;
} else {
  console.log(`\nNo off-hue colours in the ${THEME} theme across ${ROUTES.length} routes.`);
}
