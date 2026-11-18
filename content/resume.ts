import { formatDate } from "@/lib/format";
import { CROWNWAGER_EVIDENCE, DBWHISPER_EVIDENCE, requireCompleteEval } from "./evals";
import { AWS, USAGE } from "./flagship/shared";
import { projectBySlug } from "./projects";

/**
 * Résumé content — the single source of truth mirrored by /public/Mubin_Attar_Resume.pdf
 * (regenerated from this data with `npm run build:resume`) and LinkedIn. Site,
 * PDF, and LinkedIn must carry identical facts (launch checklist). Every metric
 * here is real and backed on the site (see /evals and the case studies) — no
 * résumé number exists that the portfolio can't defend.
 *
 * Written for the Applied AI Engineer market (Nov 2026): the flagship products
 * come first, each bullet is an action, what it built and a result a reader can
 * check, and the skills are the terms postings use — only ones the work shows.
 * The usage figures are read from content/flagship/shared.ts in the owner's
 * approved words; the evaluation figures from the registry with their scope.
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

const { policy } = DBWHISPER_EVIDENCE;
const cw = CROWNWAGER_EVIDENCE;
const tradepulseCanary = requireCompleteEval("TradePulse", "Look-ahead canary + parity suite");

/** A featured project as the résumé words it; its project record supplies the rest. */
type ResumeProjectEntry = {
  slug: string;
  /** What it is, in one phrase: the PDF sets it on the project's name line. */
  tagline: string;
  /** How it is built, in one sentence, where that is the evidence (checked in its public source). */
  detail?: string;
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
 *
 * Three projects, each with a registry figure, so the résumé stays one page;
 * LLM Studio (a test count, its demo offline) keeps its case study and source
 * on /work. The PDF sets a tagline on the project's name line, beside its
 * links, so a tagline stays one phrase of about 70 characters.
 *
 * DBWhisper quotes only the policy corpus. The Spider sample's honest scope (a
 * historical run of the generation model alone, with sampled questions
 * dropped) needs more words than a résumé line, so it stays on /evals in full.
 * Its `detail` names what the public repository shows at the audited commit
 * (bca0635): the graph in app/graph/query_graph.py and app/graph/nodes.py, the
 * router and breakers in app/llm/router.py, and the metrics in
 * app/observability/metrics.py. TradePulse's states the boundary its case
 * study (content/projects/tradepulse.mdx) draws between the AI and the engine.
 */
const PROJECTS = [
  {
    slug: "dbwhisper",
    tagline: "Text-to-SQL agent on LangGraph with fail-closed validation",
    detail:
      "One controlled workflow with validation, human-approval and repair paths; capability-aware model routing with fallback and circuit breakers; Prometheus metrics.",
    metrics: [
      {
        // The registry's scope words, whole; the label shortened to fit one line.
        text: `${policy.ratio} adversarial SQL deny cases denied — ${policy.kind.toLowerCase()} (${formatDate(policy.date)})`,
        method: policy.anchor,
        topic: "policy-corpus result",
      },
    ],
    stack: "FastAPI · LangGraph · pgvector · Next.js",
  },
  {
    slug: "tradepulse",
    tagline: "Backtesting platform with a grounded AI copilot",
    detail: "AI-drafted, validated strategy specs run on a deterministic engine: position sizing, risk limits, no look-ahead.",
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
    tagline: "Sports analytics platform built on an XGBoost model of NBA games",
    metrics: [
      {
        // Named by how it was measured (the mean across stratified folds), never
        // as "accuracy" alone or as a live, forecasting or betting result. The
        // spread across folds does not fit the line; /evals shows it.
        text: `${cw.cv.mean} mean ${cw.cv.folds}-fold stratified cross-validation accuracy on ${cw.games} games vs a ${cw.baseRate} home-win base rate (${formatDate(cw.date)})`,
        method: cw.anchor,
        topic: "cross-validation accuracy",
      },
    ],
    stack: "Django REST Framework · FastAPI · XGBoost · Next.js",
  },
] as const satisfies readonly ResumeProjectEntry[];

