import type { DiagramSpec } from "../types";

/** LLM Studio — layered FastAPI SaaS with strict tenancy + SSE streaming. */
export const llmStudioDiagram: DiagramSpec = {
  nodes: [
    { id: "spa", label: "Vanilla-JS SPA", sublabel: "auth gate", description: "Dependency-free frontend; auth gate + per-user history over an HttpOnly session cookie.", col: 0, row: 1 },
    { id: "auth", label: "Argon2id + sessions", sublabel: "revocable", description: "Argon2id hashing; opaque server-side session tokens, revocable on logout.", col: 1, row: 0 },
    { id: "quota", label: "Daily quota", sublabel: "before the stream", description: "Per-user daily budget on the shared key, checked before the LLM call so over-quota returns a clean 429.", col: 1, row: 1 },
    { id: "chat", label: "chat_service", sublabel: "SSE", description: "Streams tokens as text/event-stream with X-Accel-Buffering: no so proxies don't buffer.", col: 1, row: 2 },
    { id: "router", label: "LLM router", sublabel: "client_for(model)", description: "One OpenAI-compatible client factory; add a model without touching the streaming code.", col: 2, row: 1 },
    { id: "cloud", label: "Cloud LLMs", sublabel: "Gemini · Groq · …", description: "Gemini, Cloudflare, Groq, Mistral, GLM, NVIDIA — all via the OpenAI protocol.", col: 2, row: 0 },
    { id: "local", label: "Ollama", sublabel: "localhost", description: "Local models over the same interface.", col: 2, row: 2 },
    { id: "repo", label: "Repository layer", sublabel: "tenancy per query", description: "Ownership enforced on every query; a chat owned by someone else is silently refused.", col: 1, row: 3 },
    { id: "db", label: "Neon ⇄ SQLite", sublabel: "one code path", description: "Identical SQLAlchemy 2.0 path over Postgres (prod) and SQLite (local + tests).", col: 3, row: 2 },
  ],
  edges: [
    { from: "spa", to: "auth", label: "login" },
    { from: "auth", to: "quota" },
    { from: "quota", to: "chat", label: "allow" },
    { from: "chat", to: "router", label: "stream" },
    { from: "router", to: "cloud" },
    { from: "router", to: "local", dashed: true },
    { from: "chat", to: "repo", label: "persist" },
    { from: "repo", to: "db", label: "owner-scoped" },
  ],
};
