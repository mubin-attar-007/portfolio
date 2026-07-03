// Typed architecture-diagram specs for each case study, grounded in the real
// systems documented in /content/projects/*.mdx and the linked repos. These
// drive <ArchitectureDiagram/> — a data-driven, interactive SVG/HTML diagram,
// never an image. A CTO should grasp each system from the nodes + edges alone.
//
// The model is a set of vertical LANES (left→right) each holding NODES stacked
// top→bottom, plus labeled EDGES between nodes. Node roles pick the accent:
//   entry    — client / UI surface
//   service  — an app service / API tier
//   agent    — the core intelligence (highlighted, the "brain")
//   guardrail— a safety / validation gate (teal-good)
//   store    — a database / cache / queue
//   external — a downstream / third-party dependency

export type NodeRole =
  | "entry"
  | "service"
  | "agent"
  | "guardrail"
  | "store"
  | "external";

export type DiagramNode = {
  id: string;
  /** short mono kicker, e.g. "01 · UI" */
  kicker?: string;
  /** primary label */
  label: string;
  /** one-line sublabel (the "what it does") */
  detail?: string;
  role: NodeRole;
  /** 0-based lane (column) index, left→right */
  lane: number;
  /** 0-based row within the lane, top→bottom */
  row: number;
};

export type DiagramEdge = {
  from: string;
  to: string;
  /** short mono label riding the edge, e.g. "REST /query" */
  label?: string;
  /** dashed = fallback / conditional path */
  variant?: "solid" | "dashed";
};

