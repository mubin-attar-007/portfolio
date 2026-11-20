import { FOOTER, INTEGRATIONS, SITE, STATUS } from "@/config/site";

/**
 * /contact copy (spec/prototype/contact.html). Addresses and links come from
 * config/site.ts, so the page can never disagree with the footer.
 */
export const contactPage = {
  meta: {
    title: "Contact",
    description:
      "Email me about an Applied AI Engineer role, or book a call about a fixed-scope AI project.",
  },
  header: {
    kicker: "Contact",
    title: "Let's talk about what you're building",
    lede: "Hiring for an Applied AI Engineer role, or need an AI system shipped inside your rules? Share the problem, the team and what the system must do.",
  },
  label: "Ways to reach me",
  hiring: {
    title: "Hiring",
    body: `Full-time Applied AI Engineer roles. Remote, or hybrid and on-site in India, with travel to customer sites. Notice period: ${STATUS.noticePeriod}.`,
    action: { label: "Email me", href: `mailto:${SITE.email}` },
  },
  freelance: {
    title: "Freelance projects",
    /** The sentence around the inline address: before it, then after it. */
    body: ["Fixed-scope AI work. Book a 30-minute call, or email", "directly."],
    action: { label: "Book a call", href: INTEGRATIONS.calUrl },
  },
  /** Where every "Request a walkthrough" button lands (`#walkthrough`). */
  walkthrough: {
    id: "walkthrough",
    title: "Product walkthrough",
    body: "The three products' code stays private. I'll walk you through any of them on a call, on dummy data.",
    action: { label: "Book a call", href: INTEGRATIONS.calUrl },
  },
  assistant: {
    title: "Ask my assistant",
    body: "Answers from this site, with a link to the page it used.",
    action: "Open the assistant",
  },
  resume: {
    title: "Résumé",
    body: "One page. Every figure links to the method behind it.",
    action: { label: "View résumé", href: "/resume" },
  },
  source: {
    title: "Source code",
    body: "The public systems, with tests and their evaluation methods.",
    action: { label: "Open GitHub", href: SITE.socials.github },
  },
  foot: `${FOOTER.invite} ${SITE.location}, on IST (UTC+5:30).`,
} as const;
