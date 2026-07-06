import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";
import { timeline } from "@/content/timeline";

export const metadata: Metadata = {
  title: "Timeline",
  description: "What I built, learned, got wrong, and changed — phase by phase.",
  alternates: { canonical: `${SITE.url}/timeline` },
};

const ROWS: { key: "built" | "learned" | "mistake" | "changed"; label: string }[] = [
  { key: "built", label: "Built" },
  { key: "learned", label: "Learned" },
  { key: "mistake", label: "Mistake" },
  { key: "changed", label: "Changed" },
];

export default function TimelinePage() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase text-ink-tertiary">Timeline</p>
      <h1 className="mt-6 max-w-[20ch] text-4xl text-ink sm:text-5xl">Growth over titles.</h1>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
        What I built, learned, got wrong, and changed — each phase includes the mistake, because
        that&apos;s where the learning is.
      </p>

      <div className="mt-12 flex flex-col gap-12">
        {timeline.map((phase) => (
          <div key={phase.period} className="grid gap-4 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-10">
            <div>
              <p className="font-mono text-xs uppercase text-ink-tertiary">{phase.period}</p>
              <h2 className="mt-1 text-xl text-ink">{phase.role}</h2>
              {phase.org ? <p className="text-sm text-ink-secondary">{phase.org}</p> : null}
            </div>
            <dl className="divide-y divide-border border-y border-border">
              {ROWS.map((r) => (
                <div key={r.key} className="grid gap-1 py-4 sm:grid-cols-[6rem_1fr] sm:gap-4">
                  <dt className="font-mono text-xs uppercase text-ink-tertiary">{r.label}</dt>
                  <dd className="max-w-[var(--width-prose)] text-ink-secondary">{phase[r.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Section>
  );
}
