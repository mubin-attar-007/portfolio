import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Section } from "@/components/layout/section";
import { WorkSubnav } from "@/components/layout/work-subnav";
import { BrowserFrame } from "@/components/ui/browser-frame";
import { Button } from "@/components/ui/button";
import { Caret, CaretLink } from "@/components/ui/caret-link";
import { Chip } from "@/components/ui/chip";
import { CircuitArt } from "@/components/ui/circuit-art";
import { Plate } from "@/components/ui/plate";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusPill } from "@/components/ui/status-pill";
import { StickySteps } from "@/components/ui/sticky-steps";
import { Timeline, TimelineEntry } from "@/components/ui/timeline";
import { BreadcrumbJsonLd, ProjectJsonLd } from "@/components/seo/json-ld";
import { BoundaryInspector } from "@/components/case-studies/boundary-inspector";
import { CROWNWAGER_SECTIONS, CrownWagerBody } from "@/components/case-studies/crownwager";
import { DBWHISPER_SECTIONS, DBWhisperBody } from "@/components/case-studies/dbwhisper";
import { GENERIC_CASE_STUDY_SECTIONS, GenericBody } from "@/components/case-studies/generic";
import { LLM_STUDIO_SECTIONS, LlmStudioBody } from "@/components/case-studies/llm-studio";
import { TRADEPULSE_SECTIONS, TradePulseBody } from "@/components/case-studies/tradepulse";
import { CaseStudyReadingOutline } from "@/components/case-studies/reading-outline";
import { FlagshipWalkthroughSection } from "@/components/case-studies/request-walkthrough";
import type { CaseStudySection } from "@/components/case-studies/section";
import { crownwagerDiagram } from "@/components/diagrams/data/crownwager";
import { dbwhisperDiagram } from "@/components/diagrams/data/dbwhisper";
import { llmStudioDiagram } from "@/components/diagrams/data/llm-studio";
import { tradepulseDiagram } from "@/components/diagrams/data/tradepulse";
import type { DiagramSpec } from "@/components/diagrams/types";
import { DecisionBento } from "@/components/work/decision-bento";
import { DEMO_FRAME_ID, DemoPlayer, WatchDemoButton } from "@/components/work/demo-player";
import { FlowStep } from "@/components/work/flow-step";
import { NeighbourCards } from "@/components/work/neighbour-cards";
import { projectFrontmatter } from "@/components/work/project-frontmatter";
import { Results } from "@/components/work/results";
import { WorkCta } from "@/components/work/work-cta";
import styles from "@/components/work/case-study.module.css";
import { boundaryCases } from "@/content/dbwhisper-boundary";
import { evals } from "@/content/evals";
import { CASE_STUDY_STEPS, caseStudyPage as copy } from "@/content/pages/work";
import { projects, projectBySlug, projectNeighbours } from "@/content/projects";
import { formatDate } from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  const lastPublished = p.changelog[p.changelog.length - 1]?.date;
  const lastUpdated = p.changelog[0]?.date;

  return pageMetadata({
    path: `/work/${slug}`,
    title: `${p.title} — case study`,
    description: p.summary,
    social: { title: `${p.title} · Case study` },
    article: { publishedTime: lastPublished, modifiedTime: lastUpdated ?? lastPublished },
  });
}

/** Each project's authored write-up, its section index, and its architecture data. */
type CaseStudyTemplate = {
  Body: () => ReactNode;
  sections: readonly CaseStudySection[];
  diagram: DiagramSpec;
};

const TEMPLATES: Record<string, CaseStudyTemplate> = {
  dbwhisper: { Body: DBWhisperBody, sections: DBWHISPER_SECTIONS, diagram: dbwhisperDiagram },
  tradepulse: { Body: TradePulseBody, sections: TRADEPULSE_SECTIONS, diagram: tradepulseDiagram },
  crownwager: { Body: CrownWagerBody, sections: CROWNWAGER_SECTIONS, diagram: crownwagerDiagram },
  "llm-studio": { Body: LlmStudioBody, sections: LLM_STUDIO_SECTIONS, diagram: llmStudioDiagram },
};

/** The demo's hostname for the frame's URL pill, or the project name when there is no demo. */
const frameUrl = (live: string | undefined, title: string): string => (live ? new URL(live).hostname : title);

