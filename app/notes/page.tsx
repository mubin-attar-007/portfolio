import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import { AuditLane } from "@/components/features/audit-lane";
import { SITE } from "@/config/site";
import { home, pages } from "@/content/site";
import { allNotes } from "@/lib/notes";
import { NoteList } from "@/components/features/note-list";
import {
  NewsletterForm,
  NEWSLETTER_ENABLED,
} from "@/components/features/newsletter-form";

const NOTES_PATH = "/notes";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "A running notebook — short notes on retrieval, evals, agents, and infrastructure.",
  alternates: {
    canonical: `${SITE.url}${NOTES_PATH}`,
    types: { "application/rss+xml": `${SITE.url}/rss.xml` },
  },
  openGraph: {
    title: "Notes — Mubin Attar",
    description:
      "A running notebook — short notes on retrieval, evals, agents, and infrastructure.",
    url: `${SITE.url}${NOTES_PATH}`,
    type: "website",
    images: [{ url: `${SITE.url}${NOTES_PATH}/opengraph-image.png` }],
  },
};

/**
 * /notes — the digital garden index. Compact, tag-filterable rows grouped by
 * month (NoteList). Newsletter capture sits at the foot of the list, not the
 * hero.
 *
 * Shares its exact shell with /writing — the same `PageHeader` on the same
 * `aurora` band, the same feed + cross-reference pair in the actions slot, the
 * same `PAGE_BODY_BAND` content band underneath. The two pages are siblings, so
 * the only thing that should differ between them is what they say.
 */
export default async function NotesIndex() {
  const notes = await allNotes();
  const items = notes.map((n) => ({
    slug: n.slug,
    title: n.title,
    date: n.date,
    tags: n.tags,
  }));
  const copy = pages.notes;

  return (
    <>
      <Section space="lg" aurora className={PAGE_HEADER_BAND}>
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

      <Section space="md" className={PAGE_BODY_BAND}>
        <NoteList notes={items} />
        {NEWSLETTER_ENABLED && (
          <div className="mt-20 max-w-[var(--width-prose)]">
            <NewsletterForm />
          </div>
        )}
      </Section>
    </>
  );
}
