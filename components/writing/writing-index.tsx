import Link from "next/link";
import { Rss } from "lucide-react";
import { Section } from "@/components/layout/section";
import { NewsletterForm } from "@/components/features/newsletter-form";
import { Caret } from "@/components/ui/caret-link";
import { PageHeader } from "@/components/ui/page-header";
import { writingPage, type PostFilter } from "@/content/pages/writing";
import { formatPostDate } from "./format";
import { PostCover } from "./post-cover";
import { FEATURED_COUNT, type PostSummary } from "./posts";
import { WritingFilters } from "./writing-filters";

const TARGET_ID = "writing-posts";

/**
 * WritingIndex — /writing and /notes (prototype `writing.html`, Clerk Blog):
 * an RSS link, the page header, type chips, three featured covers (the latest
 * essays and guides), the full list, newest first, and — only once the
 * Buttondown list is connected — the newsletter sign-up at its foot.
 *
 * Everything is server-rendered; `initial` preselects a type by rendering the
 * other posts `hidden`, so /notes is filtered before any JS runs. The chips
 * are the only client island (WritingFilters).
 *
 * Performance: the h1 is the LCP element and nothing above it loads late; the
 * covers are CSS/SVG. A11y: featured titles are h2s under the page's h1; the
 * list is a named list; each post is one link and one tab stop.
 */
export function WritingIndex({
  posts,
  initial = "all",
  syncUrl = false,
}: {
  posts: PostSummary[];
  initial?: PostFilter;
  syncUrl?: boolean;
}) {
  const featured = posts.filter((p) => p.kind !== "note").slice(0, FEATURED_COUNT);
  const hiddenFor = (p: PostSummary) => initial !== "all" && p.kind !== initial;
  const featuredHidden = featured.every(hiddenFor);

  return (
    <Section space="lg" className="!pt-0">
      <div className="flex justify-end pt-5">
        <a
          href={writingPage.rss.href}
          className="inline-flex min-h-6 items-center gap-2 text-sm font-medium text-ink transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink-secondary"
        >
          <span aria-hidden="true" className="grid size-[18px] place-items-center rounded-[var(--radius-xs)] bg-ink text-white">
            <Rss size={12} strokeWidth={2} />
          </span>
          {writingPage.rss.label}
        </a>
      </div>

      <PageHeader kicker={writingPage.kicker} title={writingPage.title} lede={writingPage.lede} className="pt-10 pb-12 sm:pb-16" />

      <div id={TARGET_ID}>
        <div className="mb-10">
          <WritingFilters targetId={TARGET_ID} initial={initial} syncUrl={syncUrl} />
        </div>

        <section aria-label={writingPage.featuredLabel} data-filter-group hidden={featuredHidden}>
          <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
            {featured.map((post) => (
              <li key={post.href} data-kind={post.kind} hidden={hiddenFor(post)}>
                <FeaturedPost post={post} />
              </li>
            ))}
          </ul>
        </section>

        <ul data-list aria-label={writingPage.listLabel} className="mt-16 sm:mt-20">
          {posts.map((post) => (
            <li key={post.href} data-kind={post.kind} hidden={hiddenFor(post)}>
              <PostRow post={post} />
            </li>
          ))}
        </ul>
      </div>

      <NewsletterForm className="mt-16 sm:mt-20" />
    </Section>
  );
}

function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <Link href={post.href} prefetch={false} className="group flex h-full flex-col rounded-[var(--radius-lg)] focus-visible:outline-offset-4">
      <PostCover slug={post.slug} title={post.title} />
      <div className="px-1 pt-6 sm:px-4">
        <time dateTime={post.date} className="text-sm text-ink-secondary">
          {formatPostDate(post.date)}
        </time>
        <h2 className="mt-2.5 text-title text-balance text-ink transition-colors duration-fast ease-[var(--ease-out)] group-hover:text-ink-secondary">
          {post.title}
        </h2>
        {post.summary ? (
          <p className="mt-2.5 line-clamp-2 text-[0.90625rem] leading-[1.55] text-ink-secondary">{post.summary}</p>
        ) : null}
        <span className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          {writingPage.readMore}
          <Caret />
        </span>
      </div>
    </Link>
  );
}

function PostRow({ post }: { post: PostSummary }) {
  return (
    <Link
      href={post.href}
      prefetch={false}
      className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-dashed border-dots py-3.5 focus-visible:outline-offset-2 sm:grid-cols-[minmax(0,1fr)_140px_130px]"
    >
      <span className="col-span-2 text-[0.9375rem] font-medium text-ink transition-colors duration-fast ease-[var(--ease-out)] group-hover:text-ink-secondary sm:col-span-1">
        {post.title}
      </span>
      <span className="text-sm text-ink-secondary">{writingPage.kind[post.kind]}</span>
      <time dateTime={post.date} className="text-right text-sm text-ink-secondary">
        {formatPostDate(post.date)}
      </time>
    </Link>
  );
}
