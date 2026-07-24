export const flagshipHome = {
  hero: {
    kicker: "Mubin Attar · AI software engineer · Ahmedabad, India",
    title: "I build production AI systems — and prove how they work.",
    body:
      "Four live products, opened up as engineering evidence: architecture, deterministic boundaries, task-level evaluations, and the decisions behind every tradeoff. Every metric on this page links to how it was measured.",
    primary: "Read the flagship case study",
    secondary: "How I make decisions",
  },
  workbench: {
    eyebrow: "DBWhisper · live system",
    title: "Ask in plain English. Inspect every boundary.",
    tabs: [
      { id: "query", label: "Query" },
      { id: "trace", label: "Agent trace" },
      { id: "eval", label: "Eval" },
    ],
    question: "Which active accounts grew more than 20% this quarter?",
    sql:
      "SELECT account, arr, growth FROM account_growth WHERE status = 'active' AND growth > 0.20 ORDER BY growth DESC;",
    stages: [
      { label: "Retrieve schema", detail: "3 relevant tables" },
      { label: "Generate candidate", detail: "Postgres dialect" },
      { label: "Validate read-only", detail: "Allowlist passed" },
      { label: "Execute", detail: "Synthetic demo data" },
    ],
    trace: [
      {
        label: "Intent",
        detail: "Revenue growth over enrolled account data",
      },
      {
        label: "Context",
        detail: "account_growth + accounts schemas retrieved",
      },
      {
        label: "Boundary",
        detail: "SELECT-only AST and enrolled tables verified",
      },
      {
        label: "Result",
        detail: "Rows returned with the generated query attached",
      },
    ],
  },
  proof: {
    lead: "AI/ML Engineer at Sevina Technologies",
    items: [
      {
        value: "4",
        label: "products live",
        method: "production inventory",
        href: "/work",
      },
      {
        value: "3+ yrs",
        label: "shipping software",
        method: "résumé timeline",
        href: "/resume#experience",
      },
      {
        value: "82%",
        label: "exact execution match",
        method: "22-query eval",
        href: "/evals#dbwhisper-custom-golden-query-set",
      },
      {
        value: "100%",
        label: "fail-closed refusals",
        method: "4 unsafe prompts",
        href: "/evals#dbwhisper-custom-golden-query-set",
      },
    ],
  },
  capabilities: {
    kicker: "Production boundaries",
    title: "The model is one component. The system earns the trust.",
    body:
      "I design the deterministic layers around probabilistic models: retrieval, validation, routing, evals, tenancy, and operational feedback.",
    items: [
      {
        id: "guardrail",
        control: "policy gate",
        outcome: "reject",
        label: "Deterministic safety",
        title: "Fail closed before execution",
        body:
          "AST checks, table allowlists, and read-only connections reject unsafe work before a model output can touch data.",
      },
      {
        id: "retrieval",
        control: "context index",
        outcome: "ground",
        label: "Grounding",
        title: "Retrieve the smallest useful context",
        body:
          "Schema and domain evidence are ranked before generation instead of stuffing an entire system into a prompt.",
      },
      {
        id: "evaluation",
        control: "golden set",
        outcome: "score",
        label: "Evaluation",
        title: "Measure behavior end to end",
        body:
          "Execution accuracy and refusal behavior are tested against real stores, not judged by exact text match.",
      },
      {
        id: "routing",
        control: "provider router",
        outcome: "recover",
        label: "Resilience",
        title: "Route providers behind one interface",
        body:
          "Provider limits and failures become explicit routing states rather than unexplained product outages.",
      },
      {
        id: "tenancy",
        control: "repository scope",
        outcome: "isolate",
        label: "Data isolation",
        title: "Enforce ownership below the route",
        body:
          "Repository-level constraints keep user data isolated even when a handler or model makes the wrong assumption.",
      },
      {
        id: "delivery",
        control: "CI + telemetry",
        outcome: "observe",
        label: "Delivery",
        title: "Make every risky change observable",
        body:
          "Typed contracts, deterministic tests, CI gates, and public change notes turn reliability into a repeatable practice.",
      },
    ],
  },
  protocol: {
    kicker: "Evidence protocol",
    title: "Every AI feature should leave a receipt.",
    body:
      "A claim is only useful when the boundary, measurement, and published method travel with it. This is the protocol I use to keep AI work inspectable.",
    system: "DBWhisper",
    receipt: "GOLDEN-QUERY / 2026-07-08",
    steps: [
      {
        id: "claim",
        n: "01",
        label: "Claim",
        title: "Natural language should return the right rows.",
        body:
          "The product claim is written as observable behavior before prompts or providers are optimized.",
        fields: [
          { label: "Input", value: "natural-language question" },
          { label: "Expected", value: "correct result set" },
          { label: "Failure", value: "refuse or explain" },
        ],
      },
      {
        id: "boundary",
        n: "02",
        label: "Boundary",
        title: "Unsafe work must stop before execution.",
        body:
          "The generated statement crosses deterministic checks that do not depend on the model agreeing with them.",
        fields: [
          { label: "Operation", value: "SELECT only" },
          { label: "Scope", value: "enrolled schema" },
          { label: "Policy", value: "fail closed" },
        ],
      },
      {
        id: "measure",
        n: "03",
        label: "Measure",
        title: "The deployed path is scored end to end.",
        body:
          "Retrieval, generation, validation, and execution are measured together against a read-only Postgres store.",
        fields: [
          { label: "Safe prompts", value: "22 golden queries" },
          { label: "Exact match", value: "82% (18/22)" },
          { label: "Unsafe refusals", value: "100% (4/4)" },
        ],
      },
      {
        id: "publish",
        n: "04",
        label: "Publish",
        title: "The result ships with its method attached.",
        body:
          "The case study, evaluation registry, and change history make the claim inspectable instead of asking for trust.",
        fields: [
          { label: "Artifact", value: "case study" },
          { label: "Registry", value: "evaluation row" },
          { label: "History", value: "public changelog" },
        ],
      },
    ],
    links: [
      { href: "/work/dbwhisper", label: "Inspect the case study" },
      { href: "/evals", label: "Open the eval registry" },
    ],
  },
  products: {
    kicker: "Selected systems",
    title: "One engineering standard, applied to different kinds of uncertainty.",
    body:
      "Each product is live. Each claim below connects to its case study and measurement method.",
    caseStudy: "Read case study",
    live: "Open live product",
  },
  operatingSystem: {
    kicker: "How I work",
    title: "Build the evidence loop into the product.",
    body:
      "A reliable AI feature is not finished when it produces an answer. It is finished when the answer can be constrained, evaluated, and improved without guesswork.",
    steps: [
      {
        n: "01",
        title: "Constrain",
        body: "Define permissions, valid outputs, and failure behavior before optimizing prompts.",
      },
      {
        n: "02",
        title: "Measure",
        body: "Test the deployed path with task-level metrics and keep excluded cases visible.",
      },
      {
        n: "03",
        title: "Publish",
        body: "Connect claims to methods, record decisions, and expose the tradeoffs behind the result.",
      },
    ],
    ledgerTitle: "Current evaluation ledger",
    ledgerCta: "Open the complete eval registry",
  },
  writing: {
    kicker: "Engineering notes",
    title: "The decisions are part of the work.",
    body:
      "Short notes on evals, safety boundaries, retrieval, tenancy, and the choices that survive contact with production.",
    cta: "Read all writing",
  },
  close: {
    kicker: "Available for AI engineering roles",
    principle: "The model may improvise. The boundary should not.",
    title: "Need someone who can ship the model and the system around it?",
    body:
      "I am looking for teams where AI quality is treated as an engineering problem: observable, testable, and grounded in real product behavior.",
    primary: "Start a conversation",
    secondary: "View resume",
  },
} as const;
