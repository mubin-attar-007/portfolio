import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CS } from "./section";
import { CodeBlock } from "@/components/ui/code-block";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { DecisionLog } from "@/components/mdx/decision-log";
import { FailureLog } from "@/components/mdx/failure-log";
import { MetricsTable } from "@/components/ui/metric";
import { dbwhisperDiagram } from "@/components/diagrams/data/dbwhisper";
import { evals } from "@/content/evals";

/**
 * DBWhisper — the flagship case study body, authored from the real system.
 * Every claim traces to the shipped code; no benchmark numbers are invented
 * (where a hard number doesn't exist, the mechanism is described instead).
 */
export function DBWhisperBody() {
  // Single-source the flagship's own measured results from the eval registry —
  // never re-typed here, so the case study and /evals can't drift.
  const dbEvals = evals.filter((e) => e.system === "DBWhisper");
  return (
    <div>
      <CS id="context" title="Context">
        <p>
          Natural-language-to-SQL is easy to demo and hard to trust. Calling an LLM to write SQL takes
          an afternoon; the reason most such tools never reach production is that a model will happily
          emit <strong>DROP TABLE</strong>, a multi-statement payload, or a query against a table that
          doesn&apos;t exist. DBWhisper turns a plain-English question into safe, read-only SQL across
          Postgres, MySQL, and SQL Server, runs it, and explains the answer — with the guarantee that
          it can read your data but never change it.
        </p>
      </CS>

      <CS id="constraints" title="Constraints">
        <p>
          Three constraints shaped the design. <strong>Safety must be structural</strong> — the
          read-only promise can&apos;t depend on the model behaving. <strong>Schemas are large</strong> —
          real databases have dozens to hundreds of tables, too many to paste into a prompt, so the
          agent has to retrieve the right ones. And it runs on a <strong>$0 stack</strong> (Vercel +
          a Hugging Face Docker Space + Neon Postgres), which rules out waste: small prompts, bounded
          loops, lean images.
        </p>
      </CS>

      <CS id="architecture" title="System architecture">
        <p>
          A split deploy in three tiers: a Next.js UI on Vercel, a FastAPI + LangGraph agent on a
          Docker Space, and the target database queried through a read-only user. Retrieval and
          conversation memory sit in Neon Postgres with pgvector.
        </p>
        <SystemDiagram
          spec={dbwhisperDiagram}
          caption="DBWhisper — hover or focus a node to trace a request. Dashed edges are fallback paths."
        />
        <p>
          <strong>Enrollment (once per database).</strong> A target database is introspected, each
          table is documented into structured sections (summary, columns, relationships, stats), and
          those chunks are embedded into pgvector. Retrieval later searches the{" "}
          <em>documentation embeddings</em>, not the raw schema — which is what makes it work on large
          databases at all.
        </p>
      </CS>

      <CS id="data-flow" title="Data flow">
        <p>
          One question, end to end: the UI POSTs to <strong>/query</strong>; the agent runs{" "}
          <strong>search_tables</strong> to find candidate tables by semantic similarity, pulls only
          the needed section of each (columns / relationships / stats) so the prompt stays small,
          checks <strong>verified queries</strong> for a close human-approved example to adapt, then
          generates SQL. Generation passes through <strong>validate_sql</strong> before anything
          touches the database; the query executes under a timeout and row cap; the result is
          summarized back into natural language. A per-turn LangGraph checkpoint gives follow-ups
          context.
        </p>
      </CS>

      <CS id="key-decisions" title="Key decisions">
        <p>The decisions that make it trustworthy — each with the alternative it beat and the cost it accepted.</p>
        <DecisionLog
          decisions={[
            {
              choice: "A deterministic, fail-closed SQL validator — not LLM trust",
              alternatives: ["trust the model's SQL", "an LLM-as-judge safety check"],
              reason:
                "It uses sqlparse (not fragile regex) to enforce SELECT/WITH-only, single-statement, no DDL/DML/EXEC, no information_schema/sys/pg_catalog — and, given a database, rejects any query touching a table outside the enrolled schema. If no schema index exists, it fails closed rather than open.",
              tradeoff: "Rejects some exotic-but-valid queries and adds an enrollment step — a false 'safe' is far costlier than a false 'unsafe'.",
            },
            {
              choice: "Defense in depth, not a single gate",
              alternatives: ["rely on the validator alone"],
              reason:
                "Below the validator: read-only DB users (a probe warns if a connection looks writable), a query timeout + row cap, and log sanitization that masks passwords, API keys, and SQL literals. Any one layer failing doesn't expose the database.",
              tradeoff: "More moving parts to maintain and test.",
            },
            {
              choice: "Multi-provider LLM fallback over single-vendor lock-in",
              alternatives: ["one provider (e.g. OpenAI only)"],
              reason:
                "A priority chain (OpenAI → OpenRouter → DeepSeek → Groq → Anthropic → Gemini) picks the first provider with credentials and always keeps Gemini's free tier as a final fallback, so no single outage or quota exhaustion takes the product down — and it stays free to run.",
              tradeoff: "Six provider adapters to keep working behind one interface.",
            },
            {
              choice: "Retrieval over context-stuffing",
              alternatives: ["dump the whole schema into the prompt"],
              reason:
                "Schemas are documented, embedded, and retrieved per question, keeping the prompt small and the hallucination surface (and token cost) low.",
              tradeoff: "An enrollment/embedding step per database.",
            },
          ]}
        />
      </CS>

      <CS id="what-failed" title="What failed">
        <p>
          Early on, the model would emit <strong>SELECT TOP n</strong> against Postgres — valid T-SQL,
          invalid everywhere else — so cross-dialect queries failed. The fix was a deterministic
          <strong> dialect directive</strong> injected before generation, stating the target
          dialect&apos;s rule explicitly (LIMIT for Postgres/MySQL, TOP for SQL Server) rather than
          hoping the model inferred it.
        </p>
        <FailureLog
          entries={[
            { version: "v1", metric: "cross-dialect generation", value: "broken", cause: "the model defaulted to SELECT TOP n regardless of the target database" },
            { version: "v2", metric: "cross-dialect generation", value: "correct", fix: "inject a per-dialect directive before generation, and cap tool loops so a confused agent can't spin" },
          ]}
        />
      </CS>

      <CS id="performance-cost" title="Performance & cost">
        <p>
          Safety is a property of the architecture, not a single number — but the pipeline is still
          measured end to end. The structural guarantees first, then the results.
        </p>
        <MetricsTable
          rows={[
            { label: "write access to your data", value: "none", method: "Fail-closed validator + read-only DB user; a query is rejected if it references a table outside the enrolled schema." },
            { label: "LLM providers", value: "6", method: "One fallback interface; Gemini free tier is the final fallback so it runs with zero paid keys." },
            { label: "SQL dialects", value: "3", method: "Postgres, MySQL, SQL Server via SQLAlchemy 2.0 + ODBC." },
            { label: "per-run guardrails", value: "k=4 · ≤8 calls · 30s", method: "Retrieval returns the top 4 tables; each tool is capped at 8 calls per run; execution runs under a 30s timeout, a 1000-row cap, and a 5000-char SQL limit." },
            { label: "infra cost", value: "$0", method: "Vercel + Hugging Face Docker Space + Neon Postgres, all free-tier." },
          ]}
        />
        {/* Results (measured) — surfaced here so the flagship shows its OWN best
            numbers, single-sourced from content/evals.ts (never re-typed). */}
        <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-bg-subtle p-5">
          <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">
            Results (measured)
          </p>
          <p className="mt-2 max-w-[var(--width-prose)] text-sm text-ink-secondary">
            The pipeline is scored end to end — two real runs, each linked to its method:
          </p>
          <dl className="mt-4 flex flex-col gap-4">
            {dbEvals.map((e) => (
              <div key={e.benchmark} className="border-l-2 border-accent pl-4">
                <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-lg tabular-nums text-ink">{e.result}</span>
                  <span className="text-sm text-ink-secondary">
                    {e.benchmark} · {e.metric}
                  </span>
                </dt>
                {e.note ? (
                  <dd className="mt-1 max-w-[var(--width-prose)] text-sm text-ink-tertiary">{e.note}</dd>
                ) : null}
              </div>
            ))}
          </dl>
          <Link
            href="/evals"
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            See the full eval registry
            <ArrowRight
              size={15}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </CS>

      <CS id="operations" title="Operations">
        <p>
          It runs as a split deploy with the agent in a Docker Space. Per-run guardrails keep it
          bounded: each tool result is cached per run, and a tool called more than eight times returns
          an abort hint that tells the model to stop looping and produce output. Logs are sanitized
          before write, and the validator&apos;s rules are covered by unit tests that gate CI
          (pytest + ruff, alongside a gitleaks secret scan).
        </p>
        <CodeBlock
          filename="app/core/sql_validator.py"
          lang="py"
          code={`def validate_sql(sql: str, db_flag: str | None) -> None:\n    stmt = _single_statement(sql)              # exactly one statement\n    _require_read_only(stmt)                    # starts with SELECT/WITH; no DDL/DML/EXEC\n    _reject_system_tables(stmt)                 # no information_schema / sys. / pg_catalog.\n    if db_flag:\n        schema = _load_schema_index(db_flag)    # fail closed if missing\n        _require_enrolled_tables(stmt, schema)  # only tables we can vouch for`}
        />
      </CS>

      <CS id="what-id-do-differently" title="What I'd do differently">
        <p>
          Two things. I&apos;d add a small golden-query eval per enrolled database so retrieval and
          generation quality are measured, not assumed — right now the verified-query flywheel is the
          feedback loop, but it isn&apos;t scored. And I&apos;d move the six provider adapters behind a
          single typed capability interface earlier; retrofitting consistent retry/timeout behavior
          across them was more work than building it in from the start.
        </p>
      </CS>

      <CS id="evidence" title="Evidence">
        <p>
          The app is live and the source is public — the validator, the agent tools, and the
          multi-provider chain are all in the repository linked at the top of this page.
        </p>
      </CS>
    </div>
  );
}
