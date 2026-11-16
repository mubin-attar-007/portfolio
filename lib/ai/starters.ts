/**
 * The starter questions the assistant panel offers on an empty conversation.
 *
 * One list for the panel and the grounding test: a suggested question that
 * answers "not on the site" reads as broken, so test/retrieval.test.mts checks
 * that every starter retrieves passages and names the passage its fallback
 * serves. The panel is a client component, so this module holds data only.
 */
export const STARTERS = [
  "What has Mubin shipped in production?",
  "Why a deterministic SQL validator instead of trusting the LLM?",
  "How does TradePulse avoid look-ahead bias?",
  "What real production bugs has he found and fixed?",
] as const;
