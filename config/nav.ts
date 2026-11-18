import { flagshipHref, flagships, type FlagshipSlug } from "@/content/flagship";
import { projects } from "@/content/projects";
import { SITE } from "@/config/site";

/**
 * Navigation — every link map on the site, in one place: the header with its
 * Work and About menus, the mobile menu, the footer, and the work sub-nav.
 *
 * Server-side only. It reads the flagship and project registries
 * (content/flagship, content/projects.ts), so a client component must receive
 * these items as props, never import this file — that would ship the content
 * and its schemas to the browser.
 *
 * Icons are names, resolved by `NavIcon` (components/layout/nav-icon.tsx), so
 * this file stays data.
 */

export type NavIconName =
  | "folder-search"
  | "signature"
  | "nfc"
  | "database"
  | "chart"
  | "trophy"
  | "messages"
  | "users"
  | "file"
  | "clock"
  | "laptop"
  | "shield"
  | "bars"
  | "pen"
  | "chat"
  | "briefcase"
  | "sparkles";

/**
 * One destination. The element it renders as (a route, a file, another site) is
 * read from `href` by `linkKind` (components/ui/smart-link.tsx).
 */
export type NavLink = {
  label: string;
  href: string;
  icon?: NavIconName;
  /** The one-line description of a rich menu row. */
  description?: string;
};

/**
 * The menu line for each public system, keyed by its slug in
 * content/projects.ts (test/navigation.test.mts keeps the two in step).
 */
const PUBLIC_WORK_COPY = {
  dbwhisper: { description: "Plain-English questions, validated SQL", icon: "database" },
  tradepulse: { description: "Backtests that can only read closed bars", icon: "chart" },
  crownwager: { description: "NBA picks graded against final scores", icon: "trophy" },
  "llm-studio": { description: "Multi-user chat, six model providers", icon: "messages" },
} as const satisfies Record<string, { description: string; icon: NavIconName }>;

/**
 * The menu line for each flagship case study, keyed by its slug in
 * content/flagship (its name and page come from the registry).
 */
const FLAGSHIP_COPY = {
  "bench-discovery": { description: "Document review and verified redaction, web and desktop", icon: "folder-search" },
  careltc: { description: "NFC room rounds for long-term care, iOS and Android", icon: "nfc" },
  signflow: { description: "E-signatures: signing order, PAdES-sealed PDFs", icon: "signature" },
} as const satisfies Record<FlagshipSlug, { description: string; icon: NavIconName }>;

export type PublicWorkSlug = keyof typeof PUBLIC_WORK_COPY;
export type { FlagshipSlug };
/** Every work page: the three flagship case studies and the four public ones. */
export type WorkSlug = FlagshipSlug | PublicWorkSlug;

export type WorkItem = NavLink & { slug: WorkSlug; icon: NavIconName; description: string };

const isPublicWorkSlug = (slug: string): slug is PublicWorkSlug => slug in PUBLIC_WORK_COPY;

/** The flagship case studies, built at Sevina Technologies, in the registry's order. */
export const FLAGSHIP_WORK: readonly WorkItem[] = flagships.map((flagship) => ({
  slug: flagship.slug,
  label: flagship.name,
  href: flagshipHref(flagship.slug),
  ...FLAGSHIP_COPY[flagship.slug],
}));

/** The public systems, in the registry's order, titled by the registry. */
export const PUBLIC_WORK: readonly WorkItem[] = [...projects]
  .sort((a, b) => a.order - b.order)
  .flatMap((project) =>
    isPublicWorkSlug(project.slug)
      ? [{ slug: project.slug, label: project.title, href: `/work/${project.slug}`, ...PUBLIC_WORK_COPY[project.slug] }]
      : [],
  );

/** The work sub-nav's order: the flagship case studies, then the public systems. */
export const WORK_ITEMS: readonly WorkItem[] = [...FLAGSHIP_WORK, ...PUBLIC_WORK];

export const ALL_WORK: NavLink = { label: "All work", href: "/work" };

