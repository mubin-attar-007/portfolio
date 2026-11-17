/**
 * /uses — one plain line per tool saying what it is FOR (what the tool does,
 * not a claim about results). Keyed by the item names in content/site.ts
 * `uses.groups`; an item without a note simply shows none.
 */
export const TOOL_NOTES: Record<string, string> = {
  Python: "Backends, data pipelines and model work.",
  TypeScript: "Typed frontends and tooling.",
  FastAPI: "Async Python APIs with typed request models.",
  "Next.js": "React framework for the web frontends.",
  React: "UI components.",
  Django: "Batteries-included Python web framework.",
  "Tailwind CSS": "Utility-first styling.",
  LangGraph: "Agent workflows as explicit state graphs.",
  Gemini: "Google's model API.",
  "Multi-provider LLM fallback": "Routing a request to another provider when one fails.",
  pgvector: "Vector search inside Postgres.",
  "embedding retrieval": "Finding relevant passages by meaning.",
  XGBoost: "Gradient-boosted trees for tabular prediction.",
  "scikit-learn": "Classical ML, preprocessing and evaluation.",
  PostgreSQL: "The relational database of record.",
  Neon: "Serverless Postgres hosting.",
  Redis: "Caching, queues and rate limits.",
  TimescaleDB: "Time-series tables on Postgres.",
  SQLAlchemy: "Python ORM and query builder.",
  Docker: "Reproducible containers for backends.",
  Vercel: "Frontend hosting and previews.",
  "Hugging Face Spaces": "Container hosting for the backends.",
  "GitHub Actions": "CI: tests, lint and checks on every push.",
  Playwright: "Browser automation and end-to-end tests.",
  pytest: "Python test runner.",
  ruff: "Python linting and formatting.",
  Shiki: "Syntax highlighting for code blocks.",
};

/** A two-letter monogram: the initials of the first two words ("HF"), or the first two letters ("Py"). */
export function monogram(name: string): string {
  const words = name.split(/[\s/-]+/).filter(Boolean);
  if (words.length > 1) return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
  const letters = name.replace(/[^A-Za-z]/g, "");
  return letters.charAt(0).toUpperCase() + letters.charAt(1).toLowerCase();
}
