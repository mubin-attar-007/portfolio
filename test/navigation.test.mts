import test from "node:test";
import assert from "node:assert/strict";

import { ABOUT_MENU, FOOTER_NAV, NAV, NAV_ACTIONS, NAV_LINKS, PUBLIC_WORK, WORK_ITEMS, WORK_MENU } from "../config/nav.ts";
import { projects } from "../content/projects.ts";
import { ARTICLE_KICKER } from "../content/article.ts";

test("global navigation: unique destinations and a curated footer", () => {
  const header = [
    ...WORK_MENU.groups.flatMap((g) => g.items.map((i) => i.href)),
    WORK_MENU.footer.href,
    ...NAV_LINKS.map((i) => i.href),
    ...ABOUT_MENU.items.map((i) => i.href),
    ...NAV_ACTIONS.map((i) => i.href),
  ];
  const footer = FOOTER_NAV.flatMap((group) => group.links.map((item) => item.href));

  assert.equal(new Set(header).size, header.length, "header destinations are unique");
  assert.equal(new Set(footer).size, footer.length, "footer destinations are unique");
  assert.equal(new Set(NAV.map((i) => i.href)).size, NAV.length);
  assert.ok(footer.length <= 24, "the footer is a curated Clerk-style map (ADR-012), not a sitemap");
  assert.equal(header.includes("/skills"), false, "/skills stays out of the header (reached from the footer and the pages)");
});

test("the Work menu and sub-nav list every public project, from the registry", () => {
  assert.deepEqual(
    PUBLIC_WORK.map((i) => i.slug).sort(),
    projects.map((p) => p.slug).sort(),
    "every project in content/projects.ts has a Work menu line",
  );
  for (const item of PUBLIC_WORK) {
    assert.equal(item.label, projects.find((p) => p.slug === item.slug)?.title);
    assert.equal(item.href, `/work/${item.slug}`);
  }
  assert.equal(WORK_ITEMS.length, PUBLIC_WORK.length + 2, "the sub-nav adds the two field reports");
});

test("one-minute writing is labelled as brief", () => {
  assert.equal(ARTICLE_KICKER.writing("essay", 1), "Brief Essay");
  assert.equal(ARTICLE_KICKER.writing("guide", 3), "Guide");
});
