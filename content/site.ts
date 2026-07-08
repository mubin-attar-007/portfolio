/**
 * Homepage + about copy. Structured content (hero, field notes, principles)
 * lives here rather than in a parsed .md — a pragmatic divergence documented in
 * CLAUDE.md. Every number carries its method (in the linked case study).
 */

export const home = {
  metaLine: "Mubin Attar · AI/ML Engineer · Ahmedabad, India",
  headline: "I build grounded AI systems — and show how they actually work.",
  lede:
    "GenAI/ML engineer, four live products. I don't ship screenshots — I take the systems apart: the architecture, the decisions I rejected, and the numbers, every one linked to how it was measured.",
  availability: "Open to AI/ML roles — remote or Ahmedabad, India.",
  // A single quiet fact line — the facts survive; the hollow stat cards don't.
  facts: ["4 live products", "shipping AI since 2022", "$0 free-tier stack"],

  // Proof strip (the honest "trusted by" replacement) — real, verifiable credibility,
  // no logos/quotes we can't back. Employer is the anchor; every stat is true.
  proof: {
    lead: "AI/ML Engineer at",
    employer: "Sevina Technologies",
    employerNote: "healthcare-AI automation, by day",
    stats: [
      { value: "4", label: "products live in production" },
      { value: "3+ yrs", label: "shipping production AI" },
      { value: "$0", label: "free-tier infrastructure" },
    ],
  },

  // The tech-stack rotator — real tools across the four live products, shown in
  // Clerk's vertical slot-machine (each column cycles its own tools). The honest
  // take on Clerk's "trusted by" logo wall: we have no customer logos, so we
  // rotate the stack that actually ships the work.
  stackLabel: "The stack behind four live products.",
  stack: [
    "FastAPI", "Next.js", "LangGraph", "pgvector", "PostgreSQL", "XGBoost",
    "TypeScript", "React", "Docker", "Redis", "TimescaleDB", "Gemini",
    "SQLAlchemy", "Django", "Tailwind", "Playwright",
  ],

  // A representative DBWhisper request for the hero — illustrative, not a
  // benchmark. Shows the real behaviour: retrieve → validate → read-only SQL.
  heroDemo: {
    app: "dbwhisper",
    badge: "read-only",
    prompt: "revenue by month, last year",
    steps: ["retrieving schema — 4 tables", "validating — SELECT-only ✓"],
    sql: [
      "SELECT date_trunc('month', o.created_at) AS month,",
      "       sum(o.amount) AS revenue",
      "FROM orders o",
      "WHERE o.created_at >= now() - interval '1 year'",
      "GROUP BY 1 ORDER BY 1;",
    ],
    result: "12 rows · never wrote to your data",
    note: "A representative request — the validator gates every query.",
  },

  // The flagship "up close" showcase — a Clerk-Components-style split: an
  // accordion of the three real stages on the left, an animated terminal that
  // plays the active stage on the right. Every line is real behaviour, not a
  // benchmark. Copy lives here (Law 3).
  showcase: {
    eyebrow: "The flagship, up close",
    title: "How DBWhisper stays safe",
    body: "A natural-language-to-SQL agent with a deterministic safety boundary. Every request walks the same three stages — each a real decision, not a prompt.",
    cta: { label: "Read the full case study", href: "/work/dbwhisper" },
    steps: [
      {
        key: "retrieve",
        label: "Retrieve the schema",
        body: "pgvector retrieval over embedded table docs pulls only the few tables a question needs — never the whole database into the prompt.",
      },
      {
        key: "validate",
        label: "Validate, fail-closed",
        body: "A deterministic validator gates every generated statement: SELECT-only, single statement, enrolled tables. It refuses when it can't prove safety.",
      },
      {
        key: "execute",
        label: "Execute read-only",
        body: "The query runs as a least-privilege, read-only user. Rows come back; nothing is ever written.",
      },
    ],
  },

  // The "live demos" band — the AI/ML-brand differentiator: these aren't
  // screenshots, they're deployed and runnable. Cards + launch links are pulled
  // from content/projects.ts; this is just the section's voice.
  live: {
    kicker: "Deployed, not described",
    title: "Four products. All live — go try them.",
    lede: "Everything here is deployed and running on a $0 free-tier stack. Launch any of them, or read exactly how it's built.",
    note: "Free-tier backends may cold-start on first load.",
  },

  // The interactive architecture centerpiece framing (the flagship is pulled
  // from content/projects.ts; this is just the section's voice).
  architecture: {
    kicker: "The flagship, taken apart",
    title: "Inside DBWhisper",
    invite:
      "A natural-language-to-SQL agent that reads your database safely. Every box is a real decision — hover to trace the flow, click one to see what I rejected, why, and what it cost.",
  },

  // Field notes — real entries from the build. Numbers are genuine (method in
  // the linked case study). This is "how I think", not a stat wall.
  fieldNotes: [
    {
      n: "01",
      kicker: "on honest metrics",
      title: "I replaced a 68% accuracy claim with 65%.",
      body: "CrownWager inherited a model that reported ~68% — but it was “best of 300 random splits,” picked after the fact. I rewrote training to one fixed split plus 5-fold stratified cross-validation. The honest number is 65.2% ± 0.8% on 15,115 games. Lower, and real.",
      tag: { value: "65.2% ± 0.8%", label: "5-fold CV · 15,115 games" },
      href: "/work/crownwager",
    },
    {
      n: "02",
      kicker: "on safety",
      title: "“Less often” is not a safety property.",
      body: "A better prompt makes an LLM emit a destructive query less often — never never. So in DBWhisper every generated statement passes a deterministic validator first: SELECT-only, single statement, enrolled tables only. It fails closed — it refuses when it can’t prove the query is safe.",
      tag: { value: "fail-closed", label: "refuses rather than risks" },
      href: "/work/dbwhisper",
    },
    {
      n: "03",
      kicker: "on proof",
      title: "I let a test scramble the future to prove the past couldn’t see it.",
      body: "Look-ahead bias silently inflates every backtest. TradePulse decides on closed bars and fills on the next bar’s open — so a canary test multiplies all future bars by 3× and asserts the past equity curve is byte-identical. If any look-ahead leaks in, the build fails.",
      tag: { value: "byte-identical", label: "past equity under a scrambled future" },
      href: "/work/tradepulse",
    },
  ],

  principles: [
    {
      title: "Evidence over demos",
      body: "Every number is genuinely computed. If a number can’t be shared, I describe the mechanism and say so — I never invent one.",
    },
    {
      title: "Safety is structural, not statistical",
      body: "When an action can do damage, I put a deterministic gate in front of it that the model cannot talk its way past — and fail closed, refusing when safety can’t be proven.",
    },
    {
      title: "Constraints force good engineering",
      body: "A $0 stack rules out waste: retrieval-scoped prompts, bounded agent loops, lean containers. The limits shaped the design from the start.",
    },
  ],

  // The capabilities grid (dark band) — concrete, recurring guarantees across the
  // four products, each attributed to the project it ships in. Every claim is
  // backed by a real mechanism or a method-footnoted metric (Law: no fabrication).
  capabilities: {
    eyebrow: "What I actually build",
    title: "Safety and honesty, engineered in",
    body: "The same decisions recur across four live products — each a deterministic guarantee, not a best-effort prompt.",
    cta: { label: "See all work", href: "/work" },
    items: [
      {
        icon: "validator",
        kicker: "dbwhisper",
        title: "Fail-closed validation",
        body: "Every generated SQL passes a deterministic gate — SELECT-only, single statement, enrolled tables. It refuses when it can't prove the query is safe.",
      },
      {
        icon: "retrieval",
        kicker: "dbwhisper",
        title: "Retrieval-scoped prompts",
        body: "pgvector similarity pulls only the tables a question needs. A small, scoped context beats stuffing the whole schema — cheaper, and more accurate.",
      },
      {
        icon: "lookahead",
        kicker: "tradepulse",
        title: "Look-ahead-free backtests",
        body: "Decisions on closed bars, fills on the next open. A canary scrambles every future bar and asserts the past equity curve is byte-identical.",
      },
      {
        icon: "metrics",
        kicker: "crownwager",
        title: "Honest metrics",
        body: "One fixed split plus 5-fold cross-validation, reported with error bars: 65.2% ± 0.8% on 15,115 games — not a cherry-picked 68%.",
      },
      {
        icon: "fallback",
        kicker: "resilience",
        title: "Multi-provider fallback",
        body: "Six LLM providers behind one interface; the first with credentials wins and a free tier is the floor. No single vendor is a hard dependency.",
      },
      {
        icon: "infra",
        kicker: "$0 stack",
        title: "Runs on a free tier",
        body: "Retrieval-first prompts, bounded agent loops, lean containers — four products in production on a deliberately $0 stack.",
      },
    ],
  },

  // Homepage teaser for /now — a 3-line snapshot. The full "currently exploring"
  // list now lives on /now (single source: content/now.mdx), not here.
  now: {
    kicker: "Now",
    title: "What I'm working on now",
    teaser:
      "Standing up evals for DBWhisper, keeping four products live, and turning this site into a running notebook — a snapshot I update by hand.",
    cta: "See what I'm doing now",
    href: "/now",
  },

  // FAQ — the questions a hiring manager actually has, answered plainly. Every
  // answer is true and consistent with the rest of the site (no new claims).
  faq: {
    kicker: "Questions",
    title: "The short version",
    items: [
      {
        q: "Are you available for work?",
        a: "Open to AI/ML roles — remote, or in Ahmedabad, India. The fastest way to reach me is email; I read and answer every one myself.",
      },
      {
        q: "How do you work?",
        a: "Solo and end-to-end: I design, build, ship, and maintain. Evidence over demos — every number you see is genuinely computed, and it links to how it was measured.",
      },
      {
        q: "Can I try the products or read the code?",
        a: "Yes — all four are live and launchable from the section above, and every repository is public on GitHub.",
      },
      {
        q: "What do you not do?",
        a: "I don't claim what I can't show running or back with a real number. If a figure can't be shared, I describe the mechanism instead — never a fabricated one.",
      },
    ],
  },

  // DRAFT — the thesis of the "Trust is not a safety model" essay, in one line.
  philosophy: "The interesting engineering isn’t the model in the middle — it’s the deterministic boundary you build around it.",
} as const;

