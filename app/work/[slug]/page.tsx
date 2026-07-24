import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Figure } from "@/components/ui/figure";
import { ArticleHeader } from "@/components/ui/article-header";
import { ArticleFooter } from "@/components/ui/article-footer";
import { Metric, MetricsRow } from "@/components/ui/metric";
import { buttonVariants } from "@/components/ui/button";
import { projects, projectBySlug, projectNeighbours } from "@/content/projects";
import { PROJECT_STATUS_LABEL } from "@/content/article";
import type { Project } from "@/content/schema";
import { formatDate } from "@/lib/format";
import { SITE } from "@/config/site";
import { PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import {
  CROWNWAGER_SECTIONS,
  CrownWagerBody,
} from "@/components/case-studies/crownwager";
import { DBWHISPER_SECTIONS, DBWhisperBody } from "@/components/case-studies/dbwhisper";
import { GENERIC_CASE_STUDY_SECTIONS, GenericBody } from "@/components/case-studies/generic";
import { LLM_STUDIO_SECTIONS, LlmStudioBody } from "@/components/case-studies/llm-studio";
import { TRADEPULSE_SECTIONS, TradePulseBody } from "@/components/case-studies/tradepulse";
import { DemoPosterPreload } from "@/components/case-studies/demo-poster-preload";
import { CaseStudyReadingOutline } from "@/components/case-studies/reading-outline";
import { type CaseStudySection } from "@/components/case-studies/section";
import { ProjectJsonLd } from "@/components/seo/json-ld";
type CaseStudyTemplate = {
  Body: () => ReactNode;
  sections: readonly CaseStudySection[];
};

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
  const url = `${SITE.url}/work/${slug}`;
  const lastPublished = p.changelog[p.changelog.length - 1]?.date;
  const lastUpdated = p.changelog[0]?.date;

  return {
    title: `${p.title} — case study`,
    description: p.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE.name,
      url,
      title: `${p.title} · Case study`,
      description: p.summary,
      publishedTime: lastPublished,
      modifiedTime: lastUpdated ?? lastPublished,
      authors: [SITE.name],
    },
  };
}

/** Projects with an authored deep write-up and a shared section index for the TOC. */
const BODIES: Record<string, CaseStudyTemplate> = {
  dbwhisper: { Body: DBWhisperBody, sections: DBWHISPER_SECTIONS },
  tradepulse: { Body: TradePulseBody, sections: TRADEPULSE_SECTIONS },
  crownwager: { Body: CrownWagerBody, sections: CROWNWAGER_SECTIONS },
  "llm-studio": { Body: LlmStudioBody, sections: LLM_STUDIO_SECTIONS },
};

/**
 * Live-product demo tours (public/demos/<slug>.webm), recorded from each real
 * deployment — a title card + a captioned feature walkthrough. Poster is a real
 * screenshot; older Safari that can't play webm falls back to it. LLM Studio is
 * auth-gated, so its tour is signed into a real account (the chat UI, streaming,
 * and model switching), not a login screen. Rendered once, below the metrics row.
 */
const DEMO_SHOTS: Record<
  string,
  { alt: string; caption: string; width: number; height: number }
