import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Spotlight } from "@/components/features/spotlight";
import { PageHeader } from "@/components/ui/page-header";
import { AuditLane } from "@/components/features/audit-lane";
import { buttonVariants } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { CopyEmail } from "@/components/features/copy-email";
import { SITE, STATUS, INTEGRATIONS } from "@/config/site";
import { hire, home, trust } from "@/content/site";
import { PAGE_TOP, stagger } from "@/constants/page";

export const metadata: Metadata = {
  title: "Hire me",
  description: "What I'm open to, how I work, and the fastest way to start a conversation.",
  alternates: { canonical: `${SITE.url}/hire` },
  openGraph: {
    title: "Hire Mubin Attar",
    description: "What I'm open to, how I work, and the fastest way to start a conversation.",
    url: `${SITE.url}/hire`,
    type: "website",
    images: [{ url: `${SITE.url}/hire/opengraph-image.png` }],
  },
};

const H2 = "font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary";
/**
 * One card treatment for the whole page, so every panel reads as the same object.
 * Elevation is deliberately NOT baked in: two `shadow-[…]` utilities on one
 * element resolve by generated-stylesheet order, not by class order, so a panel
 * that wanted --shadow-md could not reliably override a --shadow-sm baked in
 * here. Each site states its own elevation.
 */
const PANEL = "rounded-[var(--radius-md)] border border-border bg-surface p-6 sm:p-7";
/** Resting elevation for a supporting panel. */
const PANEL_REST = "shadow-[var(--shadow-sm)]";
/**
 * Adds the cursor-following highlight. Deliberately NOT part of PANEL: a panel
 * of static prose that lights up under the cursor promises an interaction it
 * does not have. Depth signals clickability here, so this is reserved for the
 * one panel the page exists to produce — the conversation starter.
 */
const PANEL_INTERACTIVE = "spotlight";


/**
 * /hire — the single funnel for contact intent. Availability is single-sourced
 * from STATUS; the scheduling link is env-gated (NEXT_PUBLIC_CAL_URL) with an
 * honest disabled state until it's set. The email button is a real mailto — this
 * is the page every "contact" CTA routes to.
 *
 * Design: this is the conversion surface, so it carries the same depth
 * vocabulary as the homepage rather than a lighter version of it — an ambient
 * `.wash` behind the hero, a staggered entrance driven by --stagger-step, and
 * one consistent card treatment for every panel, lit by a single shared
 * <Spotlight> pointer listener.
 *
 * A11y: every effect here is decorative and sits behind content. Panel content
 * is wrapped in a positioned element so the spotlight layer can never paint over
 * text, and the whole system collapses under prefers-reduced-motion.
 */
