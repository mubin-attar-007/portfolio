import { Fragment, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { home } from "@/content/site";

/**
 * HeroTerminal — the hero's product surface: one representative DBWhisper
 * request shown end to end (prompt → tool trace → generated SQL → the shape that
 * comes back → the read-only verdict). It sits BELOW the centred hero copy as a
 * full-width panel, so the fold reads claim → action → evidence.
 *
 * Purpose / why it looks like this. The previous version started EMPTY and let a
 * timer type its way in, against a reserved 15rem min-height. Before the timer
 * finished — and for anyone with reduced motion, no JS, or a slow hydration —
 * the fold's right half was a large blank rectangle, which reads as a broken
 * component rather than product imagery. So the contract is inverted: the panel
 * is rendered COMPLETE in the markup and sized to its content, and the motion is
 * purely a way of uncovering text that is already there. Remove every animation
 * and the design is unchanged; that is the test it now passes.
 *
 * That let the whole component drop back to a server component: no `"use
 * client"`, no timers, no hydration boundary, and no possible flash of a
 * half-built frame. The type-in and the staggered response are CSS
 * (`.term-type` / `.reveal-stagger` in styles/globals.css), driven entirely by
 * `--ch` (the prompt's own length) times the `--motion-type-step` and
 * `--stagger-step` tokens — no millisecond is named here.
 *
 * Props: none. All copy and data come from `content/site.ts` (`home.heroDemo`).
 *
 * A11y. The transcript is presentational: it is `aria-hidden`, and the sr-only
 * paragraph below states the same thing in one sentence, so assistive tech gets
 * the meaning without wading through mono fragments. Nothing is ever hidden by
 * the animation — the clip is gated on `html.js` and on
 * `prefers-reduced-motion: no-preference`, so no-JS and reduced-motion visitors
 * get the finished frame immediately. The old skip/replay control existed
 * because the timed run lasted longer than five seconds (WCAG 2.2.2); the run is
 * now ~1.6s, fires once, and auto-updates nothing, so 2.2.2 no longer applies
 * and there is no mechanism left to lose. The result rows are labelled "sample
 * data" IN THE UI because they are illustrative values, not measurements.
 *
 * Performance: zero client JS, zero timers, no layout shift (the panel's height
 * is its content's height from the first paint). The only animated properties
 * are `clip-path`, `opacity` and `transform`.
 */

/**
 * The two custom properties this panel writes. Intersecting `CSSProperties` with
 * an explicit `Record` (the repo's `StaggerStyle` pattern — see live-demos.tsx /
 * capability-grid.tsx) types the key instead of asserting past it: a bare
 * `as CSSProperties` compiles just as happily with a misspelt property name,
 * which then silently does nothing at runtime.
 */
type StaggerStyle = CSSProperties & Record<"--i", number>;
type TypeStyle = CSSProperties & Record<"--ch", number>;

/**
 * Position in the entrance choreography; the delay itself is derived in CSS from
 * --stagger-step. Matches how app/page.tsx sets `--i`.
 */
const step = (i: number): StaggerStyle => ({ "--i": i });

/** The prompt's own length, the single input to the CSS type-in. */
const typeLen = (ch: number): TypeStyle => ({ "--ch": ch });

export function HeroTerminal() {
  const d = home.heroDemo;
  const rows = d.resultShape;

  return (
    <figure
      // `--shadow-lg`, not `md`: the panel is no longer a column-width figure
      // beside the copy — it is the hero's product surface, sitting full-width
      // under centred type. At that size the lighter shadow read as flat, and
      // Clerk's deep card shadow is what lifts it off the aurora.
      className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-lg)]"
      // The prompt's length is the single input to the type-in: it sets both the
      // duration and the step count, and the lead-in the response waits out.
      style={typeLen(d.prompt.length)}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-xs text-ink-tertiary">{d.app}</span>
        <span className="rounded-[var(--radius-sm)] border border-border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-ink-tertiary">
          {d.badge}
        </span>
      </div>

      <div className="px-4 py-4 font-mono text-xs leading-relaxed" aria-hidden>
        <p className="flex gap-2">
          <span className="text-accent">▸</span>
          <span className="term-type text-ink">{d.prompt}</span>
        </p>

        <div className="term-body reveal-stagger mt-4 flex flex-col gap-3.5">
          {/* The trace, named for the agent's real tools — the honest version of
              a "thinking…" spinner. */}
          <ul className="hero-item flex flex-col gap-1" style={step(0)}>
            {d.steps.map((s) => (
              <li key={s.tool} className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-ink-secondary">{s.tool}</span>
                <span className="text-ink-tertiary">{s.detail}</span>
              </li>
            ))}
          </ul>

          {/* pre-WRAP, not pre: the figure clips its overflow, so on a 360px
              phone `whitespace-pre` silently truncated the longest SQL line.
              Wrapping keeps indentation and every character readable without
              adding a scroll region nobody can focus. */}
          <div
            className="hero-item rounded-[var(--radius-md)] border border-border bg-bg-subtle px-3 py-2.5"
            style={step(1)}
          >
            {d.sql.map((line) => (
              <div key={line} className="whitespace-pre-wrap text-ink-secondary">
                {line}
              </div>
            ))}
          </div>

          {/* The result shape. Two columns rather than a <table>: the region is
              aria-hidden presentation, so a grid keeps the DOM light and the
              numbers right-aligned on tabular figures. */}
          <div className="hero-item" style={step(2)}>
            <div className="grid grid-cols-[1fr_auto] gap-x-6">
              <span className="border-b border-border pb-1 text-ink-tertiary">
                {rows.columns.key}
              </span>
              <span className="border-b border-border pb-1 text-right text-ink-tertiary">
                {rows.columns.value}
              </span>
              {rows.rows.map((row) => (
                <Fragment key={row.month}>
                  <span className="pt-1.5 tabular-nums text-ink-secondary">{row.month}</span>
                  <span className="pt-1.5 text-right tabular-nums text-ink">{row.revenue}</span>
                </Fragment>
              ))}
            </div>
            <p className="mt-2.5 flex items-center justify-between gap-3 text-ink-tertiary">
              <span>{rows.moreLabel}</span>
              {/* Labelled in the UI, not just in a comment: these values are
                  illustrative, and the site's whole claim is that it never
                  presents an invented number as a real one. */}
              <span className="rounded-[var(--radius-sm)] border border-border px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide">
                {rows.sampleLabel}
              </span>
            </p>
          </div>

          <p className="hero-item flex items-center gap-1.5 text-ink" style={step(3)}>
            <Check size={13} strokeWidth={2} className="text-positive" aria-hidden />
            <span>{d.result}</span>
          </p>
        </div>
      </div>

      <figcaption className="border-t border-border px-4 py-2.5 font-mono text-[0.7rem] text-ink-tertiary">
        {d.note}
      </figcaption>

      <p className="sr-only">
        Example DBWhisper request: “{d.prompt}”. It retrieves the schema, validates the query as
        read-only, runs it, and returns {d.result}. The rows shown are illustrative sample data.
      </p>
    </figure>
  );
}
