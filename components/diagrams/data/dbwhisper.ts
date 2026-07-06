import type { DiagramSpec } from "../types";

/**
 * DBWhisper — the live agent architecture (grounded in the real system).
 * Each node carries the REAL decision behind it (why-not / why / tradeoff),
 * mined from the codebase — this is what makes the diagram explorable.
 */
export const dbwhisperDiagram: DiagramSpec = {
  nodes: [
    {
      id: "ui",
      label: "Next.js UI",
      sublabel: "Vercel",
      description: "The browser client; sends a plain-English question over REST /query.",
      col: 0,
      row: 1,
    },
    {
      id: "api",
      label: "FastAPI + LangGraph",
      sublabel: "the agent loop",
      description: "The agent loop — retrieves the right schema slice, generates SQL, validates, executes, and summarizes.",
      col: 1,
      row: 1,
      decision: {
        rejected: "Flask/Django request loops, or raw LLM calls with no structure",
        why: "LangGraph is a state machine for a multi-step job — retrieve schema → generate → validate → execute — with checkpoints persisted to Postgres for conversation memory. FastAPI gives async streaming, typed I/O, and clean middleware for the rate-limit and auth gates.",
        tradeoff: "Heavier runtime than raw httpx + Pydantic — paid back in typed tool contracts and state that survives a restart.",
      },
    },
    {
      id: "tools",
      label: "search_tables",
      sublabel: "retrieval · k=4",
      description: "Semantic search over table summaries to find the candidate tables for the question — records which tables it touched.",
      col: 2,
      row: 0,
      decision: {
        rejected: "Stuffing the whole schema into every prompt",
        why: "Retrieval runs over documented table summaries, not raw DDL, so it stays accurate on large databases and keeps the prompt small. Top-4 tables per question; the agent is capped at 8 calls per tool per run so it can't loop.",
        tradeoff: "A one-time enrollment step per database to document + embed the schema.",
      },
    },
    {
      id: "verified",
      label: "verified queries",
      sublabel: "flywheel",
      description: "Human-approved question→SQL pairs; the agent prefers adapting a close verified example over writing SQL from scratch.",
      col: 2,
      row: 1,
      decision: {
        rejected: "Generating every query from scratch, forever",
        why: "Approved (question → SQL) pairs are retrieved at generation time so the agent adapts a proven query instead of hallucinating one. Every approval makes the next answer for that database better.",
        tradeoff: "Needs a human to approve pairs — a deliberate quality flywheel, not free.",
      },
    },
    {
      id: "pgv",
      label: "pgvector",
      sublabel: "in Postgres",
      description: "Table-documentation embeddings live in the same Postgres as everything else — retrieval searches the docs, not raw schema.",
      col: 3,
      row: 0,
      decision: {
        rejected: "A separate vector DB (Pinecone, Weaviate, Milvus)",
        why: "One managed Postgres holds embeddings, LangGraph checkpoints, metadata, and sessions — no second service to run, no ETL between stores. Embeddings are searched by cosine similarity with JSONB metadata filters on the same connection.",
        tradeoff: "pgvector's ivfflat index caps at 2000 dims, so the 3072-d Gemini embedding falls back to a sequential scan — fine at this scale, and worth it to avoid operating a second database.",
      },
    },
    {
      id: "gen",
      label: "multi-LLM",
      sublabel: "6-provider fallback",
      description: "First provider with credentials wins; Gemini's free tier is the final fallback so it runs with zero paid keys.",
      col: 1,
      row: 2,
      decision: {
        rejected: "A single hardcoded provider",
        why: "OpenAI → OpenRouter → DeepSeek → Groq → Anthropic → Gemini, ordered by cost. Gemini's free tier is always appended as the last resort, so a quota wall on any one provider is invisible to the user. Every provider failure is logged, not just rate-limits.",
        tradeoff: "Six providers' credentials to manage, and slightly different response shapes to normalize.",
      },
    },
    {
      id: "guard",
      label: "validate_sql",
      sublabel: "read-only · fail-closed",
      description: "Deterministic gate: SELECT-only, single statement, no DDL/DML, only enrolled tables — rejects when it can't prove safety.",
      col: 1,
      row: 3,
      decision: {
        rejected: "Trusting the model to write safe SQL; relying on the DB role alone",
        why: "A deterministic validator runs before every execution — whether the SQL came from the LLM or a user edit. sqlparse + regex reject DML/DDL/EXEC, multiple statements, SELECT INTO, and system-schema access, and check every table against the enrolled schema index. If the index is missing, it refuses.",
        tradeoff: "A heuristic parser isn't a formal proof — so it's one layer of defense-in-depth on top of a read-only DB user, timeouts, and row caps.",
      },
    },
    {
      id: "mem",
      label: "Neon Postgres",
      sublabel: "checkpoints",
      description: "LangGraph conversation memory, persisted per turn, so follow-ups have context.",
      col: 3,
      row: 1,
      decision: {
        rejected: "A stateless agent, or in-memory sessions lost on restart",
        why: "Conversation state (last few turns, tables touched, insights) is persisted per user + session, so a follow-up like \"now break that down by month\" has context — and survives a redeploy.",
        tradeoff: "A DB round-trip per turn to read + write the summary.",
      },
    },
    {
      id: "targetdb",
      label: "Target DB",
      sublabel: "read-only user",
      description: "Postgres, MySQL, or SQL Server — queried through a read-only user, with a timeout and a row cap.",
      col: 3,
      row: 3,
      decision: {
        rejected: "One hardcoded dialect",
        why: "The same agent targets Postgres, MySQL, or SQL Server; a per-dialect directive in the system prompt keeps generated SQL dialect-correct. Execution runs through a read-only user with a 30s timeout and a 1000-row cap.",
        tradeoff: "Per-dialect prompt tuning — the alternative (dialect-blind SQL) shipped a real bug: T-SQL `TOP` emitted against Postgres.",
      },
    },
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
