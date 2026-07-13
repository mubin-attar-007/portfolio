import type { Metadata } from "next";
import Link from "next/link";
import { Rss } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";
import { allWriting } from "@/lib/writing";
import { WritingList } from "@/components/features/writing-list";
import { NewsletterForm, NEWSLETTER_ENABLED } from "@/components/features/newsletter-form";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays, guides, and notes on AI systems, evaluation, and honest ML.",
  alternates: {
    canonical: `${SITE.url}/writing`,
    types: {
      "application/rss+xml": [
        { url: `${SITE.url}/rss.xml`, title: `${SITE.name} — Writing & Notes` },
        { url: `${SITE.url}/writing/feed.xml`, title: `${SITE.name} — Writing` },
      ],
    },
  },
};

export default async function WritingIndex() {
  const posts = await allWriting();
  const items = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    date: p.date,
    category: p.category,
    topics: p.topics,
  }));

  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">Writing</p>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="max-w-[20ch] text-4xl tracking-[-0.02em] text-ink sm:text-5xl">Writing</h1>
        <a
          href="/writing/feed.xml"
          className="group inline-flex items-center gap-1.5 font-mono text-xs text-ink-tertiary transition-colors hover:text-accent"
        >
          <Rss size={13} strokeWidth={1.6} aria-hidden />
          RSS
        </a>
      </div>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
        Essays and guides on AI systems, evaluation, and honest ML — mined from the decisions and
        failures in my case studies. For shorter, single-decision notes, see the{" "}
        <Link href="/notes" className="link-underline text-ink">
          notebook
        </Link>
        .
      </p>
      <div className="mt-12">
        <WritingList posts={items} />
      </div>
      {NEWSLETTER_ENABLED && (
        <div className="mt-20 max-w-[var(--width-prose)]">
          <NewsletterForm />
        </div>
      )}
    </Section>
  );
}
