import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { HeroTerminal } from "@/components/features/hero-terminal";
import { ProofStrip } from "@/components/features/proof-strip";
import { SkillRotator } from "@/components/features/skill-rotator";
import { CapabilityGrid } from "@/components/features/capability-grid";
import { LiveDemos } from "@/components/features/live-demos";
import { Faq } from "@/components/features/faq";
import { diagrams } from "@/components/diagrams/data";
import { SITE, STATUS } from "@/config/site";
import { home } from "@/content/site";
import { featuredProject } from "@/content/projects";
import { allWriting } from "@/lib/writing";
import { formatDate } from "@/lib/format";

/**
 * Home — flagship structure (one point per section, no two adjacent sections repeat
 * a subject). hero → proof → marquee → flagship (merged graph + safety rail) →
 * notebook → guarantees bento → products → mid-page hire CTA → exploring+writing →
 * FAQ → contact. Light/dark notched rhythm preserved. Sections below the hero carry
 * `reveal` (scroll-driven fade-up, reduced-motion-safe).
 */
export default async function Home() {
  const flagship = featuredProject;
  const rawDiagram = flagship.diagram ? diagrams[flagship.diagram] : undefined;
  // The homepage diagram is compact: keep the map + which nodes are explorable
  // (empty `decision` marker → the tick + deep link still render), but strip the
  // why/instead-of/tradeoff essays so they live ONLY on the case study, never in
  // the homepage DOM or its serialized props (fixes V2 airtight).
  const diagram = rawDiagram
    ? { ...rawDiagram, nodes: rawDiagram.nodes.map((n) => (n.decision ? { ...n, decision: {} } : n)) }
    : undefined;
  const posts = (await allWriting()).slice(0, 3);
  const [headLead, headTail] = home.headline.split(" — ");

  return (
    <>
      {/* Hero — text + a representative terminal as the focal point. */}
      <Section space="lg" className="!pt-[clamp(4.5rem,9vw,8rem)]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="min-w-0">
            <p
              className="hero-item font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary"
              style={{ animationDelay: "0.02s" }}
            >
              {home.metaLine}
            </p>
            {/* The LCP element paints immediately (no entrance fade) — the surrounding
                hero elements still fade in around it. Keeps LCP fast. */}
            <h1 className="mt-8 max-w-[24ch] text-4xl leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl lg:text-6xl">
              {headLead}
              {headTail ? <span className="text-ink-tertiary"> — {headTail}</span> : null}
            </h1>
            <p
              className="hero-item mt-8 max-w-[52ch] text-lg text-ink-secondary"
              style={{ animationDelay: "0.18s" }}
            >
              {home.lede}
            </p>
            {/* dual CTA (fixes V4): flagship case study + a real contact action */}
            <div
              className="hero-item mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.26s" }}
            >
              <Link href={`/work/${flagship.slug}`} className={buttonVariants("primary")}>
                Read the flagship case study
              </Link>
              <Link href="/hire" className={buttonVariants("secondary")}>
                Get in touch
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

      {/* Proof strip (fixes V3) — honest credibility anchor, no faked logos/quotes */}
      <ProofStrip />

      {/* The real stack in Clerk's slot-machine — the engineering take on a logo wall */}
      <SkillRotator />

      {/* Flagship — ONE section (fixes V1): the architecture graph + a compact 3-stage
          safety rail. Node reveals are short + deep-link to the case study (fixes V2). */}
      <Section space="lg" tone="invert" ariaLabel="Inside the flagship system" className="reveal">
        <SectionHeading kicker={home.architecture.kicker}>
          {home.architecture.title}
        </SectionHeading>
        <p className="mt-3 max-w-[62ch] text-lg text-ink-secondary">{home.architecture.invite}</p>
        {diagram ? (
          <div className="mt-8">
            <SystemDiagram spec={diagram} compact deepLink={`/work/${flagship.slug}`} />
          </div>
        ) : null}
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {home.showcase.steps.map((s, i) => (
            <li key={s.key} className="border-l-2 border-border pl-4">
              <span className="font-mono text-xs tabular-nums text-ink-tertiary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 text-base font-medium text-ink">{s.label}</h3>
              <p className="mt-1 max-w-[34ch] text-sm text-ink-secondary">{s.body}</p>
            </li>
          ))}
        </ol>
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

      {/* From the notebook — how I think, in three real entries */}
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
        <div className="mt-12">
          <Link
            href="/notes"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            All notes{" "}
            <ArrowRight
              size={15}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </Section>

      {/* Guarantees bento — dark card grid */}
      <Section space="lg" tone="invert" ariaLabel="What I build" className="reveal">
        <CapabilityGrid />
      </Section>

      {/* Products — everything is deployed, so make it launchable */}
      <Section space="lg" ariaLabel="Live products" className="reveal">
        <LiveDemos />
      </Section>

      {/* Mid-page hire CTA (fixes V4 — the conversion action recurs, not only in the footer) */}
      <div className="border-y border-border bg-surface">
        <div className="mx-auto flex w-full max-w-[var(--width-container)] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="inline-flex items-center gap-2.5 text-ink">
            <span className="h-2 w-2 rounded-full bg-positive" aria-hidden />
            {STATUS.text}
          </p>
          <Link href={STATUS.href} className={buttonVariants("primary", "sm")}>
            {STATUS.cta}
            <ArrowUpRight size={15} strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      {/* Now + Writing — merged two-column (shortens the page) */}
      <Section space="md" tone="subtle" ariaLabel="Now and writing" className="reveal">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <SectionHeading kicker={home.now.kicker}>{home.now.title}</SectionHeading>
            <p className="mt-8 max-w-[42ch] text-ink-secondary">{home.now.teaser}</p>
            <div className="mt-6">
              <Link
                href={home.now.href}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
              >
                {home.now.cta}{" "}
                <ArrowRight
                  size={15}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
          <div>
            <SectionHeading kicker="Writing">Selected writing</SectionHeading>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/writing/${p.slug}`}
                    className="group -mx-4 grid gap-1 rounded-[var(--radius-md)] px-4 py-4 transition-colors duration-200 ease-[var(--ease-out)] hover:bg-surface md:grid-cols-[1fr_auto] md:items-baseline md:gap-6"
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
            <div className="mt-6">
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
          </div>
        </div>
      </Section>

      {/* FAQ — the questions a hiring manager has, in a Clerk accordion (trimmed to 4) */}
      <Section space="md" ariaLabel="Frequently asked questions" className="reveal">
        <Faq />
      </Section>

      {/* Contact — a serif philosophy line, then a quiet resolution (dark close) */}
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
