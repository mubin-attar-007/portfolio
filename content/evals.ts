import { EvalSchema, type EvalRow, type EvalScore } from "./schema";

/**
 * Evals registry — the honest scoreboard. Intro copy in the owner's voice; rows
 * are real, planned or in-flight measurements. NO invented numbers: a row that
 * hasn't produced a result yet carries status "in-progress" and says so. Result
 * is filled from a real run — never dressed up as green before the eval runs.
 * A result that turns out not to hold is retired in place: the row stays, says
 * why, and its figure comes down from every other surface.
 *
 * Every figure is written down once, as the recorded value of its run (the
 * constants below), and every string a page shows is formatted from it here.
 * Pages read the derived strings through `DBWHISPER_EVIDENCE` or
 * `requireEval`; `test/evidence.test.mts` fails if a page types one of these
 * figures by hand or quotes a retired one.
 *
 * Before (re)publishing a project's figure, re-read that project's README and
 * claim audit at the commit the row cites (spec/CONTENT_MODEL.md §4).
 */
export const evalsIntro = {
  kicker: "Evals",
  title: "How I measure the work",
  lede:
    "Evals are infrastructure, not a scoreboard I curate. This is the registry: every system I can measure, the method I measure it with, and the honest current state.",
  body: [
    "“The model felt right” is not a number. For text-to-SQL that means execution accuracy — does the generated query return the correct rows when run against the real database — not string-matching against a reference.",
    "When a result isn’t in yet, the row says so plainly rather than borrowing a number from somewhere else. When a run completes, its result, date, and method land here — and where a provider limit forces a partial run, the excluded count is stated, not hidden. When a published result turns out not to hold, it is retired here: the row stays, with the reason, and its number comes down everywhere else.",
  ],
  /** "How to read a row" — the terms the rows below rely on. */
  terms: [
    {
      term: "Execution accuracy",
      def: "The generated query is RUN against the real database and its result set is compared — not its text.",
    },
    {
      term: "Deterministic policy test",
      def: "Known SQL statements go through the policy engine alone, with no model and no database. It shows how that decision function behaves on those cases; it is not model accuracy.",
    },
    {
      term: "Retired",
      def: "A published result withdrawn after an audit. The row stays, muted, with the reason and the audit; its figures are no longer shown.",
    },
  ],
  /** Labels on a retired row: the dated lead-in to its reason, and its audit link. */
  retired: { on: "Retired", audit: "Read the audit" },
} as const;

/* ---------------------------------------------------------------------------
 * Formatting — every rounding a page shows happens here, once.
 * ------------------------------------------------------------------------- */

/** "101/139" — the counts every scored result is written with. */
export const formatRatio = (score: EvalScore): string => `${score.passed}/${score.scored}`;

/**
 * "72.7%" — one decimal, so a rounded share never reads as more exact than the
 * counts beside it.
 */
export const formatShare = (score: EvalScore): string =>
  `${Number(((100 * score.passed) / score.scored).toFixed(1))}%`;

/** Cases drawn but not scored (0 when nothing was excluded). */
export const excludedCount = (score: EvalScore): number =>
  (score.sampled ?? score.scored) - score.scored;

/* ---------------------------------------------------------------------------
 * The recorded runs. Values are copied from the project's own records, at the
 * commit linked beside them, and nowhere else.
 * ------------------------------------------------------------------------- */

/**
 * DBWhisper's repository at the commit its claim audit was merged
 * (bca0635, 24 Aug 2026). Linking a fixed commit keeps the method a reader
 * opens identical to the one these rows cite.
 */
const DBWHISPER_AT_AUDIT =
  "https://github.com/mubin-attar-007/dbwhisper/blob/bca0635a4d2ef473e28b51acdf1b79c1489fe08f";

/**
 * The adversarial policy-corpus run, as DBWhisper's claim audit §4.1 records
 * it (run 24 Aug 2026): 255 cases, each run once in every SQL dialect it lists,
 * and the decision each run was expected to get.
 */
const POLICY_CORPUS = {
  cases: 255,
  runs: { deny: 343, allow: 210, needsApproval: 24 },
  /** The policy test suite the corpus runs in (`tests/sqlpolicy`). */
  tests: 616,
} as const;
const POLICY_RUNS =
  POLICY_CORPUS.runs.deny + POLICY_CORPUS.runs.allow + POLICY_CORPUS.runs.needsApproval;
