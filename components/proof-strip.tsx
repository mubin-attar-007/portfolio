import { profile } from "@/lib/content";
import { Reveal } from "./reveal";

/**
 * Positioning + proof strip — the first thing after the hero in a 30-second
 * recruiter scan. One line of positioning, then the three headline figures
 * from profile.stats (4 live AI products · 3+ years shipping · $0 infra).
 * All figures come from /content; nothing is hardcoded here.
 */
export function ProofStrip() {
  return (
    <section aria-label="At a glance" className="relative px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="mono mx-auto max-w-2xl text-center text-[13.5px] leading-relaxed text-muted">
            <span className="text-ink">{profile.role}</span> — {profile.tagline}
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <dl className="mt-8 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-elev/40 py-6 text-center">
            {profile.stats.map((s) => (
              <div key={s.label} className="px-3 sm:px-6">
                <dt className="sr-only">{s.label}</dt>
                <dd className="tnum gradient-text font-display text-3xl font-semibold leading-none sm:text-5xl">
                  {s.value}
                </dd>
                <p className="mono mt-2.5 text-[10.5px] uppercase tracking-wider text-dim sm:text-[11.5px]">
                  {s.label}
                </p>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
