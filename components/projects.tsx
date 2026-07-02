import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/lib/content";
import { GitHubIcon } from "./brand-icons";
import { Reveal } from "./reveal";

const CATEGORY: Record<string, string> = {
  dbwhisper: "01 · NL→SQL AGENT",
  "llm-studio": "02 · AI SaaS PLATFORM",
  tradepulse: "03 · BACKTESTING + COPILOT",
  crownwager: "04 · ML ANALYTICS",
};

function Card({ p, featured }: { p: Project; featured?: boolean }) {
  return (
    <article className="card lift group relative flex h-full flex-col p-6">
      <span
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)` }}
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <span className="mono text-[11px] tracking-wider" style={{ color: p.accent }}>
          {CATEGORY[p.slug]}
        </span>
        <span className="badge-live flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> LIVE
        </span>
      </div>

      <h3 className={`mt-4 font-semibold tracking-tight ${featured ? "text-3xl" : "text-2xl"}`}>
        {p.name}
      </h3>
      <p className="mt-1.5 text-[15px] text-muted">{p.tagline}</p>

      {featured && <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">{p.description}</p>}

      <ul className="mono mt-5 space-y-1.5 text-[12.5px] text-muted">
        {p.highlights.map((h) => (
          <li key={h} className="flex gap-2">
            <span className="text-accent">▸</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4 pt-1">
        <a
          href={p.live}
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-flex items-center gap-1 text-[13px] font-medium text-accent transition group-hover:gap-1.5 hover:text-accent2"
        >
          Open live <ArrowUpRight size={15} />
        </a>
        <a
          href={p.github}
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-flex items-center gap-1.5 text-[13px] text-dim transition hover:text-ink"
        >
          <GitHubIcon size={14} /> Source
        </a>
      </div>
    </article>
  );
}

export function Projects() {
  const bySlug = (s: string) => projects.find((p) => p.slug === s)!;
  return (
    <section id="work" className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="eyebrow">Shipped · live · verifiable</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Four products. All running <span className="gradient-text">right now.</span>
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            Not case-study screenshots — open tabs. Each links to the real, multi-user app and its
            source.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:[grid-auto-rows:1fr]">
          <Reveal className="md:col-span-2 md:row-span-2">
            <Card p={bySlug("dbwhisper")} featured />
          </Reveal>
          <Reveal delay={0.05}>
            <Card p={bySlug("llm-studio")} />
          </Reveal>
          <Reveal delay={0.1}>
            <Card p={bySlug("tradepulse")} />
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-3">
            <Card p={bySlug("crownwager")} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
