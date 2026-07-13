import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Figure } from "@/components/ui/figure";
import { PageHeader } from "@/components/ui/page-header";
import { Metric, MetricsRow } from "@/components/ui/metric";
import { buttonVariants } from "@/components/ui/button";
import { projects, projectBySlug } from "@/content/projects";
import type { Project } from "@/content/schema";
import { formatDate } from "@/lib/format";
import { SITE } from "@/config/site";
import { DBWhisperBody } from "@/components/case-studies/dbwhisper";
import { TradePulseBody } from "@/components/case-studies/tradepulse";
import { CrownWagerBody } from "@/components/case-studies/crownwager";
import { LlmStudioBody } from "@/components/case-studies/llm-studio";
import { GenericBody } from "@/components/case-studies/generic";

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
  return {
    title: `${p.title} — case study`,
    description: p.summary,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: `${p.title} · Case study`, description: p.summary },
  };
}

/** Projects with an authored deep write-up; others get GenericBody. */
const BODIES: Record<string, () => ReactNode> = {
  dbwhisper: DBWhisperBody,
  tradepulse: TradePulseBody,
  crownwager: CrownWagerBody,
  "llm-studio": LlmStudioBody,
};

/**
 * Live-product screenshots (public/demos/<slug>.png), captured from each real
 * deployment. Only products with a PUBLIC surface appear — LLM Studio is
 * auth-gated, so it has no shot rather than a faked one (Ground Rule: evidence,
 * not marketing). Rendered once, below the metrics row.
 */
const DEMO_SHOTS: Record<string, { alt: string; caption: string }> = {
  dbwhisper: {
    alt: "DBWhisper's live console — a plain-English question turned into a validated read-only SQL query, run, and answered.",
    caption: "The live product: plain English in, a fail-closed read-only query and answer out.",
  },
  crownwager: {
    alt: "CrownWager's live site — a model-vs-market best bet showing edge, expected value, stake, and model win probability.",
    caption: "The live product: model probabilities turned into +EV picks — informational only, no real-money wagering.",
  },
  tradepulse: {
    alt: "TradePulse's live site — an honest backtesting terminal for building, analyzing, and automating trading strategies.",
    caption: "The live product: an honest backtesting terminal — “no cherry-picked numbers.”",
  },
};

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p: Project | undefined = projectBySlug(slug);
  if (!p) notFound();
  const Body = BODIES[slug];

  return (
    <Container className="py-16">
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-ink-tertiary">
        <Link href="/work" className="inline-flex items-center gap-1 hover:text-ink">
          <ArrowLeft size={13} strokeWidth={1.5} /> Work
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-secondary">{p.title}</span>
      </nav>

      <div className="mt-8">
        <PageHeader meta={`${p.status} · ${p.role} · ${p.timeline}`} title={p.title} lede={p.summary}>
          <div className="mt-2 flex flex-wrap items-center gap-4">
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
          </div>
        </PageHeader>
      </div>

      <div className="mt-10">
        <MetricsRow>
          {p.metrics.map((m) => (
            <Metric key={m.label} label={m.label} after={m.value} method={m.method} />
          ))}
        </MetricsRow>
      </div>

      {DEMO_SHOTS[slug] ? (
        <div className="mt-10 max-w-[var(--width-prose)]">
          <Figure
            caption={
              <>
                {DEMO_SHOTS[slug]!.caption}
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
            <Image
              src={`/demos/${slug}.png`}
              alt={DEMO_SHOTS[slug]!.alt}
              width={1920}
              height={1140}
              sizes="(max-width: 768px) 100vw, 720px"
              className="h-auto w-full"
            />
          </Figure>
        </div>
      ) : null}

      <div className="mt-4">{Body ? <Body /> : <GenericBody project={p} />}</div>

      {p.changelog.length > 0 ? (
        <section
          aria-label="Changelog"
          className="mt-16 max-w-[var(--width-prose)] border-t border-border pt-8"
        >
          <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">Changelog</h2>
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

      <div className="mt-16 border-t border-border pt-8">
        <Link href="/work" className="text-sm font-medium text-accent hover:text-accent-hover">
          ← All work
        </Link>
      </div>
    </Container>
  );
}
