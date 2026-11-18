// -----------------------------------------------------------------------------
// What a question wants, read deterministically from its words: to contact or
// hire Mubin, to get his résumé, or a hiring term the site does not publish.
//
// The route uses it twice. It chooses an answer's actions ("Email Mubin",
// "Download résumé (PDF)") — never from model text — and it answers a hiring
// term the site does not cover (a salary, relocation beyond India, a specific
// start date, a visa) itself, without the model: "ask Mubin directly", with the
// ways to reach him and what the site does say about where he works. A model
// asked those questions can only guess. His notice period is on the site
// (STATUS.noticePeriod), so a question about it is a hiring question that
// retrieval answers, not a gap.
// -----------------------------------------------------------------------------

/** A hiring term the site deliberately does not publish. */
export type HiringGap = "compensation" | "relocation" | "start-date" | "visa";

/** What a question asks for, beyond its topic. */
export type Intent = {
  /** His private life (age, family, relationships): never on the site, answered without a search. */
  personal: boolean;
  /** To reach him, hire him, or ask about work with him. */
  contact: boolean;
  /** His résumé or CV. */
  resume: boolean;
  /** A hiring term the site does not cover, or null. */
  gap: HiringGap | null;
};

/**
 * The hiring terms the site does not cover. Narrow on purpose: "rate" alone is
 * a base rate on /evals and "package" is a dependency, so only the hiring
 * forms count ("his hourly rate", "salary package").
 */
const GAPS: readonly (readonly [HiringGap, RegExp])[] = [
  [
    "compensation",
    /\b(?:salary|salaries|compensation|remuneration|ctc|lpa|stipend|wages?|pay (?:range|scale|expectations?)|expected pay|(?:hourly|daily|day|billing|freelance|consulting) rates?|(?:his|your) rates?|rate card|how much (?:does|would|will) (?:he|mubin|it) (?:charge|cost)|(?:salary|compensation) package)\b/,
  ],
  ["relocation", /\breloca(?:te|tes|ted|ting|tion)\b|\bwilling to move\b|\bmove (?:abroad|countries|overseas)\b/],
  [
    // "When is he available for a call?" is a contact question, not a start date.
    "start-date",
    /\bstart(?:ing)? date\b|\bjoining date\b|\b(?:when|how soon) (?:can|could|would|will) (?:he|mubin) (?:start|join|be available)\b|\b(?:when|how soon) is (?:he|mubin) available\b(?! for a (?:call|chat|meeting))|\bimmediate joiner\b|\b(?:join|start) immediately\b|\bearliest (?:start|joining)\b|\bkab (?:se )?(?:join|start)\b|\b(?:join|start) kab\b/,
  ],
  ["visa", /\bvisas?\b|\bwork permit\b|\bsponsorship\b|\bsponsor (?:him|a visa)\b|\bh-?1b\b|\bgreen card\b/],
];

/** Wanting to reach him. */
const CONTACT =
  /\b(?:contact|e-?mail|reach (?:him|out|mubin)|get in touch|touch base|book(?:ing)? a (?:call|meeting)|schedule (?:a )?(?:call|meeting|chat)|(?:a )?call with (?:him|mubin)|phone number|whatsapp)\b/;

/**
 * Wanting to hire him or talk about work with him. Only the hiring forms of
 * ambiguous words count: "is TradePulse available?" asks about a demo, "the
 * contract test" and "position sizing" are code. A notice period is a hiring
 * question too, so its answer carries the ways to reach him.
 */
const HIRING =
  /\b(?:hire|hiring|recruit\w*|interview\w*|vacanc\w+|openings|opportunit\w+|open to|looking for (?:a |an )?(?:job|role|work|opportunit\w+)|roles|freelanc\w*|contractor|contract (?:role|work|basis|project)|consult(?:ing|ant|ancy)|work with (?:him|mubin)|join (?:our|my|the) team|fit (?:a|an|the|our|my|your|for)|is (?:he|mubin) available|available for|(?:his|mubin'?s) availability|notice period|(?:his|mubin'?s) notice|serving (?:his |the )?notice)\b/;

/**
 * Questions about his private life. The site has none of it, and a lexical
 * search would only find a coincidence ("how old" matching "old app builds").
 */
const PERSONAL =
  /\b(?:how old|his age|(?:date of|year of) birth|birthday|born in|married|marital|wife|husband|girlfriend|boyfriend|his kids|children|religion|religious|caste|his family|his parents|his height|his weight|how tall)\b/;

/** Wanting his résumé. */
const RESUME = /\b(?:resume|cv|curriculum vitae)\b/;

/** Lower-cased, accents folded ("résumé" → "resume"), whitespace collapsed. */
function normalize(question: string): string {
  return question
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Read what a question asks for. */
export function readIntent(question: string): Intent {
  const text = normalize(question);
  const gap = GAPS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
  return {
    personal: PERSONAL.test(text),
    contact: gap !== null || CONTACT.test(text) || HIRING.test(text),
    resume: RESUME.test(text),
    gap,
  };
}
