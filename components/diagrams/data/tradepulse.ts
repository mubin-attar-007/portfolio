import type { DiagramSpec } from "../types";

/** TradePulse — StrategySpec DSL + look-ahead-free event-driven engine. */
export const tradepulseDiagram: DiagramSpec = {
  nodes: [
    { id: "builder", label: "Builder UI", sublabel: "Next.js", description: "Authors a StrategySpec through a typed client; exit, sizing, and risk limits are mandatory fields.", col: 0, row: 1 },
    { id: "api", label: "FastAPI", sublabel: "Pydantic v2", description: "Validates the spec and orchestrates backtests and paper runs.", col: 1, row: 1 },
    { id: "spec", label: "StrategySpec", sublabel: "declarative DSL", description: "One canonical, non-Turing-complete spec shared by builder, engine, paper, and AI. Operands read only closed bars — look-ahead is unrepresentable.", col: 1, row: 2 },
    { id: "engine", label: "Backtest engine", sublabel: "decide i · fill i+1 open", description: "Event-driven replay: decide on closed bar i, fill at bar i+1's open. Costs and slippage per fill.", col: 2, row: 1 },
    { id: "risk", label: "Risk limits", sublabel: "enforced at entry", description: "Position clamp, daily-loss kill-switch, consecutive-loss halt — fired before a position is taken, recorded as risk events.", col: 2, row: 2 },
    { id: "result", label: "Reproducible result", sublabel: "spec_hash · engine_ver · data_fp", description: "Every result carries a spec hash, engine version, and data fingerprint, so any run can be re-derived.", col: 2, row: 3 },
    { id: "worker", label: "ARQ paper engine", sublabel: "same engine", description: "Paper trading runs the exact backtest engine with close_at_end=False; a parity test guarantees they agree.", col: 3, row: 0 },
    { id: "ts", label: "TimescaleDB", sublabel: "bars · Redis", description: "Time-series bars in TimescaleDB; Redis for queues and cache.", col: 3, row: 2 },
    { id: "ai", label: "AI copilot", sublabel: "grounded", description: "NL→validated spec via a validate-repair loop; narrates only the numbers present, never invents, never auto-executes.", col: 3, row: 3 },
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
