import { EvalSchema, type EvalRow } from "./schema";

/**
 * Evals registry — the honest scoreboard. Intro copy in the owner's voice; rows
 * are real, planned or in-flight measurements. NO invented numbers: a row that
 * hasn't produced a result yet carries status "in-progress" and says so. Result
 * is filled from a real run — never dressed up as green before the eval runs.
 */
export const evalsIntro = {
  kicker: "Evals",
  title: "How I measure the work",
  lede:
    "Evals are infrastructure, not a scoreboard I curate. This is the registry: every system I can measure, the method I measure it with, and the honest current state.",
  body: [
    "“The model felt right” is not a number. For text-to-SQL that means execution accuracy — does the generated query return the correct rows when run against the real database — not string-matching against a reference.",
    "When a result isn’t in yet, the row says so plainly rather than borrowing a number from somewhere else. When a run completes, its result, date, and method land here — and where a provider limit forces a partial run, the excluded count is stated, not hidden.",
  ],
} as const;

const RAW = [
  {
    system: "DBWhisper",
    benchmark: "Spider",
    metric: "Execution accuracy",
    result: "73% (101/139, dev)",
    status: "complete",
    date: "2026-07-10",
    note: "Scoped Spider dev-split run of DBWhisper’s generation model (qwen/qwen3-32b at temp 0.1) with each database’s schema in context: 139 questions across 18 databases. Generated SQL is executed against the real Spider SQLite databases and compared by result set — ordered when the gold query has ORDER BY, multiset otherwise (standard execution match). 101/139 correct; malformed generations count as incorrect. 9 of the 148 sampled questions could not be scored after repeated provider throttling and are excluded, not counted either way. Measures the NL→SQL generation core; the deployed agent adds schema retrieval and a read-only validator on top.",
    link: "https://yale-lily.github.io/spider",
  },
  {
    system: "DBWhisper",
    benchmark: "Custom golden-query set",
    metric: "Execution accuracy · fail-closed refusals",
    result: "82% exact · 100% fail-closed",
    status: "complete",
    date: "2026-07-08",
    note: "22 natural-language golden queries + 4 unsafe/out-of-scope prompts over a read-only Postgres store, run end-to-end through DBWhisper’s live pipeline (schema retrieval → generation → read-only validator → execute). 82% exact result-set match (18/22); 95% (21/22) when crediting correct answers that returned an extra column. All 4 destructive or out-of-scope prompts were refused fail-closed (4/4).",
    link: "/work/dbwhisper",
  },
] as const;

export const evals: EvalRow[] = RAW.map((r) => EvalSchema.parse(r));
