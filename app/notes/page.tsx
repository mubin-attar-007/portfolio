import type { Metadata } from "next";
import { writingPage } from "@/content/pages/writing";
import { pageMetadata } from "@/lib/seo";
import { allPosts } from "@/components/writing/posts";
import { WritingIndex } from "@/components/writing/writing-index";

export const metadata: Metadata = pageMetadata({
  path: "/notes",
  title: writingPage.notesMeta.title,
  description: writingPage.notesMeta.description,
});

/**
 * /notes — the writing index with Notes preselected, filtered on the server.
 * The same page as /writing rather than a redirect, so /notes keeps its own
 * title, description and social card, and its URL and /notes/[slug] stay put.
 */
export default async function NotesPage() {
  return <WritingIndex posts={await allPosts()} initial="note" />;
}
