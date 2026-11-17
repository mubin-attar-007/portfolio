import { INTEGRATIONS } from "@/config/site";
import { projects } from "@/content/projects";

/**
 * /hire copy (spec/prototype/hire.html, approved and fact-checked). Figures are
 * the approved facts (SPEC §2): 3.5+ years, two field systems, the public
 * project count read from content/projects.ts.
 */
export const hirePage = {
  meta: {
    title: "Hire me",
    description:
      "Open to Forward Deployed Engineer and Applied AI Engineer roles, and freelance AI projects. How I work, and the roles I'm open to.",
  },
  hero: {
    title: "I turn customer problems into running systems",
    accent: "inside their rules.",
    cta: { label: "See roles I'm open to", href: "#roles" },
  },
  letter: {
    title: "A note to hiring teams",
    intro:
      "Most AI projects stall between the demo and the customer's real environment. That gap is where I've worked since 2024, and it's mostly made of questions like these:",
    qa: [
      { q: "Records can't leave the PC?", a: "Tests over the compiled code prove they don't." },
      { q: "Staff share phones on the floor?", a: "Floor-phone accounts, and lock screens that show room numbers only." },
      { q: "Old app builds stay installed?", a: "New API fields are opt-in, so older builds keep working." },
      { q: "A model writes the SQL?", a: "A deterministic validator decides whether it runs." },
      { q: "A result fails its own audit?", a: "It's retired in public, with the reason." },
    ],
    strong: "I've done this on small teams, working directly with the staff who use the software.",
    agents:
      "I direct AI coding agents for much of the implementation. I set the architecture, the quality gates and the invariants, review every change and own the releases.",
    close:
      "I'm looking for a forward deployed or applied AI role where that is the job: sitting with customers, writing down their constraints, and shipping systems they rely on.",
    signoff: "Applied AI Engineer, Ahmedabad, India",
  },
  glance: {
    label: "At a glance",
    title: "Production work, in the field and in public",
    body: "Two field systems run at a healthcare operation, with names withheld. Four public AI systems come with source, recordings and the method behind every result.",
    stats: [
      { label: "In software engineering", value: "3.5+ yrs", source: { label: "Résumé", href: "/resume" } },
      { label: "Field systems in use", value: "2" },
      { label: "Public AI systems", value: String(projects.length), source: { label: "The work", href: "/work" } },
      { label: "Time zone", value: "UTC+5:30" },
    ],
  },
  perks: {
    label: "Working with me",
    title: "Constraints written down, releases gated, and evidence you can check.",
    cta: { label: "Start a conversation", href: "/contact" },
    items: [
      { icon: "route", title: "On site when it matters", body: "Comfortable travelling to customer sites. Remote, or hybrid and on-site in India." },
      { icon: "list", title: "Constraints first", body: "Before I build, I write down what the system must never do and how each rule is checked." },
      { icon: "shield", title: "Gated releases", body: "Desktop releases pass the full test suite before they ship; mobile builds pass store review." },
      { icon: "cpu", title: "AI agents, directed", body: "I set the architecture, gates and invariants, review every change and own the release." },
      { icon: "bars", title: "Figures with methods", body: "Every number links to its method. A result that fails its own audit is retired in public." },
      { icon: "file", title: "Written handover", body: "Decision records, incident write-ups and guides your team can keep working from." },
    ],
    caption: "The field systems' code and names stay private. I'll walk you through either one on a call.",
  },
  roles: {
    label: "Open to",
    title: "Roles where shipping inside the customer's rules is the job",
    note: {
      strong: "Not sure it's a fit?",
      body: "Describe the problem and the team, and I'll tell you plainly whether I'm the right person.",
      action: "Email me",
    },
    items: [
      {
        title: "Forward Deployed Engineer",
        terms: ["Full-time", "Remote, hybrid or on-site in India", "Travel to customer sites"],
        action: { label: "Get in touch", href: "/contact" },
      },
      {
        title: "Applied AI Engineer",
        terms: ["Full-time", "Remote, hybrid or on-site in India"],
        action: { label: "Get in touch", href: "/contact" },
      },
      {
        title: "Freelance AI project",
        terms: ["Fixed scope", "Remote"],
        action: { label: "Book a call", href: INTEGRATIONS.calUrl },
      },
    ],
  },
} as const;

export type PerkIcon = (typeof hirePage.perks.items)[number]["icon"];