export const about = {
  headline: "Solo engineer, real products.",
  body: [
    "I'm an AI/ML engineer with 3+ years building and shipping production AI end to end — GenAI/LLM applications, agentic and RAG systems, and predictive ML. I work across the stack: FastAPI, Next.js, Postgres, and Docker, with auth, CI/CD, and security hardening baked in.",
    "By day I build healthcare-AI automation at Sevina Technologies — clinical-compliance and reimbursement pipelines (constrained by HIPAA, so shown here only in the abstract). On my own time I ship live AI products on a $0 free-tier stack, which forces discipline: no waste, real engineering, shipped.",
    "The one rule across all of it: every number a user sees is genuinely computed — never faked.",
  ],
} as const;

/**
 * /hire — the "work with me" page. Availability is single-sourced from STATUS;
 * "How I work" links to real decision notes so the claim is backed, not asserted.
 */
export const hire = {
  kicker: "Hire me",
  title: "Let's build something honest.",
  lede:
    "I design, build, ship, and maintain AI systems end to end — and I show the evidence. If that's the kind of engineer you need, here's how I work and how to reach me.",
  howIWork: {
    body: "Solo and end to end: architecture, implementation, deploy, and the honest numbers. I put deterministic boundaries around models rather than trusting them, I measure what I ship, and I'd rather show a lower real number than a higher invented one. A few decisions that show how I think:",
    notes: [
      { label: "One agent, three SQL dialects", href: "/notes/one-agent-three-sql-dialects" },
      { label: "Six LLM providers behind one interface", href: "/notes/six-providers-one-interface" },
      { label: "Enforce tenancy in the repository layer, not the route", href: "/notes/tenancy-in-the-repository-layer" },
    ],
  },
} as const;

