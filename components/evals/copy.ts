/**
 * /evals page chrome — labels only; every figure and method sentence comes
 * from content/evals.ts.
 */
export const evalsPage = {
  title: "Evaluations",
  pill: { label: "Every figure links to its method", cta: "How it's read", href: "#methods" },
  board: {
    caption: "Evaluation registry: each row's result, scope, method and date",
    project: "Project",
    allProjects: "All projects",
    status: "Status",
    statuses: [
      { value: "current", label: "Current" },
      { value: "retired", label: "Retired" },
      { value: "all", label: "All" },
    ],
    columns: {
      rank: "#",
      project: "Project",
      metric: "Metric",
      result: "Result",
      scope: "Benchmark / scope",
      method: "Method",
      date: "Date",
      status: "Status",
    },
    method: "Method",
    measured: "Measured",
    withdrawn: "Withdrawn",
    empty: "No rows match. A project without a row has not been run against a benchmark yet.",
    count: (shown: number, total: number) =>
      `Showing ${shown} of ${total} ${total === 1 ? "result" : "results"}`,
  },
  methods: {
    kicker: "Methods",
    title: "How each result was measured",
    lead: "The full method behind every row, with the evidence it was recorded from. Deep links from the rest of the site land here.",
    evidence: "Open the evidence",
    terms: "How to read a row",
  },
  cta: {
    title: "Ask how any figure was produced",
    body: "Every number above can be reproduced from its source. If you want the walkthrough, I will run it with you.",
    primary: { label: "Get in touch", href: "/contact" },
    secondary: { label: "See the work", href: "/work" },
  },
} as const;
