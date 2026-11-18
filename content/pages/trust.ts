import type { PillStatus } from "@/config/site";
import { SITE } from "@/config/site";
import { evals, evalAnchor, evalsIntro } from "@/content/evals";
import { trust } from "@/content/site";

/**
 * The /trust page's copy and its evidence rows. Every row states a status in
 * the site's closed vocabulary and links to a source a reader can check.
 * Figures are never typed here: evaluation rows are built from content/evals.ts,
 * so a retired result comes down here the moment it is retired there.
 */

export type EvidenceRow = {
  area: string;
  claim: string;
  status: Extract<PillStatus, "verified" | "retired" | "not-claimed">;
  source?: { label: string; href: string };
};

export const TRUST_PAGE = {
  kicker: trust.kicker,
  title: "Claims you can check",
  lead: "Every item below links to a source you can check. What isn't claimed is listed too.",
  actions: {
    primary: { label: "See the evaluations", href: "/evals" },
    secondary: { label: "How the assistant works", href: "/privacy#assistant" },
  },
  glance: {
    kicker: "Evidence at a glance",
    title: "What is claimed, and where to check it",
    columns: { area: "Area", claim: "Claim", status: "Status", source: "Source" },
    noSource: "Nothing to link",
  },
  principles: { kicker: "Operating principles", title: "Evidence before statements", items: trust.principles },
  practices: { kicker: "Practices", title: "How quality is protected" },
  cta: {
    title: "Want to test a claim yourself?",
    body: "Ask about any row on this page. I'll walk you through the method, the source and its limits.",
    primary: { label: "Get in touch", href: "/contact" },
    secondary: { label: "What's shipping now", href: "/now" },
  },
} as const;

/** A link per practice group (content/site.ts `trust.controls`), by its title. */
export const PRACTICE_LINKS: Record<string, { label: string; href: string }> = {
  "Code quality gates": { label: "Read the source", href: SITE.socials.github },
  "AI safety controls": { label: "See the SQL validator", href: "/work/dbwhisper" },
  "Operational trust": { label: "See what's shipping", href: "/now" },
};

const evalRows: EvidenceRow[] = evals.map((row) =>
  row.status === "retired" && row.retired
    ? {
        area: row.system,
        claim: `${row.benchmark}: figures withdrawn after an audit. The row stays on the registry with the reason.`,
        status: "retired",
        source: { label: evalsIntro.retired.audit, href: row.retired.link ?? `/evals#${evalAnchor(row)}` },
      }
    : {
        area: row.system,
        claim: `${row.metric}: ${row.result}`,
        status: "verified",
        source: { label: "Method and date", href: `/evals#${evalAnchor(row)}` },
      },
);

export const EVIDENCE: readonly EvidenceRow[] = [
  {
    area: "Shipped work",
    claim: trust.signals[0].value,
    status: "verified",
    source: { label: "All work", href: trust.signals[0].href },
  },
  {
    area: "Evaluations",
    claim: trust.signals[1].value,
    status: "verified",
    source: { label: "The registry", href: trust.signals[1].href },
  },
  ...evalRows,
  {
    area: "Decisions",
    claim: trust.signals[2].value,
    status: "verified",
    source: { label: "Notes", href: trust.signals[2].href },
  },
  {
    area: "Site assistant",
    claim: "Questions are used for one answer. No transcript is stored, and the log line per answer never holds the question or the answer.",
    status: "verified",
    source: { label: "Privacy", href: "/privacy#assistant" },
  },
  {
    area: "Flagship work",
    claim: "No accuracy, outcome or customer result is claimed for the three private products. Their usage counts are the employer's figures, stated on each case study with what was not measured.",
    status: "not-claimed",
  },
  { area: "Compliance", claim: "No compliance certification is claimed.", status: "not-claimed" },
  { area: "Security audit", claim: "No independent security audit or penetration test is claimed.", status: "not-claimed" },
];
