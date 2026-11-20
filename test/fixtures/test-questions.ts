// -----------------------------------------------------------------------------
// Grounding proof set. Questions with the source retrieval must rank first and
// terms that passage must mention. test/retrieval.test.mts asserts them with no
// model quota, so the RETRIEVAL layer is proven before any LLM is involved.
//
// Two sets, because visitors ask two kinds of question. TEST_QUESTIONS are the
// detailed ones (factual and reasoning, across the flagships, the public
// projects, the résumé and the Sevina role). SHORT_QUESTIONS are how people
// actually type into a chat box — four or five words — which a fixed relevance
// floor tuned only on the first set used to reject outright (P3, 2026-11-16).
// The golden set (test/fixtures/assistant-golden.ts) is the end-to-end proof;
// these pin the ranking itself.
// -----------------------------------------------------------------------------

import { STATUS } from "../../config/site.ts";
import { resume } from "../../content/resume.ts";

/** The résumé's skill group that lists a tool, as its passage's source names it. */
function skillGroupOf(tool: string): string {
  const group = resume.skills.find((g) => g.items.toLowerCase().includes(tool.toLowerCase()));
  if (!group) throw new Error(`no skill group lists ${tool}`);
  return `Skills — ${group.group}`;
}

export type TestQuestion = {
  question: string;
  /** A substring expected to appear in the top-ranked passage's `source`. */
  expectedSource: string;
  /** Substrings (case-insensitive) that must appear in the top passage text. */
  mustMention: string[];
  /**
   * "first" (the default): the expected source ranks first. "retrieved": it is
   * among the passages handed to the model, and `mustMention` applies to it.
   * Only for a question whose point is that a source can be reached at all,
   * where another record of the same project answers as well and the order
   * between the two is a near tie that any unrelated content edit can flip.
   */
  rank?: "first" | "retrieved";
};

export const TEST_QUESTIONS: TestQuestion[] = [
  {
    // The flagships first: the work index is built from content/flagship and
    // content/projects.ts, with the approved usage wording.
    question: "What has Mubin actually shipped in production?",
    expectedSource: "Work — flagship products and public projects",
    mustMention: ["Bench Discovery", "CareLTC", "DBWhisper", "TradePulse"],
  },
  {
    question: "How does Bench Discovery prove that document content never leaves the PC?",
    expectedSource: "Bench Discovery case study",
    mustMention: ["binaries"],
  },
  {
    question: "How does CareLTC handle rounds when a resident is in hospital?",
    expectedSource: "CareLTC case study",
    mustMention: ["Excused"],
  },
  {
    question: "Which AWS services does CareLTC run on?",
    expectedSource: "CareLTC case study — Deployment",
    mustMention: ["Amazon Cognito", "AWS Fargate"],
  },
  {
    question: "Explain the DBWhisper RAG and agent architecture.",
    expectedSource: "FAQ",
    mustMention: ["LangGraph", "pgvector", "schema"],
  },
  {
    question: "How does DBWhisper stop the LLM from running dangerous or destructive SQL?",
    expectedSource: "FAQ",
    mustMention: ["validator", "fail-closed", "SELECT"],
  },
  {
    question: "What is Mubin's healthcare AI experience at his day job?",
    expectedSource: "Sevina",
    mustMention: ["healthcare", "clinical"],
  },
  {
    question: "How does he make sure the metrics his products show are real and not faked?",
    expectedSource: "FAQ",
    mustMention: ["look-ahead", "retired"],
  },
  {
    question: "Why should we hire him — what shows senior engineering judgment?",
    expectedSource: "FAQ",
    mustMention: ["Bench Discovery", "fails closed", "trade-off"],
  },
  {
    question: "What is his experience with LLM agents and multi-provider routing across vendors?",
    expectedSource: "FAQ",
    mustMention: ["LangGraph", "fallback", "provider"],
  },
  {
    // Education is best answered by the résumé passage, not the FAQ — retrieval
    // should prefer the most specific real source.
    question: "What is his educational background and degree?",
    expectedSource: "Résumé — Education",
    mustMention: ["MCA", "Pune"],
  },
  {
    // Proves case-study chunks (chunked by ## h2) are retrievable in their own
    // right when the query uses the case study's technical language. TradePulse's
    // FAQ answer on look-ahead scores within 1% of the section, and which of the
    // two leads moved with an edit to another case study (18 Nov 2026), so the
    // section must be retrieved, not first.
    question:
      "In TradePulse, how does the event-driven engine decide on a closed bar and fill on the next bar's open to prevent look-ahead?",
    expectedSource: "TradePulse case study",
    mustMention: ["closed bar", "look-ahead"],
    rank: "retrieved",
  },
  {
    question: "Why did NFC scans fail on iPhones in CareLTC, and how was it fixed?",
    expectedSource: "CareLTC",
    mustMention: ["inactive"],
  },
  {
    question: "Why did he build DBWhisper on LangGraph and how is the agent structured?",
    expectedSource: "DBWhisper",
    mustMention: ["langgraph", "sql"],
  },
  {
    // The Lessons section states the mechanism ("Paper trading runs the same
    // engine as backtesting … a parity test checks agreement") and ties with
    // the Architecture section, which names the paper-trading worker.
    question: "How does TradePulse guarantee backtest and paper trading match?",
    expectedSource: "TradePulse case study",
    mustMention: ["paper"],
  },
  {
    question: "What database and vector search does DBWhisper use?",
    expectedSource: "DBWhisper case study",
    mustMention: ["postgres", "fastapi"],
  },
];

