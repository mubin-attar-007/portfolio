import { allWriting } from "@/lib/writing";
import { allNotes } from "@/lib/notes";
import { renderRssFeed, feedResponse, type FeedItem } from "@/lib/feed";
import { SITE } from "@/config/site";

/** Combined RSS 2.0 feed — writing + notes, newest first. Static (build-time). */
export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const [writing, notes] = await Promise.all([allWriting(), allNotes()]);

  const items: FeedItem[] = [
    ...writing.map((post) => ({
      title: post.title,
      url: `${SITE.url}/writing/${post.slug}`,
      date: post.date,
      category: post.category,
      description: post.summary,
    })),
    ...notes.map((note) => ({
      title: note.title,
      url: `${SITE.url}/notes/${note.slug}`,
      date: note.date,
      category: "note",
      description: `A short note on ${note.tags.join(", ")}.`,
    })),
  ];

  return feedResponse(
    renderRssFeed({
      title: `${SITE.name} — Writing & Notes`,
      link: SITE.url,
      selfUrl: `${SITE.url}/rss.xml`,
      description:
        "Essays, guides, and short notes on AI systems, evaluation, and honest ML.",
      items,
    }),
  );
}
