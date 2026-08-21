import type { ReactNode } from "react";
import { timeline, timelineIntro } from "@/content/timeline";
import { LABEL, PANEL, stagger } from "@/constants/page";

/**
 * One term/description pair inside a phase — Built, Learned, Changed.
 * Renders a real `<dt>`/`<dd>` pair inside the phase's `<dl>`, so the association
 * survives with styles off.
 */
function PhaseRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[7rem_1fr] sm:gap-6">
      <dt className={LABEL}>{label}</dt>
      <dd className="max-w-[var(--width-prose)] text-ink-secondary">{children}</dd>
    </div>
  );
}

/**
 * CareerTimeline — the "growth over titles" phases (Built / Learned / Mistake /
 * Changed), rendered as a section body. Lives inside /about; the résumé is the
 * same facts in list form.
 *
 * THE MISTAKE LINE IS THE POINT. Anyone can list what they built; naming what
 * you got wrong, per phase, is the part a reader can't get from a résumé, and it
 * is the reason to believe the rest. So it is not a fourth uniform row — it is
 * lifted onto its own surface inside each phase (a `bg-bg-subtle` block with the
 * 3px left rule the site uses for callouts, its label at full `ink`, its sentence
 * one step up at `text-lg text-ink`). That emphasis is built from CONTRAST AND
 * WEIGHT, not accent: three phase cards share a viewport, and three accent rules
 * would blow the two-accent-per-viewport budget. Nothing here depends on colour
 * alone — the label, the indent, and the surface all carry the signal.
 *
 * A11y: an `<h3>` per phase (the section owns the `<h2>`); each phase's four facts
 * are a real `<dl>`; the ordered list reflects that the phases have a sequence.
 * Entrance is CSS-only and collapses under `prefers-reduced-motion`.
 */
export function CareerTimeline() {
  return (
    <ol className="reveal-stagger flex flex-col gap-8">
      {timeline.map((phase, i) => (
        <li key={phase.period} className="reveal" style={stagger(i)}>
          <article className={PANEL}>
            <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
              <div>
                <h3 className="text-xl text-ink">{phase.role}</h3>
                {phase.org ? (
                  <p className="mt-0.5 text-sm text-ink-secondary">{phase.org}</p>
                ) : null}
              </div>
              <p className={LABEL}>{phase.period}</p>
            </header>

            <hr className="rule-fade my-6" />

            <dl className="flex flex-col gap-6">
              <PhaseRow label={timelineIntro.labels.built}>{phase.built}</PhaseRow>
              <PhaseRow label={timelineIntro.labels.learned}>{phase.learned}</PhaseRow>

              {/* The credibility device — see the component note above. */}
              <div className="rounded-[var(--radius-md)] border-l-[length:var(--stripe-width)] border-l-ink bg-bg-subtle px-5 py-4 sm:px-6 sm:py-5">
                <dt className="font-mono text-xs uppercase tracking-[0.06em] text-ink">
                  {timelineIntro.labels.mistake}
                </dt>
                <dd className="mt-2.5 max-w-[var(--width-prose)] text-lg text-ink">
                  {phase.mistake}
                </dd>
              </div>

              <PhaseRow label={timelineIntro.labels.changed}>{phase.changed}</PhaseRow>
            </dl>
          </article>
        </li>
      ))}
    </ol>
  );
}
