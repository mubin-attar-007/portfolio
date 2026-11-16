// -----------------------------------------------------------------------------
// Grounding proof set. Questions with the source retrieval must rank first and
// terms that passage must mention. test/retrieval.test.mts asserts them with no
// model quota, so the RETRIEVAL layer is proven before any LLM is involved.
//
// Two sets, because visitors ask two kinds of question. TEST_QUESTIONS are the
// detailed ones (factual and reasoning, across all four projects, the résumé
// and the Sevina role). SHORT_QUESTIONS are how people actually type into a
// chat box — four or five words — which a fixed relevance floor tuned only on
// the first set used to reject outright (P3, 2026-11-16).
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
    // The Lessons section states the mechanism directly ("Paper trading runs the
    // same engine as backtesting … a parity test checks agreement").
    question: "How does TradePulse guarantee backtest and paper trading match?",
    expectedSource: "TradePulse case study",
    mustMention: ["same engine", "parity"],
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

export const SHORT_QUESTIONS: TestQuestion[] = [
  { question: "What is DBWhisper?", expectedSource: "DBWhisper — project overview", mustMention: ["natural-language-to-SQL"] },
  { question: "What does DBWhisper do?", expectedSource: "DBWhisper — project overview", mustMention: ["validation"] },
  { question: "What is TradePulse?", expectedSource: "TradePulse — project overview", mustMention: ["backtesting"] },
  { question: "What is CrownWager?", expectedSource: "CrownWager — project overview", mustMention: ["XGBoost"] },
  { question: "What is LLM Studio?", expectedSource: "LLM Studio — project overview", mustMention: ["multi-user"] },
  { question: "Who is Mubin?", expectedSource: "Profile", mustMention: ["Sevina Technologies"] },
  { question: "What does he do?", expectedSource: "Profile", mustMention: ["AI"] },
  { question: "Where does he work?", expectedSource: "Profile", mustMention: ["Sevina Technologies"] },
  { question: "Where is he based?", expectedSource: "Profile", mustMention: ["Ahmedabad"] },
  { question: "What did he study?", expectedSource: "Résumé — Education", mustMention: ["MCA"] },
  { question: "What did he do at Linescripts?", expectedSource: "Résumé — Linescripts", mustMention: ["Django"] },
  { question: "How can I contact him?", expectedSource: "Contact", mustMention: ["Email:"] },
  { question: "What's his email?", expectedSource: "Contact", mustMention: ["@"] },
  { question: "Is he open to work?", expectedSource: "Contact", mustMention: ["Availability:"] },
  { question: "Is he available for hire?", expectedSource: "Contact", mustMention: ["Availability:"] },
  { question: "What is his GitHub?", expectedSource: "Contact", mustMention: ["github.com"] },
  { question: "Does he know Docker?", expectedSource: "Skills — Data / DevOps", mustMention: ["Docker"] },
  { question: "Does Mubin have AWS experience?", expectedSource: "Skills — Data / DevOps", mustMention: ["AWS"] },
  { question: "Does he know prompt engineering?", expectedSource: "Skills — GenAI", mustMention: ["prompt engineering"] },
  { question: "What has he written?", expectedSource: "Writing — essays, guides and notes", mustMention: ["Essay:"] },
  { question: "How accurate is DBWhisper?", expectedSource: "Evaluation — DBWhisper", mustMention: ["Result:"] },
  { question: "What is the Spider score?", expectedSource: "Evaluation — DBWhisper · Spider", mustMention: ["Result:"] },
  { question: "Is the DBWhisper demo live?", expectedSource: "DBWhisper — project overview", mustMention: ["Live demo:"] },
  { question: "Is CrownWager live?", expectedSource: "CrownWager — project overview", mustMention: ["Live demo:"] },
  // Answered from a different project's passages before 2026-11-16: a rarer
  // word ("act", "handle", "try", "live") filtered out the named project's
  // own record, or a case-study section outranked the overview that states
  // the demo's status.
  { question: "Does LangGraph act as the orchestrator in DBWhisper?", expectedSource: "FAQ — DBWhisper", mustMention: ["LangGraph"] },
  { question: "How many tables can DBWhisper handle?", expectedSource: "DBWhisper", mustMention: ["16 tables"] },
  { question: "Can I try LLM Studio?", expectedSource: "LLM Studio — project overview", mustMention: ["Live demo:"] },
  { question: "Is LLM Studio live right now?", expectedSource: "LLM Studio — project overview", mustMention: ["Live demo:"] },
  { question: "Does CrownWager have a demo?", expectedSource: "CrownWager — project overview", mustMention: ["Live demo:"] },
  { question: "Is TradePulse live?", expectedSource: "TradePulse — project overview", mustMention: ["Live demo:"] },
  // The retired golden-set row used to lead the first (as if fail-closed had
  // been withdrawn) and to lose the second to the Spider row.
  { question: "Is DBWhisper fail-closed?", expectedSource: "DBWhisper case study", mustMention: ["fail-closed"] },
  { question: "What is DBWhisper's accuracy on the golden set?", expectedSource: "(retired)", mustMention: ["retired", "golden-query set"] },
];
