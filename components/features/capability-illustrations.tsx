import type { JSX, ReactNode } from "react";

/**
 * Capability illustrations — compact, engineering-native "log" scenes that show
 * each mechanism ACTUALLY WORKING: the real narrative, not an abstract hint
 * (Clerk-caliber illustration in our idiom — terminals + status badges, never
 * stock art). Rich and legible at rest; the status badges settle in on card
 * hover (globals.css `.cap-card:hover .illo-badge`, reduced-motion-safe).
 * A11y: decorative (aria-hidden) — the card's heading + copy carry the meaning.
 */

type Tone = "ok" | "no" | "accent" | "dim";

function Row({
  label,
  badge,
  tone = "dim",
  muted = false,
  strike = false,
}: {
  label: string;
  badge?: string;
  tone?: Tone;
  muted?: boolean;
  strike?: boolean;
}) {
  const badgeCls =
    tone === "ok"
      ? "text-positive"
      : tone === "no"
        ? "text-negative"
        : tone === "accent"
          ? "text-accent"
          : "text-ink-tertiary";
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`truncate ${strike ? "line-through" : ""} ${muted ? "text-ink-tertiary" : "text-ink-secondary"}`}
      >
        {label}
      </span>
      {badge ? <span className={`illo-badge shrink-0 ${badgeCls}`}>{badge}</span> : null}
    </div>
  );
}

function Scene({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-full font-mono text-[0.63rem] leading-none" aria-hidden>
      <div className="mb-2.5 flex items-center gap-1.5 text-ink-tertiary">
        <span className="text-accent">▸</span>
        <span className="uppercase tracking-wide">{title}</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

/** Fail-closed validation: two unsafe queries refused, one safe query passed. */
export function IlloValidator() {
  return (
    <Scene title="validate_sql">
      <Row label="DROP TABLE orders;" badge="✗ DDL" tone="no" />
      <Row label="SELECT …; DELETE …" badge="✗ multi" tone="no" />
      <Row label="SELECT revenue …" badge="✓ pass" tone="ok" />
    </Scene>
  );
}

/** Retrieval-scoped: only the two relevant tables are pulled from the schema. */
export function IlloRetrieval() {
  return (
    <Scene title="retrieve · k=2 / 12">
      <Row label="orders" badge="● pulled" tone="accent" />
      <Row label="users" muted />
      <Row label="order_items" badge="● pulled" tone="accent" />
      <Row label="audit_log" muted />
    </Scene>
  );
}

/** Look-ahead-free: decide on close, fill next open, canary proves no leak. */
export function IlloLookahead() {
  return (
    <Scene title="backtest">
      <Row label="decide @ bar i · close" badge="✓" tone="ok" />
      <Row label="fill @ bar i+1 · open" badge="✓" tone="ok" />
      <Row label="future ×3 canary" badge="byte-identical" tone="accent" />
    </Scene>
  );
}

/** Honest metrics: the cherry-picked number struck out, the CV'd number kept. */
export function IlloMetrics() {
  return (
    <Scene title="accuracy">
      <Row label="68.0% best-of-300" badge="✗ cherry" tone="no" strike muted />
      <Row label="65.2% ±0.8% · 5-fold" badge="✓ real" tone="ok" />
    </Scene>
  );
}

/** Multi-provider fallback: the chain steps past dead providers to a live one. */
export function IlloFallback() {
  return (
    <Scene title="provider chain">
      <Row label="OpenAI" badge="✗ no key" tone="no" muted />
      <Row label="OpenRouter" badge="✗ 429" tone="no" muted />
      <Row label="Gemini · free tier" badge="✓ served" tone="ok" />
    </Scene>
  );
}

/** $0 stack: three free-tier services sum to zero monthly cost. */
export function IlloInfra() {
  return (
    <Scene title="cost / mo">
      <Row label="Vercel" badge="$0" />
      <Row label="HF Docker Space" badge="$0" />
      <Row label="Neon Postgres" badge="$0" />
      <Row label="total" badge="$0 / mo" tone="accent" />
    </Scene>
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
