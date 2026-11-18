import { SITE_URL } from "@/lib/env";

/**
 * Site config — the ONLY place outside `content/` where copy may live
 * (name, role, canonical URL, socials). Headline/bio live in content/site.ts.
 */
export const SITE = {
  name: "Mubin Attar",
  /** The brand role, title case, as a label or a title (ADR-015). */
  role: "Applied AI Engineer",
  /**
   * The same role inside a sentence. Written out rather than derived with
   * `toLowerCase()`, which lowercases the acronym too ("an applied ai engineer").
   */
  roleInSentence: "applied AI engineer",
  /**
   * What the site is, in one sentence: the homepage's search description and
   * the default for a page without its own. At most 160 characters
   * (constants/seo.ts), which the metadata gate checks on every page.
   */
  description:
    "Mubin Attar designs and ships production AI systems: agents, retrieval, deterministic guardrails, and task-level evaluations published with their method.",
  url: SITE_URL,
  /** The brand mark's letters: the nav, the footer and the article covers. */
  monogram: "MA",
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
 * Third-party integrations — PUBLIC identifiers (a booking page, not a
 * secret), committed so it activates on deploy with zero env setup. Every
 * "Book a call" link reads it; no environment variable overrides it.
 * Empty string = the feature stays hidden (the graceful no-config state).
 *
 * The newsletter is deliberately not here. It has no committed default and
 * renders only when NEXT_PUBLIC_BUTTONDOWN_USERNAME is set
 * (components/features/newsletter-form.tsx), so it stays hidden until the
 * Buttondown list is confirmed to deliver.
 */
export const INTEGRATIONS = {
  /** Cal.com booking page (all event types). A specific event = ".../mubin-attar-007/30min". */
  calUrl: "https://cal.com/mubin-attar-007",
} as const;

/**
 * Availability (evergreen, not an announcement): the home announcement bar, /now,
 * /hire and the assistant read it. `href` is the contact funnel. The literal
 * email address stays a mailto wherever it's shown verbatim (footer, /contact).
 */
export const STATUS = {
  text: "Open to Applied AI Engineer roles",
  /**
   * The phone form of the same sentence. Not a different claim — the same one,
   * short enough to fit 360px without an ellipsis. A status line that truncates
   * mid-word reads as a layout bug rather than as availability.
   */
  short: "Open to Applied AI roles",
  /**
   * The notice period before a full-time role can start (owner, 17 Nov 2026).
   * One value for /hire, /contact, the résumé PDF, llms.txt and the assistant.
   */
  noticePeriod: "1 month",
  cta: "Get in touch",
  href: "/contact",
} as const;

/**
 * Footer copy — the identity column, in the owner's voice. `positioning` is the
 * one-line statement of what he does (the hero's claim, said plainly); `invite`
 * is the human line the assistant quotes. Neither asserts a number, so neither
 * needs a linked method.
 */
export const FOOTER = {
  positioning: "Applied AI Engineer. I ship AI and software inside the customer's rules.",
  invite: "I answer every email myself.",
} as const;

/**
 * The assistant's entry points in the chrome: the nav item, the floating
 * launcher and the mobile menu share `label`; the home announcement bar uses
 * `announcement`. The assistant panel's own copy lives with the panel.
 */
export const ASK_AI = {
  label: "Ask AI",
  /** The floating launcher's accessible name: the trigger's label first, then the visible text (WCAG 2.5.3). */
  launcherName: "Ask this site — Ask AI",
  announcement: "Ask my AI assistant",
} as const;

/**
 * The status vocabulary rendered by `StatusPill` (components/ui/status-pill.tsx).
 * One closed set, so a result is never "Retired" on one page and "Withdrawn" on
 * another. Each status also fixes the pill's colour (its meaning), never only
 * its label.
 */
export const STATUS_PILL = {
  verified: "Verified",
  retired: "Retired",
  draft: "Draft",
  "not-claimed": "Not claimed",
  "in-use": "In use",
  pilot: "Pilot",
  "deployed-demo": "Deployed demo",
} as const;

export type PillStatus = keyof typeof STATUS_PILL;