export const SHORT_QUESTIONS: TestQuestion[] = [
  { question: "What is Bench Discovery?", expectedSource: "Bench Discovery — flagship case study overview", mustMention: ["redaction"] },
  { question: "What is CareLTC?", expectedSource: "CareLTC — flagship case study overview", mustMention: ["NFC"] },
  { question: "How many people use CareLTC?", expectedSource: "CareLTC — flagship case study overview", mustMention: ["200+ users"] },
  { question: "How many people use Bench Discovery?", expectedSource: "Bench Discovery — flagship case study overview", mustMention: ["5–10 users"] },
  { question: "What broke in CareLTC?", expectedSource: "CareLTC case study — What broke", mustMention: ["Broke:"] },
  { question: "What is DBWhisper?", expectedSource: "DBWhisper — project overview", mustMention: ["natural-language-to-SQL"] },
  { question: "What does DBWhisper do?", expectedSource: "DBWhisper — project overview", mustMention: ["validation"] },
  { question: "What is TradePulse?", expectedSource: "TradePulse — project overview", mustMention: ["backtesting"] },
  { question: "Who is Mubin?", expectedSource: "About — profile", mustMention: ["Sevina Technologies", "Bench Discovery"] },
  { question: "What does he do?", expectedSource: "About — profile", mustMention: ["AI"] },
  { question: "Where does he work?", expectedSource: "About", mustMention: ["Sevina Technologies"] },
  // His profile, or the FAQ answer about his background: both say where he is.
  { question: "Where is he based?", expectedSource: "profile", mustMention: ["Ahmedabad"] },
  { question: "What did he study?", expectedSource: "Résumé — Education", mustMention: ["MCA"] },
  { question: "What did he do at Linescripts?", expectedSource: "Résumé — Linescripts", mustMention: ["Django"] },
  { question: "How can I contact him?", expectedSource: "Contact", mustMention: ["Email:"] },
  { question: "What's his email?", expectedSource: "Contact", mustMention: ["@"] },
  { question: "How can I book a call?", expectedSource: "Contact", mustMention: ["cal.com"] },
  { question: "Is he open to work?", expectedSource: "Hiring — roles he is open to", mustMention: ["Availability:"] },
  { question: "Is he available for hire?", expectedSource: "Hiring — roles he is open to", mustMention: ["Availability:"] },
  { question: "What roles is he open to?", expectedSource: "Hiring — roles he is open to", mustMention: ["LLM applications and agents"] },
  { question: "What is his notice period?", expectedSource: "Hiring — roles he is open to", mustMention: [`Notice period for full-time roles: ${STATUS.noticePeriod}`] },
  { question: "What is his GitHub?", expectedSource: "Contact", mustMention: ["github.com"] },
  { question: "Does he know Docker?", expectedSource: skillGroupOf("Docker"), mustMention: ["Docker"] },
  { question: "Does Mubin have AWS experience?", expectedSource: "Skills — AWS", mustMention: ["Amazon"] },
  { question: "Does he know prompt engineering?", expectedSource: skillGroupOf("prompt engineering"), mustMention: ["prompt engineering"] },
  { question: "What has he written?", expectedSource: "Writing — essays, guides and notes", mustMention: ["Essay:"] },
  { question: "What is he working on now?", expectedSource: "Now", mustMention: ["Building now"] },
  { question: "What does he not claim?", expectedSource: "Trust", mustMention: ["not claimed"] },
  { question: "Does this assistant store my question?", expectedSource: "FAQ — privacy", mustMention: ["Gemini"] },
  { question: "How accurate is DBWhisper?", expectedSource: "Evaluation — DBWhisper", mustMention: ["Result:"] },
  { question: "What is the Spider score?", expectedSource: "Evaluation — DBWhisper · Spider", mustMention: ["Result:"] },
  { question: "Is the DBWhisper demo live?", expectedSource: "DBWhisper — project overview", mustMention: ["Live demo:"] },
  // Answered from a different project's passages before 2026-11-16: a rarer
  // word ("act", "handle", "try", "live") filtered out the named project's
  // own record, or a case-study section outranked the overview that states
  // the demo's status.
  { question: "Does LangGraph act as the orchestrator in DBWhisper?", expectedSource: "FAQ — DBWhisper", mustMention: ["LangGraph"] },
  { question: "How many tables can DBWhisper handle?", expectedSource: "DBWhisper", mustMention: ["16 tables"] },
  { question: "Is TradePulse live?", expectedSource: "TradePulse — project overview", mustMention: ["Live demo:"] },
  // The retired golden-set row used to lead the first (as if fail-closed had
  // been withdrawn) and to lose the second to the Spider row.
  { question: "Is DBWhisper fail-closed?", expectedSource: "DBWhisper case study", mustMention: ["fail-closed"] },
  { question: "What is DBWhisper's accuracy on the golden set?", expectedSource: "(retired)", mustMention: ["retired", "golden-query set"] },
];
