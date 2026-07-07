import type { JSX } from "react";

/**
 * Capability illustrations — compact SVG scenes that play on card hover, the
 * Clerk-caliber upgrade over a static icon. Motion lives in globals.css (played
 * via `.cap-card:hover .illo-*`, staggered, spring-accented, reduced-motion
 * safe). Each visualises its capability. A11y: decorative (aria-hidden); the
 * card's heading + copy carry the meaning.
 */

/** Fail-closed validation: a query token slides into a gate, then a ✓ springs in. */
export function IlloValidator() {
  return (
    <svg viewBox="0 0 200 84" className="illo illo-validator h-full w-full" fill="none" aria-hidden>
      <rect className="v-track" x="14" y="39" width="150" height="6" rx="3" fill="var(--color-border)" />
      <rect className="v-token" x="14" y="34" width="36" height="16" rx="4" fill="var(--color-accent)" opacity="0.55" />
      <path className="v-gate" d="M104 20 V64 M118 20 V64" stroke="var(--color-border-strong)" strokeWidth="2.5" strokeLinecap="round" />
      <line className="v-scan" x1="111" y1="22" x2="111" y2="62" stroke="var(--color-accent)" strokeWidth="1.5" />
      <g className="v-check">
        <circle cx="170" cy="42" r="14" fill="var(--color-accent)" />
        <path d="M163 42 l5 5 l9 -10" stroke="var(--color-on-accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Retrieval-scoped: from a stack of table docs, only the relevant few are pulled. */
export function IlloRetrieval() {
  const rows = [22, 36, 50, 64];
  return (
    <svg viewBox="0 0 200 84" className="illo illo-retrieval h-full w-full" fill="none" aria-hidden>
      {rows.map((y, i) => (
        <g key={y} className={`r-row ${i === 1 || i === 2 ? "r-pick" : ""}`} style={{ transitionDelay: `${(i === 2 ? 1 : 0) * 90}ms` }}>
          <rect x="26" y={y} width="10" height="10" rx="2" fill="currentColor" className="r-dot" />
          <rect x="44" y={y + 2} width={i % 2 ? 96 : 120} height="6" rx="3" fill="currentColor" className="r-bar" />
        </g>
      ))}
    </svg>
  );
}

export const ILLOS: Record<string, () => JSX.Element> = {
  validator: IlloValidator,
  retrieval: IlloRetrieval,
};