/** The header's Work menu: two rich columns (flagship first) and a footer link. */
export const WORK_MENU = {
  label: "Work",
  groups: [
    { label: "Flagship", items: FLAGSHIP_WORK },
    { label: "Public systems", items: PUBLIC_WORK },
  ],
  footer: ALL_WORK,
} as const;

/** The plain links between the two menus. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: "Evals", href: "/evals", icon: "bars" },
  { label: "Writing", href: "/writing", icon: "pen" },
];

/** The header's About menu: a simple icon list under its own heading. */
export const ABOUT_MENU = {
  label: "About",
  heading: "About me",
  items: [
    { label: "About", href: "/about", icon: "users" },
    { label: "Résumé", href: "/resume", icon: "file" },
    { label: "Now", href: "/now", icon: "clock" },
    { label: "Uses", href: "/uses", icon: "laptop" },
    { label: "Trust", href: "/trust", icon: "shield" },
    { label: "Ask your AI", href: "/evaluate", icon: "sparkles" },
  ],
} as const satisfies { label: string; heading: string; items: readonly NavLink[] };

/** The routes whose pages sit inside each menu, so its trigger can show the section is current. */
export const MENU_SECTIONS = {
  work: ["/work"],
  about: ABOUT_MENU.items.map((item) => item.href),
} as const;

/** The two ghost pills at the right of the header. */
export const NAV_ACTIONS: readonly NavLink[] = [
  { label: "Contact", href: "/contact", icon: "chat" },
  { label: "Hire me", href: "/hire", icon: "briefcase" },
];

/** The mobile menu's accessible names. */
export const MENU_BUTTON = { open: "Open menu", close: "Close menu" } as const;

/** The mobile menu: the whole header, grouped. The assistant item is appended to Connect. */
export const MOBILE_NAV = [
  {
    label: "Work",
    items: [
      ...FLAGSHIP_WORK.map(({ label, href, icon }) => ({ label, href, icon })),
      { label: "Public systems", href: "/work#public", icon: "database" },
      ...NAV_LINKS,
    ],
  },
  { label: ABOUT_MENU.heading, items: ABOUT_MENU.items },
  { label: "Connect", items: NAV_ACTIONS },
] as const satisfies readonly { label: string; items: readonly NavLink[] }[];

/**
 * The primary destinations, one per section: the 404's way back in, and the
 * shape the navigation test checks.
 */
export const NAV: readonly NavLink[] = [
  { label: "Work", href: "/work" },
  ...NAV_LINKS,
  { label: "About", href: "/about" },
];

/**
 * The footer: five columns beside the brand. A curated map of the site, not a
 * sitemap (test/navigation.test.mts caps it).
 */
export const FOOTER_NAV = [
  {
    heading: "Work",
    links: [
      { label: "Flagship work", href: "/work#flagship" },
      { label: "Public systems", href: "/work#public" },
      { label: "Evaluations", href: "/evals" },
      { label: "All work", href: "/work" },
    ],
  },
  {
    heading: "Writing",
    links: [
      { label: "Essays", href: "/writing?type=essay" },
      { label: "Guides", href: "/writing?type=guide" },
      { label: "Notes", href: "/notes" },
      { label: "RSS feed", href: "/rss.xml" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About", href: "/about" },
      { label: "Résumé", href: "/resume" },
      { label: "Now", href: "/now" },
      { label: "Uses", href: "/uses" },
      { label: "Skills", href: "/skills" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Hire me", href: "/hire" },
      { label: "Contact", href: "/contact" },
      { label: "GitHub", href: SITE.socials.github },
      { label: "LinkedIn", href: SITE.socials.linkedin },
      { label: "Hugging Face", href: SITE.socials.huggingface },
    ],
  },
  {
    heading: "Site",
    links: [
      { label: "Trust", href: "/trust" },
      { label: "Ask your AI", href: "/evaluate" },
      { label: "Privacy", href: "/privacy" },
      { label: "llms.txt", href: "/llms.txt" },
    ],
  },
] as const satisfies readonly { heading: string; links: readonly NavLink[] }[];
