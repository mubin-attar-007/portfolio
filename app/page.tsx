import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Metric } from "@/components/ui/metric";
import { buttonVariants } from "@/components/ui/button";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { HeroTerminal } from "@/components/features/hero-terminal";
import { SkillRotator } from "@/components/features/skill-rotator";
import { ComponentShowcase } from "@/components/features/component-showcase";
import { CapabilityGrid } from "@/components/features/capability-grid";
import { LiveDemos } from "@/components/features/live-demos";
import { Faq } from "@/components/features/faq";
import { diagrams } from "@/components/diagrams/data";
import { SITE } from "@/config/site";
import { home } from "@/content/site";
import { featuredProject } from "@/content/projects";
import { allWriting } from "@/lib/writing";
import { formatDate } from "@/lib/format";

/**
 * Home — reimagined for rhythm (DESIGN §4). Each section does a distinct job and
 * differs in scale/density/background: hero (inspire, with a focal terminal) →
 * interactive architecture (prove/explore) → field notes (teach) → other systems
 * (survey) → principles → currently exploring → writing → contact (resolve, on a
 * serif philosophy line). Accent ≤2 per viewport; hierarchy via size + space.
 * Sections below the hero carry `reveal` (scroll-driven fade-up, reduced-motion-safe).
 */
export default async function Home() {
  const flagship = featuredProject;
  const diagram = flagship.diagram ? diagrams[flagship.diagram] : undefined;
  const posts = (await allWriting()).slice(0, 3);
  const [headLead, headTail] = home.headline.split(" — ");

  return (
    <>
      {/* Beat 1 — Hero: text + a representative terminal as the focal point.
          Trim the top padding so the sticky header's space doesn't make the
          first view top-heavy (keeps the hero roughly balanced in the fold). */}
      <Section space="lg" className="!pt-[clamp(4.5rem,9vw,8rem)]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="min-w-0">
            <p
              className="hero-item font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary"
              style={{ animationDelay: "0.02s" }}
            >
              {home.metaLine}
            </p>
            <h1
              className="hero-item mt-8 max-w-[19ch] text-4xl leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "0.09s" }}
            >
              {headLead}
              {headTail ? <span className="text-ink-tertiary"> — {headTail}</span> : null}
            </h1>
            <p
              className="hero-item mt-8 max-w-[52ch] text-lg text-ink-secondary"
              style={{ animationDelay: "0.18s" }}
            >
              {home.lede}
            </p>
            <div
              className="hero-item mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.26s" }}
            >
              <Link href={`/work/${flagship.slug}`} className={buttonVariants("primary")}>
                Read the flagship case study
              </Link>
              <Link href="#field-notes" className={buttonVariants("ghost")}>
                How I make decisions
              </Link>
            </div>
            <p
              className="hero-item mt-10 font-mono text-xs text-ink-tertiary"
              style={{ animationDelay: "0.34s" }}
            >
              {home.facts.join("  ·  ")}
              {"  ·  "}
              {home.availability}
            </p>
          </div>
          <div className="hero-item min-w-0 lg:pt-2" style={{ animationDelay: "0.16s" }}>
            <HeroTerminal />
          </div>
        </div>
      </Section>

      {/* The real stack in Clerk's slot-machine — the engineering take on a logo wall */}
      <SkillRotator />

      {/* Beat 1.5 — Flagship up close: a Clerk-Components-style split (light) */}
      <Section space="lg" ariaLabel="How DBWhisper stays safe" className="reveal">
        <ComponentShowcase />
      </Section>

      {/* Beat 2 — Interactive architecture: the flagship, on a dark band */}
      <Section space="lg" tone="invert" ariaLabel="Inside the flagship system" className="reveal">
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
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Read the full DBWhisper case study{" "}
            <ArrowRight
              size={15}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </Section>

      {/* Beat 3 — Field notes: how I think, in three real entries */}
      <Section space="lg" ariaLabel="Field notes" className="reveal">
        <div id="field-notes" className="scroll-mt-24">
          <SectionHeading kicker="From the notebook">Three decisions that shaped the work</SectionHeading>
        </div>
        <div className="mt-12 flex flex-col gap-14">
          {home.fieldNotes.map((note) => (
            <article key={note.n} className="grid gap-x-10 gap-y-3 md:grid-cols-[7rem_1fr]">
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
                  <Link href={note.href} className="link-underline text-sm text-ink">
                    Read the case
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Beat 3.5 — Capabilities: a dark card grid (Clerk auth-section pattern) */}
      <Section space="lg" tone="invert" ariaLabel="What I build" className="reveal">
        <CapabilityGrid />
      </Section>

      {/* Beat 4 — Live products: everything is deployed, so make it launchable */}
      <Section space="lg" ariaLabel="Live products" className="reveal">
        <LiveDemos />
      </Section>

      {/* Beat 5 — Principles: prose-forward, a distinct voice */}
      <Section space="md" ariaLabel="Principles" className="reveal">
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

      {/* Beat 6 — Currently exploring: an active-learning signal */}
      <Section space="sm" tone="subtle" ariaLabel="Currently exploring" className="reveal">
        <SectionHeading kicker={home.exploring.kicker}>What I&apos;m digging into now</SectionHeading>
        <ul className="mt-8 grid gap-x-12 gap-y-3 sm:grid-cols-2">
          {home.exploring.items.map((item) => (
            <li key={item} className="flex gap-3 text-ink-secondary">
              <span className="font-mono text-ink-tertiary" aria-hidden>
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Beat 7 — Writing: compressed */}
      <Section space="md" className="reveal">
        <SectionHeading kicker="Writing">Selected writing</SectionHeading>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/writing/${p.slug}`}
                className="group -mx-4 grid gap-1 rounded-[var(--radius-md)] px-4 py-4 transition-colors duration-200 ease-[var(--ease-out)] hover:bg-bg-subtle md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
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
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            All writing{" "}
            <ArrowRight
              size={15}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </Section>

      {/* Beat 7.5 — FAQ: the questions a hiring manager has, in a Clerk accordion */}
      <Section space="md" tone="subtle" ariaLabel="Frequently asked questions" className="reveal">
        <Faq />
      </Section>

      {/* Beat 8 — Contact: a serif philosophy line, then a quiet resolution (dark close) */}
      <Section space="lg" tone="invert" className="reveal">
        <p className="max-w-[24ch] font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
          {home.philosophy}
        </p>
        <div className="mt-14">
          <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">Contact</p>
          <h2 className="mt-4 max-w-[24ch] text-2xl text-ink">
            Building something that needs grounded, honest AI?
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <a href={`mailto:${SITE.email}`} className="link-underline text-lg text-ink">
              {SITE.email}
            </a>
            <a
              href={SITE.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-mono text-sm text-ink-tertiary"
            >
              GitHub
            </a>
            <a
              href={SITE.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-mono text-sm text-ink-tertiary"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
