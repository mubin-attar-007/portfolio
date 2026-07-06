/** Primary navigation. Plain labels — clever labels tax comprehension (ADR-007). */
export const NAV = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "About", href: "/about" },
] as const;

export type NavItem = (typeof NAV)[number];
