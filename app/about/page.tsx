import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { ProofStrip } from "@/components/features/proof-strip";
import { about, home } from "@/content/site";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mubin Attar — AI/ML engineer. Who I am, how I think, and the one rule across all of it.",
  alternates: { canonical: `${SITE.url}/about` },
};

const LINKS = [
  { label: "GitHub", href: SITE.socials.github, external: true },
  { label: "LinkedIn", href: SITE.socials.linkedin, external: true },
  { label: "Résumé", href: "/resume", external: false },
  { label: "Timeline", href: "/timeline", external: false },
] as const;

/**
 * /about — identity + "how I think". The hero carries the site's display type;
 * the three principles (home.principles, previously unrendered) become a
 * hairline-divided "how I think" list so the page DEMONSTRATES the thinking
 * instead of asserting it; a single primary CTA routes to the /hire funnel.
 */
export default function AboutPage() {
  return (
    <>
      <Section space="lg">
        <p className="font-mono text-xs uppercase text-ink-tertiary">About</p>
        <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-16">
          <div className="min-w-0">
            <h1 className="max-w-[18ch] text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
              {about.headline}
            </h1>
            <div className="mt-8 flex max-w-[var(--width-prose)] flex-col gap-4 text-lg text-ink-secondary">
              {about.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/hire" className={buttonVariants("primary")}>
                Work with me
              </Link>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {LINKS.map((l) =>
                  l.external ? (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-ink-secondary hover:text-ink"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="link-underline text-ink-secondary hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
          {/* Real headshot, card treatment (1px border, radius-md, no filters) — DESIGN §5. */}
          <Image
            src="/mubin.png"
            alt="Mubin Attar"
            width={369}
            height={461}
            sizes="(max-width: 768px) 45vw, 220px"
            priority
            className="order-first h-auto w-40 rounded-[var(--radius-md)] border border-border sm:w-48 md:order-none md:w-[220px]"
          />
        </div>
      </Section>

      {/* Honest proof anchor — the same credibility strip as the home page. */}
      <ProofStrip />

      {/* How I think — the three principles (previously unrendered content) as a
          hairline-divided list, not a card grid (DESIGN §9). Reveals on scroll. */}
      <Section space="md" className="reveal">
        <SectionHeading kicker={about.thinking.kicker}>{about.thinking.title}</SectionHeading>
        <dl className="mt-10 divide-y divide-border border-y border-border">
          {home.principles.map((pr) => (
            <div
              key={pr.title}
              className="grid gap-2 py-7 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-12"
            >
              <dt className="text-lg text-ink">{pr.title}</dt>
              <dd className="max-w-[var(--width-prose)] text-ink-secondary">{pr.body}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
