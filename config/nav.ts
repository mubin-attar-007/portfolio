/**
 * Primary navigation — four destinations, plain labels. Clever labels tax
 * comprehension (ADR-007), and a fifth link would put the header in competition
 * with its own call to action.
 *
 * Contact is deliberately ABSENT here: it is the header's primary button
 * (`PRIMARY_CTA`), not a peer of Work and Writing. One dominant action per
 * viewport is the rule the whole redesign is built on, and a nav link plus a
 * button pointing at the same route is the most common way sites break it.
 */
export const NAV = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Writing", href: "/writing" },
  { label: "Résumé", href: "/resume" },
] as const;

export type NavItem = (typeof NAV)[number];

/**
 * The header's one action. Lives here rather than in the component so the label
 * and the destination are edited in the same place as the links beside it.
 */
export const PRIMARY_CTA = { label: "Let's talk", href: "/hire" } as const;

/**
 * Footer navigation — a deliberate shortlist, not a second sitemap (asserted at
 * ≤8 links by test/navigation.test.mts).
 *
 * Skills and Uses stay out of BOTH maps: they are reference routes reached from
 * the pages that need them, and promoting them globally creates three competing
 * versions of the same profile story.
 */
export const FOOTER_NAV = [
  {
    heading: "Site",
    links: [
      { label: "Work", href: "/work" },
      { label: "About", href: "/about" },
      { label: "Writing", href: "/writing" },
      { label: "Résumé", href: "/resume" },
      { label: "Contact", href: "/hire" },
    ],
  },
  {
    heading: "Evidence",
    links: [
      { label: "Evals", href: "/evals" },
      { label: "Notes", href: "/notes" },
      { label: "Now", href: "/now" },
    ],
  },
] as const;
