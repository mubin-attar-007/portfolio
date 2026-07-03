import { LineChart, ShieldCheck, Gauge } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/lib/motion";

const PILLARS = [
  {
    icon: LineChart,
    title: "Evals & regression",
    body: "Fixed task banks and before/after numbers, so a change is an improvement I can prove — not a vibe. Prompts and retrieval get measured, not guessed.",
  },
  {
    icon: ShieldCheck,
    title: "Guardrails & safety",
    body: "Read-only database access, fail-closed validators, input validation, real auth. The safety layer is the seam everything hangs on — not an afterthought.",
  },
  {
    icon: Gauge,
    title: "Honest metrics",
    body: "Every number shown is genuinely computed, with trade-offs and failure modes stated. Demo mode is labeled as demo. No cherry-picking, no vanity stats.",
  },
];

export function HowIBuild() {
  return (
    <section id="build" className="dotgrid relative border-y border-line px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal trigger="view">
          <p className="eyebrow">The hidden 90%</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Anyone can wire an API to a demo.
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            The durable part is everything around the model call. That&apos;s where I spend my time.
          </p>
        </Reveal>

        <Stagger trigger="view" step={0.09} delay={0.1} className="mt-12 grid gap-4 md:grid-cols-3">
          {PILLARS.map((p) => (
            <StaggerItem key={p.title}>
              <div className="card lift group h-full p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-elev text-accent transition-colors duration-300 group-hover:border-accent/50">
                  <p.icon size={18} />
                </div>
                <h3 className="mono mt-4 text-sm uppercase tracking-wider text-ink">{p.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{p.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
