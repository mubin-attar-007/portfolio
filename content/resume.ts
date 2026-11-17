import { formatDate } from "@/lib/format";
import { CROWNWAGER_EVIDENCE, DBWHISPER_EVIDENCE, requireCompleteEval } from "./evals";
import { projectBySlug } from "./projects";

/**
 * Résumé content — the single source of truth mirrored by /public/Mubin_Attar_Resume.pdf
 * (regenerated from this data with `npm run build:resume`) and LinkedIn. Site,
 * PDF, and LinkedIn must carry identical facts (launch checklist). Every metric
 * here is real and backed on the site (see /evals and the case studies) — no
 * résumé number exists that the portfolio can't defend.
 */

/** One measured line on the résumé, with the page that documents its method. */
export type ResumeMetric = {
  /** The figure, its scope, and its date, in one line. */
  text: string;
  /** The on-site page (or anchor) that documents how it was measured. */
  method: string;
  /** What the method link explains, named in its accessible name ("Spider result"). */
  topic: string;
};

const { policy, spider } = DBWHISPER_EVIDENCE;
const cw = CROWNWAGER_EVIDENCE;
const tradepulseCanary = requireCompleteEval("TradePulse", "Look-ahead canary + parity suite");

/** A featured project as the résumé words it; its project record supplies the rest. */
type ResumeProjectEntry = {
  slug: string;
  tagline: string;
  metrics: readonly ResumeMetric[];
  stack: string;
};

/**
 * Featured projects — the résumé's own wording only. `slug` ties each entry to
 * its project record (content/projects.ts), which supplies the name, the case
 * study, and the demo and source links, so a demo that goes down loses its
 * link here in the same change that removes it from the site. Every figure is
 * read from the eval registry with its scope and date (content/evals.ts); none
 * is typed here.
 */
const PROJECTS = [
  {
    slug: "dbwhisper",
    tagline: "Natural-language-to-SQL agent — LangGraph pipeline, schema-aware pgvector retrieval, multi-LLM fallback, and a fail-closed read-only safety layer.",
    metrics: [
      {
        text: `${spider.ratio} on a ${spider.label} — ${spider.scope}; ${spider.excluded} of ${spider.sampled} dropped (${formatDate(spider.date)})`,
        method: spider.anchor,
        topic: "Spider result",
      },
      {
        text: `${policy.ratio} ${policy.label} — ${policy.kind.toLowerCase()} (${formatDate(policy.date)})`,
        method: policy.anchor,
        topic: "policy-corpus result",
      },
    ],
    stack: "FastAPI · LangGraph · Next.js",
  },
  {
    slug: "tradepulse",
    tagline: "Quant backtesting platform with next-bar execution, costs modeled by default, Decimal accounting, and an AI copilot grounded in the backtest results.",
    metrics: [
      {
        text: `Look-ahead canary + cash-conservation tests green (${formatDate(tradepulseCanary.date)})`,
        method: tradepulseCanary.anchor,
        topic: "look-ahead tests",
      },
    ],
    stack: "FastAPI · Next.js · TimescaleDB · Redis",
  },
  {
    slug: "crownwager",
    tagline: "Sports-betting analytics & ML predictions — +EV best bets, a validated XGBoost model, cross-book arbitrage finder, and a graded, verifiable track record.",
    metrics: [
      {
        text: `${cw.cv.result} XGBoost accuracy — ${cw.cv.folds}-fold cross-validation on ${cw.games} NBA games vs a ${cw.baseRate} base rate (${formatDate(cw.date)})`,
        method: cw.anchor,
        topic: "model accuracy",
      },
    ],
    stack: "Django/DRF · FastAPI · Next.js",
  },
  {
    slug: "llm-studio",
    tagline: "Multi-user, ChatGPT-style AI chat SaaS — Argon2id auth, per-user tenancy, token streaming, OpenAI-compatible multi-LLM routing, and a shared-key daily quota.",
    // Not an eval-registry row — the test count and tenancy model are documented
    // in the case study's metric table, so that is this project's method page.
    metrics: [
      {
        text: "Per-user tenancy · 31 tests",
        method: "/work/llm-studio#performance-cost",
        topic: "test suite",
      },
    ],
    stack: "FastAPI · Postgres · Docker · CI",
  },
] as const satisfies readonly ResumeProjectEntry[];

/** A résumé project with the name and links its project record supplies. */
function withProjectRecord<T extends { slug: string }>(entry: T) {
  const project = projectBySlug(entry.slug);
  if (!project) throw new Error(`resume: no project record for "${entry.slug}".`);
  return {
    ...entry,
    name: project.title,
    caseStudy: `/work/${project.slug}`,
    /** The deployed demo, only while it is up (see content/projects.ts). */
    demo: project.links.live,
    source: project.links.repo,
  };
}

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
    projectsNote: "case studies & source code",
    education: "Education",
    skills: "Skills",
    /** Per-project link labels, on the page and in the PDF. */
    caseStudy: "case study",
    demo: "demo",
    source: "source",
    method: "method",
  },
  summary:
    "Applied AI Engineer with 3.5+ years in software engineering and a production-AI focus since 2024. I build LLM applications, agentic and RAG systems, predictive ML, and healthcare automation across FastAPI, Next.js, PostgreSQL, and Docker. Four public AI projects document my work in authentication, CI/CD, validation, and task-level evaluation.",
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
   * Featured projects — public source and a case study each. Each metric line
   * carries its method page, so the site and the PDF never show a number
   * naked.
   */
  projects: PROJECTS.map(withProjectRecord),
  education: {
    degree: "Master of Computer Applications (MCA)",
    school: "Savitribai Phule University of Pune",
    year: "2021 · CGPA 8.0",
  },
  pdf: "/Mubin_Attar_Resume.pdf",
} as const;
