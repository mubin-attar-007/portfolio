import { home } from "@/content/site";

/**
 * ProofStrip — the honest "trusted by" replacement (fixes V3). No logos or
 * quotes we can't back: the employer is the real third-party anchor, and every
 * stat is true and verifiable (the products are launchable below). Server
 * component. Distinct treatment (white band) from the tech marquee (subtle band)
 * so two consecutive strips don't read as one.
 */
export function ProofStrip() {
  const { proof } = home;
  return (
    <div className="border-y border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[var(--width-container)] flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm text-ink-secondary">
          {proof.lead} <span className="font-medium text-ink">{proof.employer}</span>
          <span className="text-ink-tertiary"> · {proof.employerNote}</span>
        </p>
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {proof.stats.map((s) => (
            <li key={s.label} className="flex items-baseline gap-2">
              <span className="font-mono text-lg tabular-nums text-ink">{s.value}</span>
              <span className="text-sm text-ink-secondary">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
