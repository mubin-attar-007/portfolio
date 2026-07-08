import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { SITE, STATUS } from "@/config/site";
import { hire } from "@/content/site";

export const metadata: Metadata = {
  title: "Hire me",
  description: "What I'm open to, how I work, and the fastest way to start a conversation.",
  alternates: { canonical: `${SITE.url}/hire` },
};

const H2 = "font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary";

/**
 * /hire — the single funnel for contact intent. Availability is single-sourced
 * from STATUS; the scheduling link is env-gated (NEXT_PUBLIC_CAL_URL) with an
 * honest disabled state until it's set. The email button is a real mailto — this
 * is the page every "contact" CTA routes to.
 */
export default function HirePage() {
  // Only an absolute http(s) URL activates "Book a call" — a relative/placeholder
  // value (e.g. "/hire_booking") falls back to the honest "coming soon" state
  // instead of rendering a broken link.
  const calRaw = process.env.NEXT_PUBLIC_CAL_URL;
  const cal = calRaw && /^https?:\/\//.test(calRaw) ? calRaw : undefined;

  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">{hire.kicker}</p>
      <h1 className="mt-6 max-w-[16ch] text-4xl tracking-[-0.02em] text-ink sm:text-5xl">
        {hire.title}
      </h1>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">{hire.lede}</p>

      <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
        <section>
          <h2 className={H2}>What I&apos;m open to</h2>
          <p className="mt-4 inline-flex items-start gap-2 text-lg text-ink">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-positive" aria-hidden />
            {STATUS.text}.
          </p>
        </section>

        <section>
          <h2 className={H2}>Timezone &amp; location</h2>
          <p className="mt-4 text-lg text-ink-secondary">
            {SITE.location} — IST (UTC+5:30). Remote-first; comfortable working async and holding a
            scheduled overlap.
          </p>
        </section>
      </div>

      <section className="mt-14 max-w-[var(--width-prose)]">
        <h2 className={H2}>How I work</h2>
        <p className="mt-4 text-ink-secondary">{hire.howIWork.body}</p>
        <ul className="mt-5 flex flex-col gap-2.5">
          {hire.howIWork.notes.map((n) => (
            <li key={n.href} className="flex gap-3 text-ink-secondary">
              <span className="font-mono text-ink-tertiary" aria-hidden>
                →
              </span>
              <Link href={n.href} className="link-underline text-ink">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 max-w-[var(--width-prose)] border-t border-border pt-8">
        <h2 className={H2}>Start a conversation</h2>
        <p className="mt-4 text-ink-secondary">
          The fastest way to reach me is email — I read and answer every one myself.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a href={`mailto:${SITE.email}`} className={buttonVariants("primary")}>
            Email me
            <ArrowUpRight size={16} strokeWidth={1.8} />
          </a>
          {cal ? (
            <a
              href={cal}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants("secondary")}
            >
              Book a call
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border-strong px-3 py-2 font-mono text-xs text-ink-tertiary">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary" aria-hidden />
              Scheduling link coming soon
            </span>
          )}
        </div>
        <a
          href={`mailto:${SITE.email}`}
          className="link-underline mt-6 inline-block text-ink"
        >
          {SITE.email}
        </a>
      </section>
    </Section>
  );
}
