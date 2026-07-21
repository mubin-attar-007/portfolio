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
import { AuditLane } from "@/components/features/audit-lane";
import { Metric } from "@/components/ui/metric";
import { TextLink } from "@/components/ui/text-link";
import { Spotlight } from "@/components/features/spotlight";
import { PAGE_HEADER_BAND, PAGE_BODY_BAND, stagger } from "@/constants/page";
import { SITE } from "@/config/site";
import { home, pages } from "@/content/site";
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
};

export default function WorkIndex() {
  const flagship = featuredProject;
  return (
    <>
      {/* The shared page top. `aurora` gives the band the same light the homepage
          hero opens with — the index routes were flat by omission, not by
          decision, and a page that starts on bare page-background reads as a
          draft next to one that doesn't. */}
      <Section space="lg" aurora className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={pages.work.kicker}
          title={pages.work.title}
          lede={pages.work.lede}
        />
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
            />
          ))}
        </div>
        <div className="mt-8">
          <TextLink href={`/work/${flagship.slug}`}>{pages.work.flagshipCta}</TextLink>
        </div>
      </Section>

      <Section space="md" className="reveal">
        <SectionHeading kicker={pages.work.othersKicker}>{pages.work.othersTitle}</SectionHeading>
        {/* The same card object /writing and /notes use — radius-md, resting
            shadow-md, lift + spotlight on a whole-card link. /work had drifted
            to a larger radius, a lower shadow and no interaction cues, which
            made the three index pages read as three different sites. */}
        <Spotlight>
          <ul className="reveal-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryProjects.map((p, i) => {
              const Icon = PROJECT_ICON[p.slug] ?? Database;
              return (
                <li key={p.slug} style={stagger(i)}>
                  <Link
                    href={`/work/${p.slug}`}
                    className="spotlight lift group flex h-full flex-col rounded-[var(--radius-md)] border border-border bg-surface p-5 shadow-[var(--shadow-md)] transition-colors hover:border-border-strong"
                  >
                    <div className="relative flex items-center justify-between">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-border text-ink-tertiary transition-colors group-hover:text-accent">
                        <Icon size={18} strokeWidth={1.5} aria-hidden />
                      </span>
                      <span className="font-mono text-xs uppercase text-ink-tertiary">
                        {p.status}
                      </span>
                    </div>
                    <h2 className="relative mt-4 text-lg text-ink transition-colors group-hover:text-accent">
                      {p.title}
                    </h2>
                    <p className="relative mt-1.5 flex-1 text-sm text-ink-secondary">
                      {p.summary}
                    </p>
                    <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
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
                        className="shrink-0 text-ink-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Spotlight>
      </Section>
    </>
  );
}
