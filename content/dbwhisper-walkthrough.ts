import { DBWHISPER_EVIDENCE } from "./evals";

const { policy, spider } = DBWHISPER_EVIDENCE;

/**
 * Curated sample data and explanatory copy for the case-study request path.
 * The one stage that cites measurements, Evaluate, reads them from the eval
 * registry instead of retyping its counts.
 */
export const dbwhisperWalkthrough = {
  /* Static example data for the architecture illustration and walkthrough.
     These are sample rows, not customer data or a recorded model request. */
  stage: {
    question: "Monthly revenue from January through April 2024",
    schema: [
      { name: "orders", cols: "12 columns", selected: true },
      { name: "customers", cols: "9 columns", selected: false },
      { name: "order_items", cols: "7 columns", selected: false },
      { name: "products", cols: "11 columns", selected: false },
    ],
    sql: [
      { t: "kw", v: "SELECT" },
      { t: "fn", v: " date_trunc" },
      { t: "p", v: "('month', o.created_at) " },
      { t: "kw", v: "AS" },
      { t: "p", v: " month," },
      { t: "br", v: "" },
      { t: "fn", v: "       sum" },
      { t: "p", v: "(o.amount) " },
      { t: "kw", v: "AS" },
      { t: "p", v: " revenue" },
      { t: "br", v: "" },
      { t: "kw", v: "FROM" },
      { t: "p", v: " orders o" },
      { t: "br", v: "" },
      { t: "kw", v: "WHERE" },
      { t: "p", v: " o.created_at >= " },
      { t: "str", v: "'2024-01-01'" },
      { t: "br", v: "" },
      { t: "kw", v: "  AND" },
      { t: "p", v: " o.created_at < " },
      { t: "str", v: "'2024-05-01'" },
      { t: "br", v: "" },
      { t: "kw", v: "GROUP BY" },
      { t: "p", v: " 1 " },
      { t: "kw", v: "ORDER BY" },
      { t: "p", v: " 1;" },
    ],
    sampleLabel: "sample data",
    columns: ["month", "revenue"],
    rows: [
      ["2024-01-01", "48,210.00"],
      ["2024-02-01", "51,884.00"],
      ["2024-03-01", "63,027.00"],
      ["2024-04-01", "59,415.00"],
    ],
    verdict: "4 illustrative rows · read-only query",
  },

  /* Interactive DBWhisper architecture illustration. */
  walkthrough: {
    eyebrow: "DBWhisper · the flagship",
    title: "Inside the request path.",
    body:
      "Explore how DBWhisper retrieves context, generates SQL, checks it, and returns results. This illustration uses sample data; published evaluations are linked separately.",
    cta: { label: "Read the design decisions", href: "#key-decisions" },
    stages: [
      {
        id: "retrieve",
        label: "Retrieve",
        body: "pgvector similarity over embedded table docs pulls only the tables a question needs — never the whole schema into the prompt.",
        items: ["search_tables · pgvector similarity", "Structured schema sections", "Verified NL→SQL examples"],
      },
      {
        id: "generate",
        label: "Generate",
        body: "Dialect-correct SQL from a tightly scoped tool loop, behind a six-provider fallback chain so no vendor is a hard dependency.",
        items: ["6-provider fallback chain", "Per-dialect directives · Postgres / MySQL / SQL Server", "LangGraph tool loop"],
      },
      {
        id: "validate",
        label: "Validate",
        body: "A deterministic gate checks every statement — and refuses when it cannot prove the query is safe.",
        items: ["SELECT-only", "Single statement", "Enrolled tables only", "Fails closed"],
      },
      {
        id: "execute",
        label: "Execute",
        body: "The validated query runs through a least-privilege, read-only connection and returns its rows alongside the SQL.",
        items: ["Least-privilege read-only connection", "The result ships with its query attached"],
      },
      {
        id: "evaluate",
        label: "Evaluate",
        body: "Each layer is measured on its own terms: the policy engine against a committed adversarial corpus, the generation model against a Spider sample. Neither is an end-to-end accuracy figure, and both are published with their method.",
        items: [
          `Adversarial policy corpus · ${policy.runs} deny runs, no model`,
          `${spider.label} · ${spider.scored} scored, ${spider.excluded} of ${spider.sampled} dropped`,
        ],
      },
    ],
    /* Specimen strings that are not already in `stage`. The refusal example is
       ILLUSTRATIVE of real validator behaviour (the gate refuses non-SELECT
       statements); it is labelled as behaviour, not as a logged incident. */
    refusalDemo: {
      prompt: "Delete inactive users from last quarter",
      verdict: "REFUSED · fail-closed",
      reason: "Not a SELECT · write access does not exist on this connection",
    },
    providers: ["OpenAI", "OpenRouter", "DeepSeek", "Groq", "Anthropic", "Gemini"],
  },

} as const;
