import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import { SITE } from "@/config/site";
import { pages } from "@/content/site";
import { allWriting, loadWriting } from "@/lib/writing";
import { WritingList } from "@/components/features/writing-list";
import {
  NewsletterForm,
  NEWSLETTER_ENABLED,
} from "@/components/features/newsletter-form";

const WRITING_PATH = "/writing";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays, guides, and notes on AI systems, evaluation, and honest ML.",
  alternates: {
    canonical: `${SITE.url}${WRITING_PATH}`,
    types: {
      "application/rss+xml": [
        { url: `${SITE.url}/rss.xml`, title: `${SITE.name} — Writing & Notes` },
        {
          url: `${SITE.url}/writing/feed.xml`,
          title: `${SITE.name} — Writing`,
        },
      ],
    },
  },
  openGraph: {
    siteName: SITE.name,
    title: "Writing — Mubin Attar",
    description:
      "Essays, guides, and notes on AI systems, evaluation, and honest ML.",
    url: `${SITE.url}${WRITING_PATH}`,
    type: "website",
  },
};

export default async function WritingIndex() {
  const posts = await allWriting();
  const items = await Promise.all(
    posts.map(async (p) => {
      const entry = await loadWriting(p.slug);
      return {
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        date: p.date,
        category: p.category,
        topics: p.topics,
        readingMinutes: entry?.readingMinutes ?? 0,
      };
    }),
  );

  const copy = pages.writing;
  return (
    <>
      {/* The feed and the cross-reference to /notes are ACTIONS, so they sit in
          the header's actions slot rather than being wedged into the h1 row (the
          feed link) and buried mid-sentence in the lede (the /notes link). The
          lede is now just the page's claim, which is what a lede is for. */}
      <Section space="lg" className={PAGE_HEADER_BAND}>
        <PageHeader kicker={copy.kicker} title={copy.title} lede={copy.lede}>
          <TextLink href={copy.crossHref}>{copy.crossCta}</TextLink>
          <a
            href={copy.feedHref}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-tertiary transition-colors duration-fast ease-[var(--ease-out)] hover:text-accent"
          >
            <Rss size={13} strokeWidth={1.6} aria-hidden />
            {copy.feedCta}
          </a>
        </PageHeader>
      </Section>
      <Section space="md" className={PAGE_BODY_BAND}>
        <WritingList posts={items} />
        {NEWSLETTER_ENABLED && (
          <div className="mt-20 max-w-[var(--width-prose)]">
            <NewsletterForm />
          </div>
        )}
      </Section>
    </>
  );
}
