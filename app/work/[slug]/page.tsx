import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Figure } from "@/components/ui/figure";
import { ArticleHeader } from "@/components/ui/article-header";
import { ArticleFooter } from "@/components/ui/article-footer";
import { MetricCards } from "@/components/ui/metric";
import { buttonVariants } from "@/components/ui/button";
import { projects, projectBySlug, projectNeighbours } from "@/content/projects";
import { PROJECT_LINKS, PROJECT_STATUS_LABEL } from "@/content/article";
import type { Project } from "@/content/schema";
import { formatDate } from "@/lib/format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
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
import { BreadcrumbJsonLd, ProjectJsonLd } from "@/components/seo/json-ld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
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

/** Projects with an authored deep write-up and a shared section index for the TOC. */
const BODIES: Record<string, CaseStudyTemplate> = {
  dbwhisper: { Body: DBWhisperBody, sections: DBWHISPER_SECTIONS },
  tradepulse: { Body: TradePulseBody, sections: TRADEPULSE_SECTIONS },
  crownwager: { Body: CrownWagerBody, sections: CROWNWAGER_SECTIONS },
  "llm-studio": { Body: LlmStudioBody, sections: LLM_STUDIO_SECTIONS },
};

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p: Project | undefined = projectBySlug(slug);
  if (!p) notFound();
  const template = BODIES[slug];
  const sections = template?.sections ?? GENERIC_CASE_STUDY_SECTIONS;
  // The product recording (public/demos/<slug>.webm), captured from the real
  // deployment, stays on the page when a free-tier demo is down, so the case
  // study does not depend on a sleeping host. Its poster is a real screenshot,
  // which older Safari shows when it cannot play webm. A project without one
  // (DBWhisper, until it is re-recorded) opens on its metrics.
  const demo = p.recording;
  const { previous, next } = projectNeighbours(slug);
  const url = absoluteUrl(`/work/${slug}`);

  return (
    <>
      {/* The shared page top keeps case studies aligned with every route. */}
      <Section space="lg" className={PAGE_HEADER_BAND}>
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
        {demo ? <DemoPosterPreload href={`/demos/${slug}.webp`} /> : null}
        <Breadcrumb parent={{ label: "Work", href: "/work" }} current={p.title} />

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
              {PROJECT_LINKS.demo} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden />
            </a>
          ) : null}
          {/* ↗ marks a link that leaves the site in a new tab — the demo
              button beside it says so, and so must this. */}
          {p.links.repo ? (
            <a
              href={p.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-ink underline decoration-border-strong underline-offset-4 hover:decoration-accent"
            >
              {PROJECT_LINKS.source}
              <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden />
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
            {/* §9 order: the product FIRST, then the numbers it earned. Opening
                on three figures asks the reader to trust a claim before they
                have seen the thing making it. */}
            {demo ? (
              <div className="max-w-[var(--width-prose)]">
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
                            className="inline-flex items-center gap-0.5 text-accent underline decoration-border-strong underline-offset-2 hover:text-accent-hover hover:decoration-accent"
                          >
                            {PROJECT_LINKS.captionDemo}
                            <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden />
                          </a>{" "}
                          ({PROJECT_LINKS.captionWake}).
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

            {/* Pull-out metric cards. Every method line links to the chapter
                that derives it, so the reader can jump from a claim to its
                working rather than taking the number on trust. */}
            <div className={demo ? "mt-10" : ""}>
              <MetricCards metrics={p.metrics} methodHref="#performance-cost" />
            </div>

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
