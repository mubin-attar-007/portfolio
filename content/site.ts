/**
 * Copy that more than one route reads (spec/CONTENT_MODEL.md §5). Structured
 * content lives in a typed .ts module rather than parsed .md: it is shaped
 * data, not prose, so TypeScript checks it at build with no parser or schema in
 * between. Long-form prose stays in MDX under content/{projects,writing,notes}.
 * Every number carries its method (in the linked case study). Identity (name,
 * socials, email) is config/site.ts, never restated here.
 */

/**
 * Homepage + about copy that is NOT the homepage's own layout data.
 *
 * The homepage's own copy lives in `content/pages/home.ts`. What survives here
 * is the one block other routes read: `principles`, the three rules /about
 * renders and the assistant's corpus indexes. (The employer-anchored `proof`
 * row went with the component that rendered it, which nothing used.)
 *
 * Everything else this object used to hold — a second hero headline, a second
 * stack list, a second set of capability cards, a homepage FAQ, field notes, a
 * duplicate architecture section — was orphaned when the homepage was rebuilt,
 * and several blocks still asserted numbers that had since been corrected
 * elsewhere. Dead copy that states a metric is not harmless: it is a second
 * source waiting to be re-rendered and disagree with the first.
 */
export const home = {
  principles: [
    {
      title: "Evidence over demos",
      body: "Publish the method, sample size, and limitations alongside the result. Where details are confidential, describe the engineering without disclosing the data.",
    },
    {
      title: "Bound the model's authority",
      body: "Validate generated output before execution. Use permissions, explicit rules, and refusal paths to limit what the model can do.",
    },
    {
      title: "Design for the operating constraints",
      body: "Free-tier hosting shaped the projects: scoped retrieval, bounded agent loops, and lean containers, with cold starts and quotas treated as part of the design.",
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
      "The problem, the architecture, and the decisions behind each project. Explore the trade-offs, published evaluations, source code, and deployment links.",
    flagshipKicker: "Flagship",
    flagshipCta: "Read the full write-up",
    othersKicker: "More",
    othersTitle: "Other systems",
  },
  writing: {
    kicker: "Writing",
    title: "Notes from building AI systems.",
    lede:
      "Essays and guides on AI systems and evaluation, drawn from the decisions and failures in my projects.",
    feedCta: "RSS",
    feedHref: "/writing/feed.xml",
    crossCta: "Shorter, single-decision notes",
    crossHref: "/notes",
  },
  notes: {
    kicker: "Notes",
    title: "One decision per note.",
    lede:
      "A running notebook on retrieval, evaluation, agents, and the infrastructure behind the projects.",
    feedCta: "RSS",
    feedHref: "/rss.xml",
    crossCta: "Essays and implementation guides",
    crossHref: "/writing",
  },
  /** The 404: the primary routes and every case study, so a dead link is never a dead end. */
  notFound: {
    kicker: "404",
    title: "That page doesn't exist.",
    lede: "The link may be old or mistyped. These pages lead back into the site.",
    home: "Home",
    caseStudies: "Case studies",
  },
} as const;

/**
 * /about's social card (app/about/opengraph-image.tsx). The page's own copy is
 * `aboutPage` in content/pages/about.ts.
 */
export const about = {
  kicker: "About",
  headline: "From healthcare workflows to AI products.",
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
    cta: { label: "Work with me", href: "/hire" },
  },
} as const;

/**
 * /uses — the real stack behind the case studies. Deliberately boring; every
 * tool here actually ships in one of the projects (no aspirational padding).
 * Grouped for scanability.
 */
export const uses = {
  kicker: "Uses",
  title: "The stack",
  // The hosting split is the case studies' own: each flagship lists the AWS
  // services it runs on (content/flagship), each public project its free-tier
  // deploy (content/projects).
  intro:
    "The tools behind the case studies, from model integration to deployment. The two flagship products are hosted on AWS; the four public projects run on free tiers, which makes quotas, storage limits and cold starts explicit design constraints.",
  /**
   * How the "$0" claim is actually met. The public case studies and the
   * writing call that hosting a "$0 stack", so this page states the method —
   * a number whose backing page does not state the method is an assertion with
   * a hyperlink attached. It covers the public projects only.
   */
  costNote:
    "The public projects' hosting uses free tiers: Vercel Hobby for frontends, Hugging Face Spaces for containerised backends, Neon for Postgres, and GitHub Actions for CI. The $0 figure describes that hosting setup, not an unlimited workload budget. Provider quotas, cold starts, and model API usage remain operating constraints.",
  // The intro names the case studies; this link lets a reader check them rather
  // than take them. Label only — it adds no new claim.
  cta: { label: "See the case studies", href: "/work" },
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
        "Embedding retrieval",
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
      value: "Four public projects with case studies, source code, and deployment links.",
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
  title: "The evidence behind the work.",
  body: "The case studies describe the controls, the evaluations, and the trade-offs behind the projects. They give you a way to assess the implementation and its limits.",
  principles: [
    {
      title: "Transparent risk handling",
      body: "The case studies include failures and subsequent changes so you can see how the implementation evolved.",
    },
    {
      title: "Deterministic safety boundaries",
      body: "Validation, allowlists, permissions, and refusal paths constrain model output. Each project's case study describes where those controls apply.",
    },
    {
      title: "Single-sourced metrics",
      body: "Evaluation results link to a project write-up or registry entry with the method, sample, and scope of the run.",
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
      items: ["Versioned deployment configuration", "CI workflows alongside the source", "Project change logs and decision notes", "Dated updates on /now"],
    },
  ],
} as const;
