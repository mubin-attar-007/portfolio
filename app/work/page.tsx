import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { projectMeta, type ProjectMeta } from "@/lib/content";
import { GitHubIcon } from "@/components/brand-icons";
import { Nav } from "@/components/nav";
import { Reveal } from "@/components/reveal";

const SITE = "https://mubin-attar.vercel.app";

const CATEGORY: Record<string, string> = {
  dbwhisper: "01 · NL→SQL AGENT",
  "llm-studio": "02 · AI SaaS PLATFORM",
  tradepulse: "03 · BACKTESTING + COPILOT",
  crownwager: "04 · ML ANALYTICS",
};

export const metadata: Metadata = {
  title: "Work — 4 live systems, deep-dived",
  description:
    "Engineering case studies for four production AI systems: DBWhisper (NL→SQL agent), LLM Studio (multi-user AI SaaS), TradePulse (honest backtesting), and CrownWager (+EV sports ML). Architecture, decisions, and trade-offs — not screenshots.",
  alternates: { canonical: `${SITE}/work` },
  openGraph: {
    type: "website",
    url: `${SITE}/work`,
    title: "Work — 4 live systems, deep-dived · Mubin Attar",
    description:
      "Engineering case studies for four production AI systems. Architecture, decisions, and trade-offs.",
  },
};

function CaseStudyCard({ p }: { p: ProjectMeta }) {
  return (
    <article className="card lift group relative flex h-full flex-col p-6 sm:p-7">
      <span
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)` }}
        aria-hidden
      />

      <div className="flex items-center justify-between">
        <span className="mono text-[11px] tracking-wider" style={{ color: p.accent }}>
          {CATEGORY[p.slug] ?? "CASE STUDY"}
        </span>
        <span className="badge-live inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> LIVE
        </span>
      </div>

      <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
        <Link href={`/work/${p.slug}`} className="cs-card-title">
          <span className="absolute inset-0" aria-hidden />
          {p.name}
        </Link>
      </h2>
      <p className="mt-1.5 text-[15px] text-muted">{p.tagline}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {p.stack.slice(0, 6).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
        {p.stack.length > 6 && (
          <span className="chip">+{p.stack.length - 6}</span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-7">
        <span className="mono relative z-10 inline-flex items-center gap-1 text-[13px] font-medium text-accent transition group-hover:gap-1.5">
          Read case study <ArrowRight size={15} />
        </span>
        <a
          href={p.live}
          target="_blank"
          rel="noopener noreferrer"
          className="mono relative z-10 inline-flex items-center gap-1 text-[13px] text-dim transition hover:text-ink"
        >
          Open live <ArrowUpRight size={14} />
        </a>
        <a
          href={p.github}
          target="_blank"
          rel="noopener noreferrer"
          className="mono relative z-10 inline-flex items-center gap-1.5 text-[13px] text-dim transition hover:text-ink"
        >
          <GitHubIcon size={14} /> Source
        </a>
      </div>
    </article>
  );
}

export default function WorkIndex() {
  const items = [...projectMeta].sort((a, b) => a.order - b.order);

  return (
    <>
      <Nav />
      <main className="relative min-h-screen px-5 pb-28 pt-28 sm:px-8 md:pt-32">
        <div className="aurora" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <Reveal>
            <p className="eyebrow">Case studies · shipped · verifiable</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-5xl md:text-[3.4rem]">
              Four systems, taken apart <span className="gradient-text">at the seams.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
              Not marketing screenshots — the real engineering. Each case study walks the
              architecture, the decisions that mattered, and the trade-offs behind them, with an
              interactive system diagram and links to the live app and its source.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <CaseStudyCard p={p} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mono mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft/60 pt-5 text-[12px] text-dim">
              <span>
                <span className="text-muted">4 systems live</span> · 0 faked metrics
              </span>
              <Link href="/" className="inline-flex items-center gap-1 text-muted transition hover:text-accent">
                ← Back home
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}
