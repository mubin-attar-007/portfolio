import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/config/site";
import { talks } from "@/content/site";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Talks",
  description: "Talks and appearances on evals, LLM safety boundaries, RAG, and shipping AI on a $0 stack.",
  alternates: { canonical: `${SITE.url}/talks` },
};

/**
 * /talks — talks & appearances. The list is ready for real entries; until the
 * first one, it shows an honest empty state that routes to /hire (never an
 * invented lineup).
 */
export default function TalksPage() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">Talks</p>
      <h1 className="mt-6 max-w-[18ch] text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
        Talks &amp; appearances
      </h1>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
        On building grounded, honest AI systems — evals, deterministic safety boundaries, retrieval,
        and shipping products on a $0 stack.
      </p>

      {talks.length > 0 ? (
        <ul className="reveal mt-12 divide-y divide-border border-y border-border">
          {talks.map((t) => (
            <li key={`${t.date}-${t.title}`} className="grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8">
              <time dateTime={t.date} className="font-mono text-xs text-ink-tertiary">
                {formatDate(t.date)}
              </time>
              <div>
                <h2 className="text-lg text-ink">{t.title}</h2>
                <p className="mt-1 text-sm text-ink-secondary">{t.venue}</p>
                {t.href ? (
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-ink-tertiary underline decoration-border-strong underline-offset-4 hover:text-accent hover:decoration-accent"
                  >
                    slides / recording <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="reveal mt-12 max-w-[var(--width-prose)] rounded-[var(--radius-md)] border border-dashed border-border-strong bg-bg-subtle p-8">
          <p className="text-lg text-ink">No talks yet — this is where they&apos;ll live.</p>
          <p className="mt-3 text-ink-secondary">
            If you&apos;re organizing a meetup, podcast, or conference and think I&apos;d be a fit —
            on evals, LLM safety boundaries, retrieval, or shipping AI on a free tier — I&apos;d love
            to hear from you.
          </p>
          <div className="mt-6">
            <Link href="/hire" className={buttonVariants("secondary", "sm")}>
              Get in touch
              <ArrowUpRight size={14} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
}
