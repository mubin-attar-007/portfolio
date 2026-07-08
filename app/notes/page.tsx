import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";
import { allNotes } from "@/lib/notes";
import { NoteList } from "@/components/features/note-list";
import { NewsletterForm } from "@/components/features/newsletter-form";

export const metadata: Metadata = {
  title: "Notes",
  description: "A running notebook — short notes on retrieval, evals, agents, and infrastructure.",
  alternates: {
    canonical: `${SITE.url}/notes`,
    types: { "application/rss+xml": `${SITE.url}/rss.xml` },
  },
};

/**
 * /notes — the digital garden index. Compact, tag-filterable rows grouped by
 * month (NoteList). Newsletter capture sits at the foot of the list, not the
 * hero. Mirrors /writing's shell (kicker → h1 + RSS → lede → list).
 */
export default async function NotesIndex() {
  const notes = await allNotes();
  const items = notes.map((n) => ({ slug: n.slug, title: n.title, date: n.date, tags: n.tags }));

  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">Notes</p>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="max-w-[20ch] text-4xl tracking-[-0.02em] text-ink sm:text-5xl">Notes</h1>
        <a
          href="/rss.xml"
          className="group inline-flex items-center gap-1.5 font-mono text-xs text-ink-tertiary transition-colors hover:text-accent"
        >
          <Rss size={13} strokeWidth={1.6} aria-hidden />
          RSS
        </a>
      </div>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
        A running notebook — short notes on the decisions behind the work: retrieval, evals, agents,
        and the infrastructure that keeps four products live. Filter by tag.
      </p>
      <div className="mt-12">
        <NoteList notes={items} />
      </div>
      <div className="mt-20 max-w-[var(--width-prose)]">
        <NewsletterForm />
      </div>
    </Section>
  );
}
