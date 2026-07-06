import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Metric } from "@/components/ui/metric";
import { buttonVariants } from "@/components/ui/button";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { diagrams } from "@/components/diagrams/data/dbwhisper";
import { SITE } from "@/config/site";
import { home } from "@/content/site";
import { featuredProject, secondaryProjects } from "@/content/projects";

/**
 * Home — DESIGN §4 tempo: hero → proof strip → flagship feature → secondary
 * projects (rows) → principles → contact. Adjacent sections differ in tone or
 * density (never two card-grids). Accent budget ≤ 2 per viewport.
 */
export default function Home() {
  const flagship = featuredProject;
  const diagram = flagship.diagram ? diagrams[flagship.diagram] : undefined;

  return (
    <>
      <Section space="lg">
        <p className="font-mono text-xs uppercase text-ink-tertiary">{home.metaLine}</p>
        <h1 className="mt-6 max-w-[18ch] text-4xl text-ink sm:text-5xl">{home.headline}</h1>
        <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">{home.lede}</p>
        <p className="mt-4 font-mono text-xs text-ink-tertiary">{home.availability}</p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link href={`/work/${flagship.slug}`} className={buttonVariants("primary")}>
            Read the flagship case study
          </Link>
          <Link
            href={`/work/${flagship.slug}#key-decisions`}
            className="text-sm text-ink underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
          >
            How I make decisions
          </Link>
        </div>
      </Section>

      <Section space="sm" tone="subtle" ariaLabel="At a glance">
        <dl className="flex flex-wrap gap-x-16 gap-y-6">
          {home.proof.map((s) => (
            <div key={s.label} className="max-w-[28ch]">
              <dd className="font-mono text-2xl tabular-nums text-ink">{s.value}</dd>
              <dt className="mt-1 text-sm text-ink-secondary">{s.label}</dt>
              <p className="mt-1 text-xs text-ink-tertiary">{s.method}</p>
            </div>
          ))}
        </dl>
      </Section>

      <Section space="lg">
        <SectionHeading kicker="Flagship case study">{flagship.title}</SectionHeading>
        <p className="mt-3 max-w-[var(--width-prose)] text-ink-secondary">{flagship.summary}</p>
        {diagram ? (
          <div className="mt-6">
            <SystemDiagram spec={diagram} />
          </div>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-x-12 gap-y-6">
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

      <Section space="md" tone="subtle">
        <SectionHeading kicker="More work">Other systems</SectionHeading>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {secondaryProjects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="group grid gap-2 py-6 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
              >
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-xl text-ink transition-colors group-hover:text-accent">
                      {p.title}
                    </h3>
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
        <div className="mt-8">
          <Link href="/work" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover">
            All work <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </Section>

      <Section space="md">
        <SectionHeading kicker="How I think">Principles</SectionHeading>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {home.principles.map((pr) => (
            <div key={pr.title} className="grid gap-2 py-6 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-8">
              <h3 className="text-lg text-ink">{pr.title}</h3>
              <p className="max-w-[var(--width-prose)] text-ink-secondary">{pr.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section space="lg">
        <SectionHeading kicker="Contact">Let&apos;s talk.</SectionHeading>
        <p className="mt-3 max-w-[var(--width-prose)] text-ink-secondary">
          Building something that needs grounded, honest AI? The fastest way to reach me is email.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <a href={`mailto:${SITE.email}`} className={buttonVariants("primary")}>
            {SITE.email}
          </a>
          <a
            href={SITE.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent"
          >
            GitHub
          </a>
        </div>
      </Section>
    </>
  );
}
