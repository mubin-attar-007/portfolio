import type { DiagramSpec } from "../types";

/** LLM Studio — layered FastAPI SaaS with strict tenancy + SSE streaming. */
export const llmStudioDiagram: DiagramSpec = {
  nodes: [
    { id: "spa", label: "Vanilla-JS SPA", sublabel: "auth gate", description: "Dependency-free frontend; auth gate + per-user history over an HttpOnly session cookie.", col: 0, row: 1 },
    {
      id: "auth",
      label: "Argon2id + sessions",
      sublabel: "revocable",
      description: "Argon2id hashing; opaque server-side session tokens, revocable on logout.",
      col: 1,
      row: 0,
      decision: {
        rejected: "Stateless JWTs, and bcrypt for hashing",
        why: "A DB-backed opaque session token (HttpOnly, SameSite=Lax) gives real revocation — logout, suspend, or compromise kills the session with a single row change, which stateless JWTs can't do before expiry. Argon2id is memory-hard, which resists GPU brute-forcing far better than bcrypt.",
        tradeoff: "A DB read per authenticated request — cheap, and worth it for revocation on a multi-user app.",
      },
    },
    {
      id: "quota",
      label: "Daily quota",
      sublabel: "before the stream",
      description: "Per-user daily budget on the shared key, checked before the LLM call so over-quota returns a clean 429.",
      col: 1,
      row: 1,
      decision: {
        rejected: "Metering tokens after the call, or no quota at all",
        why: "One shared model key powers everyone, so abuse control is mandatory. Each user's daily budget is checked and atomically incremented before the model call — an over-quota user gets a clean 429 instead of burning an API call on the shared key.",
        tradeoff: "A coarse per-message budget rather than per-token metering — simpler, and enough to keep a free-tier key alive.",
      },
    },
    {
      id: "chat",
      label: "chat_service",
      sublabel: "SSE",
      description: "Streams tokens as text/event-stream with X-Accel-Buffering: no so proxies don't buffer.",
      col: 1,
      row: 2,
      decision: {
        rejected: "WebSockets, or the OpenAI SDK's built-in retry/backoff",
        why: "Token streaming is one-directional, so SSE (Cache-Control: no-cache, X-Accel-Buffering: no) is exactly right and survives a reverse proxy. The provider client sets max_retries=0 with explicit quota/timeout classification, so a 429 surfaces as a clear 'quota exhausted' message instead of the SDK silently backing off into a confusing timeout.",
        tradeoff: "~20 lines of explicit retry/branching in chat_service — for correct, legible errors.",
      },
    },
    {
      id: "router",
      label: "LLM router",
      sublabel: "client_for(model)",
      description: "One OpenAI-compatible client factory; add a model without touching the streaming code.",
      col: 2,
      row: 1,
      decision: {
        rejected: "A separate vendor SDK per provider",
        why: "One client factory returns an OpenAI-compatible client for every cloud model (Gemini, Groq, Mistral, GLM, NVIDIA) and local Ollama, so adding a model never touches the streaming path.",
        tradeoff: "Providers must speak the OpenAI protocol — true for all the ones that matter here.",
      },
    },
    { id: "cloud", label: "Cloud LLMs", sublabel: "Gemini · Groq · …", description: "Gemini, Cloudflare, Groq, Mistral, GLM, NVIDIA — all via the OpenAI protocol.", col: 2, row: 0 },
    { id: "local", label: "Ollama", sublabel: "localhost", description: "Local models over the same interface.", col: 2, row: 2 },
    {
      id: "repo",
      label: "Repository layer",
      sublabel: "tenancy per query",
      description: "Ownership enforced on every query; a chat owned by someone else is silently refused.",
      col: 1,
      row: 3,
      decision: {
        rejected: "Trusting the auth middleware and hand-written query filters",
        why: "Tenancy is enforced where data is accessed: every list/upsert/delete filters by owner_id, and a write to someone else's chat is silently refused. Belt-and-suspenders on top of the auth gate, so a bug in any one service can't leak another user's data. A test proves user B can't clobber user A's chat by reusing its id.",
        tradeoff: "A couple of extra filter calls per repository function — cheap insurance against a whole class of tenant-isolation bugs.",
      },
    },
    {
      id: "db",
      label: "Neon ⇄ SQLite",
      sublabel: "one code path",
      description: "Identical SQLAlchemy 2.0 path over Postgres (prod) and SQLite (local + tests).",
      col: 3,
      row: 2,
      decision: {
        rejected: "Forcing Postgres (or Docker) for local dev",
        why: "One SQLAlchemy path selects the driver by URL, so developers 'just run' on SQLite while production stays on Neon Postgres. This once hid a real bug — millisecond-epoch timestamps overflowed Postgres INT4 (register 500'd in prod) while SQLite's 64-bit ints passed the tests — now locked down with BigInteger columns and a regression test.",
        tradeoff: "DB-specific behavior needs a real-Postgres check — the INT4 overflow is exactly why.",
      },
    },
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
