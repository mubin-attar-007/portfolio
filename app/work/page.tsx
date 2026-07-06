import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Metric } from "@/components/ui/metric";
import { SITE } from "@/config/site";
import { featuredProject, secondaryProjects } from "@/content/projects";

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
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {secondaryProjects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="group grid gap-2 py-6 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
              >
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h2 className="text-xl text-ink transition-colors group-hover:text-accent">
                      {p.title}
                    </h2>
                    <span className="font-mono text-xs uppercase text-ink-tertiary">{p.status}</span>
                  </div>
                  <p className="mt-1 max-w-[var(--width-prose)] text-sm text-ink-secondary">{p.summary}</p>
                </div>
                <span className="font-mono text-sm tabular-nums text-ink-secondary">
                  {p.metrics[0]?.value}{" "}
                  <span className="text-ink-tertiary">{p.metrics[0]?.label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
