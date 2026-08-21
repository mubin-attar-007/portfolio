import Link from "next/link";
import { Check } from "lucide-react";
import { Section } from "@/components/layout/section";
import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { TextLink } from "@/components/ui/text-link";
import { flagshipHome } from "@/content/home-visual";
import { evalAnchor, evals } from "@/content/evals";
import { formatDate } from "@/lib/format";

/**
 * RegistryStrip — the eval registry, surfaced on the homepage.
 *
 * Clerk's homepage closes its argument with proof ("Trusted around the world");
 * a portfolio that markets measurement has something better than logos — the
 * registry itself. Four ruled rows, each linking to its full entry on /evals:
 * system, benchmark, metric, the mono result, the date. No card chrome; a
 * ledger reads more credible as a ledger.
 *
 * Rows come straight from `content/evals.ts` — the same array /evals renders —
 * so this strip can never disagree with the registry it advertises. Complete
 * rows carry the word "measured" beside the check, never colour alone.
 *
 * A11y: a list of links; each row's accessible name leads with the system and
 * metric so "82% exact" is never announced without its subject.
 */
export function RegistryStrip() {
  const r = flagshipHome.registry;

  return (
    <Section space="lg" tone="subtle" ariaLabelledBy="registry-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <EyebrowChip>{r.eyebrow}</EyebrowChip>
          <h2 id="registry-title" className="mt-4 max-w-[20ch] text-balance text-section font-bold text-ink">
            {r.title}
          </h2>
        </div>
        <p className="max-w-[44ch] text-pretty text-base text-ink-secondary md:pb-1">{r.body}</p>
      </div>

      <ul className="mt-10 border-t border-border">
        {evals.map((e) => (
          <li key={`${e.system}-${e.benchmark}`}>
            <Link
              href={`/evals#${evalAnchor(e)}`}
              prefetch={false}
              className="group/row grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 border-b border-border py-4 transition-colors duration-fast ease-[var(--ease-out)] hover:bg-surface sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:py-5"
            >
              <span className="min-w-0">
                <span className="block truncate text-[0.9375rem] font-[550] text-ink">
                  {e.system} <span className="font-normal text-ink-tertiary">· {e.benchmark}</span>
                </span>
                <span className="mt-0.5 block truncate text-sm text-ink-secondary">{e.metric}</span>
              </span>
              <span className="hidden min-w-0 items-center gap-2 font-mono text-sm tabular-nums text-ink transition-colors duration-fast ease-[var(--ease-out)] group-hover/row:text-accent sm:flex">
                {e.result}
                {e.status === "complete" ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[0.6875rem] text-ink-tertiary">
                    <Check size={11} strokeWidth={2.5} aria-hidden className="text-positive" />
                    measured
                  </span>
                ) : null}
              </span>
              <span className="text-right font-mono text-xs text-ink-tertiary">
                <span className="block sm:hidden">{e.result}</span>
                {e.date ? <time dateTime={e.date}>{formatDate(e.date)}</time> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <TextLink href={r.cta.href} className="mt-8">
        {r.cta.label}
      </TextLink>
    </Section>
  );
}
