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

/** Look-ahead-free: past bars lock to accent, future bars dim, a scan sweeps. */
export function IlloLookahead() {
  const bars = [
    { x: 26, h: 20 },
    { x: 46, h: 34 },
    { x: 66, h: 14 },
    { x: 86, h: 28 },
    { x: 118, h: 24 },
    { x: 138, h: 38 },
    { x: 158, h: 18 },
  ];
  return (
    <svg viewBox="0 0 200 84" className="illo illo-lookahead h-full w-full" fill="none" aria-hidden>
      <line x1="16" y1="66" x2="184" y2="66" stroke="var(--color-border)" strokeWidth="1.5" />
      {bars.map((b, i) => (
        <rect
          key={i}
          className={i < 4 ? "l-past" : "l-future"}
          x={b.x}
          y={66 - b.h}
          width="8"
          height={b.h}
          rx="2"
          fill="currentColor"
        />
      ))}
      <line className="l-now" x1="102" y1="16" x2="102" y2="70" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="3 3" />
      <rect className="l-scan" x="16" y="14" width="2.5" height="54" rx="1" fill="var(--color-accent)" />
    </svg>
  );
}

/** Honest metrics: a point with an error-bar bracket that draws in on hover. */
export function IlloMetrics() {
  return (
    <svg viewBox="0 0 200 84" className="illo illo-metrics h-full w-full" fill="none" aria-hidden>
      <line x1="34" y1="60" x2="166" y2="60" stroke="var(--color-border)" strokeWidth="1.5" />
      <g className="m-err">
        <line x1="100" y1="22" x2="100" y2="54" stroke="var(--color-accent)" strokeWidth="2" />
        <line x1="91" y1="23" x2="109" y2="23" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
        <line x1="91" y1="53" x2="109" y2="53" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle className="m-dot" cx="100" cy="38" r="6.5" fill="var(--color-accent)" />
    </svg>
  );
}

/** Multi-provider fallback: the cascade lights each provider, ✓ lands on a winner. */
export function IlloFallback() {
  const ys = [20, 38, 56];
  return (
    <svg viewBox="0 0 200 84" className="illo illo-fallback h-full w-full" fill="none" aria-hidden>
      {ys.map((y, i) => (
        <g key={y} className={`f-row f-r${i}`}>
          <circle cx="36" cy={y} r="5" fill="currentColor" />
          <rect x="50" y={y - 3} width="96" height="6" rx="3" fill="currentColor" opacity="0.45" />
        </g>
      ))}
      <g className="f-check">
        <circle cx="168" cy="38" r="12" fill="var(--color-accent)" />
        <path d="M162 38 l4 4 l8 -9" stroke="var(--color-on-accent)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** $0 stack: lean container blocks pop into a tidy stack, bottom-up, with spring. */
export function IlloInfra() {
  return (
    <svg viewBox="0 0 200 84" className="illo illo-infra h-full w-full" fill="none" aria-hidden>
      <rect className="i-block i-b0" x="70" y="54" width="60" height="12" rx="3" fill="currentColor" />
      <rect className="i-block i-b1" x="70" y="38" width="60" height="12" rx="3" fill="currentColor" />
      <rect className="i-block i-b2" x="70" y="22" width="60" height="12" rx="3" fill="currentColor" />
    </svg>
  );
}

export const ILLOS: Record<string, () => JSX.Element> = {
  validator: IlloValidator,
  retrieval: IlloRetrieval,
  lookahead: IlloLookahead,
  metrics: IlloMetrics,
  fallback: IlloFallback,
  infra: IlloInfra,
};
