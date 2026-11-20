import { ProjectSchema, type Project } from "./schema";

/**
 * Projects — real, shipped work. Every metric is method-backed; where a hard
 * benchmark doesn't exist, the value states a real fact/status (never invented).
 * A measured value is read from the eval registry rather than retyped, so the
 * card and /evals cannot disagree. Exactly one project is `featured` (the
 * flagship). To hand the flagship to a future project, flip `featured`.
 */
const RAW = [
  {
    slug: "dbwhisper",
    title: "DBWhisper",
    summary:
      "A natural-language-to-SQL agent with schema-aware retrieval, SELECT-only validation, a read-only database connection, and multi-provider LLM fallback.",
    status: "deployed-demo",
    role: "Designed, built, and maintained (solo)",
    timeline: "2025 – present",
    featured: true,
    order: 1,
    systems: ["LangGraph agent", "pgvector retrieval", "fail-closed SQL validator", "multi-provider LLM fallback"],
    metrics: [
      { label: "query execution", value: "read-only", method: "A SELECT-only, single-statement validator checks enrolled tables before execution through a least-privilege read-only connection. Queries outside the enrolled schema or without a schema index are rejected." },
      { label: "LLM providers behind one fallback", value: "6", method: "OpenAI → OpenRouter → DeepSeek → Groq → Anthropic → Gemini; the first with credentials wins, Gemini's free tier is the final fallback." },
      { label: "SQL dialects supported", value: "3", method: "Postgres, MySQL, and SQL Server via SQLAlchemy 2.0 + ODBC, with per-dialect generation directives." },
    ],
    card: {
      definition: "Ask your database in English, with validation before execution.",
      category: "Agents · retrieval · SQL safety",
      decision: { title: "Validate before the database sees the query." },
      shot: { src: "/demos/dbwhisper.webp", width: 768, height: 456 },
      alt: "DBWhisper's website introducing natural-language database queries, with a sample console beneath the headline.",
      caption: "DBWhisper · product website",
    },
    links: { live: "https://dbwhisper.vercel.app", repo: "https://github.com/mubin-attar-007/dbwhisper" },
    diagram: "dbwhisper",
    // No recording. The old product-site capture showed the golden-set figures
    // and the scale and uptime claims DBWhisper's claim audit withdrew (§4.4 at
    // bca0635), and a caption cannot take a figure off the screen. Re-record
    // from the current v2 site, check every frame and caption against the
    // audit, then add `recording` here (2026-11-16).
    changelog: [
      { date: "2026-07-03", summary: "Schema browser, a verified NL→SQL training flywheel, and the full marketing site." },
      { date: "2026-07-01", summary: "Flagship web console — auto-generated charts, CSV export, sortable results, staged progress." },
      { date: "2026-06-08", summary: "Production hardening: Argon2id auth, per-query tenancy, API-key + per-IP rate limits, a SQL allowlist, and optional Sentry." },
      { date: "2026-06-05", summary: "Productionized from a prototype — Next.js frontend, dialect-agnostic schema extraction, and a live demo on Neon." },
    ],
  },
  {
    slug: "tradepulse",
    title: "TradePulse",
    summary:
      "An honest quant backtesting platform — a look-ahead-free event-driven engine, costs modeled by default, and a grounded NL→strategy AI copilot.",
    status: "archived",
    role: "Designed and built (solo)",
    timeline: "2025 – 2026",
    featured: false,
    order: 2,
    systems: ["event-driven backtest engine", "cost + slippage model", "grounded AI copilot"],
    metrics: [
      { label: "look-ahead safety", value: "structural", method: "Decide on bar i, fill at bar i+1's open; a canary test fails the build if any look-ahead leaks into a result." },
      { label: "Sharpe risk-free rate", value: "0 (stated)", method: "Sharpe/Sortino are annualized; the risk-free rate is shown wherever they appear — no silent assumptions." },
    ],
    card: {
      definition: "Backtest strategies with next-bar execution and trading costs included.",
      category: "Quantitative systems · time-series",
      decision: { title: "Keep the future out of the backtest." },
      shot: { src: "/demos/tradepulse.webp", width: 1280, height: 760 },
      alt: "TradePulse's website introducing the backtesting engine and offering a real backtest.",
      caption: "TradePulse · product website",
    },
    // Archived on 2026-11-20: the code and the write-up stay public; the hosted
    // demo is no longer maintained, so the case study links no demo.
    links: { repo: "https://github.com/mubin-attar-007/tradepulse" },
    diagram: "tradepulse",
    recording: {
      alt: "Recorded scroll through the TradePulse product website.",
      caption: "Product website recording. Market data is delayed; older on-screen references to real-time charting are not the current data contract.",
      width: 1280,
      height: 760,
    },
    changelog: [
      { date: "2026-07-03", summary: "Public per-ticker pages, a position-sizing calculator, and real paper-trading email alerts." },
      { date: "2026-07-02", summary: "A public methodology page and a reality pass — cut anything the engine couldn't back." },
      { date: "2026-07-01", summary: "Credible backtest report: an underwater drawdown curve and full trade CSV export." },
      { date: "2026-06-04", summary: "Free-tier cloud deploy (Docker on Hugging Face Spaces + Neon) running on real live market data." },
      { date: "2026-06-03", summary: "First build — a look-ahead-safe, cost-aware backtest engine with a grounded NL→strategy copilot." },
    ],
  },
] as const;

export const projects: Project[] = RAW.map((p) => ProjectSchema.parse(p)).sort(
  (a, b) => a.order - b.order,
);

export const featuredProject: Project = projects.find((p) => p.featured) ?? projects[0]!;
export const secondaryProjects: Project[] = projects.filter((p) => p.slug !== featuredProject.slug);
export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);

/**
 * The case studies either side of one slug, in the curated `order` above — the
 * same sequence /work lists them in, so the end-of-article links continue the
 * order the reader has already been shown rather than inventing a second one.
 *
 * Positional, NOT temporal: `order` is a curation decision with no date meaning,
 * which is why the footer labels these "Previous"/"Next" and never "Older".
 * Returns nulls at both ends and for an unknown slug.
 */
export const projectNeighbours = (
  slug: string,
): { previous: Project | null; next: Project | null } => {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return { previous: projects[index - 1] ?? null, next: projects[index + 1] ?? null };
};
