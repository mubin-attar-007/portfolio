import test from "node:test";
import assert from "node:assert/strict";

import { FOOTER_NAV, NAV } from "../config/nav.ts";
import { ARTICLE_KICKER } from "../content/article.ts";

test("global navigation stays focused on the primary hiring path", () => {
  const headerHrefs = NAV.map((item) => item.href);
  const footerHrefs = FOOTER_NAV.flatMap((group) =>
    group.links.map((item) => item.href),
  );

  assert.equal(new Set(headerHrefs).size, headerHrefs.length);
  assert.equal(new Set(footerHrefs).size, footerHrefs.length);
  assert.ok(footerHrefs.length <= 8, "footer must remain a shortlist, not a sitemap");

  for (const supportingRoute of ["/skills", "/uses", "/timeline", "/talks"]) {
    assert.equal(
      headerHrefs.includes(supportingRoute as (typeof headerHrefs)[number]),
      false,
      `${supportingRoute} must not compete in the primary navigation`,
    );
    assert.equal(
      footerHrefs.includes(supportingRoute as (typeof footerHrefs)[number]),
      false,
      `${supportingRoute} must remain contextually discoverable, not globally promoted`,
    );
  }
});

test("one-minute writing is labelled as brief", () => {
  assert.equal(ARTICLE_KICKER.writing("essay", 1), "Brief Essay");
  assert.equal(ARTICLE_KICKER.writing("guide", 3), "Guide");
});
