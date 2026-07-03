import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import {
  caseStudyMeta,
  caseStudyNeighbors,
  caseStudySlugs,
  loadCaseStudy,
} from "@/lib/case-studies";
import { diagramForSlug } from "@/lib/diagrams";
import { GitHubIcon } from "@/components/brand-icons";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { CaseStudyToc } from "@/components/case-study-toc";
import { Nav } from "@/components/nav";
import { Reveal } from "@/lib/motion";

const SITE = "https://mubin-attar.vercel.app";

/** Prerender one route per case study; anything else 404s. */
export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = caseStudyMeta(slug);
  if (!meta) return {};

  const title = `${meta.name} — ${meta.tagline}`;
  const description = `${meta.name}: ${meta.tagline} A deep engineering case study — architecture, key decisions, and trade-offs. Built with ${meta.stack.slice(0, 4).join(", ")}.`;
  const url = `${SITE}/work/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${meta.name} · Case study`,
      description,
    },
    twitter: { card: "summary_large_image", title: `${meta.name} — ${meta.tagline}`, description },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await loadCaseStudy(slug);
  if (!study) notFound();

  const { frontmatter: fm, content, toc } = study;
  const diagram = diagramForSlug(slug);
  const neighbors = caseStudyNeighbors(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: fm.name,
    description: fm.tagline,
    codeRepository: fm.github,
    url: `${SITE}/work/${slug}`,
    programmingLanguage: fm.stack,
    author: { "@type": "Person", name: "Mubin Attar", url: `${SITE}` },
  };

  return (
    <>
      <Nav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative min-h-screen px-5 pb-28 pt-28 sm:px-8 md:pt-32">
        <div className="aurora" aria-hidden />

        <article className="relative z-10 mx-auto w-full max-w-6xl">
          {/* top accent line — kept outside the clip-path reveals so the wipe
              never clips it (it anchors to the article, not the header) */}
          <span
            className="pointer-events-none absolute left-0 top-0 h-px w-full opacity-70"
            style={{ background: `linear-gradient(90deg, transparent, ${fm.accent}, transparent)` }}
            aria-hidden
          />

          {/* breadcrumb */}
          <Reveal trigger="load">
            <nav aria-label="Breadcrumb" className="mono text-[12px] text-dim">
              <Link href="/work" className="inline-flex items-center gap-1 transition hover:text-accent">
                <ArrowLeft size={13} /> Work
              </Link>
              <span className="px-2 text-line2">/</span>
              <span className="text-muted">{fm.name}</span>
            </nav>
          </Reveal>

          {/* header */}
          <Reveal trigger="load" delay={0.06}>
            <header className="mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge-live inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> LIVE
                </span>
                <span className="mono text-[12px] text-dim">{fm.tagline}</span>
              </div>

              <h1 className="mt-4 font-display text-4xl font-medium leading-[1.0] tracking-[-0.02em] sm:text-5xl md:text-[3.6rem]">
                {fm.name}
              </h1>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {fm.stack.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={fm.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent"
                >
                  Open live <ArrowUpRight size={16} />
                </a>
                <a
                  href={fm.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  <GitHubIcon size={15} /> Source
                </a>
              </div>
            </header>
          </Reveal>

          {/* interactive architecture diagram — CTO-at-a-glance */}
          {diagram && (
            <Reveal trigger="view" delay={0.04}>
              <section className="mt-12" aria-label="System architecture">
                <span className="eyebrow">System at a glance</span>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  How {fm.name} is wired
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
                  Hover or focus any node to trace how a request flows through the system.
                </p>
                <div className="mt-6">
                  <ArchitectureDiagram
                    spec={diagram}
                    caption={`${fm.name} — data flows left to right through each tier. Dashed edges are fallback or conditional paths.`}
                  />
                </div>
              </section>
            </Reveal>
          )}

          {/* body + sticky TOC */}
          <div className="mt-14 gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="cs-body min-w-0 max-w-[68ch]">{content}</div>

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <CaseStudyToc items={toc} />
              </div>
            </aside>
          </div>

          {/* prev / next */}
          {neighbors && (
            <nav
              aria-label="More case studies"
              className="mt-16 grid grid-cols-1 gap-4 border-t border-line-soft/60 pt-8 sm:grid-cols-2"
            >
              <Link href={`/work/${neighbors.prev.slug}`} className="card lift group flex flex-col p-5">
                <span className="mono inline-flex items-center gap-1.5 text-[11px] text-dim">
                  <ArrowLeft size={13} /> Previous
                </span>
                <span className="mt-2 font-display text-lg font-semibold tracking-tight text-ink transition group-hover:text-accent">
                  {neighbors.prev.name}
                </span>
                <span className="mt-0.5 text-[13.5px] text-muted">{neighbors.prev.tagline}</span>
              </Link>
              <Link
                href={`/work/${neighbors.next.slug}`}
                className="card lift group flex flex-col p-5 text-right sm:items-end"
              >
                <span className="mono inline-flex items-center gap-1.5 text-[11px] text-dim">
                  Next <ArrowRight size={13} />
                </span>
                <span className="mt-2 font-display text-lg font-semibold tracking-tight text-ink transition group-hover:text-accent">
                  {neighbors.next.name}
                </span>
                <span className="mt-0.5 text-[13.5px] text-muted">{neighbors.next.tagline}</span>
              </Link>
            </nav>
          )}

          <div className="mono mt-10 text-center text-[12px] text-dim">
            <Link href="/work" className="inline-flex items-center gap-1 transition hover:text-accent">
              ← All case studies
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
