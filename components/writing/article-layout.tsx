import type { ReactNode } from "react";
import Link from "next/link";
import { ARTICLE_META } from "@/content/article";
import { Section } from "@/components/layout/section";
import { PAGE_TOP } from "@/constants/page";
import { articlePage } from "@/content/pages/writing";
import type { Project } from "@/content/schema";
import { ArticleFooter } from "@/components/ui/article-footer";
import { ArrowOut } from "@/components/ui/caret-link";
import type { TocItem } from "@/components/ui/toc";
import { ArticleEnd } from "./article-end";
import { ArticleSidebar, ArticleTools } from "./article-sidebar";
import { formatPostDate } from "./format";
import { PostCover } from "./post-cover";

type Neighbour = { slug: string; title: string } | null;

/**
 * ArticleLayout — the Clerk blog post: back link, date and reading time, the
 * title and lead, a typeset cover (essays and guides), the ~680px body, a
 * sticky sidebar from `xl`, and the post's ending (share, related project, CTA,
 * newer/older).
 *
 * Grid: header across the main column; from `xl` the sidebar takes a 280px
 * right column starting level with the cover (or the body, for a note). Below
 * `xl` the category and "Ask AI about this" close the header instead
 * (`ArticleTools`), so they sit in the DOM where they are seen and Tab reaches
 * them after the lead, not after the whole article.
 *
 * A11y: one `<article>` holding the h1 and the body; the sidebar is a
 * complementary landmark beside it. Performance: server-rendered; the h1 is
 * static text (the LCP element) and nothing animates in.
 */
export function ArticleLayout({
  collection,
  slug,
  title,
  lede,
  date,
  updated,
  readingTime,
  category,
  cover,
  url,
  headings,
  related,
  newer,
  older,
  tags = [],
  source,
  children,
}: {
  collection: "writing" | "notes";
  slug: string;
  title: string;
  lede?: string;
  date: string;
  updated?: string;
  readingTime?: string;
  category: string;
  cover: boolean;
  url: string;
  headings: TocItem[];
  related: Project | null;
  newer: Neighbour;
  older: Neighbour;
  /** A note's tags, shown as plain text in the meta row. */
  tags?: readonly string[];
  /** The external link a note reacts to. */
  source?: string;
  children: ReactNode;
}) {
  const path = `/${collection}/${slug}`;
  return (
    <Section space="lg" className={PAGE_TOP}>
      <Link
        href={`/${collection}`}
        prefetch={false}
        className="group inline-flex min-h-6 items-center gap-2 text-sm font-medium text-ink transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink-secondary"
      >
        <span aria-hidden="true" className="caret-swap rotate-180" />
        {articlePage.back[collection]}
      </Link>

      <div className="mt-12 grid gap-x-20 gap-y-10 xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* The article spans both rows of the main column and passes them to
            its children (subgrid), so the sidebar can start level with the
            cover while staying OUTSIDE the article: a complementary landmark
            belongs at the top level. */}
        <article className="contents xl:col-start-1 xl:row-span-2 xl:grid xl:grid-rows-subgrid">
          <header className="max-w-[680px]">
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-secondary">
              <time dateTime={date}>{formatPostDate(date)}</time>
              {readingTime ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{readingTime}</span>
                </>
              ) : null}
              {updated ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {articlePage.updated}{" "}
                    <time dateTime={updated}>{formatPostDate(updated)}</time>
                  </span>
                </>
              ) : null}
              {tags.length > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{tags.map((t) => `#${t}`).join(" ")}</span>
                </>
              ) : null}
              {source ? (
                <>
                  <span aria-hidden="true">·</span>
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-ink underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-[var(--ease-out)] hover:decoration-accent"
                  >
                    {ARTICLE_META.source}
                    <span className="sr-only"> (opens in a new tab)</span>
                    <ArrowOut />
                  </a>
                </>
              ) : null}
            </p>
            <h1 className="mt-5 text-[2rem] leading-[1.2] font-bold tracking-[-0.03em] text-balance text-ink sm:text-[2.5rem]">
              {title}
            </h1>
            {lede ? (
              <p className="mt-5 text-[1.0625rem] leading-[1.55] text-ink-secondary sm:text-[1.1875rem]">
                {lede}
              </p>
            ) : null}
            <ArticleTools category={category} url={url} className="mt-10 xl:hidden" />
          </header>

          <div className="min-w-0">
            {cover ? (
              <PostCover
                slug={slug}
                title={title}
                className="mb-12 max-w-[820px]"
              />
            ) : null}
            {/* The MDX body owns its internal rhythm (components/mdx/prose.ts). */}
            <div className="max-w-[680px] [&>:first-child]:mt-0">
              {children}
            </div>
            <ArticleEnd path={path} related={related} />
            <ArticleFooter
              collection={collection}
              previous={newer}
              next={older}
            />
          </div>
        </article>

        <div className="hidden xl:col-start-2 xl:row-start-2 xl:block">
          <ArticleSidebar
            category={category}
            url={url}
            headings={headings}
          />
        </div>
      </div>
    </Section>
  );
}
