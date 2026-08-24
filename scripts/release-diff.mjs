// Release diff — compares the RENDERED OUTPUT of two running builds, route by
// route and surface by surface.
//
// Reading `git diff` tells you what a patch touched. This tells you what
// actually reaches a visitor and a crawler, which is the question a release
// gate is really asking. It caught nothing on the pass it was written for, and
// that null result IS the value: it is evidence that a 1,300-line patch left
// titles, descriptions, canonicals, robots directives, JSON-LD, external links
// and every route's visible copy byte-identical.
//
// Surfaces compared per route: title, description, canonical, robots, og:*,
// twitter:*, JSON-LD blocks, external hrefs, and chrome-stripped visible text
// (which is what catches an altered metric, project fact, or resume line).
// Also diffs sitemap.xml, robots.txt and both feeds, ignoring timestamps.
//
// Note on og:*/twitter:*: Next.js appends a per-build cache-bust query to
// generated OG image URLs, so those tags differ on every build. Compare the
// IMAGE BYTES, not the tag, before calling that a change — this script's
// companion check does exactly that.
//
// Usage — build and serve the OLD commit and the NEW one, then:
//   NEW_URL=http://127.0.0.1:3200 OLD_URL=http://127.0.0.1:3201 //     node scripts/release-diff.mjs
import { writeFileSync } from "node:fs";

const NEW = process.env.NEW_URL ?? "http://127.0.0.1:3200";
const OLD = process.env.OLD_URL ?? "http://127.0.0.1:3201";

const routes = (await (await fetch(`${NEW}/sitemap.xml`)).text())
  .match(/<loc>([^<]+)<\/loc>/g)
  .map((m) => m.replace(/<\/?loc>/g, "").replace(/^https?:\/\/[^/]+/, ""))
  .map((r) => (r === "" ? "/" : r));

const oldRoutes = (await (await fetch(`${OLD}/sitemap.xml`)).text())
  .match(/<loc>([^<]+)<\/loc>/g)
  .map((m) => m.replace(/<\/?loc>/g, "").replace(/^https?:\/\/[^/]+/, ""))
  .map((r) => (r === "" ? "/" : r));

const findings = [];
const note = (surface, route, detail) => findings.push({ surface, route, detail });

// ---- routes
const setNew = new Set(routes), setOld = new Set(oldRoutes);
for (const r of setOld) if (!setNew.has(r)) note("ROUTES", r, "REMOVED from sitemap");
for (const r of setNew) if (!setOld.has(r)) note("ROUTES", r, "ADDED to sitemap");

// ---- per-surface extractors
const meta = (html, name) => {
  const re = new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]*>`, "gi");
  return (html.match(re) ?? []).map((t) => (t.match(/content="([^"]*)"/) ?? [])[1] ?? "").sort();
};
const surfaces = {
  title: (h) => [(h.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? ""],
  description: (h) => meta(h, "description"),
  canonical: (h) => (h.match(/<link[^>]+rel="canonical"[^>]*>/gi) ?? []).map((t) => (t.match(/href="([^"]*)"/) ?? [])[1]),
  robots: (h) => meta(h, "robots"),
  "og:*": (h) => (h.match(/<meta[^>]+property="og:[^"]*"[^>]*>/gi) ?? []).sort(),
  "twitter:*": (h) => (h.match(/<meta[^>]+name="twitter:[^"]*"[^>]*>/gi) ?? []).sort(),
  "structured-data": (h) =>
    (h.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? [])
      .map((s) => s.replace(/<[^>]+>/g, "")),
  "external-links": (h) => [...new Set((h.match(/href="(https?:\/\/[^"]+)"/g) ?? []).map((s) => s.slice(6, -1)))].sort(),
  // Visible text, chrome stripped: catches project facts, eval metrics, resume content.
  "visible-copy": (h) =>
    [h.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
       .replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim()],
};

for (const route of routes) {
  const [a, b] = await Promise.all([
    fetch(`${NEW}${route}`).then((r) => r.text()),
    fetch(`${OLD}${route}`).then((r) => r.text()),
  ]);
  for (const [surface, get] of Object.entries(surfaces)) {
    const x = JSON.stringify(get(a)), y = JSON.stringify(get(b));
    if (x !== y) {
      let detail = `changed (new ${x.length}B vs old ${y.length}B)`;
      if (surface === "visible-copy") {
        const wa = get(a)[0].split(" "), wb = get(b)[0].split(" ");
        const onlyNew = wa.filter((w) => !wb.includes(w)).slice(0, 12);
        const onlyOld = wb.filter((w) => !wa.includes(w)).slice(0, 12);
        detail = `+[${onlyNew.join(" ")}] -[${onlyOld.join(" ")}]`;
      } else if (x.length < 700 && y.length < 700) {
        detail = `NEW ${x}\n        OLD ${y}`;
      }
      note(surface, route, detail);
    }
  }
}

// ---- non-route surfaces
for (const path of ["/sitemap.xml", "/robots.txt", "/rss.xml", "/writing/feed.xml"]) {
  const [a, b] = await Promise.all([
    fetch(`${NEW}${path}`).then((r) => r.text()),
    fetch(`${OLD}${path}`).then((r) => r.text()),
  ]);
  const norm = (s) => s.replace(/<lastmod>[^<]*<\/lastmod>|<lastBuildDate>[^<]*<\/lastBuildDate>|<pubDate>[^<]*<\/pubDate>/g, "");
  if (norm(a) !== norm(b)) note("FEEDS", path, `changed (${a.length}B vs ${b.length}B)`);
}

writeFileSync(process.env.OUT ?? "release-diff.json", JSON.stringify(findings, null, 1));
console.log(`Routes compared: ${routes.length} (old sitemap: ${oldRoutes.length})`);
if (findings.length === 0) { console.log("\nIDENTICAL across every surface."); }
else {
  const bySurface = {};
  for (const f of findings) (bySurface[f.surface] ??= []).push(f);
  for (const [s, list] of Object.entries(bySurface)) {
    console.log(`\n### ${s} — ${list.length} route(s)`);
    for (const f of list.slice(0, 6)) console.log(`  ${f.route}\n        ${f.detail}`);
    if (list.length > 6) console.log(`  ... +${list.length - 6} more`);
  }
}
