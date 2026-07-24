import { SITE_URL } from "@/lib/env";

/**
 * Site config — the ONLY place outside `content/` where copy may live
 * (name, role, canonical URL, socials). Headline/bio live in content/site.ts.
 */
export const SITE = {
  name: "Mubin Attar",
  role: "AI Software Engineer",
  url: SITE_URL,
  email: "sk.mubinattar@gmail.com",
  location: "Ahmedabad, India",
  socials: {
    github: "https://github.com/mubin-attar-007",
    linkedin: "https://www.linkedin.com/in/mubin-attar-53223716a",
    huggingface: "https://huggingface.co/heisenbergblue",
  },
} as const;

export type Site = typeof SITE;

/**
 * Third-party integrations — PUBLIC identifiers (a booking page + a newsletter
 * handle, not secrets), committed so they activate on deploy with zero env setup.
 * Each is overridable at build via its matching NEXT_PUBLIC_* var (consumed in
 * app/hire/page.tsx and components/features/newsletter-form.tsx). Empty string =
 * the feature stays hidden (the graceful no-config state).
 */
export const INTEGRATIONS = {
  /** Cal.com booking page (all event types). A specific event = ".../mubin-attar-007/30min". */
  calUrl: "https://cal.com/mubin-attar-007",
  /** Buttondown newsletter handle — the embed form posts to this account. */
  buttondownUsername: "mubin-attar-007",
} as const;

/**
 * Availability chrome (evergreen, not an announcement). `href` points at /hire
 * — the single funnel for contact intent. The literal email address stays a
 * mailto wherever it's shown verbatim (footer, /hire, homepage contact).
 */
export const STATUS = {
  text: "Open to AI software engineering roles — remote or Ahmedabad, India",
  cta: "Get in touch",
  href: "/hire",
} as const;

/**
 * Footer sign-off — a personal line in the owner's voice (not a company tagline
 * and not a metric). Spoken to the reader who scrolled through the evidence.
 */
export const FOOTER = {
  signoff: "Thanks for reading this far.",
  invite: "The rest is a conversation — I answer every email myself.",
} as const;

export type RouteClass = "page" | "special" | "system";
export type RouteIntent =
  | "primary"
  | "editorial"
  | "utility"
  | "support"
  | "experience"
  | "identity";
export type RouteRiskLevel = "low" | "medium" | "high";

export type RouteInventoryItem = {
  path: string;
  label: string;
  intent: RouteIntent;
  class: RouteClass;
  inHeader: boolean;
  inFooter: boolean;
  sourceOfTruth: "content" | "static-page" | "meta-route" | "system-route";
  parityStatus: "aligned" | "mapped-alias" | "missing";
  parityNote?: string;
  risk: RouteRiskLevel;
  riskRationale: string;
};

/**
 * Foundation scope snapshot captured during Phase 0.
 * Keep this as the single source-of-truth for route parity and baseline risks.
 */
