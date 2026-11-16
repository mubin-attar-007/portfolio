import { SITE_URL } from "@/lib/env";

/**
 * Site config — the ONLY place outside `content/` where copy may live
 * (name, role, canonical URL, socials). Headline/bio live in content/site.ts.
 */
export const SITE = {
  name: "Mubin Attar",
  role: "Applied AI Engineer",
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
  text: "Open to senior AI engineering and applied AI roles — remote or Ahmedabad, India",
  /**
   * The phone form of the same sentence. Not a different claim — the same one,
   * short enough to fit 360px without an ellipsis. A status line that truncates
   * mid-word reads as a layout bug rather than as availability.
   */
  short: "Open to AI engineering roles",
  cta: "Get in touch",
  href: "/hire",
} as const;

/**
 * Footer copy — the identity column, in the owner's voice. `positioning` is the
 * one-line statement of what he does (the same claim the hero makes, said
 * plainly); `invite` is the human line under it. Neither asserts a number, so
 * neither needs a linked method.
 */
export const FOOTER = {
  positioning: "Production AI systems — designed, shipped, constrained, and measured.",
  invite: "I answer every email myself.",
} as const;
