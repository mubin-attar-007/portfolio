/**
 * /about copy (spec/prototype/about.html). Facts are read from their single
 * sources — experience and education from content/resume.ts, the principles
 * from content/site.ts — so this module holds only the page's own framing.
 */
export const aboutPage = {
  meta: {
    title: "About",
    description:
      "Mubin Attar, Applied AI Engineer: 3.5+ years in software engineering, where I've worked, and the three rules I hold every project to.",
  },
  hero: {
    title: "From healthcare workflows to AI products",
    /** The lead, split so the two highlighted phrases render in white. */
    lead: [
      { text: "I'm an applied AI engineer with " },
      { text: "3.5+ years", strong: true },
      { text: " in software engineering and a production-AI focus since 2024. I work across the whole system, from data pipelines and retrieval to " },
      { text: "the interface people use", strong: true },
      { text: "." },
    ],
  },
  experience: {
    title: "Where I've worked",
    body: "From web apps for a hospital system to AI and automation for healthcare operations.",
    /** One summary line per role, keyed by the org in content/resume.ts. */
    summaries: {
      "Sevina Technologies": "Healthcare automation, and two products in use, each written up as a case study:",
      "Linescripts Software Pvt Ltd": "Web applications including a hospital management system, REST APIs and integrations.",
    } as Record<string, string>,
    /** Names the list of flagship case studies in the employer's cell. */
    products: "Case studies",
  },
  quote: {
    text: "Trust the model to be helpful. Never trust it to be safe.",
    essay: { label: "Trust is not a safety model", href: "/writing/trust-is-not-a-safety-model" },
  },
  stack: {
    label: "Tools I ship with",
    items: ["Python", "TypeScript", "C# / .NET", "FastAPI", "Next.js", "React Native", "PostgreSQL", "Docker"],
  },
  principles: {
    title: "How I approach the work",
    body: "Three rules I hold every project to, from a free-tier demo to a system on a care floor.",
  },
  cta: {
    label: "Next steps",
    primary: {
      kicker: "Work with me",
      title: "Start with the problem",
      body: "Tell me who will use the system, where it has to run and what it must never do. I'll reply with a first version and how we'd know it works.",
      action: { label: "Get in touch", href: "/contact" },
    },
    secondary: {
      kicker: "Writing",
      title: "Read how I make decisions",
      body: "Essays and notes on validators, retrieval, evaluation and the trade-offs behind each project.",
      action: { label: "Read the writing", href: "/writing" },
    },
  },
} as const;
