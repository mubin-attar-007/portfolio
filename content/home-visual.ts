/**
 * Homepage copy and figure data.
 *
 * Structured content lives in a typed module rather than parsed markdown: it is
 * shaped data, not prose, so TypeScript checks it at build with no parser in
 * between. Long-form prose stays in MDX under content/{projects,writing,notes}.
 *
 * THE CONTENT LAW APPLIES HERE. Every number below is either (a) single-sourced
 * from content/evals.ts or content/projects.ts, or (b) labelled as illustrative
 * sample data in the UI that renders it. Nothing is invented to make a section
 * read stronger, and no metric appears in two sections competing with itself.
 */

export const flagshipHome = {
  /* ---- 1. hero --------------------------------------------------------- */
  hero: {
    titleLead: "AI systems,",
    titleAccent: "built for the real world.",
    lede: "I build the software around the model: schema-aware agents, dependable APIs, and interfaces people can use. Here are the decisions, trade-offs, and tests behind the work.",
    context: "Software since 2022 · AI focus since 2024",
    primary: { label: "Explore my work", href: "#selected-work" },
    secondary: { label: "View résumé", href: "/resume" },
  },

  /* ---- 8b. the engineer --------------------------------------------------- */
  engineer: {
    eyebrow: "The engineer",
    title: "The engineer behind the work.",
    timelineLabel: "Professional experience",
    ctas: {
      about: { label: "More about me", href: "/about" },
      resume: { label: "Résumé", href: "/resume" },
    },
  },

  /* ---- 6. selected work ------------------------------------------------- */
  work: {
    eyebrow: "Selected work",
    title: "More systems, different problems.",
    bodyParts: [
      { t: "Predictive ML, financial research, and multi-user AI. Explore the implementation and the decisions behind each product." },
    ],
    caseStudy: "View case study",
    live: "Live",
    source: "Source",
    cta: { label: "See all four projects", href: "/work" },
  },

  /* ---- 8. writing + current focus --------------------------------------- */
  notebook: {
    eyebrow: "From the notebook",
    title: "Thinking in public.",
  },
  writing: {
    label: "Selected writing",
    cta: { label: "All writing", href: "/writing" },
  },
  exploring: {
    label: "Currently exploring",
    cta: { label: "What I'm doing now", href: "/now" },
  },

  /* ---- 9. close --------------------------------------------------------- */
  close: {
    title: "Building an AI product that needs to work in production?",
    body:
      "Let's discuss the system, the failure modes, and how success will be measured.",
    primary: { label: "Start a conversation", href: "/hire" },
    secondary: { label: "View résumé", href: "/resume" },
  },
} as const;
