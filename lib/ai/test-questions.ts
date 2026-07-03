// -----------------------------------------------------------------------------
// Grounding proof set. Ten representative questions with the source we expect
// retrieval to surface, plus terms the top passage must mention. This asserts
// the RETRIEVAL layer is correct WITHOUT any LLM quota (test/retrieval.test.mts).
// -----------------------------------------------------------------------------

export type TestQuestion = {
  question: string;
  /** A substring expected to appear in the top-ranked passage's `source`. */
  expectedSource: string;
  /** Substrings (case-insensitive) that must appear in the top passage text. */
  mustMention: string[];
};

export const TEST_QUESTIONS: TestQuestion[] = [
  {
    question: "What has Mubin actually shipped in production?",
    expectedSource: "FAQ",
    mustMention: ["DBWhisper", "LLM Studio", "TradePulse", "CrownWager"],
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
    mustMention: ["look-ahead", "cross-validation"],
  },
  {
    question: "Why should we hire him — what shows senior engineering judgment?",
    expectedSource: "FAQ",
    mustMention: ["fails closed", "trade-off"],
  },
  {
    question: "What machine learning and data science work has he done with XGBoost beyond LLMs?",
    expectedSource: "FAQ",
    mustMention: ["XGBoost", "cross-validation", "Kelly"],
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
    // right when the query uses the case study's technical language.
    question:
      "In TradePulse, how does the event-driven engine decide on a closed bar and fill on the next bar's open to prevent look-ahead?",
    expectedSource: "TradePulse case study",
    mustMention: ["closed bar", "look-ahead"],
  },
];
