import { TimelineSchema, type TimelinePhase } from "./schema";

/**
 * Career timeline — growth over titles. Each phase includes a Mistake line
 * (mandatory: it's the credibility engine). Honest reflections; no invented
 * events or numbers.
 */
const RAW = [
  {
    period: "2025 – present",
    role: "Independent AI products",
    org: undefined,
    order: 1,
    built: "Four live AI products on a $0 stack — a NL→SQL agent (DBWhisper), an honest backtester (TradePulse), a +EV sports-ML system (CrownWager), and a multi-user AI chat platform (LLM Studio).",
    learned: "Safety-first LLM systems: deterministic gates around model output, retrieval over context-stuffing, and evaluation before pixels.",
    mistake: "Early on I trusted model output where a deterministic gate was needed — an LLM writing SQL against a live database with only a prompt between it and a mistake.",
    changed: "Fail-closed validators and 'look-ahead-free by construction' became defaults, not afterthoughts — the safety is now a property of the architecture.",
  },
  {
    period: "2024 – present",
    role: "AI/ML Engineer",
    org: "Sevina Technologies",
    order: 2,
    built: "Production healthcare-AI automation — clinical-compliance and reimbursement pipelines (MDS/PDPM), LLM document analysis with multi-provider routing and RAG, and eligibility-verification services, Dockerized and CI'd.",
    learned: "Building AI under real regulatory constraints (HIPAA): synthetic data, aggregate metrics, auditability, and knowing when the boring deterministic approach is the correct one.",
    mistake: "I leaned on an LLM for correctness that belonged in deterministic code — enumerable rules an auditor needs to reproduce.",
    changed: "Rules and validation moved into code the model can't override; the LLM assists, it doesn't adjudicate.",
  },
  {
    period: "2022 – 2024",
    role: "Junior Python Developer",
    org: "Linescripts Software",
    order: 3,
    built: "End-to-end web applications and RESTful services — a Hospital Management System, e-commerce platforms, and third-party API integrations, across Python, Django/DRF, and a JavaScript frontend.",
    learned: "How to ship maintainable software end to end, and that the interesting part is usually everything around the feature — the tests, the errors, the edges.",
    mistake: "I optimized for shipping features over tests, and paid for it later in regressions I could have caught.",
    changed: "CI and tests became non-negotiable before a feature is 'done' — the definition of done now includes proof it works.",
  },
] as const;

export const timeline: TimelinePhase[] = RAW.map((p) => TimelineSchema.parse(p)).sort(
  (a, b) => a.order - b.order,
);

/**
 * /timeline page chrome — lifted verbatim out of app/timeline/page.tsx (Law 3:
 * no copy in components). The `labels` map also fixes the ORDER of the four
 * rows in one place, which matters because the order is an argument: built →
 * learned → mistake → changed reads as a consequence chain, and the mistake is
 * the hinge. Reordering it would change what the page says.
 */
export const timelineIntro = {
  kicker: "Timeline",
  title: "Growth over titles.",
  lede:
    "What I built, learned, got wrong, and changed — each phase includes the mistake, because that's where the learning is.",
  /** Forward link out of the narrative, to the same facts in résumé form. */
  cta: { label: "Read the résumé", href: "/resume" },
  labels: {
    built: "Built",
    learned: "Learned",
    mistake: "Mistake",
    changed: "Changed",
  },
} as const;
