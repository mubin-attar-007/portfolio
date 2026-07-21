/**
 * Site config — the ONLY place outside `content/` where copy may live
 * (name, role, canonical URL, socials). Headline/bio live in content/site.ts.
 */
export const SITE = {
  name: "Mubin Attar",
  role: "AI/ML Engineer",
  url: "https://mubin-attar.vercel.app",
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
  text: "Open to AI/ML roles — remote or Ahmedabad, India",
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
