// Lighthouse diagnosis — why a LOCAL run disagrees with CI, and whether that
// disagreement is the site's fault.
//
// This exists because the answer has been non-obvious twice. A local run of
// this site reports performance ~71 and LCP 5-7s; CI reports 97-99 and
// LCP ~2.4s on the SAME COMMIT. Reading either number alone is useless.
//
// The two facts that resolve it, both printed below:
//
//   1. OBSERVED vs SIMULATED. Lighthouse's default throttling is `simulate`:
//      it records an unthrottled trace and then projects it onto slow 4G with a
//      4x CPU penalty. `observedLargestContentfulPaint` is what actually
//      happened; `largestContentfulPaint` is the projection. Locally those are
//      ~750ms and ~6900ms — a 9x spread. The projection is the number in the
//      score, so a page that paints in 750ms can still "score" 71.
//
//   2. WHAT THE SIMULATION IS FED. Neither `next start` nor the standalone
//      server compresses for headless Chrome here (curl gets gzip; Chrome gets
//      Content-Encoding: none), so the simulation transfers ~566KB of script
//      instead of the ~180KB that CI and Vercel actually serve. At the model's
//      1638 Kbps that difference alone is roughly two seconds, and it
//      compounds through the dependency graph.
//
// So: read `observed*` for what the page does, the payload table for what the
// simulation was charged for, and treat the score as a CI-only signal. If the
// payload table shows uncompressed sizes, the local score is not measuring the
// site.
//
//   BASE_URL=http://127.0.0.1:3200 RUNS=3 node scripts/lighthouse-diagnose.mjs
//   ROUTE=/work/dbwhisper RUNS=5 node scripts/lighthouse-diagnose.mjs
import { spawn } from "node:child_process";
import { readFile, mkdtemp, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const LIGHTHOUSE_CLI = resolve(require.resolve("lighthouse"), "..", "..", "cli", "index.js");
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3200";
const RUNS = Number(process.env.RUNS ?? 3);
const ROUTE = process.env.ROUTE ?? "/";

try {
  const { chromium } = await import("playwright");
  const exe = chromium.executablePath();
  await access(exe);
  process.env.CHROME_PATH = exe;
} catch { /* fall back to a system Chrome */ }

const dir = await mkdtemp(join(tmpdir(), "lh-investigate-"));

function run(args) {
  return new Promise((res, rej) => {
    const c = spawn(process.execPath, args, { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
    let err = "";
    c.stderr.on("data", (d) => (err += d));
    c.on("close", (code) => (code === 0 ? res() : rej(new Error(err.slice(0, 400)))));
  });
}

const reports = [];
for (let i = 0; i < RUNS; i++) {
  const out = join(dir, `run-${i}.json`);
  process.stdout.write(`  run ${i + 1}/${RUNS} ... `);
  try {
    await run([
      LIGHTHOUSE_CLI, `${BASE}${ROUTE}`, "--quiet", "--output=json", `--output-path=${out}`,
      "--form-factor=mobile",
      "--only-categories=performance,accessibility,best-practices,seo",
      // A fresh profile per run: no HTTP cache, no service worker, no prior state.
      "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
    ]);
  } catch (e) { console.log("\n    LH stderr:", String(e.message).slice(0, 400)); }
  reports.push(JSON.parse(await readFile(out, "utf8")));
  console.log("done");
}

const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const num = (id) => med(reports.map((r) => r.audits?.[id]?.numericValue).filter(Number.isFinite));
const cat = (c) => med(reports.map((r) => r.categories[c].score * 100));
const r0 = reports[0];

console.log(`\n${"=".repeat(72)}\nLIGHTHOUSE — ${ROUTE}  ·  mobile  ·  median of ${RUNS} clean-profile runs\n${"=".repeat(72)}`);
console.log(`  performance      ${cat("performance").toFixed(0)}`);
console.log(`  accessibility    ${cat("accessibility").toFixed(0)}`);
console.log(`  best-practices   ${cat("best-practices").toFixed(0)}`);
console.log(`  seo              ${cat("seo").toFixed(0)}`);
console.log(`\n  LCP              ${Math.round(num("largest-contentful-paint"))} ms`);
console.log(`  FCP              ${Math.round(num("first-contentful-paint"))} ms`);
console.log(`  Speed Index      ${Math.round(num("speed-index"))} ms`);
console.log(`  TBT              ${Math.round(num("total-blocking-time"))} ms`);
console.log(`  CLS              ${num("cumulative-layout-shift").toFixed(4)}`);
console.log(`  TTFB             ${Math.round(num("server-response-time"))} ms`);
console.log(`  per-run LCP      ${reports.map((r) => Math.round(r.audits["largest-contentful-paint"].numericValue)).join(" / ")} ms`);

// ---- LCP element + its phase breakdown
const lcpEl = r0.audits["largest-contentful-paint-element"];
console.log(`\n--- LCP ELEMENT ---`);
const node = lcpEl?.details?.items?.[0]?.items?.[0]?.node;
console.log(`  ${node?.nodeLabel ?? "(none)"}\n  selector: ${node?.selector ?? "-"}`);
const phases = lcpEl?.details?.items?.[1]?.items ?? [];
for (const p of phases) console.log(`  ${String(p.phase).padEnd(18)} ${Math.round(p.timing)} ms`);

// ---- render blocking
console.log(`\n--- RENDER-BLOCKING RESOURCES ---`);
const rb = r0.audits["render-blocking-resources"]?.details?.items ?? [];
if (!rb.length) console.log("  none");
for (const i of rb) console.log(`  ${Math.round(i.wastedMs)}ms  ${String(i.totalBytes / 1024 | 0)}KB  ${i.url}`);

// ---- fonts
console.log(`\n--- FONT LOADING ---`);
const fd = r0.audits["font-display"];
console.log(`  font-display audit: ${fd?.score === 1 ? "PASS" : fd?.score == null ? "n/a (no blocking webfont)" : "FLAG"}`);
for (const i of r0.audits["font-display"]?.details?.items ?? []) console.log(`    ${Math.round(i.wastedMs)}ms  ${i.url}`);
const netItems = r0.audits["network-requests"]?.details?.items ?? [];
const fonts = netItems.filter((i) => /font|\.woff/i.test(`${i.mimeType} ${i.url}`));
console.log(`  font requests: ${fonts.length}`);
for (const f of fonts) console.log(`    ${Math.round((f.endTime ?? 0) - (f.startTime ?? 0))}ms  ${((f.transferSize ?? 0) / 1024).toFixed(1)}KB  ${f.url.replace(BASE, "")}`);
const preloads = (r0.audits["uses-rel-preload"]?.details?.items ?? []).length;
console.log(`  preload-LCP-candidate opportunities: ${preloads}`);

// ---- hero / images
console.log(`\n--- HERO + IMAGE CONTRIBUTION ---`);
const imgs = netItems.filter((i) => /^image\//.test(i.mimeType ?? ""));
console.log(`  image requests: ${imgs.length}, total ${(imgs.reduce((a, i) => a + (i.transferSize ?? 0), 0) / 1024).toFixed(1)}KB`);
for (const i of imgs.slice(0, 8)) console.log(`    ${((i.transferSize ?? 0) / 1024).toFixed(1)}KB  ${i.url.replace(BASE, "")}`);
for (const id of ["unsized-images", "offscreen-images", "modern-image-formats", "efficient-animated-content", "prioritize-lcp-image"]) {
  const a = r0.audits[id];
  if (a && a.score !== null && a.score < 1) console.log(`  FLAG ${id}: ${a.title} (${(a.details?.items ?? []).length} item(s))`);
}

// ---- third party
console.log(`\n--- THIRD-PARTY ---`);
const tp = r0.audits["third-party-summary"]?.details?.items ?? [];
if (!tp.length) console.log("  none detected");
for (const i of tp) console.log(`  ${i.entity?.text ?? i.entity} — ${Math.round(i.blockingTime)}ms blocking, ${((i.transferSize ?? 0) / 1024).toFixed(1)}KB`);
const offOrigin = [...new Set(netItems.map((i) => { try { return new URL(i.url).origin; } catch { return null; } }))].filter((o) => o && !BASE.startsWith(o));
console.log(`  off-origin origins: ${offOrigin.length ? offOrigin.join(", ") : "none"}`);

// ---- payload
console.log(`\n--- PAYLOAD ---`);
const byType = {};
for (const i of netItems) {
  const k = (i.resourceType ?? i.mimeType ?? "other").toLowerCase();
  byType[k] = (byType[k] ?? 0) + (i.transferSize ?? 0);
}
for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1]))
  console.log(`  ${k.padEnd(12)} ${(v / 1024).toFixed(1)}KB`);
console.log(`  TOTAL        ${(Object.values(byType).reduce((a, b) => a + b, 0) / 1024).toFixed(1)}KB`);

// ---- top opportunities
console.log(`\n--- TOP OPPORTUNITIES (by estimated saving) ---`);
const opps = Object.values(r0.audits)
  .filter((a) => a.details?.type === "opportunity" && (a.details.overallSavingsMs ?? 0) > 20)
  .sort((a, b) => (b.details.overallSavingsMs ?? 0) - (a.details.overallSavingsMs ?? 0));
if (!opps.length) console.log("  none above 20ms");
for (const a of opps.slice(0, 6)) console.log(`  ${Math.round(a.details.overallSavingsMs)}ms  ${a.title}`);

console.log(`\n  (reports in ${dir})`);
