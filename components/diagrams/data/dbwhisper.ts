import type { DiagramSpec } from "../types";

/** DBWhisper — the live agent architecture (grounded in the real system). */
export const dbwhisperDiagram: DiagramSpec = {
  nodes: [
    { id: "ui", label: "Next.js UI", sublabel: "Vercel", description: "The browser client; sends a plain-English question over REST /query.", col: 0, row: 1 },
    { id: "api", label: "FastAPI agent", sublabel: "LangGraph", description: "The agent loop — retrieves the right schema slice, generates SQL, validates, executes, and summarizes.", col: 1, row: 1 },
    { id: "tools", label: "search_tables", sublabel: "retrieval", description: "Semantic search over table summaries to find the candidate tables for the question — records which tables it touched.", col: 2, row: 0 },
    { id: "verified", label: "verified queries", sublabel: "flywheel", description: "Human-approved question→SQL pairs; the agent prefers adapting a close verified example over writing SQL from scratch.", col: 2, row: 1 },
    { id: "pgv", label: "pgvector", sublabel: "embeddings", description: "Table-documentation embeddings — retrieval searches the docs, not raw schema, so it scales to large databases.", col: 3, row: 0 },
    { id: "gen", label: "multi-LLM", sublabel: "6-provider fallback", description: "First provider with credentials wins; Gemini's free tier is the final fallback so it runs with zero paid keys.", col: 1, row: 2 },
    { id: "guard", label: "validate_sql", sublabel: "read-only · fail-closed", description: "Deterministic gate: SELECT-only, single statement, no DDL/DML, only enrolled tables — rejects when it can't prove safety.", col: 1, row: 3 },
    { id: "mem", label: "Neon Postgres", sublabel: "checkpoints", description: "LangGraph conversation memory, persisted per turn, so follow-ups have context.", col: 3, row: 1 },
    { id: "targetdb", label: "Target DB", sublabel: "read-only user", description: "Postgres, MySQL, or SQL Server — queried through a read-only user, with a timeout and a row cap.", col: 3, row: 3 },
  ],
  edges: [
    { from: "ui", to: "api", label: "REST /query" },
    { from: "api", to: "tools", label: "retrieve" },
    { from: "api", to: "verified" },
    { from: "tools", to: "pgv", label: "search" },
    { from: "api", to: "gen", label: "generate" },
    { from: "gen", to: "guard", label: "gate" },
    { from: "guard", to: "targetdb", label: "read-only exec" },
    { from: "api", to: "mem", label: "checkpoint" },
  ],
};

export const diagrams: Record<string, DiagramSpec> = {
  dbwhisper: dbwhisperDiagram,
};
