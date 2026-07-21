/**
 * Résumé content — the single source of truth mirrored by /public/Mubin_Attar_Resume.pdf
 * (regenerated from this data via scripts/build-resume-pdf.mts) and LinkedIn. Site,
 * PDF, and LinkedIn must carry identical facts (launch checklist). Every metric here
 * is real and backed on the site (see /evals and the case studies) — no résumé number
 * exists that the portfolio can't defend.
 */
export const resume = {
  /**
   * Page chrome — the labels app/resume/page.tsx used to hardcode (Law 3). These
   * name sections; they assert nothing. The h1 stays SITE.name, because on a
   * résumé the person is the title.
   */
  kicker: "Résumé",
  download: "Download PDF",
  /** Forward link out of the résumé, to the evidence behind it. */
  cta: { label: "See the work behind it", href: "/work" },
  labels: {
    experience: "Experience",
    projects: "Featured projects",
    /** Qualifier shown after the projects label — a fact, and a checkable one. */
    projectsNote: "all live & open-source",
    education: "Education",
    skills: "Skills",
  },
  summary:
    "AI/ML Engineer shipping production software since 2022 and production AI since 2024 — GenAI/LLM applications, agentic and RAG systems, predictive ML, and healthcare-AI automation. Four AI products shipped to production and kept live, each measured rather than demoed. Fluent across the stack (FastAPI, Next.js, PostgreSQL, Docker) with auth, CI/CD, and security hardening baked in.",
  skills: [
    { group: "Languages", items: "Python, JavaScript / TypeScript, SQL" },
    { group: "GenAI / LLM", items: "LangChain, LangGraph, RAG, pgvector, prompt engineering, agents, multi-provider routing (Gemini, GPT, Claude, Groq)" },
    { group: "Machine Learning", items: "scikit-learn, XGBoost, neural networks, pandas, NumPy, model training & evaluation" },
    { group: "Backend", items: "FastAPI, Django / DRF, SQLAlchemy, REST APIs, async, Argon2 auth, Playwright & Selenium automation" },
    { group: "Frontend", items: "Next.js, React, TypeScript, Tailwind CSS" },
    { group: "Data / DevOps", items: "PostgreSQL, SQL Server, Redis, Docker, AWS, GitHub Actions (CI/CD), ETL, Vercel, Hugging Face" },
    { group: "Practices", items: "MLOps, testing (pytest), OOP, DSA, secure API design, observability" },
  ],
  experience: [
    {
      role: "AI/ML Engineer",
      org: "Sevina Technologies",
      period: "2024 – present",
      place: "Ahmedabad",
      points: [
        "Build and ship production AI & automation systems for healthcare — end-to-end pipelines (Python, Playwright, Selenium) that extract, validate, and synchronize clinical, resident, and demographic data into SQL Server, with logging, reconciliation, and error recovery.",
        "Developed an AI clinical decision-support platform that turns CMS MDS assessments into interactive dashboards, compliance findings, and reimbursement insights (HIPPS/PDPM) for skilled-nursing facilities via automated PDF extraction and deterministic, guideline-aligned rules.",
        "Built Generative AI applications — LLM document-analysis assistants with multi-provider routing (OpenAI, Claude, Gemini), RAG, and validated structured output — plus a FastAPI eligibility-verification service with async batch processing, Dockerized deploys, and CI/CD.",
      ],
    },
    {
      role: "Junior Python Developer",
      org: "Linescripts Software Pvt Ltd",
      period: "2022 – 2024",
      place: "Pune",
      points: [
        "Delivered end-to-end web applications — including a Hospital Management System and e-commerce platforms — with Python, Django & DRF, and responsive HTML5/CSS3/JavaScript/Bootstrap frontends.",
        "Built RESTful APIs and backend services, integrated third-party APIs, and collaborated cross-functionally on requirements, design, and testing.",
      ],
    },
  ],
  /**
   * Featured projects — all live and open-source. Each carries ONE real, defensible
   * metric (mirrored from /evals and the case studies), never a marketing figure.
   * `method` is the on-site page that documents how that metric was measured — the
   * site renders it as a link so no number here is ever shown naked.
   */
  projects: [
    {
      name: "DBWhisper",
      tagline: "Natural-language-to-SQL agent — LangGraph pipeline, schema-aware pgvector retrieval, multi-LLM fallback, and a fail-closed read-only safety layer.",
      // Spider figure is the /evals registry number (101/139 execution-match on the
      // dev split) — the only one with a published method. Never round it differently.
      metric: "73% Spider dev · 82% golden-set exact · 100% fail-closed",
      stack: "FastAPI · LangGraph · Next.js",
      method: "/evals",
      live: "https://dbwhisper.vercel.app",
      github: "https://github.com/mubin-attar-007/dbwhisper",
    },
    {
      name: "TradePulse",
      tagline: "Quant backtesting platform engineered so common backtest lies are structurally impossible — look-ahead-free by construction, costs-on-by-default, Decimal money, grounded AI copilot.",
      metric: "Look-ahead canary + cash-conservation tests green",
      stack: "FastAPI · Next.js · TimescaleDB · Redis",
      method: "/evals",
      live: "https://tradepulse-live.vercel.app",
      github: "https://github.com/mubin-attar-007/tradepulse",
    },
    {
      name: "CrownWager",
      tagline: "Sports-betting analytics & ML predictions — +EV best bets, a validated XGBoost model, cross-book arbitrage finder, and a graded, verifiable track record.",
      metric: "65.2% ± 0.8% XGBoost accuracy (5-fold CV)",
      stack: "Django/DRF · FastAPI · Next.js",
      method: "/evals",
      live: "https://crownwager.vercel.app",
      github: "https://github.com/mubin-attar-007/crownwager",
    },
    {
      name: "LLM Studio",
      tagline: "Multi-user, ChatGPT-style AI chat SaaS — Argon2id auth, per-user tenancy, token streaming, OpenAI-compatible multi-LLM routing, and a shared-key daily quota.",
      // Not an eval-registry row — the test count and tenancy model are documented
      // in the case study's metric table, so that is this project's method page.
      metric: "Per-user tenancy · 31 tests · live on HF + Neon",
      stack: "FastAPI · Postgres · Docker · CI",
      method: "/work/llm-studio",
      live: "https://heisenbergblue-llm-studio.hf.space",
      github: "https://github.com/mubin-attar-007/llm_studio",
    },
  ],
  education: {
    degree: "Master of Computer Applications (MCA)",
    school: "Savitribai Phule University of Pune",
    year: "2021 · CGPA 8.0",
  },
  pdf: "/Mubin_Attar_Resume.pdf",
} as const;
