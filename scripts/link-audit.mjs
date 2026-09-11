// Crawl the sitemap and all discovered same-site links, including fragments.
// BASE_URL=http://127.0.0.1:3200 node scripts/link-audit.mjs
// External links and form/API submissions are intentionally outside this gate.
import { chromium } from "playwright";

const BASE = new URL(process.env.BASE_URL ?? "http://127.0.0.1:3200");
const browser = await chromium.launch();
const page = await browser.newPage();
const pending = new Set(["/", "/dev/components", "/talks", "/timeline", "/changelog"]);
const checked = new Map();
const fragments = [];
const failures = [];
let links = 0;

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
          hrefs: Array.from(doc.querySelectorAll("a[href]"), (a) => a.getAttribute("href")),
          ids: Array.from(doc.querySelectorAll("[id], a[name]"), (el) => el.id || el.getAttribute("name")),
        };
      }, html);
      checked.set(path, { ids: new Set(document.ids) });
      const resolvedPage = new URL(response.url);
      for (const href of document.hrefs) {
        if (!href) continue;
        const target = new URL(href, resolvedPage);
        if (!origins.has(target.origin)) continue;
        // The assistant endpoint is intentionally POST-only; a crawl must not
        // turn this read-only check into an API operation.
        if (target.pathname.startsWith("/api/")) continue;
        const targetPath = target.pathname + target.search;
        pending.add(targetPath);
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

  for (const fragment of fragments) {
    const target = checked.get(fragment.target);
    if (target?.ids && !target.ids.has(fragment.id)) {
      failures.push(`${fragment.from} → ${fragment.target}#${fragment.id}: missing fragment`);
    }
  }
  console.log(`${checked.size} same-site pages/assets, ${links} link references, ${fragments.length} fragment references checked.`);
  console.log(`${failures.length} broken destinations.`);
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
