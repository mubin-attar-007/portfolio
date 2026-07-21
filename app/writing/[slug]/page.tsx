import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { PAGE_TOP } from "@/constants/page";
import { routableWritingSlugs, loadWriting, writingNeighbours } from "@/lib/writing";
import { formatDate } from "@/lib/format";
import { SITE } from "@/config/site";
import { ArticleJsonLd } from "@/components/seo/json-ld";
import { NewsletterForm } from "@/components/features/newsletter-form";
import { PostCover } from "@/components/features/post-cover";
import { ArticleHeader } from "@/components/ui/article-header";
import { ArticleFooter } from "@/components/ui/article-footer";
import { ARTICLE_META } from "@/content/article";
import { home } from "@/content/site";
import { AuditLane } from "@/components/features/audit-lane";

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
  const url = `${SITE.url}/writing/${slug}`;
  return {
    title: w.meta.title,
    description: w.meta.summary,
    alternates: { canonical: url },
    openGraph: { type: "article", title: w.meta.title, description: w.meta.summary, url },
  };
}

export default async function WritingPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await loadWriting(slug);
  if (!w) notFound();
  const { meta, content, readingMinutes } = w;
  // Writing is sorted newest-first, so the entry BEFORE this one in the index is
  // the newer one — the footer labels that direction "Newer" for this collection.
  const { newer, older } = await writingNeighbours(slug);
  const url = `${SITE.url}/writing/${slug}`;

  return (
    // PAGE_TOP: every route opens 128px from the nav; `space="lg"`'s 192 top
    // made the article templates the only pages that started a step lower.
    // The band keeps `lg`'s 208px close — it is the whole page.
    <Section space="lg" className={PAGE_TOP}>
      <ArticleJsonLd
        title={meta.title}
        description={meta.summary}
        url={url}
        datePublished={meta.date}
        dateModified={meta.updated}
      />
      <article className="max-w-[var(--width-prose)]">
        {/* Article cover — same slug seed as the index card, so the essay and
            its card share one identity. Above the header because it is this
            page's masthead, not evidence inside the argument. */}
        <div className="mb-10 aspect-[16/7] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-subtle shadow-[var(--shadow-sm)]">
          <PostCover slug={slug} category={meta.category} />
        </div>
        <ArticleHeader
          kicker={meta.category}
          title={meta.title}
          lede={meta.summary}
          meta={[
            <time key="date" dateTime={meta.date}>
              {formatDate(meta.date)}
            </time>,
            meta.updated ? (
              <time key="updated" dateTime={meta.updated}>
                {ARTICLE_META.updated(formatDate(meta.updated))}
              </time>
            ) : null,
            readingMinutes > 0 ? (
              <span key="reading">{ARTICLE_META.readingTime(readingMinutes)}</span>
            ) : null,
          ]}
        />
        <AuditLane
          title="Audit lane"
          items={[
            ...home.proof.stats.map((stat) => ({
              href: stat.href,
              value: stat.value,
              label: stat.label,
            })),
            { href: "/trust", label: "trust policy" },
            { href: "/changelog", label: "changelog" },
          ]}
          className="mt-8"
        />
        {/* The MDX body owns its own internal rhythm (components/mdx/prose.ts);
            this only sets the gap between the header and the first block. */}
        <div className="mt-10">{content}</div>
      </article>
      <div className="mt-20 max-w-[var(--width-prose)] border-t border-border pt-8">
        <NewsletterForm />
      </div>
      <ArticleFooter collection="writing" previous={newer} next={older} />
    </Section>
  );
}
