/**
 * The starter questions the assistant panel offers on an empty conversation.
 *
 * One list for the panel and the grounding test: a suggested question that
 * answers "not on the site" reads as broken, so test/retrieval.test.mts checks
 * that every starter retrieves the pages it is about and names the passage its
 * fallback serves. The panel is a client component, so this module holds data
 * and a pure lookup only.
 *
 * The flagships lead, then hiring, then a public project.
 */
export const STARTERS = [
  "What is Bench Discovery?",
  "How does CareLTC record room rounds?",
  "What roles is Mubin open to?",
  "How does DBWhisper keep generated SQL safe?",
] as const;

/**
 * The starters of a case study's page, by product: the assistant opened on a
 * case study offers that case study's questions.
 */
export const CASE_STUDY_STARTERS: Readonly<Record<string, readonly string[]>> = {
  "bench-discovery": [
    "What does Bench Discovery do?",
    "How does Bench Discovery keep documents on the PC?",
    "What broke in Bench Discovery, and what changed?",
    "Which AWS services does Bench Discovery run on?",
  ],
  careltc: [
    "What does CareLTC do?",
    "How does CareLTC check a tap on the server?",
    "What broke in CareLTC, and what changed?",
    "Which AWS services does CareLTC run on?",
  ],
  signflow: [
    "What does SignFlow do?",
    "How does SignFlow prove a signed PDF was not changed?",
    "How do SignFlow's signing links work?",
    "How does SignFlow keep patient details encrypted?",
  ],
  dbwhisper: [
    "What does DBWhisper do?",
    "How does DBWhisper keep generated SQL safe?",
    "What is DBWhisper's Spider score?",
    "How was DBWhisper deployed?",
  ],
  tradepulse: [
    "What is TradePulse?",
    "How does TradePulse avoid look-ahead bias?",
    "How does TradePulse guarantee backtest and paper trading match?",
    "Is TradePulse live?",
  ],
  crownwager: [
    "What is CrownWager?",
    "How accurate is CrownWager's model?",
    "How does CrownWager avoid overfitting?",
    "Can I try CrownWager?",
  ],
  "llm-studio": [
    "What is LLM Studio?",
    "How does LLM Studio keep one user from reading another user's chats?",
    "What production bug did he fix in LLM Studio?",
    "Can I try LLM Studio?",
  ],
};

/** An essay's or a note's starters: "this" is the page the panel was opened on. */
export const ARTICLE_STARTERS: Readonly<Record<"writing" | "notes", readonly string[]>> = {
  writing: ["What is this essay about?", "What are the key decisions in this essay?", "Which project does this essay come from?"],
  notes: ["What is this note about?", "What decision does this note record?", "Which project does this note come from?"],
};

/** The starters for the page the panel was opened on (a site path), or the general ones. */
export function startersFor(page: string | null): readonly string[] {
  const path = page?.split("#", 1)[0] ?? "";
  const product = /^\/work\/([a-z0-9-]+)$/.exec(path)?.[1];
  if (product && CASE_STUDY_STARTERS[product]) return CASE_STUDY_STARTERS[product]!;
  if (/^\/writing\/[a-z0-9-]+$/.test(path)) return ARTICLE_STARTERS.writing;
  if (/^\/notes\/[a-z0-9-]+$/.test(path)) return ARTICLE_STARTERS.notes;
  return STARTERS;
}
