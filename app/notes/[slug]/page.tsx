import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routableNoteSlugs, loadNote, noteDescription, noteNeighbours } from "@/lib/notes";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ArticleLayout } from "@/components/writing/article-layout";
import { articleHeadings, relatedProject } from "@/components/writing/posts";
import { ARTICLE_META } from "@/content/article";
import { writingPage } from "@/content/pages/writing";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await routableNoteSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = await loadNote(slug);
  if (!n) return {};
  return pageMetadata({
    path: `/notes/${slug}`,
    title: n.meta.title,
    description: noteDescription(n.meta),
    article: { publishedTime: n.meta.date, tags: n.meta.tags },
  });
}

/**
 * A note (Clerk blog post, no cover): the summary as the lead when it has one,
 * tags as plain text, and the source link it reacts to.
 */
export default async function NotePost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await loadNote(slug);
  if (!n) notFound();
  const { meta, content, readingMinutes } = n;
  const { newer, older } = await noteNeighbours(slug);
  const url = absoluteUrl(`/notes/${slug}`);

  return (
    <>
      <ArticleJsonLd title={meta.title} description={noteDescription(meta)} url={url} datePublished={meta.date} />
      <BreadcrumbJsonLd
        items={[
          { name: "Notes", url: absoluteUrl("/notes") },
          { name: meta.title, url },
        ]}
      />
      <ArticleLayout
        collection="notes"
        slug={slug}
        title={meta.title}
        lede={meta.summary}
        date={meta.date}
        readingTime={readingMinutes > 0 ? ARTICLE_META.readingTime(readingMinutes) : undefined}
        category={writingPage.kind.note}
        cover={false}
        url={url}
        headings={articleHeadings("notes", slug)}
        related={relatedProject("notes", slug)}
        newer={newer}
        older={older}
        tags={meta.tags}
        source={meta.source}
      >
        {content}
      </ArticleLayout>
    </>
  );
}
