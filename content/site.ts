/**
 * Homepage + about copy. Structured content (hero, field notes, principles)
 * lives in a typed .ts module rather than parsed .md: it is shaped data, not
 * prose, so TypeScript checks it at build with no parser or schema in between.
 * Long-form prose stays in MDX under content/{projects,writing,notes}.
 * Every number carries its method (in the linked case study).
 */
// Social URLs are identity, not copy, so they have exactly one home in
// config/site.ts. Read from there rather than restated here — a profile URL
// written down twice is a profile URL that will eventually disagree with itself.
import { SITE } from "@/config/site";

export const home = {
  metaLine: "Mubin Attar · AI/ML Engineer · Ahmedabad, India",
  headline: "I build grounded AI systems — and show how they actually work.",
  // The hero lede is now CENTRED under the headline and capped at ~62ch, so it
  // has to resolve in two even lines — the previous four-line version read as a
  // paragraph pushed into a hero. Nothing factual was dropped: "GenAI/ML
  // engineer" already sits in `metaLine` directly above it, and the substance
  // (four live products, architecture, rejected decisions, every number linked
  // to its method) is intact.
  lede:
    "Four live products, taken apart in public: the architecture, the decisions I rejected, and every number linked to how it was measured.",
  // Hero actions. Copy lives here, not in the component (CLAUDE.md content law).
  // Primary points at evidence, not at a contact form: the flagship case study
  // is the thing that actually answers "can he build this".
  ctas: {
    primary: "Read the flagship case study",
    secondary: "Get in touch",
  },
  availability: "Open to AI/ML roles — remote or Ahmedabad, India.",
  // A single quiet fact line — the facts survive; the hollow stat cards don't.
  facts: ["4 live products", "production AI since 2024", "$0 free-tier stack"],

  // Proof strip (the honest "trusted by" replacement) — real, verifiable credibility,
  // no logos/quotes we can't back. Employer is the anchor; every stat is true AND
  // checkable: `href` is the page where the visitor can verify the count themselves,
  // so no number on the homepage stands unsupported.
  proof: {
    lead: "AI/ML Engineer at",
    employer: "Sevina Technologies",
    employerNote: "healthcare-AI automation, by day",
    stats: [
      { value: "4", label: "products live in production", href: "/work" },
      { value: "3+ yrs", label: "shipping software", href: "/resume" },
      { value: "$0", label: "free-tier infrastructure", href: "/uses" },
    ],
  },

  // "Measured" band — surfaces the flagship's honest eval headline and links to the
  // registry (F-07). The NUMBER is single-sourced from content/evals.ts (the completed
  // golden-set row); this is framing copy only — never a hardcoded metric.
  measured: {
    kicker: "Measured",
    lede:
      "DBWhisper’s live pipeline — schema retrieval → read-only validator → execute — scored end-to-end over a read-only Postgres store:",
    cta: "See the eval registry",
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
  // Grouped for the homepage stack band — a Clerk-style hairline-celled grid.
  // Same tools as `stack`, arranged by role so the grid reads as a real system.
  stackGroups: [
    { label: "Backend & agents", items: ["FastAPI", "Django", "LangGraph", "SQLAlchemy"] },
    { label: "AI / ML", items: ["Gemini", "pgvector", "XGBoost"] },
    { label: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind"] },
    { label: "Data, infra & CI", items: ["PostgreSQL", "TimescaleDB", "Redis", "Docker", "Playwright"] },
  ],

  // A representative DBWhisper request for the hero — illustrative, not a
  // benchmark. Shows the real behaviour end to end: retrieve → validate →
  // read-only SQL → the shape that comes back. The panel renders ALL of it, so
  // the hero figure is a complete product surface rather than a box waiting for
  // an animation to fill it.
  heroDemo: {
    app: "dbwhisper",
    badge: "read-only",
    prompt: "revenue by month, last year",
    // The trace names the agent's REAL tools (app/agent/tools.py in DBWhisper:
    // `search_tables` does pgvector retrieval over table docs; `validate_sql` is
    // the fail-closed SELECT-only / single-statement / enrolled-tables gate).
    // Generic "thinking…" lines would say nothing; these are what the pipeline
    // actually does, and the case study documents each one.
    steps: [
      { tool: "search_tables", detail: "matched orders — 4 enrolled tables" },
      { tool: "validate_sql", detail: "SELECT-only · single statement · enrolled ✓" },
    ],
    sql: [
      "SELECT date_trunc('month', o.created_at) AS month,",
      "       sum(o.amount) AS revenue",
      "FROM orders o",
      "WHERE o.created_at >= now() - interval '1 year'",
      "GROUP BY 1 ORDER BY 1;",
    ],
    // The returned shape. These row VALUES are invented sample data from a demo
    // database — so the panel labels them "sample data" in the UI. They are not
    // a customer figure, a benchmark, or a claim of any kind. The three rows +
    // `moreLabel` add up to the 12 rows the verdict line reports, and they run
    // ascending to match the query's `ORDER BY 1`.
    resultShape: {
      columns: { key: "month", value: "revenue" },
      rows: [
        { month: "2024-01-01", revenue: "48,210.00" },
        { month: "2024-02-01", revenue: "51,884.00" },
        { month: "2024-03-01", revenue: "63,027.00" },
      ],
      moreLabel: "9 more rows",
      sampleLabel: "sample data",
    },
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
    lede: "Everything here is deployed and running — launch any of them, or read exactly how it's built.",
    note: "Free-tier backends may cold-start on first load.",
  },

  // The interactive architecture centerpiece framing (the flagship is pulled
  // from content/projects.ts; this is just the section's voice).
  architecture: {
    kicker: "The flagship, taken apart",
    title: "Inside DBWhisper",
    invite:
      "A natural-language-to-SQL agent that reads your database safely. Every box is a real decision — hover to trace the flow, click one to see what I rejected, why, and what it cost.",
    cta: "Read the full DBWhisper case study",
  },

  // Band headers that used to be typed straight into app/page.tsx. They are
  // user-facing copy, so they belong here with everything else the page says —
  // the component should not be the place a sentence is edited.
  notebook: {
    kicker: "From the notebook",
    title: "Three decisions that shaped the work",
    cta: "All notes",
    href: "/notes",
    // The per-entry link label, shared by all three notes — one string because
    // it is one affordance repeated, not three separate labels to keep in sync.
    entryCta: "Read the case",
  },
  writing: {
    kicker: "Writing",
    title: "Selected writing",
    cta: "All writing",
    href: "/writing",
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

  // The contact close's ask — the direct question under the philosophy line.
  // (Moved out of app/page.tsx where it shipped as a literal — content law 3.)
  // The CTA label itself is STATUS.cta (config/site.ts): one funnel, one label.
  contactTitle: "Building something that needs grounded, honest AI?",
} as const;

/**
 * Page tops for the index routes, in one place so the four of them can be read
 * against each other. They used to be literals inside the page components,
 * which is how /writing and /notes ended up with a kicker and an h1 that said
 * the same word ("Writing" over "Writing") — a duplication that is obvious here
 * and invisible when the strings live 200 lines apart in two different files.
 *
 * /evals is deliberately absent: its header copy already exists as `evalsIntro`
 * in content/evals.ts, next to the rows it introduces. Restating it here would
 * create a second source for the same sentence.
 *
 * Every `lede` is framing, not a claim — no number, capability, or date is
 * asserted here that the page below it does not back.
 */
export const pages = {
  work: {
    kicker: "Case studies",
    title: "Systems, taken apart.",
    lede:
      "Not screenshots — the real engineering. Each write-up walks the architecture, the decisions that mattered, and the trade-offs, with links to the live app and its source.",
    flagshipKicker: "Flagship",
    flagshipCta: "Read the full write-up",
    othersKicker: "More",
    othersTitle: "Other systems",
  },
  writing: {
    kicker: "Writing",
    title: "Essays on building AI honestly.",
    lede:
      "Essays and guides on AI systems, evaluation, and honest ML — mined from the decisions and failures in my case studies.",
    feedCta: "RSS",
    feedHref: "/writing/feed.xml",
    crossCta: "Shorter, single-decision notes",
    crossHref: "/notes",
  },
  notes: {
    kicker: "Notes",
    title: "One decision per note.",
    lede:
      "A running notebook — short notes on the decisions behind the work: retrieval, evals, agents, and the infrastructure that keeps four products live.",
    feedCta: "RSS",
    feedHref: "/rss.xml",
    crossCta: "Longer essays and guides",
    crossHref: "/writing",
  },
} as const;

export const about = {
  kicker: "About",
  headline: "Solo engineer, real products.",
  body: [
    "I'm an AI/ML engineer — shipping software since 2022 and focused on production AI since 2024: GenAI/LLM applications, agentic and RAG systems, and predictive ML. I work across the stack: FastAPI, Next.js, Postgres, and Docker, with auth, CI/CD, and security hardening baked in.",
    "By day I build healthcare-AI automation at Sevina Technologies — clinical-compliance and reimbursement pipelines (constrained by HIPAA, so shown here only in the abstract). On my own time I ship live AI products on a $0 free-tier stack, which forces discipline: no waste, real engineering, shipped.",
    "The one rule across all of it: every number a user sees is genuinely computed — never faked.",
  ],
  // The page's action pair. Previously typed straight into app/about/page.tsx,
  // where a lone primary button sat beside four plain text links and read as
  // unfinished; the page now uses the site's standard primary/secondary pair.
  ctas: {
    primary: "Work with me",
    secondary: "Read the résumé",
  },
  // The supporting links under the CTA pair. `external` decides which affordance
  // the shared TextLink renders (outward arrow vs forward chevron) — it is a fact
  // about the destination, not a style choice, so it belongs with the content.
  links: [
    { label: "GitHub", href: SITE.socials.github, external: true },
    { label: "LinkedIn", href: SITE.socials.linkedin, external: true },
    { label: "Timeline", href: "/timeline", external: false },
  ],
  // Framing for the /about "how I think" section, which renders home.principles.
  thinking: {
    kicker: "How I think",
    title: "Three rules I don't break",
    cta: "See how that thinking developed",
    href: "/timeline",
  },
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
 * /talks page copy. Lifted verbatim out of app/talks/page.tsx, where the lede
 * and the whole empty state were typed into the component (Law 3). Nothing here
 * is a new claim: the empty state exists precisely so the page never implies a
 * speaking history that hasn't happened yet.
 */
export const talksIntro = {
  kicker: "Talks",
  title: "Talks & appearances",
  lede:
    "On building grounded, honest AI systems — evals, deterministic safety boundaries, retrieval, and shipping products on a $0 stack.",
  /** Label for the per-talk artifact link, once there are talks to link. */
  entryCta: "slides / recording",
  empty: {
    title: "No talks yet — this is where they'll live.",
    body:
      "If you're organizing a meetup, podcast, or conference and think I'd be a fit — on evals, LLM safety boundaries, retrieval, or shipping AI on a free tier — I'd love to hear from you.",
    cta: { label: "Get in touch", href: "/hire" },
  },
} as const;

/**
 * /now page chrome. The lede and the body are the MDX file (content/now.mdx);
 * this is only the framing the component used to hardcode. "Open to" repeats no
 * fact — the availability sentence itself is single-sourced from STATUS.
 */
export const nowPage = {
  kicker: "Now",
  title: "What I'm doing now",
  /** Prefix for the front-matter `updated` date. Never derived from file mtime. */
  updatedLabel: "Last updated",
  openTo: {
    title: "Open to",
    cta: { label: "Work with me", href: "/hire" },
  },
} as const;

/**
 * /uses — the real stack behind the four live products. Deliberately boring and
 * cheap; every tool here actually ships in one of the projects (no aspirational
 * padding). Grouped for scanability.
 */
export const uses = {
  kicker: "Uses",
  title: "The stack",
  intro:
    "The tools behind four live products — chosen to be boring, cheap, and reliable. A $0 free-tier stack, on purpose: the constraint rules out waste.",
  // The page asserts "four live products"; this is the link that lets a reader
  // check the claim rather than take it. Label only — it adds no new claim.
  cta: { label: "See the four products", href: "/work" },
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

export const trust = {
  kicker: "Trust",
  title: "I publish what ships and what changed.",
  body: "This site is built as an engineering portfolio, so the trust page is evidence-first: security posture, delivery promises, and the standards behind what I claim.",
  principles: [
    {
      title: "Transparent risk handling",
      body: "If I discover reliability or quality issues, I log them, fix them, and keep the changelog visible. No bug is 'buried' if it affects confidence.",
    },
    {
      title: "Deterministic safety boundaries",
      body: "LLM layers can be non-deterministic; the guardrails must not be. Validation, allowlists, and fallback paths are designed to fail closed and be auditable.",
    },
    {
      title: "Single-sourced metrics",
      body: "Every public figure in the portfolio is linked to its source: a project write-up, an eval, or a reproducible artifact.",
    },
  ],
  controls: [
    {
      title: "Code quality gates",
      items: ["Type checks in CI", "Deterministic tests for critical paths", "Dependency and secret hygiene", "Manual review checkpoints on risky modules"],
    },
    {
      title: "AI safety controls",
      items: ["Prompt and tool boundary checks", "Read-only execution for data tasks where possible", "Input/output constraints", "Schema and permission enforcement"],
    },
    {
      title: "Operational trust",
      items: ["Zero-downtime deployment practices", "Rollback and incident playbooks", "Post-change notes for shipped decisions", "Public changelog for architecture and product movement"],
    },
  ],
} as const;

export const changelog = {
  kicker: "Changelog",
  title: "Product and engineering updates, in order.",
  intro:
    "I keep this registry current so hiring teams and collaborators can see what changed, when, and why.",
  entries: [
    {
      quarter: "2026 · Q1",
      title: "Structured trust surface added",
      details: [
        "Added dedicated /trust and /changelog routes with evidence-first sections.",
        "Wired trust and changelog links into primary and footer navigation.",
        "Consolidated trust and changelog copy in a single typed content source.",
      ],
    },
    {
      quarter: "2025 · Q4",
      title: "Homepage + evidence rhythm upgrade",
      details: [
        "Split architecture and delivery copy into explicit, verifiable strips.",
        "Added measured strip and field-note scaffolding for measurable work evidence.",
        "Reworked claims to link back to case study sources and evaluation artifacts.",
      ],
    },
    {
      quarter: "2025 · Q3",
      title: "Live demos and stack clarity",
      details: [
        "Centralized the live portfolio sections and product launch links.",
        "Added role-specific stack grouping to remove decorative tech-wall claims.",
        "Hardened content discipline with no-numbers-on-home unless sourced.",
      ],
    },
  ],
} as const;
