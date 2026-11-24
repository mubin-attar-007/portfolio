// -----------------------------------------------------------------------------
// A pasted job description, prepared for the model: its requirements, each with
// the site passage that comes closest (spec/AI_ASSISTANT.md §4).
//
// Comparing up to eight requirements with a dozen passages made the model think
// for longer than an answer may take: the live answer stalled after its first
// bullet (2026-11-24). So the matching happens here, with the same tested
// search every question uses, and the model only judges each pair: does this
// passage show this requirement, partly, or not at all? A requirement no
// passage matches is "not on the site" before the model sees it.
// -----------------------------------------------------------------------------

import { passagesById, retrieve, type RetrievedPassage } from "./retrieval";

/** The résumé's summary: cited with every comparison, so one always has a page behind it. */
const RESUME_PASSAGE = "resume-document";

/** The most requirements an answer goes through, in the description's order. */
export const MAX_REQUIREMENTS = 8;

/** The longest requirement kept: longer lines are company prose, not one requirement. */
const MAX_REQUIREMENT_CHARS = 160;

/** A list item: a bullet or a number in front of the text. */
const LIST_ITEM = /^(?:[-*•▪◦·–]|\d{1,2}[.)])\s+/;

/**
 * The employer's own terms and the company's prose: not requirements of the
 * candidate. A requirement about him never mentions them.
 */
