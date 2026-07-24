import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/config/site";
import { talks, talksIntro } from "@/content/site";
import { formatDate } from "@/lib/format";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND, PANEL, PANEL_RAISED, stagger } from "@/constants/page";

export const metadata: Metadata = {
  title: "Talks",
  description:
    "Talks and appearances on evals, LLM safety boundaries, RAG, and shipping AI on a $0 stack.",
  alternates: { canonical: `${SITE.url}/talks` },
  robots: { index: false, follow: false },
  openGraph: {
    siteName: SITE.name,
    title: "Talks — Mubin Attar",
    description:
      "Talks and appearances on evals, LLM safety boundaries, RAG, and shipping AI on a $0 stack.",
    url: `${SITE.url}/talks`,
    type: "website",
  },
};

/**
 * /talks — talks & appearances.
 *
 * The list is ready for real entries; until the first one, it shows an honest
 * empty state that routes to /hire. It never invents a lineup — an empty page
 * that says so is worth more than a padded one, and the same rule governs every
 * number on this site.
 *
 * Design: the shared PageHeader, then either the hairline-
 * divided list (the same divided-list vocabulary as /about's principles) or the
 * empty-state panel. The panel uses the site's ordinary card treatment rather
 * than a dashed "placeholder" border: the state is honest, so it should look
 * finished, not like something failed to load.
 *
 * A11y: one `<h1>` (PageHeader); each entry's title is an `<h2>` so the list is
 * navigable by heading, and `<time dateTime>` carries the machine-readable date.
 * External artifact links use the shared TextLink, which supplies the outward
 * arrow and `rel="noopener noreferrer"`.
 */
export default function TalksPage() {
  return (
    <>
      <Section space="md" className={PAGE_HEADER_BAND}>
        <PageHeader kicker={talksIntro.kicker} title={talksIntro.title} lede={talksIntro.lede}>
          <TextLink href={talksIntro.empty.cta.href} tone="quiet">
            {talksIntro.empty.cta.label}
          </TextLink>
        </PageHeader>
      </Section>
      <Section space="md" className={PAGE_BODY_BAND}>
        {talks.length > 0 ? (
          <ul className="reveal-stagger divide-y divide-border border-y border-border">
            {talks.map((t, i) => (
              <li
                key={`${t.date}-${t.title}`}
                className="reveal grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8"
                style={stagger(i)}
              >
                <time dateTime={t.date} className={LABEL}>
                  {formatDate(t.date)}
                </time>
                <div>
                  <h2 className="text-lg text-ink">{t.title}</h2>
                  <p className="mt-1 text-sm text-ink-secondary">{t.venue}</p>
                  {t.href ? (
                    <TextLink href={t.href} external tone="quiet" className="mt-3">
                      {talksIntro.entryCta}
                    </TextLink>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <section className={`reveal max-w-[var(--width-prose)] ${PANEL} ${PANEL_RAISED}`}>
            <h2 className="text-lg text-ink">{talksIntro.empty.title}</h2>
            <p className="mt-3 text-ink-secondary">{talksIntro.empty.body}</p>
            <div className="mt-6">
              <Link href={talksIntro.empty.cta.href} className={buttonVariants("primary")}>
                {talksIntro.empty.cta.label}
              </Link>
            </div>
          </section>
        )}
      </Section>
    </>
  );
}
