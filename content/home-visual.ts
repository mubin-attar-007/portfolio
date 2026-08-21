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
    eyebrow: "AI Systems Engineer · Ahmedabad, India",
    /**
     * Two lines on desktop. The second carries the accent, because it is the
     * half of the sentence that makes the actual claim — "production AI" is the
     * category, "built to be trusted" is the differentiator.
     */
    titleLead: "Production AI systems.",
    titleAccent: "Built to be trusted.",
    /* Segments, not a string: the reference two-tones its intros — key phrases
       a step darker than the connective tissue — and that emphasis is content,
       not styling, so it lives here. */
    ledeParts: [
      { t: "I design and ship AI products " },
      { t: "end to end", strong: true },
      { t: " — from agents and retrieval to " },
      { t: "deterministic guardrails", strong: true },
      { t: " and evaluations that " },
      { t: "show what actually works", strong: true },
      { t: "." },
    ],
    primary: { label: "Explore DBWhisper", href: "/work/dbwhisper" },
    secondary: { label: "View selected work", href: "/work" },
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

  /* ---- 5b. flagship walkthrough -----------------------------------------
     Clerk's accordion-rail product section ("Pixel-perfect UIs" — copy rail +
     stage list on the left, live specimen on the right), adapted to walk
     DBWhisper's five stages. Every item line is a real mechanism from the
     content model; the specimen panels restate the SAME facts as UI, never new
     ones. */
  walkthrough: {
    eyebrow: "DBWhisper · flagship",
    title: "Five stages. One guarantee.",
    body:
      "Every request walks the same pipeline, and the dangerous step is guarded by code the model cannot argue with. Select a stage to see what it does.",
    cta: { label: "Read the full case study", href: "/work/dbwhisper" },
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
        body: "The query runs as a least-privilege, read-only user. Rows come back; nothing is ever written.",
        items: ["Least-privilege read-only connection", "The result ships with its query attached"],
      },
      {
        id: "evaluate",
        label: "Evaluate",
        body: "The deployed path is scored end to end against a real read-only store — and the numbers are published with their method.",
        items: ["22 golden queries · 4 unsafe prompts", "Spider dev split · 139 questions"],
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

  /* ---- 5c. reliability bento --------------------------------------------
     Clerk's giant dark feature bento, carrying the guarantees that recur
     across the four products. Every body line restates a mechanism or metric
     that content/projects.ts or content/evals.ts already backs. */
  bento: {
    eyebrow: "Engineered reliability",
    title: "Everything the model needs around it",
    body:
      "The same decisions recur across four live products — each a deterministic guarantee, not a best-effort prompt.",
    items: [
      {
        id: "gate",
        glyph: "gate",
        wide: true,
        title: "Fail-closed validation",
        body: "Every generated statement passes a deterministic gate — SELECT-only, single statement, enrolled tables — and is refused when safety cannot be proven.",
      },
      {
        id: "retrieval",
        glyph: "retrieval",
        wide: true,
        title: "Retrieval-scoped prompts",
        body: "pgvector similarity pulls only the tables a question needs — a small scoped context beats stuffing the schema.",
      },
      {
        id: "evals",
        glyph: "matrix",
        title: "Task-level evals",
        body: "Execution accuracy against real stores, published with method, date, and the excluded cases stated.",
      },
      {
        id: "fallback",
        glyph: "route",
        title: "Multi-provider fallback",
        body: "Six LLM providers behind one interface — the first with credentials wins, a free tier is the floor.",
      },
      {
        id: "tenancy",
        glyph: "lock",
        title: "Tenancy below the route",
        body: "Ownership is enforced in the repository layer on every query — not just at the handler.",
      },
      {
        id: "canary",
        glyph: "wave",
        title: "Look-ahead canary",
        body: "A test multiplies every future bar by 3× and asserts the past equity curve is byte-identical.",
      },
      {
        id: "honest",
        glyph: "scale",
        title: "Honest metrics",
        body: "65.2% ± 0.8% cross-validated replaced a cherry-picked 68% — lower, and real.",
      },
      {
        id: "hardening",
        glyph: "shield",
        title: "Security hardening",
        body: "Argon2id auth, per-IP and API-key rate limits, admin 2FA, and blocking bandit + gitleaks in CI.",
      },
      {
        id: "infra",
        glyph: "pipeline",
        span: 6,
        title: "Production on a $0 stack",
        body: "Vercel, Hugging Face Spaces, Neon, and GitHub Actions free tiers — lean containers, bounded loops, CI-gated deploys. The constraint is the discipline.",
      },
    ],
  },

  /* ---- 5d. registry strip ------------------------------------------------ */
  registry: {
    eyebrow: "The record",
    title: "Measured, on the record.",
    body: "Every system that can be scored, with its method and its date. When a run is partial, the excluded count is stated — not hidden.",
    cta: { label: "Open the full registry", href: "/evals" },
  },

  /* ---- 8b. the engineer --------------------------------------------------- */
  engineer: {
    eyebrow: "The engineer",
    title: "Built by one person, end to end.",
    principlesLabel: "Three rules I don't break",
    timelineLabel: "The road here",
    ctas: {
      about: { label: "More about me", href: "/about" },
      resume: { label: "Résumé", href: "/resume" },
    },
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
