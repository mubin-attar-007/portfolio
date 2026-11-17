import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { pages } from "@/content/site";
import { writingPage } from "@/content/pages/writing";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { allPosts } from "@/components/writing/posts";
import { WritingIndex } from "@/components/writing/writing-index";

export const metadata: Metadata = pageMetadata({
  path: "/writing",
  title: writingPage.meta.title,
  description: writingPage.meta.description,
  // The essays-only feed, besides the combined one every page advertises.
  feeds: [{ url: absoluteUrl(pages.writing.feedHref), title: `${SITE.name} — Writing` }],
});

/**
 * /writing — every essay, guide and note (Clerk Blog). Static: `?type=` is
 * applied by the filter island on the client, so the page stays prerendered.
 */
export default async function WritingPage() {
  return <WritingIndex posts={await allPosts()} syncUrl />;
}
