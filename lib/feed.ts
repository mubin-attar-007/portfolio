// -----------------------------------------------------------------------------
// RSS 2.0 feed rendering — the single implementation behind /rss.xml and
// /writing/feed.xml.
//
// Both routes previously carried their own copy of the escaper, the item
// template, the channel envelope, and the response headers. One divergence
// between them (a missed escape, a different date format) would ship invalid
// XML to every reader, so the builder lives here and the routes only supply
// data. Pure and dependency-free, which also makes it testable under
// `node --test` without the MDX pipeline.
// -----------------------------------------------------------------------------

/** One syndicated entry. `date` is an ISO calendar date (YYYY-MM-DD). */
export type FeedItem = {
  title: string;
  /** Absolute URL — used as both <link> and the permalink <guid>. */
  url: string;
  date: string;
  category: string;
  description: string;
};

/** The channel envelope around a set of items. */
export type FeedChannel = {
  title: string;
  /** Absolute URL of the page this feed syndicates. */
  link: string;
  /** Absolute URL of the feed itself, for <atom:link rel="self">. */
  selfUrl: string;
  description: string;
  items: FeedItem[];
};

/**
 * Escape the characters that are unsafe in XML text and double-quoted attribute
 * values. `&` must be replaced first or it would double-escape the entities we
 * emit. Apostrophes are left alone — they are legal in both positions here, and
 * escaping them would only churn the output of every existing feed entry.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Newest-first comparator for anything carrying an ISO calendar date.
 *
 * Returns 0 for equal dates. That matters: a comparator that answers -1 for
 * equal inputs is inconsistent, and the engine is free to produce a different
 * order for the same input. With 0, `Array.prototype.sort` (stable per spec)
 * keeps same-day entries in the order the caller supplied them.
 *
 * ISO-8601 dates are zero-padded, so lexicographic order is chronological order
 * and no Date parsing is needed.
 */
export function byDateDesc(a: { date: string }, b: { date: string }): number {
  if (a.date < b.date) return 1;
  if (a.date > b.date) return -1;
  return 0;
}

/** Render one <item> element. */
function renderItem(item: FeedItem): string {
  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <description>${escapeXml(item.description)}</description>
    </item>`;
}

/**
 * Render a complete RSS 2.0 document. Items are emitted newest first; the
 * caller does not need to pre-sort.
 */
export function renderRssFeed(channel: FeedChannel): string {
  const body = [...channel.items].sort(byDateDesc).map(renderItem).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(channel.description)}</description>
    <language>en</language>
${body}
  </channel>
</rss>`;
}

/** Wrap rendered feed XML in a Response with the correct content type. */
export function feedResponse(xml: string): Response {
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
