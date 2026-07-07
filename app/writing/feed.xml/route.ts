import { allWriting } from "@/lib/writing";
import { SITE } from "@/config/site";

/** RSS 2.0 feed for the writing. Static — regenerated at build. */
export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = await allWriting();
  const items = posts
    .map((p) => {
      const url = `${SITE.url}/writing/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} — Writing</title>
    <link>${SITE.url}/writing</link>
    <atom:link href="${SITE.url}/writing/feed.xml" rel="self" type="application/rss+xml" />
    <description>Essays, guides, and notes on AI systems, evaluation, and honest ML.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
