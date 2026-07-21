import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants, ButtonGlyph } from "@/components/ui/button";
import { AuditLane } from "@/components/features/audit-lane";
import { SITE, STATUS } from "@/config/site";
import { home, nowPage } from "@/content/site";
import { loadNow } from "@/lib/now";
import { formatDate } from "@/lib/format";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND, PANEL, PANEL_RAISED } from "@/constants/page";

const NOW_PATH = "/now";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm building, exploring, and reading right now — a running snapshot.",
  alternates: { canonical: `${SITE.url}${NOW_PATH}` },
  openGraph: {
    title: "Now — Mubin Attar",
    description: "What I'm building, exploring, and reading right now — a running snapshot.",
    url: `${SITE.url}${NOW_PATH}`,
    type: "website",
    images: [{ url: `${SITE.url}${NOW_PATH}/opengraph-image.png` }],
  },
};

/**
 * /now — a hand-updated snapshot of current work.
 *
 * Content is one MDX file (content/now.mdx); the "Last updated" line reads the
 * required `updated` front-matter (never file mtime), so the page cannot go
 * silently stale. The "Open to" tail is single-sourced from STATUS so it can't
 * diverge from /hire and the footer.
 *
 * Design: the shared PageHeader on an `aurora` band, then the prose at
 * `--width-prose` in a body band whose top padding is pulled in — the header
 * band already paid the gap, so the page opens on the snapshot rather than on
 * air. The closing "Open to" panel carries the page's only real elevation
 * (--shadow-md), because it is the one thing on the page a reader can act on.
 *
 * A11y: the freshness dot is decorative — the date beside it carries the meaning,
 * so nothing depends on colour. One `<h1>` (PageHeader); the closing panel's `<h2>`
 * uses the shared LABEL style without becoming a heading level of its own.
 */
export default async function NowPage() {
  const { meta, content } = await loadNow();

  return (
    <>
      <Section space="md" aurora className={PAGE_HEADER_BAND}>
        <PageHeader kicker={nowPage.kicker} title={nowPage.title} lede={meta.lede}>
          <p className="inline-flex items-center gap-2 font-mono text-xs text-ink-tertiary">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" aria-hidden />
            {nowPage.updatedLabel} {formatDate(meta.updated)}
          </p>
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
        <div className="reveal max-w-[var(--width-prose)]">{content}</div>

        <hr className="rule-fade mt-14 max-w-[var(--width-prose)]" />

        {/* Open to — single-sourced from STATUS so it never diverges from /hire
            and the footer. The one panel on the page with card elevation. */}
        <section className={`reveal mt-8 max-w-[var(--width-prose)] ${PANEL} ${PANEL_RAISED}`}>
          <h2 className={LABEL}>{nowPage.openTo.title}</h2>
          <p className="mt-4 text-lg text-ink">{STATUS.text}.</p>
          <div className="mt-6">
            <Link href={nowPage.openTo.cta.href} className={buttonVariants("primary")}>
              <ButtonGlyph />
              {nowPage.openTo.cta.label}
            </Link>
          </div>
        </section>
      </Section>
    </>
  );
}
