import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { nowCopy } from "@/components/now/copy";
import { loadNowEntries, type NowEntry } from "@/components/now/now-entries";
import styles from "@/components/now/now.module.css";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CircuitArt } from "@/components/ui/circuit-art";
import { Kicker } from "@/components/ui/kicker";
import { Timeline, TimelineEntry } from "@/components/ui/timeline";
import { PAGE_TOP } from "@/constants/page";
import { STATUS } from "@/config/site";
import { nowPage } from "@/content/site";
import { formatDate } from "@/lib/format";
import { loadNow } from "@/lib/now";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/now",
  title: "Now",
  description: "What I'm building, exploring, and reading right now — a running snapshot.",
});

/**
 * /now — a hand-updated snapshot in the Clerk changelog pattern: a date rail
 * with dots, one entry per section of content/now.mdx (plus the structured
 * "Currently exploring" list from its front-matter, which the homepage shares),
 * and faint circuit art at the side. The snapshot has one date, the required
 * `updated` front-matter (never file mtime), so every entry carries it.
 *
 * A11y: one `<h1>`; each entry's title is an `<h2>` in an ordered list; the
 * dots and the art are decorative.
 */
export default async function NowPage() {
  const [{ meta }, sections] = await Promise.all([loadNow(), loadNowEntries()]);
  const date = formatDate(meta.updated);

  const exploring: NowEntry | null =
    meta.exploring.length > 0
      ? {
          id: nowCopy.exploringId,
          title: nowPage.exploringTitle,
          content: (
            <ul className={styles.cards}>
              {meta.exploring.map((item) => (
                <li key={item.title} className={styles.card}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
          ),
        }
      : null;
  // Exploring sits between what is being built and what is being read.
  const entries = exploring ? [sections[0], exploring, ...sections.slice(1)].filter((e): e is NowEntry => !!e) : sections;

  return (
    <Section space="lg" className={`${PAGE_TOP} overflow-x-clip`}>
      <div className={styles.art} aria-hidden="true">
        <CircuitArt fade="top" />
      </div>

      <header className="relative max-w-[640px]">
        <Kicker className="mb-4">{nowPage.kicker}</Kicker>
        <h1 className="text-display text-ink text-balance">{nowPage.title}</h1>
        <p className="mt-6 text-page-lead text-ink-secondary">{meta.lede}</p>
        <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink-tertiary">
          <span className={styles.fresh} aria-hidden="true" />
          {nowPage.updatedLabel} <time dateTime={meta.updated}>{date}</time>
        </p>
      </header>

      <div className={`relative mt-20 ${styles.feed}`}>
        <Timeline label={nowCopy.timeline}>
          {entries.map((entry) => {
            const category = nowCopy.categories[entry.id];
            return (
              <TimelineEntry
                key={entry.id}
                id={entry.id}
                date={date}
                dateTime={meta.updated}
                title={entry.title}
                titleAs="h2"
                tags={category ? <Chip variant="soft">{category}</Chip> : undefined}
              >
                <div className={styles.prose}>{entry.content}</div>
              </TimelineEntry>
            );
          })}
        </Timeline>

        <aside className={styles.openTo} aria-labelledby="now-open-to">
          <h2 id="now-open-to" className="text-title text-ink">
            {STATUS.text}.
          </h2>
          <div className="mt-5">
            <Button href={nowPage.openTo.cta.href} variant="dark" caret>
              {nowPage.openTo.cta.label}
            </Button>
          </div>
        </aside>
      </div>
    </Section>
  );
}
