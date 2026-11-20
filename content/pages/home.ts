import { INTEGRATIONS, SITE } from "@/config/site";
import { boundaryCases } from "@/content/dbwhisper-boundary";
import { DBWHISPER_EVIDENCE, requireCompleteEval } from "@/content/evals";
import { flagshipHref } from "@/content/flagship";
import { benchDiscovery } from "@/content/flagship/bench-discovery";
import { EMPLOYER, USAGE } from "@/content/flagship/shared";
import { caseStudyPage } from "@/content/pages/work";
import { ACTION_LABELS } from "@/lib/ai/chat-contract";
import { GAP_OPENING } from "@/lib/ai/hiring-gaps";

/**
 * Home page copy (`/`). Every sentence the home sections show lives here, once.
 * Figures are never typed: evaluation figures are read from the eval registry
 * (content/evals.ts), each with its method line and the link to the registry
 * row it came from, and the flagship usage figures from the wording the owner
 * approved (content/flagship/shared.ts `USAGE`).
 */

const host = SITE.url.replace(/^https?:\/\//, "");

const TRADEPULSE = requireCompleteEval("TradePulse", "Look-ahead canary + parity suite");

/** The boundary case the validator lets through: a generated read query meets the same checks. */
const ELIGIBLE = boundaryCases.find((c) => c.outcome === "eligible");
if (!ELIGIBLE) throw new Error("content/dbwhisper-boundary.ts: no eligible case");

/** The flagship case studies (content/flagship). */
export const FLAGSHIP_PAGES = {
  benchDiscovery: flagshipHref("bench-discovery"),
  careltc: flagshipHref("careltc"),
  signflow: flagshipHref("signflow"),
} as const;

/** The prompt a visitor pastes into their own AI: it points at llms.txt. */
export const AGENT_PROMPT = {
  full: `Read ${SITE.url}/llms.txt and the pages it links to. Then tell me whether ${SITE.name} fits an Applied AI Engineer role on my team, and cite the pages you used.`,
  /** The short form the chip reveals on hover (an ellipsis cuts it on narrow screens). */
  preview: `Read ${host}/llms.txt, then tell me whether Mubin fits my team`,
  label: "Copy prompt",
  hint: "Ask your own AI whether I fit your role",
  copied: "Prompt copied. Paste it into your AI.",
  failed: "Copy failed. Your browser blocked the clipboard.",
} as const;

export const HERO = {
  title: "I ship AI and software that stays inside the rules",
  sub: `Applied AI Engineer. At ${EMPLOYER} I built Bench Discovery (${USAGE["bench-discovery"].sentence}) and lead CareLTC (${USAGE.careltc.short}).`,
} as const;

/**
 * The tabbed showcase under the hero (components/home/showcase.tsx): a tab per
 * product, and under the stage a pill per screen of the chosen product. A
 * flagship's screens are real captures, named by file, back then front; the
 * caption says what they show (it names the figure). DBWhisper's and the
 * assistant's screens are illustrated, and a visitor can try them: every case
 * is fixed in advance and labelled so, and nothing is sent anywhere.
 */
export const SHOWCASE = {
  label: "Showcase",
  sample: "Illustrative sample · synthetic data",
  noQuery: "Illustrative case · no query is sent",
  /** The assistant screens' input, pictured under the answer. */
  askInput: "Ask a question…",
  tabs: {
    benchDiscovery: "Bench Discovery",
    careltc: "CareLTC",
    signflow: "SignFlow",
    dbwhisper: "DBWhisper",
    assistant: "Ask my assistant",
  },
  views: {
    benchDiscovery: [
      {
        id: "review",
        label: "Review",
        caption: "The web platform's review queue, in front of a search across a Matter",
        captures: ["web-search", "web-review"],
      },
      {
        id: "answers",
        label: "Citations",
        caption: "An answer that cites the page it came from, in front of a Matter's documents with what was read",
        captures: ["web-documents", "web-ask-citations"],
      },
      {
        id: "desktop",
        label: "Desktop app",
        caption: "The desktop app's redaction rules in view, in front of Classify by Content",
        captures: ["desk-classify-content", "desk-redaction"],
      },
    ],
    careltc: [
      {
        id: "floor",
        label: "Live floor",
        caption: "The admin portal's live floor status, and a floor phone's home screen",
        captures: ["portal-live-status", "mobile-floor-home"],
      },
      {
        id: "missed",
        label: "Missed",
        caption: "Missed rounds and their alerts in the portal, and the rounds due now on a floor phone",
        captures: ["portal-missed-alerts", "mobile-rounds-due"],
      },
      {
        id: "reports",
        label: "Reports",
        caption: "Compliance computed on the server, and skipped rounds kept on record on the phone",
        captures: ["portal-reports", "mobile-skipped-rounds"],
      },
    ],
    signflow: [
      {
        id: "envelopes",
        label: "Envelopes",
        caption: "The sender's dashboard, and the signer's page opened from an emailed link",
        captures: ["dashboard", "signing"],
      },
      {
        id: "fields",
        label: "Fields",
        caption: "Fields placed on the page for each signer, and an envelope's recipients, each with a role",
        captures: ["field-placement", "wizard-recipients"],
      },
      {
        id: "signed",
        label: "Signed PDF",
        caption: "The signed copies beside the audit trail, and a signed PDF with its audit-trail certificate page",
        captures: ["audit-trail", "signed-document"],
      },
    ],
    dbwhisper: [
      { id: "generate", label: "Generate" },
      { id: "validate", label: "Validate" },
      { id: "answer", label: "Answer" },
    ],
    assistant: [
      { id: "ask", label: "Ask" },
      { id: "hiring", label: "Hiring questions" },
    ],
  },
  dbwhisper: {
    /** Faded context behind every DBWhisper screen (hidden on phones). */
    backdrop: [
      { title: "Schema retrieval", rows: [["Dialect", "PostgreSQL"], ["Tables", "Retrieved per question"]] },
      { title: "Execution", rows: [["Database user", "Read-only"], ["Timeout, row cap", "On"]] },
    ],
    generate: {
      title: "Ask your database",
      hint: "Pick a question to see its read-only SQL",
      label: "Questions",
      cases: [
        {
          id: "revenue",
          label: "Revenue",
          sql: "SELECT date_trunc('month', created_at) AS month,\n  SUM(amount) AS revenue\nFROM orders GROUP BY 1 ORDER BY 1;",
        },
        {
          id: "customers",
          label: "Top customers",
          sql: "SELECT c.name, COUNT(*) AS orders\nFROM customers c JOIN orders o ON o.customer_id = c.id\nGROUP BY c.name ORDER BY orders DESC LIMIT 5;",
        },
        {
          id: "unpaid",
          label: "Unpaid",
          sql: "SELECT id, total FROM orders\nWHERE status = 'unpaid'\n  AND created_at >= date_trunc('week', now());",
        },
      ],
      /** What a generated read query meets: the checks of the case study's eligible case, word for word. */
      checks: ELIGIBLE.checks,
      verdict: ELIGIBLE.title,
    },
    /** The case study's boundary cases (content/dbwhisper-boundary.ts), one passed and two refused. */
    validate: {
      title: "The validator decides",
      hint: "Pick a case: checked before anything runs",
      label: "Cases",
      cases: boundaryCases,
    },
    answer: {
      title: "The answer",
      hint: "“Revenue by month, January to April 2024”",
      columns: ["Month", "Revenue"],
      rows: [
        ["Jan 2024", "$12,480"],
        ["Feb 2024", "$13,120"],
        ["Mar 2024", "$15,960"],
        ["Apr 2024", "$14,210"],
      ],
      note: "4 rows · read-only connection",
    },
  },
  /**
   * The assistant's first screen: questions it is built to answer, and the
   * shape of its answers. A citation is named as the assistant names it: a case
   * study by its product, a page by its title (lib/ai/corpus.ts).
   */
  ask: {
    title: "Ask about my work",
    hint: "Answers from this site, citing their pages",
    label: "Questions",
    questions: [
      {
        id: "built",
        label: "What he built",
        question: `What has Mubin built at ${EMPLOYER}?`,
        answer:
          "Three products in use: Bench Discovery, document review with cited answers on the web and verified redaction on the PC; CareLTC, NFC room rounds for long-term care; and SignFlow, e-signatures with PKI-signed PDFs.",
        cites: ["Bench Discovery", "CareLTC", "SignFlow"],
      },
      {
        id: "roles",
        label: "Roles",
        question: "Which roles is he open to?",
        answer:
          "Applied AI Engineer roles, full-time, and freelance AI projects: remote, or hybrid and on-site in India, with travel to customer sites.",
        cites: ["Hiring", "Contact"],
      },
      {
        id: "safe-sql",
        label: "Safe SQL",
        question: "How does DBWhisper keep generated SQL safe?",
        answer:
          "Every query passes a SELECT-only, single-statement validator against the enrolled tables, then runs on a least-privilege read-only connection.",
        cites: ["DBWhisper"],
      },
    ],
  },
  /**
   * The assistant's second screen: hiring terms the site does not publish. Each
   * reply is the assistant's own, word for word (lib/ai/hiring-gaps.ts), for the
   * gap it reads in the question (test/home-showcase.test.mts holds both).
   */
  hiring: {
    title: "Hiring questions",
    hint: "What the site doesn't say, it never guesses",
    label: "Questions",
    questions: [
      { id: "start", label: "Start date", question: "When could he start?", gap: "start-date", answer: GAP_OPENING["start-date"] },
      { id: "salary", label: "Salary", question: "What salary does he expect?", gap: "compensation", answer: GAP_OPENING.compensation },
      { id: "visa", label: "Visa", question: "Would he need visa sponsorship?", gap: "visa", answer: GAP_OPENING.visa },
    ],
    /** The actions the assistant offers under a hiring answer (lib/ai/actions.ts). */
    actions: [ACTION_LABELS.email, ...(INTEGRATIONS.calUrl ? [ACTION_LABELS.book] : []), ACTION_LABELS.contact],
  },
} as const;

/** Bench Discovery's web test count, read from its record (the hero's verification figure). */
const BD_WEB_TESTS = benchDiscovery.figures.find((f) => f.source === "verification" && f.label.startsWith("web tests"));
if (!BD_WEB_TESTS) throw new Error("content/flagship/bench-discovery.ts: no web test figure");

/**
 * The facts strip under the hero, in place of a logo wall: two sets of five
 * that it swaps slot by slot (slot i shows sets[0][i], then sets[1][i]), each
 * pair on one subject. Figures are read from their records.
 */
export const FACTS = {
  label: "At a glance",
  pause: "Pause the facts",
  play: "Play the facts",
  sets: [
    [
      { value: "3.5+ years", note: "in software engineering" },
      { value: `${USAGE.careltc.figure} users`, note: `CareLTC, ${USAGE.careltc.label.replace(/^users /, "")}` },
      { value: `${USAGE["bench-discovery"].figure} users`, note: `Bench Discovery, ${USAGE["bench-discovery"].label.replace(/^users /, "")}` },
      { value: "iOS and Android", note: "shipped through store review" },
      { value: "Since 2024", note: "building AI that runs in production" },
    ],
    [
      { value: "3 products", note: `in use, built at ${EMPLOYER}` },
      { value: `${USAGE.signflow.figure} users`, note: "SignFlow, in-house e-signatures" },
      { value: `${BD_WEB_TESTS.value} tests`, note: "Bench Discovery's web platform, last full run" },
      { value: "PAdES B-T", note: "SignFlow's sealed PDFs, checked with pyHanko on test runs" },
      { value: DBWHISPER_EVIDENCE.policy.ratio.replace("/", " of "), note: "unsafe SQL runs denied by DBWhisper's policy" },
    ],
  ],
} as const;

export const FLAGSHIP = {
  kicker: "Flagship work",
  title: `Three products in use, built at ${EMPLOYER}`,
  lead: "The real apps, shown on dummy data. Each case study covers the problem, the architecture on AWS, the code and the decisions behind it.",
  more: { label: "Request a walkthrough", href: "/contact#walkthrough" },
  caseStudy: "Read the case study",
  inUse: "In use",
  cards: {
    benchDiscovery: {
      title: "Bench Discovery",
      body: "Team review with answers that cite the page on the web, and document triage and verified redaction on the PC. I designed, built and maintain both.",
      usage: USAGE["bench-discovery"].sentence,
      badge: "✓ Answer cites page 2",
    },
    careltc: {
      title: "CareLTC",
      body: "Care staff record each round with a tap at the door on iOS or Android; nurses follow every floor live. I lead it and did the main engineering work.",
      usage: USAGE.careltc.sentence,
      badge: "✓ Round recorded · tap at the door",
    },
    tenancy: {
      title: "Tenancy in the database",
      body: "Every query carries the tenant from the verified session, and row-level security fails closed: no context, no rows.",
      /** The art: the session sets its tenant, and only its rows come back. */
      statement: "SET LOCAL app.organization_id = 'A'",
      rows: [
        { label: "round · room 101", tenant: "A" },
        { label: "round · room 205", tenant: "B" },
        { label: "round · room 118", tenant: "A" },
      ],
      tenantLabel: "tenant",
    },
    stores: {
      title: "Shipped through store review",
      body: "CareLTC's iOS and Android releases passed both stores' review in 2026, and older builds keep working while new ones wait.",
      /** The art: each review, waiting, then passed. */
      reviews: ["App Store review", "Google Play review"],
      waiting: "in review",
      passed: "passed",
    },
    broke: {
      title: "What broke, and what changed",
      body: "iOS marks an app inactive while its NFC sheet is open, and the scanner restarted under itself. It now stops only in the background.",
      timeline: [
        "iPhone scans fail: duplicate session",
        "Cause: app inactive under the scan sheet",
        "Change: stop only in background, then retry",
      ],
    },
    signflow: {
      title: "SignFlow",
      body: "Documents go out through single-use links in signing order and come back as one PDF, sealed with a PAdES signature and timestamped. I led its design and build.",
      usage: USAGE.signflow.sentence,
      badge: "✓ Signature valid · timestamp valid",
    },
    singleUse: {
      title: "A signing link works once",
      body: "Each signer's link carries a single-use token with an expiry. Open it a second time and it is refused.",
      /** The art: the same link opened twice. */
      attempts: [
        { label: "first open", result: "signs", outcome: "ok" },
        { label: "second open", result: "401 · refused", outcome: "refused" },
      ],
    },
    agents: {
      title: "I direct AI coding agents",
      body: "I set the architecture, the quality gates and the invariants, review every change and own the releases.",
      satellites: ["Architecture", "Quality gates", "Code review", "Releases"],
    },
  },
} as const;

/**
 * One public system's card: its copy, the one result it leads with, and —
 * where the case study has something to use in the page — a link straight to it.
 */
export type PublicCard = {
  slug: "dbwhisper" | "tradepulse";
  body: string;
  metric: { value: string; method: string; href: string };
  tryIt?: { label: string; href: string };
};

export const PUBLIC = {
  kicker: "Public work",
  title: "Public systems you can inspect",
  lead: "Source, recordings and the method behind every result. TradePulse is archived: its code and write-up stay public, and it is no longer maintained.",
  more: { label: "All case studies", href: "/work" },
  caseStudy: "Case study",
  source: "Source",
  methodLink: "Method",
  cards: [
    {
      slug: "dbwhisper",
      body: "Ask a database a question in plain English; a validator approves the SQL before it runs.",
      metric: {
        value: `${DBWHISPER_EVIDENCE.policy.ratio.replace("/", " of ")} unsafe runs denied`,
        method: "An adversarial policy corpus: a deterministic test, not model accuracy",
        href: DBWHISPER_EVIDENCE.policy.anchor,
      },
      tryIt: {
        label: caseStudyPage.boundary.cta,
        href: `/work/dbwhisper#${caseStudyPage.boundary.id}`,
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
  ] satisfies readonly PublicCard[],
} as const;

export const AGENT = {
  title: "Evaluate me with your own AI",
  lead: "Paste one prompt into the AI you already use. It reads my llms.txt and answers from my real work, with links you can check.",
  /** The page with more prompts to try (/evaluate). */
  more: { label: "More prompts to try", href: "/evaluate" },
  /** The drifting questions' pause and play button (WCAG 2.2.2). */
  pause: "Pause the questions",
  play: "Play the questions",
  questions: [
    [
      "What has Mubin shipped for healthcare teams?",
      "How does DBWhisper keep SQL safe?",
      "Does Mubin fit an Applied AI Engineer role?",
      "Where can Mubin work from?",
    ],
    [
      "What broke in CareLTC?",
      "Which result was retired, and why?",
      "How does Mubin use AI coding agents?",
      "Show me the evals",
    ],
    [
      "Is Mubin open to travel?",
      "What does Bench Discovery do?",
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
      action: { label: "How it works", href: "/privacy#assistant" },
    },
  },
} as const;

export const HOW = {
  kicker: "How I work",
  title: "Most of a deployment happens away from the editor",
  lead: "How I take a product from its users' problem to something they rely on.",
  steps: [
    { title: "Start from the operator's day", body: "Who uses it, on what device, in which shift, and what a mistake costs.", link: { label: "CareLTC", href: FLAGSHIP_PAGES.careltc } },
    { title: "Write the constraints down", body: "Each one names what it forces and how it is checked.", link: { label: "Bench Discovery", href: `${FLAGSHIP_PAGES.benchDiscovery}#constraints` } },
    { title: "Ship versions people install", body: "Releases go out through gates I own, and through store review.", link: { label: "CareLTC releases", href: `${FLAGSHIP_PAGES.careltc}#deployment` } },
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
  /** The wall's pause and play button (WCAG 2.2.2). */
  pause: "Pause the cards",
  play: "Play the cards",
} as const;

export const CTA = {
  title: "Need an engineer who ships AI that stays inside the rules?",
  lead: "Tell me who will use the system, where it has to run, and what it must never do. I'll reply with a first version and how we'd know it works.",
  primary: { label: "Get in touch", href: "/contact" },
  secondary: { label: "View résumé", href: "/resume" },
  availability:
    "Open to Applied AI Engineer roles and freelance AI projects · remote, or hybrid and on-site in India · comfortable travelling to customer sites",
} as const;