> = {
  dbwhisper: {
    alt: "Silent screen tour of DBWhisper's live site — plain-English questions turned into validated read-only SQL, run, and answered.",
    caption: "Silent tour of the live product — plain English in, a fail-closed read-only query and answer out.",
    width: 768,
    height: 456,
  },
  crownwager: {
    alt: "Silent screen tour of CrownWager's live site — model-vs-market best bets with edge, expected value, and model win probability.",
    caption: "Silent tour of the live product — model probabilities turned into +EV picks (informational only, no real-money wagering).",
    width: 1280,
    height: 760,
  },
  tradepulse: {
    alt: "Silent screen tour of TradePulse's live site — an honest backtesting terminal for building and running trading strategies.",
    caption: "Silent tour of the live product — an honest backtesting terminal, “no cherry-picked numbers.”",
    width: 1280,
    height: 760,
  },
  "llm-studio": {
    alt: "Silent screen tour of LLM Studio's live app — a private multi-model chat workspace with token streaming and model switching.",
    caption: "Silent tour of the live app — a private, multi-model chat workspace: streaming answers, model switching, and per-user quotas.",
    width: 1280,
    height: 720,
  },
};

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p: Project | undefined = projectBySlug(slug);
  if (!p) notFound();
  const template = BODIES[slug];
  const sections = template?.sections ?? GENERIC_CASE_STUDY_SECTIONS;
  const demo = DEMO_SHOTS[slug];
  const { previous, next } = projectNeighbours(slug);

  return (
    <>
      {/* The shared page top keeps case studies aligned with every route. */}
      <Section space="lg" className={PAGE_HEADER_BAND}>
        <ProjectJsonLd
          title={p.title}
          description={p.summary}
          url={`${SITE.url}/work/${slug}`}
          timeline={p.timeline}
          role={p.role}
          systems={p.systems}
          links={p.links}
          changelog={p.changelog}
        />
        {demo ? <DemoPosterPreload href={`/demos/${slug}.webp`} /> : null}
        <nav
          aria-label="Breadcrumb"
          className="relative z-10 mb-8 font-mono text-xs text-ink-tertiary"
        >
          <Link href="/work" className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={13} strokeWidth={1.5} /> Work
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink-secondary">{p.title}</span>
        </nav>

        {/* The status is the kicker; role and timeline drop to the meta row, which
          is where the other two article templates put their document facts. One
          fused `status · role · timeline` line was the case study's own private
          format and read as a slug dump ("active-development"). */}
        <ArticleHeader
          kicker={PROJECT_STATUS_LABEL[p.status]}
          title={p.title}
          lede={p.summary}
          meta={[<span key="role">{p.role}</span>, <span key="timeline">{p.timeline}</span>]}
        >
          {p.links.live ? (
            <a
              href={p.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants("secondary", "sm")}
            >
              Open live <ArrowUpRight size={14} strokeWidth={1.5} />
            </a>
          ) : null}
          {p.links.repo ? (
            <a
              href={p.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent"
            >
              Source
            </a>
          ) : null}
        </ArticleHeader>
      </Section>

      {/* The body band spends the other half of the header seam; `lg` keeps the
          208px close the article template always had. The metrics row is the
          band's first content — no extra margin, the seam IS the gap. */}
      <Section space="lg" className={PAGE_BODY_BAND}>
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-10">
          <div id="work-case-study-content">
            <MetricsRow>
              {p.metrics.map((m) => (
                <Metric
                  key={m.label}
                  label={m.label}
                  after={m.value}
                  method={m.method}
                  methodHref="#performance-cost"
                />
              ))}
            </MetricsRow>

            {demo ? (
              <div className="mt-10 max-w-[var(--width-prose)]">
                <Figure
                  caption={
                    <>
                      {demo.caption}
                      {p.links.live ? (
                        <>
                          {" "}
                          <a
                            href={p.links.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline decoration-border-strong underline-offset-2 hover:text-accent-hover hover:decoration-accent"
                          >
                            Visit the live app →
                          </a>
                        </>
                      ) : null}
                    </>
                  }
                >
                  <video
                    poster={`/demos/${slug}.webp`}
                    aria-label={demo.alt}
                    width={demo.width}
                    height={demo.height}
                    controls
                    muted
                    playsInline
                    preload="none"
                    className="block h-auto w-full"
                  >
                    <source src={`/demos/${slug}.webm`} type="video/webm" />
                    <track
                      kind="captions"
                      src={`/demos/${slug}.vtt`}
                      srcLang="en"
                      label="English"
                      default
                    />
                  </video>
                </Figure>
              </div>
            ) : null}

            {/* No top margin: the body's first `<CS>` heading carries the section gap
                itself (PROSE.h2's `mt-14`), the same as the first heading in an MDX
                essay. A margin here would stack on top of it and the case study would
                open with a wider gap than the other two templates. */}
            <div>
              {template ? <template.Body /> : <GenericBody project={p} />}
            </div>

            {p.changelog.length > 0 ? (
              <section
                aria-label="Changelog"
                className="mt-20 max-w-[var(--width-prose)] border-t border-border pt-8"
              >
                <h2 className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">
                  Changelog
                </h2>
                <ol className="mt-6 flex flex-col gap-5">
                  {p.changelog.map((c, i) => (
                    <li key={`${c.date}-${i}`} className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-6">
                      <time dateTime={c.date} className="font-mono text-xs text-ink-tertiary">
                        {formatDate(c.date)}
                      </time>
                      <p className="text-ink-secondary">{c.summary}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <ArticleFooter collection="work" previous={previous} next={next} />
          </div>
          <CaseStudyReadingOutline slug={slug} sections={sections} contentId="work-case-study-content" />
        </div>
      </Section>
    </>
  );
}