/** A résumé project with the name and links its project record supplies. */
function withProjectRecord(entry: ResumeProjectEntry) {
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

/**
 * The AWS services the skills line names: ten, behind nine labels, that AI
 * Engineer postings ask for, chosen from the seventeen the flagship products
 * run on (each case study lists its full set). The image registry, the load
 * balancer and the CDN are left to the case studies, so the line fits one line
 * of the page at a readable size. Each label stands for services in the shared
 * register, and test/resume-pdf.test.mts proves every one is in a flagship's
 * stack, so the line can name nothing the products do not use.
 */
export const RESUME_AWS = [
  { label: "ECS (Fargate)", services: [AWS.ecs, AWS.fargate] },
  { label: "RDS", services: [AWS.rds] },
  { label: "S3", services: [AWS.s3] },
  { label: "Cognito", services: [AWS.cognito] },
  { label: "KMS", services: [AWS.kms] },
  { label: "Secrets Manager", services: [AWS.secrets] },
  { label: "IAM", services: [AWS.iam] },
  { label: "CloudWatch", services: [AWS.cloudwatch] },
  { label: "CloudFormation", services: [AWS.cloudformation] },
] as const;

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
    /** The PDF's section headings: the five words résumé-screening software looks for. */
    summary: "Summary",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    education: "Education",
    /** Per-project link labels, on the page and in the PDF. */
    caseStudy: "case study",
    demo: "demo",
    source: "source",
    method: "method",
  },
  summary: `Applied AI Engineer with 3.5+ years in software engineering: LLM applications, RAG, agents, evals and guardrails. Sole engineer of Bench Discovery (${USAGE["bench-discovery"].sentence}): an AWS web platform and a Windows app. Lead engineer for CareLTC (${USAGE.careltc.short}): iOS and Android apps, NestJS API on AWS.`,
  /**
   * Six groups, one line each in the PDF (AI engineering two), of the terms
   * AI Engineer postings search for. "LLM applications" and "guardrails" lead
   * the summary, so this list does not repeat them; how DBWhisper routes
   * models and is evaluated is in its project line.
   */
  skills: [
    {
      group: "AI engineering",
      items:
        "RAG, agents (LangGraph), tool use, embeddings (pgvector), evaluation, prompt engineering, Claude and OpenAI APIs, AI-assisted development (Claude Code) with review and release gates",
    },
    { group: "Languages", items: "Python, TypeScript, JavaScript, SQL, C# (.NET, WPF)" },
    { group: "Frameworks", items: "FastAPI, Django REST Framework, NestJS, Node.js, Next.js, React, React Native (Expo)" },
    { group: "Data and ML", items: "PostgreSQL (row-level security), SQL Server, Redis, ETL, pandas, scikit-learn, XGBoost" },
    { group: "Cloud (AWS)", items: RESUME_AWS.map((service) => service.label).join(", ") },
    { group: "DevOps, CI/CD and testing", items: "Docker, GitHub Actions, canary deploys, pytest, Vitest, Playwright, contract tests" },
  ],
  experience: [
    {
      role: "AI/ML Engineer",
      org: "Sevina Technologies",
      period: "2024 – present",
      place: "Ahmedabad",
      points: [
        "Designed, built and maintain Bench Discovery for legal document review: a multi-tenant web platform on AWS (Next.js, FastAPI, PostgreSQL), and a Windows app (C#, .NET, WPF) that triages and redacts on the PC.",
        "Built the web platform's RAG assistant (Claude, pgvector): grounded answers cite the page, row or paragraph and every quote is verified; a person confirms each action; a spend cap gates every call.",
        `Lead engineer for CareLTC (${USAGE.careltc.short}), NFC room rounds for long-term care: iOS and Android apps (React Native), a NestJS API on AWS and an admin portal, working directly with care staff and admins.`,
        "Made check-ins require a physical NFC tap, built the alerting pipeline (grouped push, reminders, escalation) and shipped App Store and Google Play releases, keeping older builds working.",
        "Built clinical-data pipelines into SQL Server, AI decision support for CMS MDS assessments (HIPPS/PDPM), LLM document assistants with RAG and model routing, and a FastAPI eligibility service.",
      ],
    },
    {
      role: "Junior Python Developer",
      org: "Linescripts Software Pvt Ltd",
      period: "2022 – 2024",
      place: "Pune",
      points: [
        "Delivered a hospital management system and e-commerce platforms in Python, Django and DRF: REST APIs, third-party integrations and Bootstrap frontends, with cross-functional requirements, design and testing.",
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
    school: "Savitribai Phule Pune University",
    year: "2021 · CGPA 8.0",
  },
  pdf: "/Mubin_Attar_Resume.pdf",
} as const;
