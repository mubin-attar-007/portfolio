// -----------------------------------------------------------------------------
// The next steps an answer offers: write to Mubin, book a call, open the
// contact page, get the résumé, open the case study.
//
// Chosen by the route from the question's intent (lib/ai/intent.ts) and the
// pages the answer cites — never from model text — and read again by the
// panel, which renders an action only when its destination is exactly one of
// these. The panel is a client component, so this module reads config, not
// content.
// -----------------------------------------------------------------------------

import { INTEGRATIONS, SITE } from "@/config/site";
import { MAX_ACTIONS, type ActionKind, type AssistantAction, type CitationLink } from "./chat-contract";
import { pagePath } from "./citation-links";
import type { Intent } from "./intent";

/**
 * The résumé PDF the site serves. Duplicated from content/resume.ts (`pdf`)
 * because the panel may not import content; test/assistant-citations.test.mts
 * fails if they differ.
 */
export const RESUME_PDF = "/Mubin_Attar_Resume.pdf";

/** The fixed actions, by kind. A booking link exists only while the site has one. */
const FIXED: Partial<Record<Exclude<ActionKind, "case-study">, AssistantAction>> = {
  email: { kind: "email", label: "Email Mubin", href: `mailto:${SITE.email}` },
  ...(INTEGRATIONS.calUrl ? { book: { kind: "book" as const, label: "Book a call", href: INTEGRATIONS.calUrl } } : {}),
  contact: { kind: "contact", label: "Contact page", href: "/contact" },
  "resume-pdf": { kind: "resume-pdf", label: "Download résumé (PDF)", href: RESUME_PDF },
  resume: { kind: "resume", label: "View résumé", href: "/resume" },
};

/** A case study's page: "/work/careltc". */
const CASE_STUDY = /^\/work\/[a-z0-9-]+$/;

/** The longest action label the panel renders. */
const MAX_LABEL_CHARS = 60;

/** What the route knows about a cited passage when it chooses actions. */
type CitedPassage = { kind: string; projects: readonly string[]; links: readonly CitationLink[] };

/** The case studies an answer is about: those of the products its cited records name, in order. */
function caseStudies(cited: readonly CitedPassage[]): CitationLink[] {
  const seen = new Set<string>();
  const pages: CitationLink[] = [];
  for (const passage of cited) {
    if (passage.kind === "writing" || passage.kind === "note") continue;
    for (const link of passage.links) {
      const page = pagePath(link.href);
      if (!CASE_STUDY.test(page) || seen.has(page)) continue;
      seen.add(page);
      pages.push({ label: link.label, href: page });
    }
  }
  return pages;
}

/**
 * The actions for an answer.
 *
 * - Hiring or contact → Email Mubin, Book a call, Contact page.
 * - The résumé → Download résumé (PDF), View résumé.
 * - Otherwise, an answer about one or two products → their case studies
 *   ("Open the case study", or one per product by name).
 */
export function chooseActions(intent: Intent, cited: readonly CitedPassage[]): AssistantAction[] {
  const actions: AssistantAction[] = [];
  const add = (kind: Exclude<ActionKind, "case-study">) => {
    const action = FIXED[kind];
    if (action) actions.push(action);
  };
  if (intent.resume) {
    add("resume-pdf");
    add("resume");
  }
  if (intent.contact) {
    add("email");
    add("book");
    add("contact");
  }
  if (!intent.resume && !intent.contact) {
    const studies = caseStudies(cited);
    if (studies.length === 1) {
      actions.push({ kind: "case-study", label: "Open the case study", href: studies[0]!.href });
    } else if (studies.length === 2) {
      for (const study of studies) actions.push({ kind: "case-study", label: `${study.label} case study`, href: study.href });
    }
  }
  return actions.slice(0, MAX_ACTIONS);
}

const KINDS: ReadonlySet<string> = new Set<ActionKind>(["email", "book", "contact", "resume-pdf", "resume", "case-study"]);

/** True when `href` is the one destination an action of this kind may have. */
function allowed(kind: ActionKind, href: string): boolean {
  if (kind === "case-study") return CASE_STUDY.test(href);
  return FIXED[kind]?.href === href;
}

/**
 * Read the `actions` event of a response into the actions the panel renders.
 * An action is kept only when its kind is known, its label is plain and short,
 * and its destination is exactly the one that kind may have: a tampered
 * response can never turn an action into a link to anywhere else.
 */
export function readActions(value: unknown): AssistantAction[] {
  if (!Array.isArray(value)) return [];
  const actions: AssistantAction[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const { kind, label, href } = item as { kind?: unknown; label?: unknown; href?: unknown };
    if (typeof kind !== "string" || !KINDS.has(kind) || typeof href !== "string" || typeof label !== "string") continue;
    const text = label.trim();
    if (!text || text.length > MAX_LABEL_CHARS || seen.has(href) || !allowed(kind as ActionKind, href)) continue;
    seen.add(href);
    actions.push({ kind: kind as ActionKind, label: text, href });
    if (actions.length === MAX_ACTIONS) break;
  }
  return actions;
}
