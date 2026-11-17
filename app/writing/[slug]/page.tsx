import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routableWritingSlugs, loadWriting, writingNeighbours } from "@/lib/writing";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ArticleLayout } from "@/components/writing/article-layout";
import { articleHeadings, relatedProject } from "@/components/writing/posts";
import { ARTICLE_META } from "@/content/article";
import { writingPage } from "@/content/pages/writing";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await routableWritingSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = await loadWriting(slug);
  if (!w) return {};
  return pageMetadata({
    path: `/writing/${slug}`,
    title: w.meta.title,
    description: w.meta.summary,
    article: { publishedTime: w.meta.date, modifiedTime: w.meta.updated, tags: w.meta.topics },
  });
}

/** An essay or guide (Clerk blog post): cover, body, sticky sidebar. */
export default async function WritingPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await loadWriting(slug);
  if (!w) notFound();
  const { meta, content, readingMinutes } = w;
  // Writing is sorted newest-first: the entry BEFORE this one is the newer one.
  const { newer, older } = await writingNeighbours(slug);
  const url = absoluteUrl(`/writing/${slug}`);

  return (
    <>
      <ArticleJsonLd
        title={meta.title}
        description={meta.summary}
        url={url}
        datePublished={meta.date}
        dateModified={meta.updated}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Writing", url: absoluteUrl("/writing") },
          { name: meta.title, url },
        ]}
      />
      <ArticleLayout
        collection="writing"
        slug={slug}
        title={meta.title}
        lede={meta.summary}
        date={meta.date}
        updated={meta.updated}
        readingTime={readingMinutes > 0 ? ARTICLE_META.readingTime(readingMinutes) : undefined}
        category={writingPage.kind[meta.category]}
        cover={meta.category !== "note"}
        url={url}
        headings={articleHeadings("writing", slug)}
        related={relatedProject("writing", slug)}
        newer={newer}
        older={older}
      >
        {content}
      </ArticleLayout>
    </>
  );
}