const NOT_A_REQUIREMENT =
  /\b(?:salary|compensation|pay\b|benefits?|equity|stock|bonus(?:es)?\b|perks?|insurance|paid time off|pto|vacation|holidays?|visa|sponsorship|relocation|equal opportunity|we offer|we provide|you(?:'ll| will) get|our (?:team|company|mission|culture)|about us|apply|application)\b/i;

/** A heading line ("Requirements:", "What you'll do") rather than an item under it. */
const HEADING = /^[^.;]{0,48}:$|^(?:about the role|responsibilities|requirements|qualifications|nice to have|what you(?:'ll| will) do|who you are|preferred)$/i;

/** One requirement and the passage that comes closest, or null when none matches. */
export type RequirementEvidence = { requirement: string; passage: RetrievedPassage | null };

/** An inline heading in front of a clause: "Requirements: 3+ years of Python". */
const INLINE_HEADING = /^(?:[A-Za-z'’ ]{2,30}):\s+/;

/** The company's voice, not a requirement of the candidate: "We are looking for an engineer…". */
const COMPANY_VOICE = /^(?:we|we're|our|join|at [A-Z])\b/i;

/**
 * A heading written without a colon, left at the end of the item before it
 * when the description arrives on one line: "…on AWS Requirements".
 */
const TRAILING_HEADING =
  /\s+(?:about the role|responsibilities|requirements|qualifications|nice to have|preferred|bonus points|what you(?:'ll| will) do|who you are|must[- ]haves?)$/i;

/** Whitespace collapsed; list markers, inline and trailing headings and a closing full stop removed. */
const clean = (text: string): string =>
  text
    .replace(LIST_ITEM, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(INLINE_HEADING, "")
    .replace(/[.;,]+$/, "")
    .replace(TRAILING_HEADING, "")
    .replace(/[.;,]+$/, "")
    .trim();

/** A title, every word capitalised ("Applied AI Engineer"): the role's name, not a requirement. */
const TITLE = /^[A-Z0-9][\w./+-]*(?:\s+[A-Z0-9(][\w./()+,-]*)*$/;

/** True when a candidate line reads as one requirement of the candidate. */
function isRequirement(text: string): boolean {
  return (
    text.length >= 12 &&
    text.length <= MAX_REQUIREMENT_CHARS &&
    text.split(" ").length >= 3 &&
    !TITLE.test(text) &&
    !HEADING.test(text) &&
    !COMPANY_VOICE.test(text) &&
    !NOT_A_REQUIREMENT.test(text)
  );
}

/** The headings job descriptions are written under, as they appear inline: "Requirements: …". */
const SECTION_HEADING =
  /\s*\b(about the role|responsibilities|requirements|qualifications|nice to have|preferred|bonus points|what you(?:'ll| will) do|who you are|must[- ]haves?)\s*:\s*/gi;

/**
 * The description's lines. The route's guard collapses every run of
 * whitespace to one space (a pasted "System:" line cannot pose as a turn), so
 * a description arrives on one line: its bullets (" - ", " • ") and headings
 * are put back on lines of their own.
 */
function linesOf(description: string): string[] {
  return description
    .replace(SECTION_HEADING, (_match, heading: string) => `\n${heading}:\n`)
    .replace(/\s+(?=[-*•▪◦·–]\s+\S)/g, "\n")
    // The company's own sentences ("We offer…") start a line, so they cannot ride
    // on the last item and take it out with them.
    .replace(/\s+(?=(?:We|We're|Our|Join us|About us)\b)/g, "\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The requirements a job description lists, in its order, at most
 * MAX_REQUIREMENTS. List items when it has them; otherwise the clauses of
 * "Heading: a; b; c" lines and the sentences of its prose.
 */
export function requirementsOf(description: string): string[] {
  const lines = linesOf(description);
  const items = lines.filter((line) => LIST_ITEM.test(line)).map(clean).filter(isRequirement);
  const found =
    items.length >= 2
      ? items
      : lines
          .flatMap((line) => {
            // "Requirements: a; b; c" → its clauses; prose → its sentences.
            return line.split(/;|(?<=[a-z0-9)])\.\s+/i);
          })
          .map(clean)
          .filter(isRequirement);
  return [...new Set(found)].slice(0, MAX_REQUIREMENTS);
}

/**
 * Each requirement with the cited passage that matches it best, by the site
 * search every question uses, leniently: its filler words ("strong
 * understanding of") are not its topic. No passage when none of its words is
 * on the site: "Familiarity with Kubernetes" is not shown.
 */
export function matchRequirements(requirements: readonly string[]): RequirementEvidence[] {
  return requirements.map((requirement) => ({
    requirement,
    // A retired result was withdrawn after an audit: never evidence of a skill.
    passage: retrieve(topicOf(requirement), { k: 5, lenient: true, withoutRetired: true }).find((hit) => hit.cited) ?? null,
  }));
}

/**
 * How job descriptions ask for a skill, rather than the skill: "strong
 * understanding of", "3+ years of experience with", "familiarity with". Left
 * in, spelling correction can read them as site words and outweigh the skill.
 */
const FILLER =
  /\b(?:(?:strong|solid|deep|good|excellent|proven|hands-on|demonstrated|working|practical)\s+)?(?:understanding|knowledge|experience|familiarity|proficiency|expertise|background|comfort|ability)\s+(?:of|with|in|to|using)\b|\b\d+\+?\s*(?:years?|yrs?)\s+of\b|\b(?:to understand|their|the ability to|nice to have)\b/gi;

/** A requirement's topic: the skill it asks for, without the way it asks. */
const topicOf = (requirement: string): string => requirement.replace(FILLER, " ").replace(/\s+/g, " ").trim();

/**
 * The passages a comparison cites: the résumé's summary first (an answer cites
 * at most five pages, and the résumé is the one a recruiter wants), then each
 * matched passage once, in the requirements' order.
 */
export function evidencePassages(items: readonly RequirementEvidence[]): RetrievedPassage[] {
  const seen = new Set<string>();
  const passages: RetrievedPassage[] = [];
  for (const passage of [...passagesById([RESUME_PASSAGE]), ...items.map((item) => item.passage)]) {
    if (!passage || seen.has(passage.id)) continue;
    seen.add(passage.id);
    passages.push(passage);
  }
  return passages;
}

/** The page a visitor can open for a passage: its first citation's label ("CareLTC", "Skills"). */
const pageOf = (passage: RetrievedPassage): string => passage.links[0]?.label ?? passage.source;

/**
 * The comparison when no model can write it (no key, or a visitor the Gemini
 * tier may not serve): each requirement with the page closest to it, from site
 * search, said to be that and not a judgement of fit.
 */
export function roleFitFallback(items: readonly RequirementEvidence[]): string {
  const lines = items.map(({ requirement, passage }) =>
    passage ? `- ${requirement}: closest page, ${pageOf(passage)}` : `- ${requirement}: not on the site`,
  );
  return [
    "Live answers aren't available right now, so here is each requirement with the page of this site closest to it, from site search. A match is a place to look, not a judgement of fit.",
    ...lines,
  ].join("\n");
}
