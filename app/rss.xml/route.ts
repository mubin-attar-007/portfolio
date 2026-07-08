import { allWriting } from "@/lib/writing";
import { allNotes } from "@/lib/notes";
import { SITE } from "@/config/site";

/** Combined RSS 2.0 feed — writing + notes, newest first. Static (build-time). */
export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Item = { title: string; url: string; date: string; category: string; description: string };

export async function GET() {
  const [writing, notes] = await Promise.all([allWriting(), allNotes()]);

  const items: Item[] = [
    ...writing.map((p) => ({
      title: p.title,
      url: `${SITE.url}/writing/${p.slug}`,
      date: p.date,
      category: p.category,
      description: p.summary,
    })),
    ...notes.map((n) => ({
      title: n.title,
      url: `${SITE.url}/notes/${n.slug}`,
      date: n.date,
      category: "note",
      description: `A short note on ${n.tags.join(", ")}.`,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const body = items
    .map(
      (it) => `    <item>
      <title>${esc(it.title)}</title>
      <link>${it.url}</link>
      <guid isPermaLink="true">${it.url}</guid>
      <pubDate>${new Date(`${it.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${esc(it.category)}</category>
      <description>${esc(it.description)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} — Writing &amp; Notes</title>
    <link>${SITE.url}</link>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Essays, guides, and short notes on AI systems, evaluation, and honest ML.</description>
    <language>en</language>
${body}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
