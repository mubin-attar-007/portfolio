/**
 * /work and /work/[slug] copy. Facts stay in their single sources — the
 * flagship registry (content/flagship), the project registry
 * (content/projects.ts), the eval registry (content/evals.ts), each case
 * study's frontmatter (content/projects/*.mdx) and its diagram data
 * (components/diagrams/data/*.ts). This module holds only the pages' framing.
 */
export const workIndexPage = {
  meta: {
    title: "Work",
    description:
      "Bench Discovery, CareLTC and SignFlow, three products in use built at Sevina Technologies, and four public AI systems with source, recordings and methods.",
  },
  hero: {
    kicker: "Work",
    title: "Systems I've shipped",
    lede: "Three products in use, built at Sevina Technologies, and four public AI systems you can inspect today: source, recordings and the method behind every result.",
  },
  flagship: {
    kicker: "Flagship work",
    title: "Three products in use, built at Sevina Technologies",
    lead: "The real apps, shown on dummy data. Each case study covers the problem, the architecture on AWS, the code and the decisions behind it. The repositories stay private.",
    cta: { label: "Request a walkthrough", href: "/contact#walkthrough" },
    readCaseStudy: "Read the case study",
    employer: "Built at Sevina Technologies",
  },
  public: {
    kicker: "Public work",
    title: "Four AI systems you can inspect today",
    lead: "Each one has its source, a recording or capture, and the method behind every figure it publishes.",
    more: { label: "How each was measured", href: "/evals" },
    caseStudy: "Case study",
    // Never "live": the demos run on free tiers that sleep (design-system §7.2).
    demo: "Demo",
    source: "Source",
    method: "Method",
  },
  stack: {
    kicker: "Stack",
    title: "What these systems run on",
  },
  cta: {
    title: "Want the walkthrough?",
    body: "I'll take you through any of these systems on a call, including Bench Discovery, CareLTC and SignFlow, whose code stays private.",
    primary: { label: "Get in touch", href: "/contact" },
    secondary: { label: "Read the résumé", href: "/resume" },
  },
} as const;

/**
 * "Ask AI about <product>" on every case study, flagship and public: the hero's
 * button, which opens the site's assistant on the page's own starter questions,
 * and the title of those questions as chips in the closing band
 * (`CASE_STUDY_STARTERS`, lib/ai/starters.ts).
 */
export const askAiLabel = (product: string): string => `Ask AI about ${product}`;

export const caseStudyPage = {
  watchDemo: "Watch the recording",
  readWalkthrough: "Walk through a request",
  // Never "live": the demos run on free tiers that sleep (design-system §7.2).
  tryDemo: "Try the demo",
  viewSource: "View source",
  recording: {
    play: "Play the recording",
  },
  howItWorks: {
    kicker: "How it works",
    title: "Follow one request through the system",
    lead: "Each step is a part of the real architecture: what it does, and what it hands on.",
    stepsLabel: "System walkthrough",
    from: "Receives from",
    to: "Hands to",
  },
  /**
   * DBWhisper's "Try the boundary" section, the boundary inspector's home.
   * `id` is its anchor and `cta` the label of every link into it (the case
   * study's hero and the home DBWhisper card).
   */
  boundary: {
    id: "try-the-boundary",
    cta: "Try the validator",
    kicker: "Try the boundary",
    title: "The model proposes. The validator decides.",
    lead: "Pick a case and watch which check stops it. These are curated examples of the documented policy; nothing is sent to a database.",
  },
  decisions: {
    kicker: "Key decisions",
    title: "Each choice, with what it cost",
    rejected: "Instead of",
    tradeoff: "Trade-off",
  },
  results: {
    kicker: "Results, with methods",
    title: "What is measured, and how",
    lead: "Every figure links to the method that produced it. A result that stopped holding stays here, marked Retired, with the reason.",
    evalsLink: { label: "All results on /evals", href: "/evals" },
    columns: { metric: "Result", sample: "Sample", status: "Status", date: "Recorded" },
    method: "Method",
    audit: "Read the audit",
    claimsTitle: "Claims that rest on design, and how each is checked",
    retiredReason: "Why it was retired",
  },
  shipped: {
    kicker: "Shipping log",
    title: "How it got here",
  },
  writeup: {
    kicker: "The write-up",
    title: "The full case study",
  },
  stack: {
    kicker: "Stack",
    title: "Built with",
  },
  neighbours: {
    previous: "Previous",
    next: "Next",
  },
  cta: {
    title: "Want the walkthrough?",
    body: "I'll take you through the architecture, the decisions and what broke, on a call.",
    primary: { label: "Get in touch", href: "/contact" },
    secondary: { label: "All work", href: "/work" },
  },
} as const;

/**
 * The parts of each architecture diagram that "How it works" steps through,
 * in the order a request meets them (node ids from components/diagrams/data).
 * DBWhisper is absent: its request walkthrough is the stepped explainer.
 */
export const CASE_STUDY_STEPS: Record<string, readonly string[]> = {
  tradepulse: ["builder", "api", "spec", "engine", "risk", "result", "worker"],
  crownwager: ["web", "django", "ml", "registry", "xgb", "ev", "record"],
  "llm-studio": ["spa", "auth", "quota", "chat", "router", "repo", "db"],
};
