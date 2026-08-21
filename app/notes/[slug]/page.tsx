import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PAGE_TOP } from "@/constants/page";
import { routableNoteSlugs, loadNote, noteNeighbours } from "@/lib/notes";
import { formatDate } from "@/lib/format";
import { SITE } from "@/config/site";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import {
  NewsletterForm,
  NEWSLETTER_ENABLED,
} from "@/components/features/newsletter-form";
import { ArticleHeader } from "@/components/ui/article-header";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArticleFooter } from "@/components/ui/article-footer";
import { ARTICLE_KICKER, ARTICLE_META } from "@/content/article";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await routableNoteSlugs()).map((slug) => ({ slug }));
}

const describe = (tags: string[]) => `A short note on ${tags.join(", ")}.`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = await loadNote(slug);
  if (!n) return {};
  const url = `${SITE.url}/notes/${slug}`;
  const description = describe(n.meta.tags);
  return {
    title: n.meta.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE.name,
      title: n.meta.title,
      description,
      url,
      publishedTime: n.meta.date,
      tags: n.meta.tags,
      authors: [SITE.name],
    },
  };
}

export default async function NotePost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await loadNote(slug);
  if (!n) notFound();
  const { meta, content, readingMinutes } = n;
  // Notes are sorted newest-first — same mapping as /writing.
  const { newer, older } = await noteNeighbours(slug);
  const url = `${SITE.url}/notes/${slug}`;

  return (
    // PAGE_TOP: every route opens 128px from the nav; `space="lg"`'s 192 top
    // made the article templates the only pages that started a step lower.
    // The band keeps `lg`'s 208px close — it is the whole page.
    <Section space="lg" className={PAGE_TOP}>
      <ArticleJsonLd
        title={meta.title}
        description={describe(meta.tags)}
        url={url}
        datePublished={meta.date}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Notes", url: `${SITE.url}/notes` },
          { name: meta.title, url },
        ]}
      />
      <Breadcrumb parent={{ label: "Notes", href: "/notes" }} current={meta.title} />
      <article className="max-w-[var(--width-prose)]">
        <ArticleHeader
          kicker={ARTICLE_KICKER.note}
          title={meta.title}
          meta={[
            <time key="date" dateTime={meta.date}>
              {formatDate(meta.date)}
            </time>,
            readingMinutes > 0 ? (
              <span key="reading">{ARTICLE_META.readingTime(readingMinutes)}</span>
            ) : null,
            // Tags are one meta ITEM, not one per tag: they are a single facet
            // of the note, and splitting them would let the interpunct
            // separators imply four unrelated facts.
            <span key="tags" className="flex flex-wrap gap-x-2 gap-y-1">
              {meta.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </span>,
            meta.source ? (
              <a
                key="source"
                href={meta.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-[var(--ease-out)] hover:text-accent hover:decoration-accent"
              >
                {ARTICLE_META.source}
                <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden />
              </a>
            ) : null,
          ]}
        />
        <div className="mt-10">{content}</div>
      </article>
      {NEWSLETTER_ENABLED ? (
        <div className="mt-20 max-w-[var(--width-prose)] border-t border-border pt-8">
          <NewsletterForm />
        </div>
      ) : null}
      <ArticleFooter collection="notes" previous={newer} next={older} />
    </Section>
  );
}