/** Every run expected to be denied was denied. */
const POLICY_CORPUS_SCORE = { passed: POLICY_CORPUS.runs.deny, scored: POLICY_CORPUS.runs.deny };

/**
 * The Spider dev sample, as `spider_results.json` records it (10 Jul 2026):
 * 148 questions drawn, 139 scored, 101 matched the gold result set.
 */
const SPIDER_SCORE = { passed: 101, scored: 139, sampled: 148 } as const;

const RAW = [
  {
    system: "DBWhisper",
    benchmark: "Adversarial SQL policy corpus",
    metric: "Deny cases denied · a deterministic policy test, not model accuracy",
    score: POLICY_CORPUS_SCORE,
    result: `${formatRatio(POLICY_CORPUS_SCORE)} denied`,
    status: "complete",
    date: "2026-08-24",
    note: `A deterministic test of DBWhisper v2’s SQL policy engine (sql_policy@2.0.0 on sqlglot 30.17.0, the check behind its validator since 24 August 2026) against the adversarial corpus committed in its repository, sql_policy_cases.yaml v2.0.0. Each of its ${POLICY_CORPUS.cases} distinct cases runs once in every dialect it lists, across PostgreSQL, MySQL, SQL Server, and SQLite, for ${POLICY_RUNS} case-and-dialect runs: all ${POLICY_CORPUS.runs.deny} runs expected to be denied were denied, all ${POLICY_CORPUS.runs.allow} expected to be allowed were allowed, and the ${POLICY_CORPUS.runs.needsApproval} that should need human approval did. No model and no database are involved, so this measures the policy decision — not model accuracy and not the end-to-end agent. It is a structural check over a parsed query, bounded by the parser’s fidelity in each dialect, and a corpus covers only the attacks someone wrote down: evidence of no known bypass, not proof that none exists. Reproduce it with “uv run pytest tests/sqlpolicy” from a clean checkout (${POLICY_CORPUS.tests} tests, recorded 24 August 2026).`,
    link: `${DBWHISPER_AT_AUDIT}/docs/v2/CLAIM_AUDIT.md#41-approved--policy-corpus-results`,
  },
  {
    system: "DBWhisper",
    benchmark: "Spider",
    metric: "Execution accuracy · generation model only",
    score: SPIDER_SCORE,
    result: `${formatRatio(SPIDER_SCORE)} (${formatShare(SPIDER_SCORE)})`,
    status: "complete",
    date: "2026-07-10",
    note: `A Spider dev-split sample scored on DBWhisper’s generation model alone — qwen/qwen3-32b at temperature 0.1, with each database’s schema in context and no retrieval or policy layer. Generated SQL is executed against the real Spider SQLite databases and compared by result set — ordered when the gold query has ORDER BY, multiset otherwise (standard execution match). ${formatRatio(SPIDER_SCORE)} scored questions matched the gold result set (${formatShare(SPIDER_SCORE)}); malformed generations count as incorrect. ${excludedCount(SPIDER_SCORE)} of the ${SPIDER_SCORE.sampled} sampled questions were dropped after repeated provider throttling rather than scored, which moves the figure up: counted as wrong, it would be ${SPIDER_SCORE.passed}/${SPIDER_SCORE.sampled} (${formatShare({ passed: SPIDER_SCORE.passed, scored: SPIDER_SCORE.sampled })}). It measures the model, not the deployed agent, and the Spider dataset is not vendored, so re-running it needs the dataset and a provider key.`,
    link: `${DBWHISPER_AT_AUDIT}/evaluation/results/historical/spider_results.provenance.md`,
  },
  {
    system: "DBWhisper",
    benchmark: "Custom golden-query set",
    metric: "Execution accuracy · fail-closed refusals",
    result: "Retired",
    status: "retired",
    date: "2026-07-08",
    note: "An end-to-end run of DBWhisper’s v1 pipeline (schema retrieval → generation → read-only validator → execute) over a small golden-query set on a four-table, read-only Postgres store. Its accuracy and refusal figures are no longer published here or anywhere else on this site.",
    retired: {
      date: "2026-11-16",
      reason: "DBWhisper’s own claim audit (24 August 2026) withdrew both figures. The run cannot be reproduced from a clean checkout: its harness and questions were not in the repository when the figures were published, and they depend on a local database and API that are not part of it. It used a prompt that was retired on 21 August 2026; its set-based comparison was looser than the exact result-set match it reported; and none of its unsafe prompts reached the validator, because the model declined first, so it never measured fail-closed refusal.",
      link: `${DBWHISPER_AT_AUDIT}/docs/v2/CLAIM_AUDIT.md#44-not-publishable--metrics-that-must-not-appear-until-re-run`,
    },
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

/** The rows that still publish a figure — every row except the retired ones. */
export const publishedEvals: EvalRow[] = evals.filter((e) => e.status !== "retired");

/**
 * The anchor for one registry row.
 *
 * Exported rather than re-derived per page. /evals used to slugify locally while
 * the homepage and the case studies hardcoded the resulting string, which meant
 * renaming a benchmark silently broke every inbound deep link with nothing
 * failing. One function, both ends.
 */
export const evalAnchor = (row: Pick<EvalRow, "system" | "benchmark">): string =>
  `${row.system}-${row.benchmark}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Look a row up by system + benchmark, throwing at MODULE LOAD if it is gone.
 *
 * This is the mechanism that makes "single-sourced from the registry" true
 * rather than a comment. The homepage evidence line reads its policy-corpus
 * figure through here, so deleting or renaming the row fails `next build`
 * instead of leaving a hardcoded number on the homepage pointing at an anchor
 * that no longer exists.
 */
export function requireEval(system: string, benchmark: string): EvalRow {
  const row = evals.find((e) => e.system === system && e.benchmark === benchmark);
  if (!row) {
    throw new Error(
      `evals: no row for "${system} / ${benchmark}". A surface links to this row; ` +
        `update the caller in the same change that renames or removes it.`,
    );
  }
  return row;
}

/**
 * A row a surface quotes as a result: it must be complete and dated, or this
 * throws at module load. Returns the row with its date and its /evals anchor,
 * so a caller never formats an undefined date or rebuilds the anchor.
 */
export function requireCompleteEval(system: string, benchmark: string) {
  const row = requireEval(system, benchmark);
  if (row.status !== "complete" || !row.date) {
    throw new Error(`evals: "${system} / ${benchmark}" must be a complete, dated row.`);
  }
  return { row, date: row.date, anchor: `/evals#${evalAnchor(row)}` };
}

/** A complete row that also records its counts — throws at module load otherwise. */
function requireScoredEval(system: string, benchmark: string) {
  const complete = requireCompleteEval(system, benchmark);
  if (!complete.row.score) {
    throw new Error(`evals: "${system} / ${benchmark}" must record its passed/scored counts.`);
  }
  return { ...complete, score: complete.row.score };
}

const POLICY = requireScoredEval("DBWhisper", "Adversarial SQL policy corpus");
const SPIDER = requireScoredEval("DBWhisper", "Spider");

/**
 * DBWhisper's two published results, as every surface that quotes them needs
 * them: the homepage evidence line, the case-study walkthrough, the résumé and
 * its PDF. Values are derived from the registry rows above, and the labels
 * that scope them live here once, so no surface can quote a figure without
 * its scope.
 */
export const DBWHISPER_EVIDENCE = {
  /** A deterministic policy test: how the policy engine decided known cases. */
  policy: {
    anchor: POLICY.anchor,
    date: POLICY.date,
    /** "343/343" */
    ratio: formatRatio(POLICY.score),
    /** Deny runs in the corpus (cases × the dialects each lists). */
    runs: POLICY.score.scored,
    label: "adversarial SQL deny cases denied by the policy engine",
    kind: "Deterministic policy test, not model accuracy",
  },
  /** The generation model alone on a Spider sample — not the deployed agent. */
  spider: {
    anchor: SPIDER.anchor,
    date: SPIDER.date,
    /** "101/139" */
    ratio: formatRatio(SPIDER.score),
    /** "72.7%" */
    share: formatShare(SPIDER.score),
    scored: SPIDER.score.scored,
    excluded: excludedCount(SPIDER.score),
    sampled: SPIDER.score.sampled ?? SPIDER.score.scored,
    label: "Spider dev sample",
    scope: "generation model only, no retrieval or policy layer",
  },
} as const;

