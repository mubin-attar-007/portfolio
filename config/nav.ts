/** Primary navigation. Plain labels — clever labels tax comprehension (ADR-007). */
export const NAV = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "Notes", href: "/notes" },
  { label: "About", href: "/about" },
  { label: "Hire me", href: "/hire" },
] as const;

export type NavItem = (typeof NAV)[number];

/**
 * Footer navigation — the complete site map, grouped so nothing is orphaned.
 * "Explore" is the work/writing surface; "Me" is the person + how to reach them.
 * The header carries only the five primary items; the footer carries everything.
 */
export const FOOTER_NAV = [
  {
    heading: "Explore",
    links: [
      { label: "Work", href: "/work" },
      { label: "Writing", href: "/writing" },
      { label: "Notes", href: "/notes" },
      { label: "Now", href: "/now" },
      { label: "Evals", href: "/evals" },
    ],
  },
  {
    heading: "Me",
    links: [
      { label: "About", href: "/about" },
      { label: "Résumé", href: "/resume" },
      { label: "Timeline", href: "/timeline" },
      { label: "Uses", href: "/uses" },
      { label: "Talks", href: "/talks" },
      { label: "Hire me", href: "/hire" },
    ],
  },
] as const;
