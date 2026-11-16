import Link from "next/link";
import { home } from "@/content/site";
import { BAND_CELL, BAND_ROW, BAND_RULE_LG, BAND_RULE_SM } from "@/constants/bands";

/**
 * ProofStrip — the honest "trusted by" replacement (fixes V3). No logos or
 * quotes we can't back: the employer is the real third-party anchor, and every
 * stat links to the page where a visitor can verify the count for themselves —
 * the site's "no number without its backing" rule applies here too. Server
 * component, rendered on /about.
 *
 * Presence. The stats used to sit inline at body size, which made three claims
 * the page is built on read like a footnote. They are now the largest thing in
 * the band — mono, tabular, value over label — laid out as ruled CELLS on the
 * band geometry in `constants/bands.ts`, one kind of hairline and one cell
 * padding throughout. The band carries `.reveal`, so it rises into place once as
 * you reach it; the effect is on the band as a whole because a stat that arrives
 * after its neighbours reads as a loading state, not as choreography.
 *
 * A11y: each stat is one link whose accessible name is the full "value label"
 * phrase, so "4" is never announced alone. The label stays UNDERLINED at rest —
 * these links sit in a field of non-link text, and a colour-only affordance
 * failed the gate here once already (WCAG 1.4.1). The underline is CONSTANT, not
 * a hover state — hover only tints the value to accent, and focus is the global
 * focus ring. The separators are CSS borders, so they add no DOM and nothing for
 * assistive technology to announce.
 */
export function ProofStrip() {
  const { proof } = home;
  return (
    <div className="reveal border-y border-border bg-surface">
      <div className={`${BAND_ROW} flex flex-col lg:flex-row lg:items-stretch`}>
        {/* `flex-1`, not `flex-none` + `justify-between`: the stats' leading rule
            has to sit against this cell. A gap between them would leave the rule
            floating in the middle of the row with air on both sides. */}
        <div className={`${BAND_CELL} flex flex-1 items-center pl-0`}>
          <p className="max-w-[32ch] text-sm text-ink-secondary">
            {proof.lead} <span className="font-medium text-ink">{proof.employer}</span>
            <span className="text-ink-tertiary"> · {proof.employerNote}</span>
          </p>
        </div>
        {/* The group's boundary with the lead cell lives on the <ul>, because the
            lead sits ABOVE the stats until `lg` and beside them after. */}
        <ul className={`${BAND_RULE_LG} grid grid-cols-1 sm:grid-cols-3 lg:min-w-[34rem]`}>
          {proof.stats.map((s, i) => (
            // Crisp hairlines rather than the fading ones this strip used to
            // draw: one kind of separator across the whole band.
            //
            // The leading padding tracks which cell is at the row's left edge, and
            // that changes twice: stacked (every cell is), 3-up from `sm` (only the
            // first), beside the lead cell from `lg` (none — it needs its padding
            // back so its text clears the rule).
            <li
              key={s.label}
              className={`${BAND_CELL} pl-0 ${
                i === 0 ? "lg:pl-6" : `${BAND_RULE_SM} sm:pl-6`
              }`}
            >
              <Link href={s.href} className="group block">
                <span className="block font-mono text-3xl tabular-nums text-ink transition-colors duration-base group-hover:text-accent">
                  {s.value}
                </span>
                {/* currentColor underline, not a near-invisible hairline one:
                    it has to read as an underline at rest, which is the whole
                    point of not relying on colour alone. */}
                <span className="mt-1.5 block max-w-[16ch] text-sm text-ink-secondary underline decoration-1 underline-offset-4">
                  {s.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
