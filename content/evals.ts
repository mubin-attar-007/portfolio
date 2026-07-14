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
  {
    system: "CrownWager",
    benchmark: "NBA moneyline · 15,115 games",
    metric: "Model accuracy (cross-validated)",
    result: "65.2% ± 0.8%",
    status: "complete",
    date: "2026-07-02",
    note: "5-fold stratified cross-validation on 15,115 NBA games — replacing an earlier post-hoc “best of 300 random splits” 68%. The base home-win rate is 57.5%, so this is a real ~8-point edge (ROC-AUC 0.685). Published picks are then graded against the real final score, and the track record is flagged “insufficient” below 20 settled picks.",
    link: "/work/crownwager",
  },
  {
    system: "TradePulse",
    benchmark: "Look-ahead canary + parity suite",
    metric: "Look-ahead leakage",
    result: "0 leaks · byte-identical",
    status: "complete",
    date: "2026-07-01",
    note: "The engine decides on closed bar i and fills at bar i+1’s open. A canary multiplies every future bar by 3× and asserts the past equity curve is byte-identical; any look-ahead leak changes the curve and fails the build. Correctness is proven structurally, not scored on returns — the platform deliberately publishes no flattering performance number.",
    link: "/work/tradepulse",
  },
] as const;

export const evals: EvalRow[] = RAW.map((r) => EvalSchema.parse(r));