export const FOUNDATION_SCOPE = {
  phase: "Phase 0",
  approvedAt: "2026-07-23",
  inventory: [
    {
      path: "/",
      label: "Home",
      intent: "primary",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Canonical primary landing route.",
    },
    {
      path: "/work",
      label: "Projects",
      intent: "primary",
      class: "page",
      inHeader: true,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "mapped-alias",
      parityNote: "Audited as Projects target; implemented path is /work.",
      risk: "low",
      riskRationale: "Naming mismatch is expected and documented.",
    },
    {
      path: "/work/[slug]",
      label: "Project detail",
      intent: "primary",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Matches portfolio content model.",
    },
    {
      path: "/about",
      label: "About",
      intent: "identity",
      class: "page",
      inHeader: true,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Named as requested.",
    },
    {
      path: "/writing",
      label: "Blog index",
      intent: "editorial",
      class: "page",
      inHeader: true,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "mapped-alias",
      parityNote: "Audited as Blog target; implemented path is /writing.",
      risk: "low",
      riskRationale: "Naming mismatch is expected and documented.",
    },
    {
      path: "/writing/[slug]",
      label: "Blog detail",
      intent: "editorial",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Consistent detail format and metadata.",
    },
    {
      path: "/notes",
      label: "Notes index",
      intent: "editorial",
      class: "page",
      inHeader: true,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Supports secondary editorial family and remains discoverable.",
    },
    {
      path: "/notes/[slug]",
      label: "Notes detail",
      intent: "editorial",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Consistent with notes detail behavior.",
    },
    {
      path: "/resume",
      label: "Experience",
      intent: "experience",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "mapped-alias",
      parityNote: "Audited as Experience target; implemented path is /resume.",
      risk: "low",
      riskRationale: "Equivalent scope and intended content mapping.",
    },
    {
      path: "/skills",
      label: "Skills",
      intent: "identity",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Dedicated skills page now implemented as a first-class route.",
    },
    {
      path: "/hire",
      label: "Contact / Hire",
      intent: "utility",
      class: "page",
      inHeader: true,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "mapped-alias",
      parityNote: "Audited as Contact target; implemented path is /hire.",
      risk: "low",
      riskRationale: "Clear CTA surface already active.",
    },
    {
      path: "/privacy",
      label: "Privacy",
      intent: "support",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Legal/compliance route is implemented and discoverable in footer links.",
    },
    {
      path: "/not-found",
      label: "404 fallback",
      intent: "support",
      class: "special",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "static-page",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Route exists and closes unhandled URLs.",
    },
    {
      path: "/trust",
      label: "Trust",
      intent: "identity",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Strong trust surface present in nav and footer.",
    },
    {
      path: "/now",
      label: "Now",
      intent: "identity",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Maintains living status surface.",
    },
    {
      path: "/uses",
      label: "Uses",
      intent: "identity",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Supplementary identity content.",
    },
    {
      path: "/timeline",
      label: "Timeline",
      intent: "experience",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Timeline narrative is consistent with experience work.",
    },
    {
      path: "/evals",
      label: "Evaluations",
      intent: "identity",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Technical trust artifact in secondary navigation.",
    },
    {
      path: "/talks",
      label: "Talks",
      intent: "identity",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Completes identity and speaking artifacts.",
    },
    {
      path: "/changelog",
      label: "Changelog",
      intent: "identity",
      class: "page",
      inHeader: false,
      inFooter: true,
      sourceOfTruth: "content",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Stable support surface and audit-friendly content cadence.",
    },
    {
      path: "/api/chat",
      label: "Assistant API",
      intent: "utility",
      class: "system",
      inHeader: false,
      inFooter: false,
      sourceOfTruth: "system-route",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Operational endpoint outside navigation scope.",
    },
    {
      path: "/rss.xml",
      label: "RSS feed",
      intent: "utility",
      class: "system",
      inHeader: false,
      inFooter: false,
      sourceOfTruth: "system-route",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Static feed endpoint and discoverable via robots metadata.",
    },
    {
      path: "/writing/feed.xml",
      label: "Writing feed",
      intent: "utility",
      class: "system",
      inHeader: false,
      inFooter: false,
      sourceOfTruth: "system-route",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Static feed endpoint.",
    },
    {
      path: "/sitemap.xml",
      label: "Sitemap",
      intent: "utility",
      class: "system",
      inHeader: false,
      inFooter: false,
      sourceOfTruth: "system-route",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Standard search-discovery artifact.",
    },
    {
      path: "/robots.txt",
      label: "Robots",
      intent: "utility",
      class: "system",
      inHeader: false,
      inFooter: false,
      sourceOfTruth: "system-route",
      parityStatus: "aligned",
      risk: "low",
      riskRationale: "Standard crawler policy endpoint.",
    },
  ] as const satisfies readonly RouteInventoryItem[],

  requestedPages: [
    { requested: "Home", mappedTo: "/" },
    { requested: "About", mappedTo: "/about" },
    { requested: "Projects", mappedTo: "/work" },
    { requested: "Experience", mappedTo: "/resume" },
    { requested: "Skills", mappedTo: "/skills" },
    { requested: "Blog", mappedTo: "/writing" },
    { requested: "Contact", mappedTo: "/hire" },
    { requested: "404", mappedTo: "/not-found" },
    { requested: "Privacy", mappedTo: "/privacy" },
  ],

  routeRisks: [
    {
      id: "R-003",
      title: "Route naming mismatch vs. requested map",
      severity: "low",
      impact: "Projects/Experience/Contact are mapped aliases, not direct slugs.",
      mitigation: "Keep alias map in this manifest and decide aliasing policy per phase.",
    },
  ],
} as const;
