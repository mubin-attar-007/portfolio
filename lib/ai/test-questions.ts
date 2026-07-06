// -----------------------------------------------------------------------------
// Grounding proof set. Representative questions (factual + reasoning, across all
// four projects, the résumé, and the Sevina role) with the source we expect
// retrieval to surface, plus terms the top passage must mention. Asserts the
// RETRIEVAL layer is correct WITHOUT any LLM quota (test/retrieval.test.mts).
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
  {
    question: "What went wrong in LLM Studio in production and how was it fixed?",
    expectedSource: "LLM Studio",
    mustMention: ["epoch"],
  },
  {
    question: "How does CrownWager avoid overfitting its NBA betting model?",
    expectedSource: "CrownWager",
    mustMention: ["xgboost", "cross-validation"],
  },
  {
    question: "Why did he build DBWhisper on LangGraph and how is the agent structured?",
    expectedSource: "DBWhisper",
    mustMention: ["langgraph", "sql"],
  },
  {
    question: "How does TradePulse guarantee backtest and paper trading match?",
    expectedSource: "TradePulse case study",
    mustMention: ["fastapi", "postgres"],
  },
  {
    question: "What database and vector search does DBWhisper use?",
    expectedSource: "DBWhisper case study",
    mustMention: ["postgres", "fastapi"],
  },
  {
    question: "How does LLM Studio keep one user from reading another user's chats?",
    expectedSource: "LLM Studio",
    mustMention: ["llm studio"],
  },
];
