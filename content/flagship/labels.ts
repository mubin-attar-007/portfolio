/**
 * The flagship template's generic labels: section titles, column heads and
 * actions. No product facts live here (those are in the product modules), so
 * the three case studies share one template and one vocabulary.
 */
export const FLAGSHIP_LABELS = {
  kicker: "Flagship case study",
  pills: { employer: "Built at Sevina Technologies" },
  cta: { walkthrough: "Request a walkthrough", watch: "Watch the recording", href: "/contact#walkthrough" },
  /** The hero's two labelled lines: the owner's credit, then how he builds with AI agents. */
  credit: { role: "My role", agents: "How I build" },
  figures: {
    label: "At a glance",
    approved: "Usage as approved for publication by Sevina Technologies.",
    method: "How the tests were run",
  },
  sketchCaption: "Simplified architecture · generic names · no customer data",
  crossingPrefix: "Crosses the boundary:",
  play: "Play the recording",
  sections: {
    tour: {
      kicker: "Product tour",
      title: "The real app, with dummy data",
      lead: "Every screen below is the product running on invented records. Pick a screen to see what it shows and why it matters.",
      shots: "Screens",
    },
    problem: { kicker: "The problem", title: "Who it is for, and what it has to do", users: "Who uses it" },
    built: { kicker: "What I built", title: "The parts I own" },
    recordings: {
      kicker: "Recordings",
      title: "Watch it run",
      lead: "Screen recordings of the real app on dummy data. Nothing downloads until you press play.",
      scenes: "What the recording shows",
      length: "Length",
    },
    how: {
      kicker: "How it works",
      title: "One run, step by step",
      lead: "Each step is a part of the real architecture. The sketch lights the part the step touches.",
      label: "How it works",
    },
    highlights: {
      kicker: "Engineering highlights",
      title: "The engineering behind it",
      lead: "The decisions that make the product safe to rely on, each one checked by a test or a gate.",
    },
    architecture: {
      kicker: "Architecture",
      title: "What runs where",
      boundary: "What crosses which boundary",
      columns: { data: "Data", direction: "Direction", path: "Path", rule: "Rule" },
      direction: { stays: "Stays", leaves: "Leaves", enters: "Enters" },
      stack: "Built with",
      aws: "Hosted on AWS",
    },
    code: {
      kicker: "Code",
      title: "Excerpts from the production code",
      lead: "Curated and sanitised: names and comments shortened, nothing private left in. Each comes with the story behind it.",
      excerpts: "Excerpts",
    },
    constraints: {
      kicker: "Constraints",
      title: "What the system is not allowed to do",
      lead: "Each constraint, what it forced in the design, and how it is checked.",
      columns: { constraint: "Constraint", forced: "What it forced", checked: "How it is checked" },
    },
    broke: {
      kicker: "What broke",
      title: "What broke, and what changed",
      lead: "Failures written as system behaviour, with the guard that keeps each one fixed.",
      fields: { broke: "Broke", cause: "Cause", change: "Change", guard: "Guard" },
      label: "Incident log",
    },
    decisions: {
      kicker: "Decisions",
      title: "Key decisions, and what they cost",
      fields: { instead: "Instead of", reason: "Why", tradeoff: "Trade-off" },
    },
    verification: {
      kicker: "Verification",
      title: "How it is checked",
      suites: "Test suites",
      checks: "Checks and gates",
      notMeasured: "Not measured",
      notMeasuredLead: "No figure is published for these. None is implied.",
    },
    deployment: { kicker: "Deployment", title: "Where it runs and how it ships" },
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
  neighbours: { previous: "Previous", next: "Next", label: "More work" },
  /**
   * Phones hold back the rest of a long list behind "Show N more …" (ShowMore,
   * components/ui/show-more.tsx); wider screens show everything.
   */
  more: {
    highlights: ["highlight", "highlights"],
    incidents: ["incident", "incidents"],
    decisions: ["decision", "decisions"],
    constraints: ["constraint", "constraints"],
  },
} as const;

type Noun = readonly [one: string, many: string];

/** "Show 4 more incidents" (or "Show 1 more incident"): the closed label of a phone disclosure. */
export const showMoreLabel = (count: number, [one, many]: Noun): string =>
  `Show ${count} more ${count === 1 ? one : many}`;

/** "Show fewer incidents": the same control's label once it is open. */
export const showFewerLabel = ([, many]: Noun): string => `Show fewer ${many}`;

/** The section ids, in page order: stable anchors for deep links. */
export const FLAGSHIP_SECTION_IDS = {
  tour: "tour",
  problem: "problem",
  recordings: "recordings",
  how: "how-it-works",
  highlights: "highlights",
  architecture: "architecture",
  code: "code",
  constraints: "constraints",
  broke: "what-broke",
  decisions: "decisions",
  verification: "verification",
  deployment: "deployment",
  outcome: "outcome",
  walkthrough: "walkthrough",
} as const;
