// Unit tests for the shared RSS builder (lib/feed.ts) — the one implementation
// behind /rss.xml and /writing/feed.xml. Run via:
//   node --import ./test/alias-loader.mjs --test "test/**/*.test.mts"

import test from "node:test";
import assert from "node:assert/strict";

import { escapeXml, byDateDesc, renderRssFeed, type FeedItem } from "../lib/feed.ts";

const item = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  title: "A title",
  url: "https://example.com/writing/a-title",
  date: "2026-01-02",
  category: "essay",
  description: "A description.",
  ...overrides,
});

test("escapeXml neutralises the characters that would break the document", () => {
  assert.equal(escapeXml("a & b"), "a &amp; b");
  assert.equal(escapeXml("<script>"), "&lt;script&gt;");
  assert.equal(escapeXml('say "hi"'), "say &quot;hi&quot;");
});

test("escapeXml escapes ampersands first, so entities are not double-escaped", () => {
  assert.equal(escapeXml("<a & b>"), "&lt;a &amp; b&gt;");
});

test("byDateDesc orders newest first", () => {
  assert.ok(byDateDesc({ date: "2026-01-01" }, { date: "2025-01-01" }) < 0);
  assert.ok(byDateDesc({ date: "2025-01-01" }, { date: "2026-01-01" }) > 0);
});

test("byDateDesc returns 0 for equal dates (a consistent comparator)", () => {
  assert.equal(byDateDesc({ date: "2026-01-01" }, { date: "2026-01-01" }), 0);
});

test("same-day entries keep their source order", () => {
  const same = "2026-03-04";
  const xml = renderRssFeed({
    title: "Feed",
    link: "https://example.com",
    selfUrl: "https://example.com/rss.xml",
    description: "d",
    items: [
      item({ title: "First", date: same }),
      item({ title: "Second", date: same }),
      item({ title: "Third", date: same }),
    ],
  });
  assert.ok(
    xml.indexOf("<title>First</title>") <
      xml.indexOf("<title>Second</title>") &&
      xml.indexOf("<title>Second</title>") < xml.indexOf("<title>Third</title>"),
    "stable sort must not reorder same-day items",
  );
});

test("renderRssFeed sorts items newest first regardless of input order", () => {
  const xml = renderRssFeed({
    title: "Feed",
    link: "https://example.com",
    selfUrl: "https://example.com/rss.xml",
    description: "d",
    items: [
      item({ title: "Older", date: "2024-05-06" }),
      item({ title: "Newer", date: "2026-05-06" }),
    ],
  });
  assert.ok(xml.indexOf("<title>Newer</title>") < xml.indexOf("<title>Older</title>"));
});

test("renderRssFeed escapes channel and item text", () => {
  const xml = renderRssFeed({
    title: "Mubin — Writing & Notes",
    link: "https://example.com",
    selfUrl: "https://example.com/rss.xml",
    description: "Essays & notes",
    items: [item({ title: "Tags <b> & things" })],
  });
  assert.ok(xml.includes("<title>Mubin — Writing &amp; Notes</title>"));
  assert.ok(xml.includes("<title>Tags &lt;b&gt; &amp; things</title>"));
  assert.ok(!xml.includes("<b>"), "raw markup must never reach the document");
});

test("renderRssFeed emits RFC-822 pubDates from ISO calendar dates", () => {
  const xml = renderRssFeed({
    title: "Feed",
    link: "https://example.com",
    selfUrl: "https://example.com/rss.xml",
    description: "d",
    items: [item({ date: "2026-01-02" })],
  });
  assert.ok(xml.includes("<pubDate>Fri, 02 Jan 2026 00:00:00 GMT</pubDate>"));
});
