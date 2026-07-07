import { ProjectSchema, type Project } from "./schema";

/**
 * Projects — real, shipped work. Every metric is method-backed; where a hard
 * benchmark doesn't exist, the value states a real fact/status (never invented).
 * Exactly one project is `featured` (the flagship). To hand the flagship to a
 * future project, flip `featured`.
 */
const RAW = [
  {
    slug: "dbwhisper",
    title: "DBWhisper",
    summary:
      "A natural-language-to-SQL agent that reads your database safely — schema-aware retrieval, a fail-closed read-only validator, and multi-provider LLM fallback.",
    status: "production",
    role: "Designed, built, and maintain (solo)",
    timeline: "2025 – present",
    featured: true,
    order: 1,
    systems: ["LangGraph agent", "pgvector retrieval", "fail-closed SQL validator", "multi-provider LLM fallback"],
    metrics: [
      { label: "write access to your data", value: "none", method: "Fail-closed read-only validator gates every query before execution; the query is rejected if it references a table outside the enrolled schema, or if no schema index exists." },
      { label: "LLM providers behind one fallback", value: "6", method: "OpenAI → OpenRouter → DeepSeek → Groq → Anthropic → Gemini; the first with credentials wins, Gemini's free tier is the final fallback." },
      { label: "SQL dialects supported", value: "3", method: "Postgres, MySQL, and SQL Server via SQLAlchemy 2.0 + ODBC, with per-dialect generation directives." },
    ],
    links: { live: "https://dbwhisper.vercel.app", repo: "https://github.com/mubin-attar-007/dbwhisper" },
    diagram: "dbwhisper",
  },
  {
    slug: "tradepulse",
    title: "TradePulse",
    summary:
      "An honest quant backtesting platform — a look-ahead-free event-driven engine, costs modeled by default, and a grounded NL→strategy AI copilot.",
    status: "production",
    role: "Designed and built (solo)",
    timeline: "2025 – present",
    featured: false,
    order: 2,
    systems: ["event-driven backtest engine", "cost + slippage model", "grounded AI copilot"],
    metrics: [
      { label: "look-ahead safety", value: "structural", method: "Decide on bar i, fill at bar i+1's open; a canary test fails the build if any look-ahead leaks into a result." },
      { label: "Sharpe risk-free rate", value: "0 (stated)", method: "Sharpe/Sortino are annualized; the risk-free rate is shown wherever they appear — no silent assumptions." },
    ],
    links: { live: "https://tradepulse-live.vercel.app", repo: "https://github.com/mubin-attar-007/tradepulse" },
    diagram: "tradepulse",
  },
  {
    slug: "crownwager",
    title: "CrownWager",
    summary:
      "+EV sports-betting analytics — a validated XGBoost model turned into fair-odds edge, Kelly staking, an arbitrage finder, and a graded model track-record.",
    status: "production",
    role: "Designed and built (solo)",
    timeline: "2025 – present",
    featured: false,
    order: 3,
    systems: ["XGBoost model", "fair-odds edge + Kelly staking", "graded model track-record"],
    metrics: [
      { label: "model accuracy", value: "65.2% ± 0.8%", method: "5-fold stratified cross-validation on 15,115 NBA games; base home-win rate is 57.5%, so a real ~8-point edge (ROC-AUC 0.685)." },
      { label: "track-record", value: "graded vs finals", method: "Every published pick is settled against the real final score; the record is flagged 'insufficient' below 20 settled picks." },
    ],
    links: { live: "https://crownwager.vercel.app", repo: "https://github.com/mubin-attar-007/crownwager" },
    diagram: "crownwager",
  },
  {
    slug: "llm-studio",
    title: "LLM Studio",
    summary:
      "A multi-user, ChatGPT-style AI platform — per-user tenancy, token streaming, multi-LLM routing, and daily quotas, Dockerized and CI'd.",
    status: "production",
    role: "Designed and built (solo)",
    timeline: "2025 – present",
    featured: false,
    order: 4,
    systems: ["Argon2 auth + sessions", "per-user tenancy", "multi-LLM routing"],
    metrics: [
      { label: "tests passing", value: "31", method: "pytest suite gated in CI, alongside ruff, pip-audit, and gitleaks checks." },
      { label: "tenancy", value: "per-user", method: "Ownership is enforced on every query in the repository layer, not just at the route." },
    ],
    links: { live: "https://heisenbergblue-llm-studio.hf.space", repo: "https://github.com/mubin-attar-007/llm_studio" },
    diagram: "llm-studio",
  },
] as const;

export const projects: Project[] = RAW.map((p) => ProjectSchema.parse(p)).sort(
  (a, b) => a.order - b.order,
);

export const featuredProject: Project = projects.find((p) => p.featured) ?? projects[0]!;
export const secondaryProjects: Project[] = projects.filter((p) => p.slug !== featuredProject.slug);
export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((p) => p.slug === slug);