export type DiagramSpec = {
  /** column headers, one per lane */
  lanes: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

// ---------------------------------------------------------------------------
// DBWhisper — NL→SQL agent (LangGraph + pgvector RAG + fail-closed validator)
// ---------------------------------------------------------------------------
const dbwhisper: DiagramSpec = {
  lanes: ["Client", "Agent tier", "Retrieval", "Data"],
  nodes: [
    { id: "ui", kicker: "01 · UI", label: "Next.js UI", detail: "Vercel · REST /query", role: "entry", lane: 0, row: 1 },
    { id: "api", kicker: "02 · API", label: "FastAPI agent", detail: "LangGraph create_agent", role: "agent", lane: 1, row: 1 },
    { id: "tools", kicker: "03 · tools", label: "search_tables", detail: "semantic table retrieval", role: "service", lane: 2, row: 0 },
    { id: "verified", kicker: "04 · flywheel", label: "verified queries", detail: "approved Q→SQL, reused", role: "service", lane: 2, row: 1 },
    { id: "pgv", kicker: "05 · vectors", label: "pgvector", detail: "table-doc embeddings", role: "store", lane: 3, row: 0 },
    { id: "gen", kicker: "06 · generate", label: "multi-LLM", detail: "6-provider fallback chain", role: "service", lane: 1, row: 2 },
    { id: "guard", kicker: "07 · guardrail", label: "validate_sql", detail: "read-only · fail-closed", role: "guardrail", lane: 1, row: 3 },
    { id: "mem", kicker: "08 · memory", label: "Neon Postgres", detail: "LangGraph checkpoints", role: "store", lane: 3, row: 1 },
    { id: "targetdb", kicker: "09 · execute", label: "Target DB", detail: "Postgres · MySQL · MSSQL", role: "external", lane: 3, row: 3 },
  ],
  edges: [
    { from: "ui", to: "api", label: "REST /query" },
    { from: "api", to: "tools", label: "retrieve" },
    { from: "api", to: "verified", label: "reuse" },
    { from: "tools", to: "pgv", label: "semantic search" },
    { from: "verified", to: "pgv" },
    { from: "api", to: "gen", label: "generate" },
    { from: "gen", to: "guard", label: "gate" },
    { from: "guard", to: "targetdb", label: "read-only exec" },
    { from: "api", to: "mem", label: "checkpoint" },
  ],
};

// ---------------------------------------------------------------------------
// LLM Studio — multi-user AI chat SaaS (auth + tenancy + quota + SSE routing)
// ---------------------------------------------------------------------------
const llmStudio: DiagramSpec = {
  lanes: ["Client", "FastAPI", "Routing", "Data"],
  nodes: [
    { id: "spa", kicker: "01 · UI", label: "Vanilla-JS SPA", detail: "auth gate · HttpOnly cookie", role: "entry", lane: 0, row: 1 },
    { id: "auth", kicker: "02 · auth", label: "Argon2id + sessions", detail: "DB-backed, revocable", role: "guardrail", lane: 1, row: 0 },
    { id: "quota", kicker: "03 · quota", label: "Daily quota", detail: "checked BEFORE stream", role: "guardrail", lane: 1, row: 1 },
    { id: "chat", kicker: "04 · service", label: "chat_service", detail: "SSE · X-Accel-Buffering: no", role: "agent", lane: 1, row: 2 },
    { id: "router", kicker: "05 · route", label: "LLM router", detail: "client_for(model)", role: "service", lane: 2, row: 1 },
    { id: "cloud", kicker: "06 · cloud", label: "Cloud LLMs", detail: "Gemini · Groq · Mistral · GLM", role: "external", lane: 2, row: 0 },
    { id: "local", kicker: "07 · local", label: "Ollama", detail: "localhost:11434/v1", role: "external", lane: 2, row: 2 },
    { id: "repo", kicker: "08 · repo", label: "Repository layer", detail: "tenancy on every query", role: "service", lane: 1, row: 3 },
    { id: "db", kicker: "09 · store", label: "Neon ⇄ SQLite", detail: "users · chats · usage_daily", role: "store", lane: 3, row: 2 },
  ],
  edges: [
    { from: "spa", to: "auth", label: "login" },
    { from: "auth", to: "quota" },
    { from: "quota", to: "chat", label: "allow" },
    { from: "chat", to: "router", label: "stream" },
    { from: "router", to: "cloud" },
    { from: "router", to: "local", variant: "dashed" },
    { from: "chat", to: "repo", label: "persist" },
    { from: "repo", to: "db", label: "owner-scoped" },
  ],
};

// ---------------------------------------------------------------------------
// TradePulse — honest backtesting (StrategySpec DSL + look-ahead-free engine)
// ---------------------------------------------------------------------------
const tradepulse: DiagramSpec = {
  lanes: ["Client", "API + DSL", "Engine", "Data / AI"],
  nodes: [
    { id: "builder", kicker: "01 · UI", label: "Builder UI", detail: "Next.js · typed client", role: "entry", lane: 0, row: 1 },
    { id: "api", kicker: "02 · API", label: "FastAPI", detail: "Pydantic v2 validation", role: "service", lane: 1, row: 1 },
    { id: "spec", kicker: "03 · DSL", label: "StrategySpec", detail: "non-Turing-complete · closed bars", role: "guardrail", lane: 1, row: 2 },
    { id: "engine", kicker: "04 · engine", label: "Backtest engine", detail: "decide i · fill i+1 open", role: "agent", lane: 2, row: 1 },
    { id: "risk", kicker: "05 · risk", label: "Risk limits", detail: "enforced at entry", role: "guardrail", lane: 2, row: 2 },
    { id: "result", kicker: "06 · result", label: "Reproducible result", detail: "spec_hash · engine_ver · data_fp", role: "service", lane: 2, row: 3 },
    { id: "worker", kicker: "07 · worker", label: "ARQ paper engine", detail: "same engine · close_at_end=False", role: "service", lane: 3, row: 0 },
    { id: "ts", kicker: "08 · store", label: "TimescaleDB", detail: "bars · Redis queues", role: "store", lane: 3, row: 2 },
    { id: "ai", kicker: "09 · copilot", label: "AI copilot", detail: "validate-repair · never invents", role: "external", lane: 3, row: 3 },
  ],
  edges: [
    { from: "builder", to: "api", label: "spec" },
    { from: "api", to: "spec", label: "validate" },
    { from: "spec", to: "engine", label: "replay" },
    { from: "engine", to: "risk" },
    { from: "engine", to: "result" },
    { from: "engine", to: "worker", label: "reuse engine", variant: "dashed" },
    { from: "engine", to: "ts", label: "bars" },
    { from: "spec", to: "ai", label: "NL → spec", variant: "dashed" },
  ],
};

// ---------------------------------------------------------------------------
// CrownWager — +EV sports analytics (decoupled Django + FastAPI ML service)
// ---------------------------------------------------------------------------
const crownwager: DiagramSpec = {
  lanes: ["Client", "Backend", "ML service", "Data"],
  nodes: [
    { id: "web", kicker: "01 · UI", label: "Next.js 15", detail: "React 19 · REST + JWT", role: "entry", lane: 0, row: 1 },
    { id: "django", kicker: "02 · API", label: "Django + DRF", detail: "service + repository layers", role: "agent", lane: 1, row: 1 },
    { id: "ev", kicker: "03 · math", label: "EV / Kelly", detail: "Decimal edge + staking", role: "service", lane: 1, row: 0 },
    { id: "record", kicker: "04 · record", label: "Graded record", detail: "settles on FINAL scores", role: "guardrail", lane: 1, row: 2 },
    { id: "bot", kicker: "05 · bot", label: "CrownBot", detail: "Claude · grounded in best bets", role: "service", lane: 1, row: 3 },
    { id: "ml", kicker: "06 · model", label: "FastAPI ML", detail: "own container · /predict", role: "external", lane: 2, row: 1 },
    { id: "registry", kicker: "07 · registry", label: "Model registry", detail: "SHA-256 · validated:true only", role: "guardrail", lane: 2, row: 2 },
    { id: "xgb", kicker: "08 · XGBoost", label: "XGBoost", detail: "~65% 5-fold CV", role: "agent", lane: 2, row: 0 },
    { id: "pg", kicker: "09 · store", label: "PostgreSQL", detail: "odds · bets · Celery + Redis", role: "store", lane: 3, row: 1 },
  ],
  edges: [
    { from: "web", to: "django", label: "REST + JWT" },
    { from: "django", to: "ev" },
    { from: "django", to: "record" },
    { from: "django", to: "bot" },
    { from: "django", to: "ml", label: "HTTP /predict" },
    { from: "ml", to: "registry", label: "checksum" },
    { from: "registry", to: "xgb", label: "serve if valid" },
    { from: "ml", to: "django", label: "circuit breaker", variant: "dashed" },
    { from: "django", to: "pg", label: "persist" },
  ],
};

const DIAGRAMS: Record<string, DiagramSpec> = {
  dbwhisper,
  "llm-studio": llmStudio,
  tradepulse,
  crownwager,
};

/** The architecture spec for a slug, or null if none is defined. */
export function diagramForSlug(slug: string): DiagramSpec | null {
  return DIAGRAMS[slug] ?? null;
}
