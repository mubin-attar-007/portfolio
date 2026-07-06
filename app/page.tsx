import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Metric } from "@/components/ui/metric";
import { buttonVariants } from "@/components/ui/button";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { diagrams } from "@/components/diagrams/data";
import { SITE } from "@/config/site";
import { home } from "@/content/site";
import { featuredProject, secondaryProjects } from "@/content/projects";
import { allWriting } from "@/lib/writing";
import { formatDate } from "@/lib/format";

/**
 * Home — reimagined for rhythm (DESIGN §4). Each section does a distinct job and
 * differs in scale/density/background: hero (inspire) → interactive architecture
 * (prove/explore) → field notes (teach) → other systems (survey) → writing →
 * contact (resolve). One accent budget ≤2 per viewport; hierarchy via size and
 * space, never decoration.
 */
export default async function Home() {
  const flagship = featuredProject;
  const diagram = flagship.diagram ? diagrams[flagship.diagram] : undefined;
  const posts = (await allWriting()).slice(0, 3);
  const [headLead, headTail] = home.headline.split(" — ");

  return (
    <>
      {/* Beat 1 — Hero: big, confident, airy */}
      <Section space="lg">
        <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">
          {home.metaLine}
        </p>
        <h1 className="mt-8 max-w-[19ch] text-4xl leading-[1.04] tracking-[-0.02em] text-ink sm:text-6xl lg:text-7xl">
          {headLead}
          {headTail ? <span className="text-ink-tertiary"> — {headTail}</span> : null}
        </h1>
        <p className="mt-8 max-w-[56ch] text-lg text-ink-secondary sm:text-xl">{home.lede}</p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link href={`/work/${flagship.slug}`} className={buttonVariants("primary")}>
            Read the flagship case study
          </Link>
          <Link
            href="#field-notes"
            className="text-sm text-ink underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
          >
            How I make decisions
          </Link>
        </div>
        <p className="mt-10 font-mono text-xs text-ink-tertiary">
          {home.facts.join("  ·  ")}
          {"  ·  "}
          {home.availability}
        </p>
      </Section>

      {/* Beat 2 — Interactive architecture: the flagship, explorable */}
      <Section space="lg" tone="subtle" ariaLabel="Inside the flagship system">
        <SectionHeading kicker={home.architecture.kicker}>
          {home.architecture.title}
        </SectionHeading>
        <p className="mt-3 max-w-[62ch] text-lg text-ink-secondary">{home.architecture.invite}</p>
        {diagram ? (
          <div className="mt-8">
            <SystemDiagram spec={diagram} />
          </div>
        ) : null}
        <div className="mt-10 flex flex-wrap gap-x-14 gap-y-6">
          {flagship.metrics.slice(0, 3).map((m) => (
            <Metric key={m.label} label={m.label} after={m.value} method={m.method} />
          ))}
        </div>
        <div className="mt-10">
          <Link
            href={`/work/${flagship.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Read the full DBWhisper case study <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </Section>

      {/* Beat 3 — Field notes: how I think, in three real entries */}
      <Section space="lg" ariaLabel="Field notes">
        <div id="field-notes" className="scroll-mt-24">
          <SectionHeading kicker="From the notebook">Three decisions that shaped the work</SectionHeading>
        </div>
        <div className="mt-12 flex flex-col gap-14">
          {home.fieldNotes.map((note) => (
            <article
              key={note.n}
              className="grid gap-x-10 gap-y-3 md:grid-cols-[7rem_1fr]"
            >
              <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1">
                <span className="font-mono text-3xl tabular-nums text-ink-tertiary">{note.n}</span>
                <span className="font-mono text-xs text-ink-tertiary">{note.kicker}</span>
              </div>
              <div className="max-w-[60ch]">
                <h3 className="text-xl text-ink sm:text-2xl">{note.title}</h3>
                <p className="mt-3 text-ink-secondary">{note.body}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="font-mono text-sm">
                    <span className="tabular-nums text-ink">{note.tag.value}</span>{" "}
                    <span className="text-ink-tertiary">{note.tag.label}</span>
                  </span>
                  <Link
                    href={note.href}
                    className="text-sm text-ink underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
                  >
                    Read the case
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Beat 4 — Other systems: compact survey, a scale-step down */}
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
                    <h3 className="text-lg text-ink transition-colors group-hover:text-accent">
                      {p.title}
                    </h3>
                    <span className="font-mono text-xs uppercase text-ink-tertiary">{p.status}</span>
                  </div>
                  <p className="mt-1 max-w-[var(--width-prose)] text-sm text-ink-secondary">
                    {p.summary}
                  </p>
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
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            All work <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </Section>

      {/* Beat 5 — Principles: prose-forward, a distinct voice */}
      <Section space="md" ariaLabel="Principles">
        <SectionHeading kicker="How I work">Principles</SectionHeading>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
          {home.principles.map((pr) => (
            <div key={pr.title} className="max-w-[42ch]">
              <h3 className="text-lg font-medium text-ink">{pr.title}</h3>
              <p className="mt-2 text-ink-secondary">{pr.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Beat 6 — Writing: compressed */}
      <Section space="md" tone="subtle">
        <SectionHeading kicker="Writing">Selected writing</SectionHeading>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/writing/${p.slug}`}
                className="group grid gap-1 py-4 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
              >
                <h3 className="text-base text-ink transition-colors group-hover:text-accent">
                  {p.title}
                </h3>
                <time dateTime={p.date} className="font-mono text-xs text-ink-tertiary">
                  {formatDate(p.date)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link
            href="/writing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            All writing <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </Section>

      {/* Beat 7 — Contact: a quiet resolution, not a second hero */}
      <Section space="lg">
        <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">Contact</p>
        <h2 className="mt-4 max-w-[24ch] text-2xl text-ink sm:text-3xl">
          Building something that needs grounded, honest AI?
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          <a
            href={`mailto:${SITE.email}`}
            className="text-lg text-ink underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
          >
            {SITE.email}
          </a>
          <a
            href={SITE.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-ink-tertiary underline decoration-border underline-offset-4 hover:text-ink"
          >
            GitHub
          </a>
          <a
            href={SITE.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-ink-tertiary underline decoration-border underline-offset-4 hover:text-ink"
          >
            LinkedIn
          </a>
        </div>
      </Section>
    </>
  );
}
