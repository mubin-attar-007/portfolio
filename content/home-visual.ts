/**
 * Homepage copy and figure data.
 *
 * Structured content lives in a typed module rather than parsed markdown: it is
 * shaped data, not prose, so TypeScript checks it at build with no parser in
 * between. Long-form prose stays in MDX under content/{projects,writing,notes}.
 *
 * THE CONTENT LAW APPLIES HERE. Every number below is either (a) single-sourced
 * from content/evals.ts or content/projects.ts, or (b) labelled as illustrative
 * sample data in the UI that renders it. Nothing is invented to make a section
 * read stronger, and no metric appears in two sections competing with itself.
 */

import { DBWHISPER_GOLDEN } from "./evals";

export const flagshipHome = {
  /* ---- 1. hero --------------------------------------------------------- */
  hero: {
    eyebrow: "Mubin Attar · AI Systems Engineer",
    /**
     * Two lines on desktop. The second carries the accent, because it is the
     * half of the sentence that makes the actual claim — "production AI" is the
     * category, "built to be trusted" is the differentiator.
     */
    titleLead: "Production AI systems.",
    titleAccent: "Built to be trusted.",
    lede:
      "I design and ship AI products end to end — from agents and retrieval to deterministic guardrails and evaluations that show what actually works.",
    primary: { label: "Explore DBWhisper", href: "/work/dbwhisper" },
    secondary: { label: "View selected work", href: "/work" },
    tertiary: { label: "Read my engineering principles", href: "#method" },
  },

  /* ---- 2. hero product stage -------------------------------------------
     A real DBWhisper request, rendered as the product rather than as a browser
     mock-up. Every tool name is the agent's ACTUAL tool (app/agent/tools.py in
     DBWhisper): `search_tables` does pgvector retrieval over table docs, and
     `validate_sql` is the fail-closed SELECT-only / single-statement /
     enrolled-tables gate. Generic "thinking…" lines would say nothing.

     The ROW VALUES are sample data from a demo database. They are labelled as
     such in the UI: they are not a customer figure, a benchmark, or a claim. */
  stage: {
    app: "dbwhisper",
    connection: "analytics_demo · postgres",
    badge: "read-only",
    askLabel: "Ask",
    question: "Revenue by month for the last year",
    recentLabel: "Recent",
    recent: [
      "Top 10 customers by lifetime value",
      "Refund rate by product category",
      "Signups per week since launch",
    ],
    schemaLabel: "Enrolled schema",
    schema: [
      { name: "orders", cols: "12 columns", selected: true },
      { name: "customers", cols: "9 columns", selected: true },
      { name: "order_items", cols: "7 columns", selected: false },
      { name: "products", cols: "11 columns", selected: false },
    ],
    runLabel: "Run",
    runMeta: "4 steps · 1.2s",
    steps: [
      { tool: "search_tables", detail: "matched orders — 2 of 4 enrolled tables", state: "ok" },
      { tool: "generate_sql", detail: "postgres dialect · temperature 0.1", state: "ok" },
      { tool: "validate_sql", detail: "SELECT-only · single statement · enrolled tables", state: "ok" },
      { tool: "execute", detail: "least-privilege read-only connection", state: "ok" },
    ],
    sqlLabel: "Generated query",
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
      { t: "p", v: " o.created_at >= now() - " },
      { t: "kw", v: "INTERVAL" },
      { t: "str", v: " '1 year'" },
      { t: "br", v: "" },
      { t: "kw", v: "GROUP BY" },
      { t: "p", v: " 1 " },
      { t: "kw", v: "ORDER BY" },
      { t: "p", v: " 1;" },
    ],
    resultLabel: "Result",
    sampleLabel: "sample data",
    columns: ["month", "revenue"],
    rows: [
      ["2024-01-01", "48,210.00"],
      ["2024-02-01", "51,884.00"],
      ["2024-03-01", "63,027.00"],
      ["2024-04-01", "59,415.00"],
    ],
    moreLabel: "8 more rows",
    verdict: "12 rows returned · nothing was written",
    /**
     * Floating evidence cards. Deliberately NOT the four numbers in the proof
     * bar 300px below: two components stating the same metric is the "multiple
     * components communicating the same proof" failure the redesign exists to
     * remove. These state what the RUN guarantees; the bar states the record.
     */
    evidence: [
      {
        id: "gate",
        label: "Deterministic gate",
        body: "Refuses when it cannot prove the query is safe.",
      },
      {
        id: "readonly",
        label: "Read-only execution",
        body: "Least-privilege connection. No write path exists.",
      },
      {
        id: "measured",
        label: "Scored end to end",
        body: "Retrieval → generation → validation → execute.",
      },
    ],
  },

  /* ---- 3. proof band ---------------------------------------------------
     Four points, each linking to the page where a visitor can check it. The
     82% / 100% pair is single-sourced from the completed golden-set row in
     content/evals.ts; "4 live products" is the length of content/projects.ts. */
  proof: {
    label: "The record",
    items: [
      {
        value: "4",
        label: "products live in production",
        method: "Deployed and maintained — not screenshots",
        href: "/work",
      },
      {
        value: "3+ yrs",
        label: "shipping software",
        method: "Since 2022; production AI since 2024",
        href: "/resume",
      },
      {
        value: DBWHISPER_GOLDEN.exactMatch,
        label: "exact execution match",
        method: "22 golden queries, run end to end",
        href: DBWHISPER_GOLDEN.anchor,
      },
      {
        value: DBWHISPER_GOLDEN.failClosed,
        label: "fail-closed refusals",
        method: "4 of 4 unsafe prompts refused",
        href: DBWHISPER_GOLDEN.anchor,
      },
    ],
  },

  /* ---- 4. the stack wall ------------------------------------------------
     The honest answer to a "trusted by" logo wall: there are no customer logos
     to show, so the wall shows the stack that actually ships four live products.
     Each cell cycles its own column, which is what keeps fifteen tools legible
     in the height of one row. Every tool here appears in `uses` (content/site.ts)
     — the wall is not aspirational padding. */
  techWall: {
    lead: "The stack behind four live products.",
    columns: [
      ["FastAPI", "Django", "LangGraph"],
      ["Next.js", "React", "TypeScript"],
      ["PostgreSQL", "pgvector", "TimescaleDB"],
      ["Docker", "GitHub Actions", "Playwright"],
      ["XGBoost", "Gemini", "SQLAlchemy"],
    ],
  },

  /* ---- 5. flagship ------------------------------------------------------ */
  flagship: {
    eyebrow: "Flagship project",
    /** One sentence that defines the product before any mechanism is named. */
    definition:
      "A natural-language interface to a production database that cannot damage it.",
    problem:
      "A better prompt makes a model emit a destructive query less often — never “never”. Anything with write access to real data needs a boundary the model cannot argue its way past.",
    guaranteesLabel: "Three engineering guarantees",
    guarantees: [
      {
        n: "01",
        title: "Retrieve only the schema the question needs",
        body: "pgvector similarity over embedded table docs selects a few tables, instead of stuffing an entire database into the prompt.",
      },
      {
        n: "02",
        title: "Validate before anything executes",
        body: "A deterministic gate checks SELECT-only, single statement, enrolled tables — and fails closed when it cannot prove safety.",
      },
      {
        n: "03",
        title: "Measure the deployed path, not the demo",
        body: "Retrieval, generation, validation and execution are scored together against a real read-only Postgres store.",
      },
    ],
    caseStudy: "Read the case study",
    live: "Open the live product",
    repo: "Source",
    /** The pipeline drawn beside the copy. Labels are the real stage names. */
    pipeline: [
      { id: "ask", label: "Question", note: "natural language" },
      { id: "retrieve", label: "Retrieve", note: "pgvector · table docs" },
      { id: "generate", label: "Generate", note: "6-provider fallback" },
      { id: "validate", label: "Validate", note: "fail-closed gate" },
      { id: "execute", label: "Execute", note: "read-only connection" },
      { id: "rows", label: "Rows", note: "with the query attached" },
    ],
    refusal: { label: "Refuse", note: "unsafe or out of scope" },
  },

  /* ---- 6. selected work ------------------------------------------------- */
  work: {
    eyebrow: "Selected work",
    title: "One engineering standard, three kinds of uncertainty.",
    body:
      "Each of these is deployed and maintained. Each claim below links to the case study and the method behind it.",
    caseStudy: "View case study",
    live: "Live",
    source: "Source",
    cta: { label: "See all four projects", href: "/work" },
  },

  /* ---- 7. method / capabilities ----------------------------------------- */
  method: {
    eyebrow: "How I engineer AI systems",
    title: "AI that works beyond the demo",
    body: "The model is only one component. Reliability comes from the system around it.",
    items: [
      {
        id: "retrieval",
        visual: "retrieval",
        title: "Agents and retrieval",
        body: "Context selection, orchestration, structured tools, and grounded generation — so the model answers from evidence rather than from memory.",
        proof: { label: "In DBWhisper", href: "/notes/retrieval-beats-stuffing" },
      },
      {
        id: "safeguards",
        visual: "gate",
        title: "Deterministic safeguards",
        body: "Validation, permission boundaries, failure handling, and fail-closed behaviour that does not depend on the model agreeing to it.",
        proof: { label: "Why a validator", href: "/writing/a-validator-is-not-a-better-prompt" },
      },
      {
        id: "evaluation",
        visual: "matrix",
        title: "Evaluation systems",
        body: "Task-level metrics, regression tests, trace inspection, and error analysis — including the cases that were excluded and why.",
        proof: { label: "Open the registry", href: "/evals" },
      },
      {
        id: "delivery",
        visual: "pipeline",
        title: "Full-stack delivery",
        body: "Product UI, APIs, data pipelines, deployment, observability, and the iteration loop that keeps four products live on a $0 stack.",
        proof: { label: "The stack", href: "/uses" },
      },
    ],
  },

  /* ---- 8. writing + current focus --------------------------------------- */
  notebook: {
    eyebrow: "From the notebook",
    title: "Thinking in public.",
  },
  writing: {
    label: "Selected writing",
    cta: { label: "All writing", href: "/writing" },
  },
  exploring: {
    label: "Currently exploring",
    cta: { label: "What I'm doing now", href: "/now" },
  },

  /* ---- 9. close --------------------------------------------------------- */
  close: {
    title: "Building an AI product that needs to work in production?",
    body:
      "Let's discuss the system, the failure modes, and how success will be measured.",
    primary: { label: "Start a conversation", href: "/hire" },
    secondary: { label: "View résumé", href: "/resume" },
  },
} as const;
