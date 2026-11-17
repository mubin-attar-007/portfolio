/**
 * The field report's generic labels: section titles, column heads and
 * actions. No field facts live here (those are in the report modules), so
 * the two reports share one template and one vocabulary.
 */
export const FIELD_LABELS = {
  kicker: "Field report · private repository",
  breadcrumb: "Field work",
  cta: { primary: "Request a walkthrough", secondary: "What a walkthrough covers", href: "/contact" },
  credit: "My role",
  sketchCaption: "Simplified architecture · generic names · no customer data",
  crossingPrefix: "Crosses the boundary:",
  sections: {
    problem: { kicker: "The problem", title: "The customer problem", users: "Who uses it" },
    constraints: {
      kicker: "Constraints",
      title: "What the system is not allowed to do",
      lead: "Each constraint, what it forced in the design, and how it is checked.",
      columns: { constraint: "Constraint", forced: "What it forced", checked: "How it is checked" },
    },
    built: {
      kicker: "What I built",
      title: "The parts I own",
      others: "Built by others",
      howBuilt: "How it was built",
    },
    trace: {
      kicker: "The trace",
      title: "One request, step by step",
      lead: "Follow one run through the system. The diagram lights the part each step touches.",
      label: "Request trace",
    },
    architecture: { kicker: "Architecture", title: "The other side of the boundary" },
    boundary: {
      kicker: "Boundary ledger",
      title: "What crosses which boundary",
      columns: { data: "Data", direction: "Direction", path: "Path", rule: "Rule" },
      direction: { stays: "Stays", leaves: "Leaves", enters: "Enters" },
    },
    deployment: { kicker: "Deployment", title: "Where it runs and how it ships" },
    broke: {
      kicker: "What broke",
      title: "What broke, and what I changed",
      lead: "Failures are written as system behaviour, with the guard that keeps each one fixed.",
      fields: { broke: "Broke", cause: "Cause", change: "Change", guard: "Guard" },
      label: "Incident log",
    },
    decisions: {
      kicker: "Decisions",
      title: "Key decisions",
      fields: { instead: "Instead of", reason: "Why", tradeoff: "Trade-off" },
    },
    verification: {
      kicker: "Verification",
      title: "How it was verified",
      checks: "Checks and gates",
      notMeasured: "Not measured",
      notMeasuredLead: "No figure is published for these. None is implied.",
    },
    outcome: { kicker: "Outcome", title: "What the record shows", proves: "Proves", notShown: "Doesn't show" },
    walkthrough: {
      kicker: "Walkthrough on request",
      title: "See the work behind this page",
      lead: "The repository is private. On a call I can take you through the system itself.",
      covers: "A call covers",
      staysPrivate: "Stays private",
      book: "Book a call",
    },
  },
} as const;

/** The section ids, in page order: stable anchors for deep links. */
export const FIELD_SECTION_IDS = {
  problem: "problem",
  constraints: "constraints",
  built: "built",
  trace: "trace",
  architecture: "architecture",
  boundary: "boundary",
  deployment: "deployment",
  broke: "what-broke",
  decisions: "decisions",
  verification: "verification",
  outcome: "outcome",
  walkthrough: "walkthrough",
} as const;
