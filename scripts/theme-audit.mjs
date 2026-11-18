// Hue audit. Walks every route and reports any computed colour whose hue falls
// outside the palette's allowed families.
//
// This exists because a stray accent is invisible to every other gate: axe
// checks contrast, the screens sweep checks overflow, and neither notices that
// one section is the wrong hue. That defect shipped once.
//
//   BASE_URL=http://localhost:3200 node scripts/theme-audit.mjs
//
// The site has one theme (ADR-018): a light canvas with dark pages and plates
// built into the design, so one pass covers both. THEME is accepted for the CI
// call (`THEME=light`) and any other value fails loudly rather than auditing
// something that does not exist. Exit 1 on any offender.

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3200";
const THEME = process.env.THEME ?? "light";
if (THEME !== "light") {
  console.error(`theme-audit: the site has one theme (ADR-018); THEME="${THEME}" does not exist.`);
  process.exit(1);
}

const ROUTES = (
  process.env.ROUTES ??
  "/,/work,/work/dbwhisper,/work/bench-discovery,/work/careltc,/writing,/writing/a-validator-is-not-a-better-prompt,/notes,/evals,/about,/hire,/contact,/resume,/now,/uses,/trust,/skills,/privacy"
)
  .split(",")
  .filter(Boolean);

/**
 * Allowed hue windows, in degrees, from styles/tokens.css:
 *
 * - violet, the one accent: --color-accent #6b4bff (251°), its hover #5a37ef,
 *   the button gradient, and the plate violet #9d8cff (250°);
 * - cyan, the dark plates' second signal: --color-plate-cyan #63d2ef (192°)
 *   and the --color-ambient sky #38bdf8 (198°) used in data visuals.
 *
 * Anything else with chroma — a blue, a teal, a pink, a lime — is drift.
 * Neutrals are exempt (see CHROMA_FLOOR). Product SCREENSHOTS are exempt —
 * they are photographs of other apps, not our palette — as is `.shiki` syntax
 * highlighting, a semantic system of its own.
 */
const ALLOWED = [
  [245, 260], // violet
  [188, 200], // plate cyan and ambient sky
];

/**
 * Semantic status hues. These are not accents — they carry meaning (live,
 * measured, regressed, caution) and sit deliberately outside the brand family
 * so they cannot be mistaken for one. Kept as a separate list so the audit
 * stays a real guard on accent drift rather than a list of everything on the
 * page. Windows are the light and plate tokens' hues with a little room.
 */
const STATUS = [
  [136, 150], // positive — #15803d (142°), plate #4ade80 (142°)
  [0, 8], // negative — #dc2626, plate #f87171 (0°)
  [352, 360], // negative, the other side of 0°
  [20, 48], // warning — #b45309 (26°), plate #fbbf24 (43°)
];
/**
 * Neutral test, by CHROMA (max-min across RGB) rather than HSL saturation.
 * At near-black, HSL inflates saturation, so a saturation floor flags every
 * dark plate. Chroma is luminance-independent: 7 is neutral, 72 is a colour.
 */
const CHROMA_FLOOR = 28;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });

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
    { allowed: ALLOWED, status: STATUS, chromaFloor: CHROMA_FLOOR },
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
  console.log(`${unique.length === 0 ? "✓" : "✗"} ${route}${unique.length ? ` — ${unique.length} off-hue` : ""}`);
  await page.close();
}

await browser.close();

if (offenders.length > 0) {
  console.error(
    `
OFF-HUE (accent ${JSON.stringify(ALLOWED)}, status ${JSON.stringify(STATUS)}):`,
  );
  for (const o of offenders) {
    console.error(`\n  ${o.route}`);
    for (const h of o.hits.slice(0, 10)) {
      console.error(`    ${h.hue}° ${h.rgb}  ${h.prop}  ${h.el}`);
    }
  }
  process.exitCode = 1;
} else {
  console.log(`\nNo off-hue colours across ${ROUTES.length} routes.`);
}
