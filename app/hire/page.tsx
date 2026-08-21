import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { CopyEmail } from "@/components/features/copy-email";
import { SITE, STATUS, INTEGRATIONS } from "@/config/site";
import { hire, home, trust } from "@/content/site";
import { LABEL, PANEL, PAGE_TOP } from "@/constants/page";

export const metadata: Metadata = {
  title: "Hire me",
  description: "What I'm open to, how I work, and the fastest way to start a conversation.",
  alternates: { canonical: `${SITE.url}/hire` },
  openGraph: {
    siteName: SITE.name,
    title: "Hire Mubin Attar",
    description: "What I'm open to, how I work, and the fastest way to start a conversation.",
    url: `${SITE.url}/hire`,
    type: "website",
  },
};

/**
 * /hire — the single funnel for contact intent.
 *
 * Layout: a two-column page from `lg`, with the narrative on the left and the
 * contact card STICKY on the right. The previous single column ran to the prose
 * measure and left the right half of a 1216px page empty, which put the one
 * action this page exists to produce below the fold on every screen. Now it is
 * beside the reader the whole way down.
 *
 * There is no questionnaire and no long form. The ask is an email address and a
 * booking link; anything more is a hurdle in front of a conversation.
 *
 * Availability is single-sourced from `STATUS`, so it can never disagree with
 * the bar above the header, the homepage close, or the footer. The scheduling
 * link is env-gated (`NEXT_PUBLIC_CAL_URL`) and simply does not render when
 * unset, rather than shipping a dead button.
 *
 * A11y: one `<h1>` via `PageHeader`; every panel is a labelled `<section>`; the
 * availability dot is decorative and its sentence carries the meaning. The
 * sticky column drops to static below `lg`, so it can never eat a phone's
 * viewport.
 */
export default function HirePage() {
  // Only an absolute http(s) URL activates "Book a call" — a relative or
  // placeholder value falls back to simply not rendering the action rather than
  // shipping a link that goes nowhere.
  const calRaw = process.env.NEXT_PUBLIC_CAL_URL ?? INTEGRATIONS.calUrl;
  const cal = calRaw && /^https?:\/\//.test(calRaw) ? calRaw : undefined;

  return (
    // PAGE_TOP alone (not PAGE_HEADER_BAND): this is a single-band page, so its
    // one Section is also the page's close — it keeps the asymmetric bottom
    // rather than ending the funnel on a thin header seam.
    <Section space="md" className={PAGE_TOP}>
      <PageHeader kicker={hire.kicker} title={hire.title} lede={hire.lede} />

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        {/* ---- the narrative ---- */}
        <div className="reveal min-w-0">
          {/* Proof anchor for a cold visitor who landed here straight from
              search. The first thing on the page that reads as an object is the
              evidence, not an action. */}
          <dl className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
            {home.proof.stats.map((s) => (
              // col-reverse keeps the number on top visually while the DOM keeps
              // the real description-list order: the label is the <dt> and the
              // number is its <dd>.
              <div key={s.label} className="flex flex-col-reverse gap-1 px-4 py-4 sm:px-5">
                <dt className="text-xs leading-snug text-ink-tertiary">{s.label}</dt>
                <dd className="font-mono text-xl tabular-nums text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <h2 className={LABEL}>What I&apos;m open to</h2>
            <p className="mt-4 flex items-start gap-2.5 text-lg text-ink">
              <span
                aria-hidden
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-[var(--radius-pill)] bg-positive"
              />
              {STATUS.text}.
            </p>
            <p className="mt-3 max-w-[58ch] text-ink-secondary">
              {SITE.location} — IST (UTC+5:30). Remote-first; comfortable working async and holding
              a scheduled overlap.
            </p>
          </section>

          <section className="mt-10">
            <h2 className={LABEL}>How I work</h2>
            <p className="mt-4 max-w-[62ch] text-ink-secondary">{hire.howIWork.body}</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {hire.howIWork.notes.map((n) => (
                <li key={n.href} className="group flex gap-3 text-ink-secondary">
                  <span
                    aria-hidden
                    className="font-mono text-ink-tertiary transition-transform duration-base ease-[var(--ease-out)] group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                  <Link href={n.href} prefetch={false} className="link-underline text-ink">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className={LABEL}>{trust.kicker}</h2>
            <p className="mt-4 max-w-[62ch] text-ink-secondary">{trust.body}</p>
            <TextLink href="/trust" className="mt-4">
              Open the trust policy
            </TextLink>
          </section>
        </div>

        {/* ---- the ask ---- */}
        <div className="reveal lg:sticky lg:top-24 lg:self-start">
          <section className={PANEL}>
            <h2 className={LABEL}>Start a conversation</h2>
            <p className="mt-4 text-ink-secondary">
              The fastest way to reach me is email — I read and answer every one myself.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a href={`mailto:${SITE.email}`} className={`${buttonVariants("primary", "lg")} w-full`}>
                Email me
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
              </a>
              {cal ? (
                <a
                  href={cal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonVariants("secondary", "lg")} w-full`}
                >
                  Book a call
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
                </a>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5">
              <a href={`mailto:${SITE.email}`} className="link-underline text-sm text-ink">
                {SITE.email}
              </a>
              <CopyEmail email={SITE.email} />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-ink-tertiary">
              Every project here is live and every repository is public — the fastest way to judge
              the work is to open one.
            </p>
          </section>
        </div>
      </div>
    </Section>
  );
}
