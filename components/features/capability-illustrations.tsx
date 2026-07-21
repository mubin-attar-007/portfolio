import type { JSX, ReactNode } from "react";

/**
 * Capability illustrations — compact, engineering-native "log" scenes that show
 * each mechanism ACTUALLY WORKING: the real narrative, not an abstract hint
 * (Clerk-caliber illustration in our idiom — terminals + status badges, never
 * stock art).
 *
 * Density is calibrated against Clerk's dark bento vignettes: sparse rows,
 * DIM chrome, and at most ONE colour moment per scene. Everything that is not
 * the scene's single payoff sits in tertiary ink — the eye should land on the
 * one row where the mechanism resolves (`focal` + a toned badge), and the rest
 * should read as ambient machinery. Early versions coloured every ✗ and ✓,
 * which made six cards shout at once; Clerk's cards whisper.
 *
 * The status badges settle in on card hover (globals.css
 * `.cap-card:hover .illo-badge`, reduced-motion-safe).
 * A11y: decorative (aria-hidden) — the card's heading + copy carry the meaning.
 */

type Tone = "ok" | "no" | "accent" | "dim";

const BADGE: Record<Tone, string> = {
  ok: "text-positive",
  no: "text-negative",
  accent: "text-accent",
  dim: "text-ink-tertiary",
};

function Row({
  label,
  badge,
  tone = "dim",
  focal = false,
  strike = false,
}: {
  label: string;
  badge?: string;
  /** Badge colour. `dim` (default) keeps the row inside the ambient machinery. */
  tone?: Tone;
  /** The scene's payoff row — its label steps up from tertiary to secondary. */
  focal?: boolean;
  strike?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`truncate ${strike ? "line-through" : ""} ${
          focal ? "text-ink-secondary" : "text-ink-tertiary"
        }`}
      >
        {label}
      </span>
      {badge ? <span className={`illo-badge shrink-0 ${BADGE[tone]}`}>{badge}</span> : null}
    </div>
  );
}

function Scene({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-full font-mono text-[0.63rem] leading-none" aria-hidden>
      {/* The chevron is chrome, not payoff — tertiary like the title, so the
          scene's one colour moment stays the focal badge below. */}
      <div className="mb-3 flex items-center gap-1.5 text-ink-tertiary">
        <span>▸</span>
        <span className="uppercase tracking-wide">{title}</span>
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

/** Fail-closed validation: two unsafe queries refused, one safe query passed. */
export function IlloValidator() {
  return (
    <Scene title="validate_sql">
      <Row label="DROP TABLE orders;" badge="✗ DDL" />
      <Row label="SELECT …; DELETE …" badge="✗ multi" />
      <Row label="SELECT revenue …" badge="✓ pass" tone="ok" focal />
    </Scene>
  );
}

/** Retrieval-scoped: only the two relevant tables are pulled from the schema. */
export function IlloRetrieval() {
  return (
    <Scene title="retrieve · k=2 / 12">
      <Row label="orders" badge="● pulled" tone="accent" focal />
      <Row label="users" />
      <Row label="order_items" badge="● pulled" tone="accent" focal />
      <Row label="audit_log" />
    </Scene>
  );
}

/** Look-ahead-free: decide on close, fill next open, canary proves no leak. */
export function IlloLookahead() {
  return (
    <Scene title="backtest">
      <Row label="decide @ bar i · close" badge="✓" />
      <Row label="fill @ bar i+1 · open" badge="✓" />
      <Row label="future ×3 canary" badge="byte-identical" tone="accent" focal />
    </Scene>
  );
}

/** Honest metrics: the cherry-picked number struck out, the CV'd number kept. */
export function IlloMetrics() {
  return (
    <Scene title="accuracy">
      <Row label="68.0% best-of-300" badge="✗ cherry" strike />
      <Row label="65.2% ±0.8% · 5-fold" badge="✓ real" tone="ok" focal />
    </Scene>
  );
}

/** Multi-provider fallback: the chain steps past dead providers to a live one. */
export function IlloFallback() {
  return (
    <Scene title="provider chain">
      <Row label="OpenAI" badge="✗ no key" />
      <Row label="OpenRouter" badge="✗ 429" />
      <Row label="Gemini · free tier" badge="✓ served" tone="ok" focal />
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
      <Row label="total" badge="$0 / mo" tone="accent" focal />
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
