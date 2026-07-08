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
    "Evals are infrastructure, not a scoreboard I curate. This is the registry: every system I can measure, the method I measure it with, and the honest current state — including the ones still in progress.",
  body: [
    "“The model felt right” is not a number. For text-to-SQL that means execution accuracy — does the generated query return the correct rows — not string-matching against a reference.",
    "Where a result isn’t in yet, the row says “in progress” rather than borrowing a number from somewhere else. When a run completes, its result and date land here, linked to how it was measured.",
  ],
} as const;

const RAW = [
  {
    system: "DBWhisper",
    benchmark: "Spider",
    metric: "Execution accuracy",
    result: "In progress",
    status: "in-progress",
    note: "Cross-domain text-to-SQL benchmark; the harness scores whether generated SQL returns the correct result set, not string-match.",
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
