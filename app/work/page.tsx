import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  LineChart,
  Target,
  MessagesSquare,
} from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHeader } from "@/components/ui/page-header";
import { Metric } from "@/components/ui/metric";
import { TextLink } from "@/components/ui/text-link";
import { PAGE_HEADER_BAND, PAGE_BODY_BAND, stagger } from "@/constants/page";
import { SITE } from "@/config/site";
import { pages } from "@/content/site";
import { featuredProject, secondaryProjects } from "@/content/projects";

/** A monochrome line-icon per system — the Clerk docs-card motif (calm, not photos). */
const PROJECT_ICON: Record<string, typeof ArrowRight> = {
  dbwhisper: Database,
  tradepulse: LineChart,
  crownwager: Target,
  "llm-studio": MessagesSquare,
};

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

export default function WorkIndex() {
  const flagship = featuredProject;
  return (
    <>
      {/* Shared page-top rhythm; hierarchy comes from type and space. */}
      <Section space="lg" className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={pages.work.kicker}
          title={pages.work.title}
          lede={pages.work.lede}
        />
      </Section>
      <Section space="md" tone="subtle" className={`reveal ${PAGE_BODY_BAND}`}>
        <SectionHeading kicker={pages.work.flagshipKicker}>{flagship.title}</SectionHeading>
        <p className="mt-3 max-w-[var(--width-prose)] text-ink-secondary">
          {flagship.summary}
        </p>
        <div className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
          {flagship.metrics.slice(0, 3).map((m) => (
            <Metric
              key={m.label}
              label={m.label}
              after={m.value}
              method={m.method}
              methodHref={`/work/${flagship.slug}#performance-cost`}
            />
          ))}
        </div>
        <div className="mt-8">
          <TextLink href={`/work/${flagship.slug}`}>{pages.work.flagshipCta}</TextLink>
        </div>
      </Section>

      <Section space="md" className="reveal">
        <SectionHeading kicker={pages.work.othersKicker}>{pages.work.othersTitle}</SectionHeading>
        <ul className="reveal-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryProjects.map((p, i) => {
            const Icon = PROJECT_ICON[p.slug] ?? Database;
            return (
              <li key={p.slug} style={stagger(i)}>
                <Link
                  href={`/work/${p.slug}#performance-cost`}
                  className="group flex h-full flex-col rounded-[var(--radius-md)] border border-border bg-surface p-5 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-border text-ink-tertiary transition-colors group-hover:text-accent">
                      <Icon size={18} strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="font-mono text-xs uppercase text-ink-tertiary">
                      {p.status}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg text-ink transition-colors group-hover:text-accent">
                    {p.title}
                  </h2>
                  <p className="mt-1.5 flex-1 text-sm text-ink-secondary">
                    {p.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="font-mono text-sm tabular-nums text-ink">
                      {p.metrics[0]?.value}{" "}
                      <span className="text-ink-tertiary">
                        {p.metrics[0]?.label}
                      </span>
                    </span>
                    <ArrowRight
                      size={15}
                      strokeWidth={1.5}
                      aria-hidden
                      className="shrink-0 text-ink-tertiary transition-transform duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </div>
                  <span className="mt-2 text-xs text-ink-tertiary underline decoration-border-strong underline-offset-4">
                    Method: performance &amp; cost
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
