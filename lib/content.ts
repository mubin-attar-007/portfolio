// Single source of truth for portfolio content — all real, verifiable.

export const profile = {
  name: "Mubin Attar",
  role: "AI / ML Engineer",
  focus: "GenAI · LLMs · Agents · MLOps",
  location: "Ahmedabad, India",
  email: "sk.mubinattar@gmail.com",
  tagline: "I build and ship real, honest AI products — end to end.",
  // The line that runs through everything he builds:
  ethos:
    "Every number a user sees is genuinely computed — never faked. Real products, honest metrics, shipped.",
  summary:
    "AI/ML Engineer with 3+ years building and shipping production AI products end-to-end — GenAI/LLM applications, agentic & RAG systems, predictive ML, and healthcare-AI automation. Fluent across the stack (FastAPI, Next.js, PostgreSQL, Docker) with auth, CI/CD, and security hardening baked in. I turn ideas into deployed, maintainable software.",
  socials: {
    github: "https://github.com/mubin-attar-007",
    linkedin: "https://www.linkedin.com/in/mubin-attar-53223716a",
    huggingface: "https://huggingface.co/heisenbergblue",
    email: "mailto:sk.mubinattar@gmail.com",
  },
  stats: [
    { value: "4", label: "live AI products" },
    { value: "3+", label: "years shipping" },
    { value: "$0", label: "infra — free-tier stack" },
  ],
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  live: string;
  github: string;
  accent: string; // tailwind-ish hex for per-card theming
};

export const projects: Project[] = [
  {
    slug: "dbwhisper",
    name: "DBWhisper",
    tagline: "Ask your database in plain English.",
    description:
      "A natural-language-to-SQL agent: a LangGraph pipeline with schema-aware pgvector retrieval, multi-LLM fallback, and a fail-closed read-only safety layer. A verified-query flywheel makes it smarter with use.",
    highlights: [
      "LangGraph agent + pgvector RAG",
      "Fail-closed read-only SQL validator",
      "Verified-query flywheel + schema browser",
    ],
    stack: ["FastAPI", "LangGraph", "pgvector", "Next.js", "Postgres"],
    live: "https://dbwhisper.vercel.app",
    github: "https://github.com/mubin-attar-007/dbwhisper",
    accent: "#6366f1",
  },
  {
    slug: "llm-studio",
    name: "LLM Studio",
    tagline: "A multi-user, ChatGPT-style AI platform.",
    description:
      "A production AI-chat SaaS: email/session auth, per-user tenancy, token streaming, multi-LLM routing, and daily quotas — Dockerized and CI'd. The full SaaS shape, on a free stack.",
    highlights: [
      "Per-user tenancy + Argon2 auth",
      "Token streaming + multi-LLM routing",
      "Daily quotas, Docker, CI",
    ],
    stack: ["FastAPI", "Postgres", "Docker", "Vanilla JS"],
    live: "https://heisenbergblue-llm-studio.hf.space",
    github: "https://github.com/mubin-attar-007/llm_studio",
    accent: "#10a37f",
  },
  {
    slug: "tradepulse",
    name: "TradePulse",
    tagline: "An honest quant backtesting platform.",
    description:
      "An event-driven backtesting engine that's structurally look-ahead-free, models commission + slippage by default, and enforces hard risk limits — paired with an AI copilot that explains results without inventing numbers.",
    highlights: [
      "Look-ahead-free event-driven engine",
      "Costs modeled by default; drawdown always shown",
      "Grounded AI copilot (NL → strategy)",
    ],
    stack: ["FastAPI", "Next.js", "TimescaleDB", "Redis"],
    live: "https://tradepulse.vercel.app",
    github: "https://github.com/mubin-attar-007/tradepulse",
    accent: "#3b82f6",
  },
  {
    slug: "crownwager",
    name: "CrownWager",
    tagline: "+EV sports-betting analytics.",
    description:
      "Sports analytics + ML: a validated XGBoost model (65% CV accuracy) turned into fair-odds edge, EV & Kelly staking, an arbitrage finder, and a verifiable model track-record that grades every published pick against the real final score.",
    highlights: [
      "Validated XGBoost model (65% CV)",
      "Fair-odds edge + Kelly staking",
      "Verifiable, graded model track-record",
    ],
    stack: ["Django/DRF", "FastAPI", "XGBoost", "Next.js"],
    live: "https://crownwager.vercel.app",
    github: "https://github.com/mubin-attar-007/crownwager",
    accent: "#f59e0b",
  },
];

export const experience = [
  {
    company: "Sevina Technologies",
    role: "AI/ML Engineer",
    period: "2024 — Present",
    place: "Ahmedabad",
    points: [
      "Build and ship production AI & automation systems for healthcare — end-to-end pipelines (Python, Playwright, Selenium) that extract, validate, and sync clinical/resident/demographic data into SQL Server with logging, reconciliation, and error recovery.",
      "Developed an AI clinical decision-support platform: turns CMS MDS assessments into dashboards, compliance findings, and reimbursement insights (HIPPS/PDPM) via automated PDF extraction and guideline-aligned rules.",
      "Built GenAI applications — LLM document-analysis assistants with multi-provider routing (OpenAI, Claude, Gemini), RAG, and validated structured output — plus a FastAPI eligibility-verification service with async batching, Docker, and CI/CD.",
    ],
  },
  {
    company: "Linescripts Software Pvt Ltd",
    role: "Junior Python Developer",
    period: "2022 — 2024",
    place: "Pune",
    points: [
      "Delivered end-to-end web applications — including a Hospital Management System and e-commerce platforms — with Python, Django & DRF, and responsive frontends.",
      "Built RESTful APIs and backend services, integrated third-party APIs, and collaborated cross-functionally on requirements, design, and testing.",
    ],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "TypeScript / JavaScript", "SQL"] },
  {
    group: "GenAI / LLM",
    items: ["LangChain", "LangGraph", "RAG", "pgvector", "Agents", "Multi-provider routing"],
  },
  {
    group: "Machine Learning",
    items: ["scikit-learn", "XGBoost", "Neural Networks", "pandas", "NumPy"],
  },
  {
    group: "Backend",
    items: ["FastAPI", "Django / DRF", "SQLAlchemy", "async", "Argon2 auth"],
  },
  { group: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
  {
    group: "Data / DevOps",
    items: ["PostgreSQL", "Redis", "Docker", "GitHub Actions", "Vercel", "Hugging Face"],
  },
];

export const education = {
  degree: "Master of Computer Applications (MCA)",
  school: "Savitribai Phule University of Pune",
  year: "2021 · CGPA 8.0",
};
