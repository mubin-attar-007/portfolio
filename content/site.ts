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

/**
 * Homepage + about copy that is NOT the homepage's own layout data.
 *
 * The homepage's sections read `flagshipHome` (content/home-visual.ts). What
 * survives here are the two blocks that other routes render:
 *
 * - `proof`     the employer-anchored credibility row on /about and /hire.
 * - `principles` the three rules, rendered by /about.
 *
 * Everything else this object used to hold — a second hero headline, a second
 * stack list, a second set of capability cards, a homepage FAQ, field notes, a
 * duplicate architecture section — was orphaned when the homepage was rebuilt,
 * and several blocks still asserted numbers that had since been corrected
 * elsewhere. Dead copy that states a metric is not harmless: it is a second
 * source waiting to be re-rendered and disagree with the first.
 */
export const home = {
  // The honest "trusted by" replacement: the employer is the real third-party
  // anchor, and every stat links to the page where a visitor can verify the
  // count themselves. No logos or quotes that cannot be backed.
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
    crossCta: "Essays and implementation guides",
    crossHref: "/writing",
  },
} as const;

export const about = {
  kicker: "About",
  headline: "Solo engineer, real products.",
  body: [
    "I'm an AI systems engineer — shipping software since 2022 and focused on production AI since 2024: GenAI/LLM applications, agentic and RAG systems, and predictive ML. I work across the stack: FastAPI, Next.js, Postgres, and Docker, with auth, CI/CD, and security hardening baked in.",
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
    { label: "Résumé", href: "/resume", external: false },
  ],
  // Framing for the /about "how I think" section, which renders home.principles.
  thinking: {
    kicker: "How I think",
    title: "Three rules I don't break",
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
  /** Heading for the structured `exploring` list in the front-matter. */
  exploringTitle: "Currently exploring",
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
  /**
   * How the "$0" claim is actually met. It is stated here because /about and
   * /hire both show "$0 free-tier infrastructure" and link to this page to back
   * it — a number whose backing page does not state the method is an assertion
   * with a hyperlink attached.
   */
  costNote:
    "Every service below runs on its published free tier: Vercel Hobby for the frontends, Hugging Face Spaces for the containerised backends, Neon for Postgres, and GitHub Actions for CI. No paid plan, no trial credit, and no card on file — which is why cold starts are a real trade-off rather than a footnote.",
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

/**
 * /trust — evidence about the evidence.
 *
 * `signals` used to live in app/trust/page.tsx as three rows labelled "Signal 1,
 * 2, 3" with no link on any of them, which contradicted this page's own third
 * principle ("every public figure is linked to its source"). Each signal now has
 * a real name and a real destination; a claim that cannot get one does not
 * belong on this page.
 */
export const trust = {
  kicker: "Trust",
  signals: [
    {
      label: "Shipped",
      value: "Four products live in production, each with a public case study.",
      href: "/work",
    },
    {
      label: "Measured",
      value: "A public eval registry: method, date, and the excluded cases stated.",
      href: "/evals",
    },
    {
      label: "Recorded",
      value: "Decision notes for the choices behind the work, published as they are made.",
      href: "/notes",
    },
  ],
  title: "I publish what ships and what changed.",
  body: "This site is built as an engineering portfolio, so the trust page is evidence-first: security posture, delivery promises, and the standards behind what I claim.",
  principles: [
    {
      title: "Transparent risk handling",
      body: "If I discover reliability or quality issues, I log them, fix them, and keep a running record visible. No bug is 'buried' if it affects confidence.",
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
      items: ["Zero-downtime deployment practices", "Rollback and incident playbooks", "Post-change notes for shipped decisions", "A running record of shipped decisions on /now"],
    },
  ],
} as const;
