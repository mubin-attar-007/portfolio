import { allWriting } from "@/lib/writing";
import { renderRssFeed, feedResponse } from "@/lib/feed";
import { SITE } from "@/config/site";

/** RSS 2.0 feed for the writing. Static — regenerated at build. */
export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  const posts = await allWriting();

  return feedResponse(
    renderRssFeed({
      title: `${SITE.name} — Writing`,
      link: `${SITE.url}/writing`,
      selfUrl: `${SITE.url}/writing/feed.xml`,
      description: "Essays, guides, and notes on AI systems, evaluation, and honest ML.",
      items: posts.map((post) => ({
        title: post.title,
        url: `${SITE.url}/writing/${post.slug}`,
        date: post.date,
        category: post.category,
        description: post.summary,
      })),
    }),
  );
}
