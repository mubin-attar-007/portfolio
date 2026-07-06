import type { DiagramSpec } from "../types";

/** TradePulse — StrategySpec DSL + look-ahead-free event-driven engine. */
export const tradepulseDiagram: DiagramSpec = {
  nodes: [
    { id: "builder", label: "Builder UI", sublabel: "Next.js", description: "Authors a StrategySpec through a typed client; exit, sizing, and risk limits are mandatory fields.", col: 0, row: 1 },
    {
      id: "api",
      label: "FastAPI + ARQ",
      sublabel: "async · Redis queue",
      description: "Validates the spec and orchestrates backtests and paper runs; background work runs on an ARQ worker.",
      col: 1,
      row: 1,
      decision: {
        rejected: "Celery (sync-first), or a full broker — Kafka / RabbitMQ",
        why: "The app is async-first, and Redis is already a hard dependency for sessions — so ARQ (asyncio-native, Redis-backed) adds no new infrastructure. The ingestion supervisor and paper-trading cron live on the worker, never in the API lifespan, so a web deploy never interrupts live feeds.",
        tradeoff: "Redis pub/sub is lossy by design — fine for transient quotes; real-money fills would need an outbox, which is deferred behind an interface seam.",
      },
    },
    {
      id: "spec",
      label: "StrategySpec",
      sublabel: "one canonical DSL",
      description: "One canonical, non-Turing-complete spec shared by builder, engine, paper, and AI. Operands read only closed bars — look-ahead is unrepresentable.",
      col: 1,
      row: 2,
      decision: {
        rejected: "Four separate specs (AI, engine, DB, UI) with no single owner",
        why: "The legacy had four ways to describe a strategy and no source of truth — the #1 integration risk. Now one Pydantic-v2 spec is the contract: owned by the engine, consumed by the AI, UI (zod via OpenAPI), and DB. Entry, exit, sizing, and risk are mandatory; a CI drift-guard fails if any generated artifact diverges.",
        tradeoff: "Stricter schema rejects some legacy entry-only strategies — deliberately, to force discipline.",
      },
    },
    {
      id: "engine",
      label: "Backtest engine",
      sublabel: "decide i · fill i+1 open",
      description: "Event-driven replay: decide on closed bar i, fill at bar i+1's open. Costs and slippage per fill.",
      col: 2,
      row: 1,
      decision: {
        rejected: "Simpler bar-forward replay with looser timing (lets the future leak in)",
        why: "Financial honesty is the product. Decisions are evaluated only after a bar closes; fills happen at the next bar's open; indicators are causal (bar i sees only bars 0..i). A canary test scales all future bars by 3× and asserts the past equity curve is byte-identical — so look-ahead is caught by CI, not trust.",
        tradeoff: "A more complex state machine than a naive loop — paid back in reproducibility. Default costs (2 bps commission + 1 bps slippage) are always on, so the numbers are honest, not flattering.",
      },
    },
    { id: "risk", label: "Risk limits", sublabel: "enforced at entry", description: "Position clamp, daily-loss kill-switch, consecutive-loss halt — fired before a position is taken, recorded as risk events.", col: 2, row: 2 },
    { id: "result", label: "Reproducible result", sublabel: "spec_hash · engine_ver · data_fp", description: "Every result carries a spec hash, engine version, and data fingerprint, so any run can be re-derived.", col: 2, row: 3 },
    {
      id: "worker",
      label: "ARQ paper engine",
      sublabel: "same engine",
      description: "Paper trading runs the exact backtest engine with close_at_end=False; a parity test guarantees they agree.",
      col: 3,
      row: 0,
      decision: {
        rejected: "A separate live/paper execution path from the backtester",
        why: "Two engines drift; the paper results would stop matching the backtest that sold the strategy. Instead paper trading calls the same engine.run() with close_at_end=False, and a parity test asserts identical final equity. Even the position-sizing calculator delegates to the engine's _size() rather than reimplementing it.",
        tradeoff: "The engine must stay pure and reusable — a constraint that keeps the design honest.",
      },
    },
    {
      id: "ts",
      label: "TimescaleDB",
      sublabel: "or plain Postgres",
      description: "1-minute bars in a TimescaleDB hypertable when available; higher timeframes derived on the fly via time_bucket.",
      col: 3,
      row: 2,
      decision: {
        rejected: "Mandatory TimescaleDB, or pre-aggregating every timeframe at ingest",
        why: "Store only 1-minute bars; derive 5m/1h/1d on the fly with time_bucket — always fresh, zero staleness. The migration creates a hypertable only if the extension exists, and falls back to a normal Postgres table otherwise, so it runs on any free-tier Postgres (Neon, Supabase, RDS).",
        tradeoff: "On-the-fly aggregation costs a little CPU vs. pre-aggregated tables — worth it to support any timeframe without a migration.",
      },
    },
    {
      id: "ai",
      label: "AI copilot",
      sublabel: "grounded",
      description: "NL→validated spec via a validate-repair loop; narrates only the numbers present, never invents, never auto-executes.",
      col: 3,
      row: 3,
      decision: {
        rejected: "Free-form LLM output that can invent numbers or place trades",
        why: "The copilot turns natural language into a StrategySpec through a validate-repair loop (up to 2 repairs) — the output is always a schema-valid spec or an honest refusal. When it narrates results it is instructed to use only the numbers provided, never invent, and always end with 'not financial advice'.",
        tradeoff: "Some NL inputs are rejected rather than guessed — the right failure mode for money.",
      },
    },
  ],
  edges: [
    { from: "builder", to: "api", label: "spec" },
    { from: "api", to: "spec", label: "validate" },
    { from: "spec", to: "engine", label: "replay" },
    { from: "engine", to: "risk" },
    { from: "engine", to: "result" },
    { from: "engine", to: "worker", label: "reuse", dashed: true },
    { from: "engine", to: "ts", label: "bars" },
    { from: "spec", to: "ai", label: "NL → spec", dashed: true },
  ],
};