/**
 * The hero lead: the summary without the tagline it often opens with, since
 * the tagline is already the headline ("An honest quant backtesting platform —
 * a look-ahead-free engine…" → "A look-ahead-free engine…").
 */
function heroLead(summary: string, tagline: string): string {
  const opener = tagline.replace(/\.$/, "");
  if (!summary.startsWith(opener)) return summary;
  const rest = summary.slice(opener.length).replace(/^\s*[—–-]\s*/, "");
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

/**
 * /work/[slug] — a public system's product page (the Clerk product-page
 * pattern): the work sub-nav, a centred hero with the real recording in a
 * browser frame, how it works, the decisions, the measured results with their
 * methods, the shipping log, then the full write-up.
 *
 * Every figure is read from the registries (content/projects.ts,
 * content/evals.ts) or the diagram data; nothing on this page is retyped.
 * DBWhisper has no recording — it was withdrawn because its frames showed
 * retracted figures — so its frame holds the product capture and its hero
 * leads with the request walkthrough.
 */
export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();
  const template = TEMPLATES[slug];
  const sections = template?.sections ?? GENERIC_CASE_STUDY_SECTIONS;
  const { tagline, stack } = projectFrontmatter(slug);
  const rows = evals.filter((e) => e.system === p.title);
  const steps = CASE_STUDY_STEPS[slug];
  const { previous, next } = projectNeighbours(slug);
  const url = absoluteUrl(`/work/${slug}`);
  const isFlagship = slug === "dbwhisper";

  return (
    <>
      <WorkSubnav current={slug} />
      <ProjectJsonLd
        title={p.title}
        description={p.summary}
        url={url}
        timeline={p.timeline}
        role={p.role}
        systems={p.systems}
        links={p.links}
        changelog={p.changelog}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Work", url: absoluteUrl("/work") },
          { name: p.title, url },
        ]}
      />

      {/* ---- hero ---- */}
      <section className={styles.hero} aria-labelledby="case-study-title">
        <CircuitArt fade="center" className={styles.heroArt} />
        <div className={styles.heroInner}>
          {p.recording ? (
            <WatchDemoButton label={copy.watchDemo} />
          ) : isFlagship ? (
            <a href="#request-walkthrough" className={styles.watchPill}>
              {copy.readWalkthrough}
              <Caret />
            </a>
          ) : null}
          <p className={styles.heroProduct}>{p.title}</p>
          <h1 id="case-study-title" className={styles.heroTitle}>
            {tagline}
          </h1>
          <p className={styles.heroLead}>{heroLead(p.summary, tagline)}</p>
          <div className={styles.heroActions}>
            {p.links.live ? (
              <Button href={p.links.live} variant="dark" size="lg" caret>
                {copy.tryDemo}
              </Button>
            ) : null}
            {p.links.repo ? (
              <Button href={p.links.repo} variant={p.links.live ? "light" : "dark"} size="lg" caret>
                {copy.viewSource}
              </Button>
            ) : null}
          </div>
          <div className={styles.heroMeta}>
            <StatusPill status="deployed-demo" />
            {p.links.repo ? <Chip variant="outline">Open source</Chip> : null}
            <span className={styles.heroFacts}>
              {p.role} · {p.timeline}
            </span>
          </div>
        </div>

        <div id={DEMO_FRAME_ID} className={styles.heroFrame}>
          <BrowserFrame url={frameUrl(p.links.live, p.title)}>
            {p.recording ? (
              <DemoPlayer
                slug={slug}
                alt={p.recording.alt}
                width={p.recording.width}
                height={p.recording.height}
                playLabel={copy.recording.play}
              />
            ) : (
              <Image
                src={`/demos/${slug}.png`}
                alt={p.card.alt}
                width={1920}
                height={1140}
                sizes="(min-width: 1100px) 1040px, calc(100vw - 32px)"
                priority
              />
            )}
          </BrowserFrame>
          <p className={styles.heroCaption}>{p.recording ? p.recording.caption : p.card.caption}</p>
        </div>
      </section>

      {/* ---- how it works ---- */}
      <Section space="md" id="how-it-works" ariaLabelledBy={isFlagship ? "walkthrough-title" : "how-title"}>
        {isFlagship ? (
          <FlagshipWalkthroughSection />
        ) : template && steps ? (
          <>
            <SectionHeader
              id="how-title"
              kicker={copy.howItWorks.kicker}
              title={copy.howItWorks.title}
              lead={copy.howItWorks.lead}
            />
            <StickySteps
              className={styles.steps}
              label={copy.howItWorks.stepsLabel}
              steps={steps.map((id) => {
                const node = template.diagram.nodes.find((n) => n.id === id);
                if (!node) throw new Error(`${slug}: no diagram node "${id}"`);
                return {
                  id,
                  title: node.label,
                  body: node.description,
                  media: (
                    <FlowStep
                      spec={template.diagram}
                      id={id}
                      fromLabel={copy.howItWorks.from}
                      toLabel={copy.howItWorks.to}
                    />
                  ),
                };
              })}
            />
          </>
        ) : null}
      </Section>

      {/* ---- DBWhisper: try the boundary ---- */}
      {isFlagship ? (
        <Section space="md" tone="subtle" id="try-the-boundary" ariaLabelledBy="boundary-heading">
          <div className={styles.boundary}>
            <SectionHeader
              id="boundary-heading"
              kicker={copy.boundary.kicker}
              title={copy.boundary.title}
              lead={copy.boundary.lead}
            />
            <BoundaryInspector cases={boundaryCases} />
          </div>
        </Section>
      ) : null}

      {/* ---- key decisions ---- */}
      {template ? (
        <Plate id="key-decisions-band" labelledBy="decisions-title">
          <SectionHeader id="decisions-title" kicker={copy.decisions.kicker} kickerTone="cyan" title={copy.decisions.title} />
          <div className={styles.bandBody}>
            <DecisionBento spec={template.diagram} labels={copy.decisions} />
          </div>
        </Plate>
      ) : null}

      {/* ---- results, with methods ---- */}
      <Section space="lg" id="results" ariaLabelledBy="results-title">
        <SectionHeader id="results-title" kicker={copy.results.kicker} title={copy.results.title} lead={copy.results.lead}>
          <CaretLink href={copy.results.evalsLink.href} size="md">
            {copy.results.evalsLink.label}
          </CaretLink>
        </SectionHeader>
        <div className={styles.bandBody}>
          <Results project={p} rows={rows} labels={copy.results} />
        </div>
      </Section>

      {/* ---- shipping log ---- */}
      {p.changelog.length > 0 ? (
        <Section space="md" tone="subtle" id="shipping-log" ariaLabelledBy="shipped-title">
          <div className={styles.split}>
            <SectionHeader id="shipped-title" kicker={copy.shipped.kicker} title={copy.shipped.title} />
            <Timeline label={`${p.title} releases`}>
              {p.changelog.map((c) => (
                <TimelineEntry key={`${c.date}-${c.summary}`} date={formatDate(c.date)} dateTime={c.date}>
                  <p>{c.summary}</p>
                </TimelineEntry>
              ))}
            </Timeline>
          </div>
        </Section>
      ) : null}

      {/* ---- the full write-up ---- */}
      <Section space="lg" id="write-up" ariaLabelledBy="writeup-title">
        <SectionHeader id="writeup-title" kicker={copy.writeup.kicker} title={copy.writeup.title} />
        <div className={styles.writeup}>
          <div id="work-case-study-content" className={styles.writeupBody}>
            {template ? <template.Body /> : <GenericBody project={p} />}
          </div>
          <CaseStudyReadingOutline slug={slug} sections={sections} contentId="work-case-study-content" />
        </div>
      </Section>

      {/* ---- stack, neighbours, CTA ---- */}
      <Section space="md" tone="subtle" ariaLabelledBy="stack-title">
        <div className={styles.split}>
          <SectionHeader id="stack-title" kicker={copy.stack.kicker} title={copy.stack.title} size="sm" />
          <div>
            <ul className={styles.stack} aria-label={`${p.title} stack`}>
              {stack.map((tool) => (
                <li key={tool}>
                  <Chip variant="raised" size="md">
                    {tool}
                  </Chip>
                </li>
              ))}
            </ul>
            <ul className={styles.stackSystems} aria-label={`${p.title} systems`}>
              {p.systems.map((system) => (
                <li key={system}>{system}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section space="md" ariaLabelledBy="case-study-cta-title">
        <NeighbourCards previous={previous} next={next} labels={copy.neighbours} />
        <div className={styles.ctaGap}>
          <WorkCta id="case-study-cta-title" {...copy.cta} />
        </div>
      </Section>
    </>
  );
}