export default function HirePage() {
  // Only an absolute http(s) URL activates "Book a call" — a relative/placeholder
  // value (e.g. "/hire_booking") falls back to the honest "coming soon" state
  // instead of rendering a broken link.
  const calRaw = process.env.NEXT_PUBLIC_CAL_URL ?? INTEGRATIONS.calUrl;
  const cal = calRaw && /^https?:\/\//.test(calRaw) ? calRaw : undefined;

  // The shared PageHeader on an `aurora` band — the same object every other
  // landing route opens with. /hire used to hand-roll a third h1 scale on the
  // site's only `wash` page-top, which made the contact funnel read as a
  // different template from its siblings; the funnel is the last place a
  // visitor should feel a seam.
  //
  // PAGE_TOP alone (not PAGE_HEADER_BAND): this is a single-band page, so its
  // one Section is also the page's close — it keeps `md`'s asymmetric 172px
  // bottom rather than ending the funnel on the thin 48px header seam.
  return (
    <Section space="md" aurora className={PAGE_TOP}>
      <Spotlight>
        <div className="reveal-stagger">
          <PageHeader kicker={hire.kicker} title={hire.title} lede={hire.lede} />
          {/* Proof anchor for cold visitors who land straight on /hire from search.
              A real surface rather than a pair of rules — the first thing on the
              page that reads as an object is the evidence. Sits OUTSIDE the
              header as the page's first content, not inside its actions slot:
              it is evidence, not an action. */}
          <dl
            className="hero-item relative z-10 mt-10 grid max-w-[var(--width-prose)] grid-cols-3 divide-x divide-border overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)]"
            style={stagger(5)}
          >
            {home.proof.stats.map((s) => (
              // col-reverse keeps the number on top visually while the DOM keeps the
              // real description-list order: the label is the <dt> (the term) and
              // the number is its <dd>. It used to be inverted, so screen readers
              // announced "4" as the term and the label as its definition.
              <div key={s.label} className="flex flex-col-reverse gap-1 px-5 py-4">
                <dt className="text-xs text-ink-tertiary">{s.label}</dt>
                <dd className="font-mono text-xl tabular-nums text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>

          <section className="reveal mt-8 rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">
              {trust.kicker}
            </p>
            <p className="mt-2 max-w-[72ch] text-sm text-ink-secondary">{trust.body}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <TextLink href="/trust" tone="quiet">
                Open trust policy
              </TextLink>
              <TextLink href="/changelog" tone="quiet">
                Open changelog
              </TextLink>
            </div>
          </section>

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
              { href: "/resume", label: "resume ledger" },
            ]}
            className="mt-8"
          />
        </div>

        <div className="reveal mt-14 grid gap-6 sm:grid-cols-2">
          <section className={`${PANEL} ${PANEL_REST}`}>
            <div className="relative">
              <h2 className={H2}>What I&apos;m open to</h2>
              <p className="mt-4 inline-flex items-start gap-2 text-lg text-ink">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-positive" aria-hidden />
                {STATUS.text}.
              </p>
            </div>
          </section>

          <section className={`${PANEL} ${PANEL_REST}`}>
            <div className="relative">
              <h2 className={H2}>Timezone &amp; location</h2>
              <p className="mt-4 text-lg text-ink-secondary">
                {SITE.location} — IST (UTC+5:30). Remote-first; comfortable working async and holding
                a scheduled overlap.
              </p>
            </div>
          </section>
        </div>

        <section className="reveal mt-14 max-w-[var(--width-prose)]">
          <h2 className={H2}>How I work</h2>
          <p className="mt-4 text-ink-secondary">{hire.howIWork.body}</p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {hire.howIWork.notes.map((n) => (
              <li key={n.href} className="group flex gap-3 text-ink-secondary">
                <span
                  className="font-mono text-ink-tertiary transition-transform duration-base group-hover:translate-x-0.5"
                  aria-hidden
                >
                  →
                </span>
                <Link href={n.href} className="link-underline text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <hr className="rule-fade mt-14 max-w-[var(--width-prose)]" />

        {/* The conversion moment — the one panel on the page carrying real
            elevation, because it is the thing the page exists to produce. */}
        <section
          className={`reveal mt-8 max-w-[var(--width-prose)] ${PANEL} ${PANEL_INTERACTIVE} shadow-[var(--shadow-md)]`}
        >
          <div className="relative">
            <h2 className={H2}>Start a conversation</h2>
            <p className="mt-4 text-ink-secondary">
              The fastest way to reach me is email — I read and answer every one myself.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a href={`mailto:${SITE.email}`} className={buttonVariants("primary")}>
                Email me
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </a>
              {cal && (
                <a
                  href={cal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants("secondary")}
                >
                  Book a call
                  <ArrowUpRight size={16} strokeWidth={1.8} />
                </a>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href={`mailto:${SITE.email}`} className="link-underline text-ink">
                {SITE.email}
              </a>
              <CopyEmail email={SITE.email} />
            </div>
            <p className="mt-6 max-w-[54ch] text-sm text-ink-tertiary">
              References from managers and collaborators I&apos;ve shipped with are available on
              request.
            </p>
          </div>
        </section>
      </Spotlight>
    </Section>
  );
}
