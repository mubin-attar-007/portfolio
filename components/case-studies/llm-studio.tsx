import { CS } from "./section";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { DecisionLog } from "@/components/mdx/decision-log";
import { FailureLog } from "@/components/mdx/failure-log";
import { MetricsTable } from "@/components/ui/metric";
import { CodeBlock } from "@/components/ui/code-block";
import { llmStudioDiagram } from "@/components/diagrams/data/llm-studio";

/** LLM Studio — case study authored from the real system. No invented numbers. */
export function LlmStudioBody() {
  return (
    <div>
      <CS id="context" title="Context">
        <p>
          &quot;Wrap an LLM API in a chat UI&quot; is a weekend project. Turning that into something
          multiple people can actually sign into is where the engineering lives: passwords hashed
          correctly, sessions that can be revoked, a hard guarantee that user A can never read user
          B&apos;s chats, a fair budget on a shared key, and streaming that survives a reverse proxy.
        </p>
      </CS>

      <CS id="constraints" title="Constraints">
        <p>
          One shared model key powers everyone, so abuse control is mandatory. It ships on a $0 stack
          (a Hugging Face Docker Space + Neon Postgres), and the frontend is intentionally
          framework-free to keep the container tiny and the ChatGPT pixel-match tractable.
        </p>
      </CS>

      <CS id="architecture" title="System architecture">
        <p>
          A strictly layered FastAPI backend serving a vanilla-JS SPA: routes → services →
          an LLM router → a repository → the database. Tenancy is enforced at the repository layer,
          streaming is SSE tuned for proxies, and the same SQLAlchemy code runs over Postgres in
          production and SQLite in tests.
        </p>
        <SystemDiagram
          spec={llmStudioDiagram}
          caption="LLM Studio — quota is checked before the stream; tenancy is enforced at the repository."
        />
      </CS>

      <CS id="data-flow" title="Data flow">
        <p>
          A request authenticates against a server-side session, the daily quota is checked{" "}
          <em>before</em> the model call, <strong>chat_service</strong> streams tokens over SSE, the
          router picks an OpenAI-compatible client for the chosen model, and the repository persists
          the turn scoped to the owner.
        </p>
      </CS>

      <CS id="key-decisions" title="Key decisions">
        <DecisionLog
          decisions={[
            {
              choice: "DB-backed sessions over stateless JWTs",
              alternatives: ["stateless JWTs"],
              reason:
                "Argon2id hashing and an opaque server-side session token (HttpOnly, SameSite=Lax) give real revocation, session tracking, and clean expiry.",
              tradeoff: "A DB read per authenticated request — worth more than shaving a query for a chat app.",
            },
            {
              choice: "Tenancy enforced at the repository layer, not in routes",
              alternatives: ["ownership checks sprinkled across routes"],
              reason:
                "Ownership is enforced where data is accessed: lists filter by owner, and upsert/delete silently refuse a chat owned by someone else — one auditable choke point.",
              tradeoff: "The 'silent skip' is less chatty than a 403, but cross-tenant access is structurally impossible.",
            },
            {
              choice: "Quota checked before the stream, not after",
              alternatives: ["meter tokens after the call", "no quota"],
              reason:
                "Each user gets a daily budget keyed by user + date, atomically incremented and checked before the LLM call, so an over-quota user gets a clean 429 instead of burning an API call.",
              tradeoff: "A coarse per-message budget rather than per-token metering — simpler and enough to keep a shared free-tier key alive.",
            },
            {
              choice: "OpenAI-compatible routing over per-vendor SDKs",
              alternatives: ["a separate SDK per provider"],
              reason:
                "One client factory returns an OpenAI-compatible client for cloud models (Gemini, Groq, Mistral, GLM, NVIDIA) and local Ollama, so adding a model never touches the streaming code.",
              tradeoff: "Providers must speak the OpenAI protocol.",
            },
            {
              choice: "SSE tuned for real proxies",
              alternatives: ["WebSockets", "plain SSE"],
              reason:
                "Streaming sends text/event-stream frames with Cache-Control: no-cache and X-Accel-Buffering: no so a reverse proxy doesn't buffer the token stream.",
              tradeoff: "One-directional SSE rather than WebSockets — exactly right for token streaming.",
            },
          ]}
        />
      </CS>

      <CS id="what-failed" title="What failed">
        <p>
          Millisecond-epoch timestamp columns were overflowing 32-bit <strong>INT4</strong> in
          Postgres (values near 2.1×10⁹) while SQLite silently tolerated it — the exact class of bug
          that&apos;s invisible locally and obvious against a real database. The columns are now
          <strong> BigInteger</strong>.
        </p>
        <FailureLog
          entries={[
            { version: "v1", metric: "timestamp columns", value: "overflow", cause: "ms-epoch values overflowed 32-bit INT4 in Postgres; SQLite silently tolerated it" },
            { version: "v2", metric: "timestamp columns", value: "BigInteger", fix: "widened the columns; caught only by deploying against the real production database" },
          ]}
        />
      </CS>

      <CS id="performance-cost" title="Performance & cost">
        <MetricsTable
          rows={[
            { label: "tests passing", value: "31", method: "pytest + ruff gating CI, plus pip-audit + gitleaks + Dependabot." },
            { label: "database path", value: "dual", method: "Identical SQLAlchemy 2.0 code over Postgres (prod, pooled) and SQLite (local + tests), so tests need zero external services." },
            { label: "hardening", value: "CSP + limits", method: "Sliding-window rate limits on auth/reset/upload, a strict CSP (object-src none, frame-ancestors none), HSTS, and structured per-request logging." },
            { label: "document grounding", value: "10 MB cap", method: ".txt/.md/.pdf/.docx uploads are extension- and size-limited, extracted, and truncated to a 200k-char cap before use as context." },
          ]}
        />
      </CS>

      <CS id="operations" title="Operations">
        <p>
          Shipped as a single Docker container; sessions and usage live in Postgres. The tenancy
          guarantee is one line at the choke point:
        </p>
        <CodeBlock
          filename="repository (chat upsert)"
          lang="py"
          code={`# a chat owned by someone else is silently refused — one auditable choke point\nif existing and existing.owner_id not in (None, owner_id):\n    continue  # never touch another tenant's row`}
        />
      </CS>

      <CS id="what-id-do-differently" title="What I'd do differently">
        <p>
          A side-by-side compare mode (stream two models to the same prompt) is on the roadmap; the
          shipped app streams one model per request. I&apos;d also move the coarse per-message quota to
          real per-token metering once usage justifies the added bookkeeping.
        </p>
      </CS>

      <CS id="evidence" title="Evidence">
        <p>The app is live and the auth, tenancy, and routing code are in the repository above.</p>
      </CS>
    </div>
  );
}
