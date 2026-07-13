import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, LineChart, Target, MessagesSquare } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Metric } from "@/components/ui/metric";
import { SITE } from "@/config/site";
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
      <Section space="lg">
        <p className="font-mono text-xs uppercase text-ink-tertiary">Case studies</p>
        <h1 className="mt-6 max-w-[20ch] text-4xl text-ink sm:text-5xl">Systems, taken apart.</h1>
        <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
          Not screenshots — the real engineering. Each write-up walks the architecture, the decisions
          that mattered, and the trade-offs, with links to the live app and its source.
        </p>
      </Section>

      <Section space="md" tone="subtle">
        <SectionHeading kicker="Flagship">{flagship.title}</SectionHeading>
        <p className="mt-3 max-w-[var(--width-prose)] text-ink-secondary">{flagship.summary}</p>
        <div className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
          {flagship.metrics.slice(0, 3).map((m) => (
            <Metric key={m.label} label={m.label} after={m.value} method={m.method} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            href={`/work/${flagship.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Read the full write-up <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </Section>

      <Section space="md">
        <SectionHeading kicker="More">Other systems</SectionHeading>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryProjects.map((p) => {
            const Icon = PROJECT_ICON[p.slug] ?? Database;
            return (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-colors hover:border-border-strong"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-border text-ink-tertiary transition-colors group-hover:text-accent">
                      <Icon size={18} strokeWidth={1.5} aria-hidden />
                    </span>
                    <span className="font-mono text-xs uppercase text-ink-tertiary">{p.status}</span>
                  </div>
                  <h2 className="mt-4 text-lg text-ink transition-colors group-hover:text-accent">
                    {p.title}
                  </h2>
                  <p className="mt-1.5 flex-1 text-sm text-ink-secondary">{p.summary}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="font-mono text-sm tabular-nums text-ink">
                      {p.metrics[0]?.value}{" "}
                      <span className="text-ink-tertiary">{p.metrics[0]?.label}</span>
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
      </Section>
    </>
  );
}
