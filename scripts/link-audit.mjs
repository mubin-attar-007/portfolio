// Crawl the sitemap and all discovered same-site links, including fragments.
// BASE_URL=http://127.0.0.1:3200 node scripts/link-audit.mjs
// External links are never fetched, and form/API submissions are outside this
// gate; every link's markup is still held to the arrow law (arrowLaw below).
import { chromium } from "playwright";

const BASE = new URL(process.env.BASE_URL ?? "http://127.0.0.1:3200");
const browser = await chromium.launch();
const page = await browser.newPage();
// The flagship case studies (content/flagship): in the sitemap, and linked from
// the homepage, /work and the nav. The anonymous field-report addresses they
// replaced redirect to them (next.config.ts), so old links still land.
const FLAGSHIPS = ["/work/bench-discovery", "/work/careltc", "/work/signflow"];
const RETIRED_FIELD_REPORTS = ["/work/field/records-triage", "/work/field/nfc-room-rounds"];
// The sitemap seeds the crawl; these are pages it does not list but a visitor
// can still reach: the component preview and the old paths that redirect.
const pending = new Set(["/", "/dev/components", "/talks", "/timeline", "/changelog", ...RETIRED_FIELD_REPORTS]);
const checked = new Map();
// Every same-site path some page links to: a page only the sitemap names is
// one no visitor can reach.
const linked = new Set();
const fragments = [];
const failures = [];
let links = 0;

/**
 * The arrow law (design-system.md §11.4): a link to another site opens a new
 * tab, a new tab always carries rel="noopener", and ↗ marks exactly the links
 * that open a new tab or a mail client, never one that stays in this tab. Read
 * from the server-rendered HTML, so links that exist only after hydration (the
 * assistant's next steps) are outside it; the panel re-checks those itself.
 * One failure per link and problem, however many pages repeat it (the footer).
 */
const arrowFailures = new Map();
let outbound = 0;
function arrowLaw(from, target, anchor, origins) {
  const external = /^https?:$/.test(target.protocol) && !origins.has(target.origin);
  const mail = target.protocol === "mailto:";
  const newTab = anchor.target === "_blank";
  if (external || mail || newTab) outbound += 1;
  const problems = [];
  if (external && !newTab) problems.push("goes to another site without opening a new tab");
  if (newTab && !/\bnoopener\b|\bnoreferrer\b/.test(anchor.rel)) problems.push('opens a new tab without rel="noopener"');
  if ((newTab || mail) && !anchor.arrow) problems.push("opens a new tab or a mail client without ↗");
  if (!newTab && !mail && anchor.arrow) problems.push("carries ↗ but stays in this tab");
  for (const problem of problems) {
    const key = `${anchor.href}|${anchor.name}|${problem}`;
    if (!arrowFailures.has(key)) arrowFailures.set(key, `${from}: "${anchor.name}" (${anchor.href}) ${problem}`);
  }
}

try {
  const sitemapResponse = await fetch(new URL("/sitemap.xml", BASE));
  if (!sitemapResponse.ok) throw new Error(`sitemap returned ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  if (urls.length === 0) throw new Error("sitemap contained no pages");
  const origins = new Set([BASE.origin, ...urls.map((url) => url.origin)]);
  for (const url of urls) pending.add(url.pathname + url.search);

  // Adding to this Set extends the traversal; each path is fetched once even
  // when many pages link to it or to different fragments within it.
  for (const path of pending) {
    try {
      const response = await fetch(new URL(path, BASE), { signal: AbortSignal.timeout(30000) });
      if (!response.ok) {
        failures.push(`${path}: HTTP ${response.status}`);
        checked.set(path, null);
        continue;
      }
      if (!response.headers.get("content-type")?.includes("text/html")) {
        checked.set(path, { ids: null });
        await response.body?.cancel();
        continue;
      }
      const html = await response.text();
      // Parse an inert document: no scripts execute and no page is navigated.
      const document = await page.evaluate((source) => {
        const doc = new DOMParser().parseFromString(source, "text/html");
        return {
          anchors: Array.from(doc.querySelectorAll("a[href]"), (a) => ({
            href: a.getAttribute("href"),
            target: a.getAttribute("target"),
            rel: a.getAttribute("rel") ?? "",
            // ArrowOut renders `.arrow-out`; a glyph typed into the text counts too.
            arrow: a.querySelector(".arrow-out") !== null || (a.textContent ?? "").includes("↗"),
            name: (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
          })),
          ids: Array.from(doc.querySelectorAll("[id], a[name]"), (el) => el.id || el.getAttribute("name")),
        };
      }, html);
      checked.set(path, { ids: new Set(document.ids) });
      const resolvedPage = new URL(response.url);
      for (const anchor of document.anchors) {
        const { href } = anchor;
        if (!href) continue;
        const target = new URL(href, resolvedPage);
        arrowLaw(path, target, anchor, origins);
        if (!origins.has(target.origin)) continue;
        // The assistant endpoint is intentionally POST-only; a crawl must not
        // turn this read-only check into an API operation.
        if (target.pathname.startsWith("/api/")) continue;
        const targetPath = target.pathname + target.search;
        pending.add(targetPath);
        linked.add(targetPath);
        links += 1;
        if (target.hash.length > 1) {
          fragments.push({ from: path, target: targetPath, id: decodeURIComponent(target.hash.slice(1)) });
        }
      }
    } catch (error) {
      failures.push(`${path}: ${error.message}`);
      checked.set(path, null);
    }
  }

  // The flagships lead the site, so each must be linked from a page, not only
  // listed in the sitemap, and must have been fetched and parsed. Missing one
  // means its links went missing, or this gate silently stopped checking it.
  const flagshipsReached = FLAGSHIPS.filter((path) => linked.has(path) && checked.get(path)?.ids);
  for (const path of FLAGSHIPS.filter((flagship) => !flagshipsReached.includes(flagship))) {
    failures.push(`${path}: the flagship case study was not reached through a link from any page`);
  }

  for (const fragment of fragments) {
    const target = checked.get(fragment.target);
    if (target?.ids && !target.ids.has(fragment.id)) {
      failures.push(`${fragment.from} → ${fragment.target}#${fragment.id}: missing fragment`);
    }
  }
  failures.push(...arrowFailures.values());
  console.log(
    `${checked.size} same-site pages/assets (${flagshipsReached.length}/${FLAGSHIPS.length} flagship case studies ` +
      `linked; ${RETIRED_FIELD_REPORTS.length} retired field-report addresses), ${links} link references, ` +
      `${fragments.length} fragment references checked; ${outbound} new-tab, mail and outbound links held to the arrow law.`,
  );
  console.log(`${failures.length} broken destinations, missing fragments or links against the arrow law.`);
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
