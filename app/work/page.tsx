import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { ProjectCard } from "@/components/work/project-card";
import { buttonVariants } from "@/components/ui/button";
import { FIGURE, PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { SITE } from "@/config/site";
import { pages } from "@/content/site";
import { flagshipHome } from "@/content/home-visual";
import { featuredProject, secondaryProjects } from "@/content/projects";
import cardStyles from "@/components/work/project-card.module.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies for four live AI systems — architecture, key decisions, and measured results. Not screenshots.",
  alternates: { canonical: `${SITE.url}/work` },
  openGraph: {
    siteName: SITE.name,
    title: "Work — Mubin Attar",
    description:
      "Case studies for four live AI systems — architecture, key decisions, and measured results. Not screenshots.",
    url: `${SITE.url}/work`,
    type: "website",
  },
};

/**
 * /work — four projects, with the flagship given a shape the other three do not
 * get.
 *
 * The index used to present DBWhisper as a text block beside a list of its own
 * subsystem names, and the other three as small icon cards. That made the
 * flagship look like a paragraph and the rest look like documentation links —
 * and, more importantly, it looked nothing like the gallery the visitor had just
 * clicked away from on the homepage.
 *
 * Now the flagship gets a full-width editorial band with the real product
 * screenshot and its three measured metrics, and the other three use the SAME
 * `ProjectCard` the homepage bento uses. One card treatment, two placements.
 *
 * There are no filters. With four projects a filter row is furniture that
 * removes items from a list a visitor can already see in one glance.
 */
export default function WorkIndex() {
  const flagship = featuredProject;
  const labels = {
    caseStudy: flagshipHome.work.caseStudy,
    live: flagshipHome.work.live,
    source: flagshipHome.work.source,
  };

  return (
    <>
      <Section space="lg" className={`relative overflow-hidden ${PAGE_HEADER_BAND}`}>
        {/* The same light source the homepage hero has — /work was the only
            route presenting the flagship on a completely grey surface. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(58%_80%_at_50%_-12%,color-mix(in_srgb,var(--color-accent)_11%,transparent),transparent_75%)]"
        />
        <PageHeader kicker={pages.work.kicker} title={pages.work.title} lede={pages.work.lede} />
      </Section>

      {/* ---- the flagship ---- */}
      <Section space="md" tone="subtle" className={`reveal ${PAGE_BODY_BAND}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14">
          <div>
            <EyebrowChip>{pages.work.flagshipKicker}</EyebrowChip>
            <h2 className="mt-4 text-section font-bold text-ink">{flagship.title}</h2>
            <p className="mt-4 max-w-[46ch] text-pretty text-lg text-ink-secondary">
              {flagship.summary}
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-7 sm:grid-cols-3">
              {flagship.metrics.slice(0, 3).map((m) => (
                <div key={m.label}>
                  <dd className="text-3xl font-bold tabular-nums tracking-[-0.03em] text-ink">
                    {m.value}
                  </dd>
                  <dt className="mt-1.5 text-sm leading-snug text-ink-secondary">{m.label}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={`/work/${flagship.slug}`}
                prefetch={false}
                className={buttonVariants("primary", "md")}
              >
                {pages.work.flagshipCta}
                <ArrowRight size={15} strokeWidth={2.25} aria-hidden />
              </Link>
              {flagship.links.live ? (
                <a
                  href={flagship.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/live inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink"
                >
                  {labels.live}
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2.25}
                    aria-hidden
                    className="transition-transform duration-fast ease-[var(--ease-out)] group-hover/live:-translate-y-0.5 group-hover/live:translate-x-0.5"
                  />
                </a>
              ) : null}
              {flagship.links.repo ? (
                <a
                  href={flagship.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/repo inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink"
                >
                  {labels.source}
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2.25}
                    aria-hidden
                    className="transition-transform duration-fast ease-[var(--ease-out)] group-hover/repo:-translate-y-0.5 group-hover/repo:translate-x-0.5"
                  />
                </a>
              ) : null}
            </div>
          </div>

          {/* The real product, at the top of the page that is about it. The
              intrinsic width/height come from the content model, so the frame
              reserves its box before the image decodes. */}
          <figure className={FIGURE}>
            {/* The same window chrome every other capture wears — this was the
                one bare screenshot left on the site. */}
            <div
              aria-hidden
              className="flex h-8 items-center gap-2.5 border-b border-border bg-bg-subtle px-3"
            >
              <span className="flex gap-[0.3125rem]">
                <span className="h-[0.4375rem] w-[0.4375rem] rounded-[var(--radius-pill)] bg-border-strong" />
                <span className="h-[0.4375rem] w-[0.4375rem] rounded-[var(--radius-pill)] bg-border-strong" />
                <span className="h-[0.4375rem] w-[0.4375rem] rounded-[var(--radius-pill)] bg-border-strong" />
              </span>
              <span className="font-mono text-[0.6875rem] text-ink-tertiary">
                {flagship.slug}.app
              </span>
            </div>
            {/* The full-resolution capture (1920px), not the 768px card webp:
                a 56vw slot on retina wants ~1600px, and the smaller asset went
                soft exactly where the page claims "not screenshots". The bottom
                fade makes the crop read deliberate. */}
            <Image
              src="/demos/dbwhisper.png"
              alt={flagship.card.alt}
              width={1920}
              height={1140}
              className="h-auto w-full [mask-image:linear-gradient(to_bottom,black_84%,transparent)]"
              sizes="(min-width: 64rem) 56vw, 100vw"
              priority
            />
          </figure>
        </div>
      </Section>

      {/* ---- the rest ---- */}
      <Section space="md" className="reveal">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <EyebrowChip>{pages.work.othersKicker}</EyebrowChip>
            <h2 className="mt-4 text-section font-bold text-ink">{pages.work.othersTitle}</h2>
          </div>
          <TextLink href="/evals" className="sm:pb-2">
            How each was measured
          </TextLink>
        </div>

        <div className={cardStyles.grid}>
          {secondaryProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} labels={labels} />
          ))}
        </div>
      </Section>
    </>
  );
}
