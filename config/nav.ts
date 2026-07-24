/** Primary navigation. Plain labels — clever labels tax comprehension (ADR-007). */
export const NAV = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "Notes", href: "/notes" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/hire" },
] as const;
// Evals, Trust, and Changelog remain discoverable without competing with the
// primary hiring path. They are supporting proof surfaces, not wayfinding.

export type NavItem = (typeof NAV)[number];

/**
 * Footer navigation — a deliberate shortlist, not a second sitemap.
 *
 * Skills and Uses are supporting reference routes; Timeline is already linked
 * contextually from About. Keeping those pages out of the global footer removes
 * three competing versions of the same profile story without deleting content.
 * Talks stays unpromoted until it has a real entry.
 */
export const FOOTER_NAV = [
  {
    heading: "Explore",
    links: [
      { label: "Work", href: "/work" },
      { label: "Evals", href: "/evals" },
      { label: "Writing", href: "/writing" },
      { label: "Notes", href: "/notes" },
    ],
  },
  {
    heading: "Profile",
    links: [
      { label: "About", href: "/about" },
      { label: "Résumé", href: "/resume" },
      { label: "Now", href: "/now" },
      { label: "Contact", href: "/hire" },
    ],
  },
] as const;
