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
import { projects } from "./projects";

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
      { value: String(projects.length), label: "public project case studies", href: "/work" },
      { value: "3+ yrs", label: "shipping software", href: "/resume" },
      { value: "$0", label: "free-tier infrastructure", href: "/uses" },
    ],
  },

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
} as const;

export const about = {
  kicker: "About",
  headline: "From healthcare workflows to AI products.",
  body: [
    `I'm an ${SITE.role.toLowerCase()} with 3+ years in software engineering and a production-AI focus since 2024. I work across the system: data pipelines, APIs, retrieval, model integration, and the interface people use.`,
    "At Sevina Technologies I build healthcare automation, including clinical-compliance and reimbursement workflows. I describe that work at the system level here to protect confidential information. My independent projects make the architecture, implementation, and evaluations available to explore.",
    "The work I enjoy most is connecting a useful model to reliable software: defining what it can do, handling failures, and measuring whether the complete system solves the problem.",
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
    title: "How I approach the work",
  },
} as const;

/**
 * /hire — the "work with me" page. Availability is single-sourced from STATUS;
 * "How I work" links to real decision notes so the claim is backed, not asserted.
 */
export const hire = {
  kicker: "Contact",
  title: "Let's talk about what you're building.",
  lede:
    "I work on LLM applications, AI platforms, and production software. Share the problem, the team, and what you need the system to do.",
  howIWork: {
    body: "I connect architecture decisions to working software: clear interfaces, validated model output, and tests that cover the deployed workflow. My case studies explain the decisions and the costs I accepted. These notes give a shorter view:",
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
 * /uses — the real stack behind the four shipped products. Deliberately boring and
 * cheap; every tool here actually ships in one of the projects (no aspirational
 * padding). Grouped for scanability.
 */
export const uses = {
  kicker: "Uses",
  title: "The stack",
  intro:
    "The tools behind the projects, from model integration to deployment. Free-tier infrastructure keeps the hosting setup small and makes quotas, storage limits, and cold starts explicit design constraints.",
  /**
   * How the "$0" claim is actually met. It is stated here because /about and
   * /hire both show "$0 free-tier infrastructure" and link to this page to back
   * it — a number whose backing page does not state the method is an assertion
   * with a hyperlink attached.
   */
  costNote:
    "The project hosting setup uses free tiers: Vercel Hobby for frontends, Hugging Face Spaces for containerised backends, Neon for Postgres, and GitHub Actions for CI. The $0 figure describes that hosting setup, not an unlimited workload budget. Provider quotas, cold starts, and model API usage remain operating constraints.",
  // The page asserts "four shipped products"; this is the link that lets a reader
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
