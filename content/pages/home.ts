import { SITE } from "@/config/site";
import { CROWNWAGER_EVIDENCE, DBWHISPER_EVIDENCE, requireCompleteEval } from "@/content/evals";

/**
 * Home page copy (`/`). Every sentence the home sections show lives here, once.
 * Figures are never typed: they are read from the eval registry
 * (content/evals.ts), and each one carries the method line and the link to
 * the registry row it came from. Field-work copy is anonymous by rule (no
 * employer, client, product or facility names) and was fact-checked against
 * the field reports' published material.
 */

const host = SITE.url.replace(/^https?:\/\//, "");

const TRADEPULSE = requireCompleteEval("TradePulse", "Look-ahead canary + parity suite");

export const FIELD_REPORTS = {
  records: "/work/field/records-triage",
  nfc: "/work/field/nfc-room-rounds",
} as const;

/** The prompt a visitor pastes into their own AI: it points at llms.txt. */
export const AGENT_PROMPT = {
  full: `Read ${SITE.url}/llms.txt and the pages it links to. Then tell me whether ${SITE.name} fits a Forward Deployed Engineer role on my team, and cite the pages you used.`,
  /** The short form the chip reveals on hover (an ellipsis cuts it on narrow screens). */
  preview: `Read ${host}/llms.txt, then tell me whether Mubin fits my team`,
  label: "Copy prompt",
  hint: "Ask your own AI whether I fit your role",
  copied: "Prompt copied. Paste it into your AI.",
  failed: "Copy failed. Your browser blocked the clipboard.",
} as const;

export const HERO = {
  title: "I ship AI and software inside the customer's rules",
  sub: "Applied AI Engineer. Two systems in use at a healthcare operation, and four public AI systems with source and methods.",
} as const;

export const SHOWCASE = {
  label: "Showcase",
  sample: "Illustrative sample · synthetic data",
  noQuery: "Illustrative case · no query is sent",
  tabs: {
    records: "Records triage",
    nfc: "NFC room rounds",
    dbwhisper: "DBWhisper",
    assistant: "Ask my assistant",
  },
} as const;

export const FACTS = {
  label: "At a glance",
  items: [
    { value: "3.5+ years", note: "in software engineering" },
    { value: "2 field systems", note: "in use today" },
    { value: "4 public systems", note: "with source and methods" },
    { value: "iOS and Android", note: "shipped through store review" },
    { value: SITE.location, note: "remote, hybrid or on-site" },
  ],
} as const;

export const FIELD = {
  kicker: "Field work",
  title: "Two systems people rely on every day",
  lead: "The code and the organisation stay private. Each report covers the problem, the constraints, where it runs, what broke and what I changed.",
  more: { label: "Request a walkthrough", href: "/contact" },
  report: "Read the report",
  cards: {
    records: {
      title: "Records triage and review",
      body: "An offline Windows app that finds the records a case needs in years of mixed files, without the documents leaving the PC. Primary engineer and release owner; I also built and operate the cloud platform where a team reviews them with cited answers.",
      chips: ["Desktop app in use", "Cloud platform in pilot"],
    },
    nfc: {
      title: "NFC room rounds",
      body: "Care staff record each round with a tap at the door; nurses watch live status and follow up on missed rounds. One of two engineers; I ran the iOS and Android releases.",
      chip: "In use on care floors",
    },
    offline: {
      title: "Documents never leave the PC",
      body: "Tests over the compiled code fail the build on any network type in document handling. Only the licence check goes online.",
    },
    stores: {
      title: "Shipped through store review",
      body: "iOS and Android releases passed both stores' review in 2026, and older builds keep working while new ones wait.",
    },
    broke: {
      title: "What broke, and what I changed",
      body: "iOS marks an app inactive while its NFC sheet is open, and the scanner restarted under itself. It now stops only in the background.",
      timeline: [
        "iPhone scans fail: duplicate session",
        "Cause: app inactive under the scan sheet",
        "Fix: stop only in background, then retry",
      ],
    },
    agents: {
      title: "I direct AI coding agents",
      body: "I set the architecture, the quality gates and the invariants, review every change and own the releases.",
      satellites: ["Architecture", "Quality gates", "Code review", "Releases"],
    },
    private: {
      title: "Walkthrough on request",
      body: "Names are withheld and the code stays private. I'll walk you through either system on a call.",
      badge: "Private repository",
    },
  },
} as const;

/** One public system's card: its copy, and the one result it leads with. */
export type PublicCard = {
  slug: "dbwhisper" | "tradepulse" | "crownwager" | "llm-studio";
  body: string;
  metric: { value: string; method: string; href: string };
};

export const PUBLIC = {
  kicker: "Public work",
  title: "Four AI systems you can inspect today",
  lead: "Source, recordings and the method behind every result.",
  more: { label: "All case studies", href: "/work" },
  caseStudy: "Case study",
  source: "Source",
  methodLink: "Method",
  illustrativePick: "Illustrative pick",
  cards: [
    {
      slug: "dbwhisper",
      body: "Ask a database a question in plain English; a validator approves the SQL before it runs.",
      metric: {
        value: `${DBWHISPER_EVIDENCE.policy.ratio.replace("/", " of ")} unsafe runs denied`,
        method: "An adversarial policy corpus: a deterministic test, not model accuracy",
        href: DBWHISPER_EVIDENCE.policy.anchor,
      },
    },
    {
      slug: "tradepulse",
      body: "Backtest trading strategies with next-bar fills, costs modelled, and an AI copilot.",
      metric: {
        value: "Look-ahead can't be written",
        method: "Strategies read closed bars only, and a canary test proves it",
        href: TRADEPULSE.anchor,
      },
    },
    {
      slug: "crownwager",
      body: "NBA predictions from an XGBoost model, graded publicly against final scores.",
      metric: {
        value: `${CROWNWAGER_EVIDENCE.cv.mean} accuracy`,
        method: `${CROWNWAGER_EVIDENCE.cv.folds}-fold stratified cross-validation, against a ${CROWNWAGER_EVIDENCE.baseRate} home-win base rate`,
        href: CROWNWAGER_EVIDENCE.anchor,
      },
    },
    {
      slug: "llm-studio",
      body: "A multi-user AI chat platform with accounts, streaming and six model providers behind one interface.",
      metric: {
        value: "Tenancy on every query",
        method: "Enforced once, in the repository layer, not in each route",
        href: "/notes/tenancy-in-the-repository-layer",
      },
    },
  ] satisfies readonly PublicCard[],
} as const;

export const AGENT = {
  title: "Evaluate me with your own AI",
  lead: "Paste one prompt into the AI you already use. It reads my llms.txt and answers from my real work, with links you can check.",
  questions: [
    [
      "What has Mubin shipped for healthcare teams?",
      "How does DBWhisper keep SQL safe?",
      "Does Mubin fit a Forward Deployed Engineer role?",
      "Where can Mubin work from?",
    ],
    [
      "What broke in the NFC rounds app?",
      "Which result was retired, and why?",
      "How does Mubin use AI coding agents?",
      "Show me the evals",
    ],
    [
      "Is Mubin open to travel?",
      "What does the records triage app do?",
      "Summarise Mubin's experience",
      "How do I get in touch?",
    ],
  ],
  columns: {
    site: {
      title: "Ask on this site",
      body: "The assistant answers from my case studies and links the page it used.",
      action: "Open the assistant",
    },
    agent: {
      title: "Ask your own agent",
      body: "One prompt points your AI at llms.txt, a plain summary of my work written for machines.",
      action: "Copy the prompt",
      copied: "Copied",
      failed: "Copy failed",
    },
    privacy: {
      title: "Private by default",
      body: "Your question is used to write one answer. This site doesn't store it.",
      action: { label: "How it works", href: "/privacy" },
    },
  },
} as const;

export const HOW = {
  kicker: "How I work",
  title: "Most of a deployment happens away from the editor",
  lead: "How I take a system from a customer's problem to something their staff rely on.",
  steps: [
    { title: "Start from the operator's day", body: "Who uses it, on what device, in which shift, and what a mistake costs.", link: { label: "The rounds app", href: FIELD_REPORTS.nfc } },
    { title: "Write the constraints down", body: "Each one names what it forces and how it is checked.", link: { label: "The records suite", href: FIELD_REPORTS.records } },
    { title: "Ship versions people install", body: "Releases go out through gates I own, and through store review.", link: { label: "Mobile releases", href: FIELD_REPORTS.nfc } },
    { title: "Measure, and retire what fails", body: "A score that failed its own audit is retired in public, with the reason.", link: { label: "Evaluations", href: "/evals" } },
    { title: "Hand over in writing", body: "Reports, decision logs and guides a team can work from.", link: { label: "Writing", href: "/writing" } },
  ],
} as const;

export const WRITING = {
  kicker: "Writing",
  title: "Decisions, written down",
  quote: "Trust the model to be helpful. Never trust it to be safe.",
  /** The essay the quote is from; its title is read from the collection. */
  quoteSlug: "trust-is-not-a-safety-model",
  from: "From the essay",
  more: { label: "All writing", href: "/writing" },
  categories: { essay: "Essay", guide: "Guide", note: "Note" },
} as const;

export const CTA = {
  title: "Need an engineer who ships inside your customer's rules?",
  lead: "Tell me who will use the system, where it has to run, and what it must never do. I'll reply with a first version and how we'd know it works.",
  primary: { label: "Get in touch", href: "/contact" },
  secondary: { label: "View résumé", href: "/resume" },
  availability:
    "Open to full-time FDE roles and freelance projects · remote, or hybrid and on-site in India · comfortable travelling to customer sites",
} as const;