/** A talk or appearance. */
export type Talk = {
  date: string;
  title: string;
  venue: string;
  href?: string;
};

/**
 * Talks & appearances — real entries only. Empty until the first one happens;
 * the page renders an honest empty state (never an invented lineup). Add a row
 * here when a talk is booked.
 */
export const talks: Talk[] = [];

/**
 * /uses — the real stack behind the four live products. Deliberately boring and
 * cheap; every tool here actually ships in one of the projects (no aspirational
 * padding). Grouped for scanability.
 */
export const uses = {
  intro:
    "The tools behind four live products — chosen to be boring, cheap, and reliable. A $0 free-tier stack, on purpose: the constraint rules out waste.",
  groups: [
    {
      title: "Languages & frameworks",
      items: ["Python", "TypeScript", "FastAPI", "Next.js", "React", "Django", "Tailwind CSS"],
    },
    {
      title: "AI / ML",
      items: [
        "LangGraph",
        "Gemini",
        "Multi-provider LLM fallback",
        "pgvector",
        "embedding retrieval",
        "XGBoost",
        "scikit-learn",
      ],
    },
    {
      title: "Data & infrastructure",
      items: ["PostgreSQL", "Neon", "Redis", "TimescaleDB", "SQLAlchemy", "Docker"],
    },
    {
      title: "Deploy & tooling",
      items: ["Vercel", "Hugging Face Spaces", "GitHub Actions", "Playwright", "pytest", "ruff", "Shiki"],
    },
  ],
} as const;
