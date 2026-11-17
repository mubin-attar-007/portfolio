// -----------------------------------------------------------------------------
// The questions an answer offers to ask next.
//
// Curated, never model-written: each topic has a short list, and the route
// picks two or three from the topic of the pages an answer cites, leaving out
// what the visitor has already asked. test/retrieval.test.mts checks that
// every one of them is answered from its topic's pages, as the starters are.
// The panel shows a follow-up only when it is one of these, so a tampered
// response cannot put words in a button. Data and pure functions only: the
// panel imports this module.
// -----------------------------------------------------------------------------

import { MAX_FOLLOW_UPS } from "./chat-contract";

/** What an answer was about, as far as choosing what to ask next goes. */
export type FollowUpTopic =
  | "bench-discovery"
  | "careltc"
  | "dbwhisper"
  | "tradepulse"
  | "crownwager"
  | "llm-studio"
  | "hiring"
  | "resume"
  | "skills"
  | "evals"
  | "writing"
  | "profile";

/** Each topic's questions, the most useful first. */
export const FOLLOW_UPS: Readonly<Record<FollowUpTopic, readonly string[]>> = {
  "bench-discovery": [
    "How does Bench Discovery keep documents on the PC?",
    "How does Bench Discovery verify a redaction?",
    "What broke in Bench Discovery, and what changed?",
    "Which AWS services does Bench Discovery run on?",
  ],
  careltc: [
    "How does CareLTC check a tap on the server?",
    "What broke in CareLTC, and what changed?",
    "How many people use CareLTC?",
    "Which AWS services does CareLTC run on?",
  ],
  dbwhisper: [
    "How does DBWhisper keep generated SQL safe?",
    "What is DBWhisper's Spider score?",
    "How was DBWhisper deployed?",
  ],
  tradepulse: ["How does TradePulse avoid look-ahead bias?", "Is TradePulse live?", "What is TradePulse's stack?"],
  crownwager: ["How accurate is CrownWager's model?", "Can I try CrownWager?", "How does CrownWager avoid overfitting?"],
  "llm-studio": [
    "How does LLM Studio keep one user from reading another user's chats?",
    "What production bug did he fix in LLM Studio?",
    "Can I try LLM Studio?",
  ],
  hiring: ["What roles is Mubin open to?", "Can he work remotely or on-site?", "How can I contact him?"],
  resume: ["Summarise his experience", "What did he do at Linescripts?", "What did he study?"],
  skills: ["Does Mubin have AWS experience?", "What's his tech stack?", "Has he used LangGraph?"],
  evals: ["Which result was retired, and why?", "How does he measure his work?", "What is DBWhisper's Spider score?"],
  writing: ["What has he written?", "What is the essay 'Trust is not a safety model' about?", "How does he measure his work?"],
  profile: ["What has Mubin shipped in production?", "What roles is Mubin open to?", "How can I contact him?"],
};

/** Every curated follow-up: the only questions the panel will show as one. */
const ALL: ReadonlySet<string> = new Set(Object.values(FOLLOW_UPS).flat());

/** A question as compared with what was asked: case, spacing and closing punctuation ignored. */
const normalized = (question: string): string => question.trim().toLowerCase().replace(/\s+/g, " ").replace(/[?.!]+$/, "");

/** The topic of a page path: "/work/careltc#what-broke" → "careltc", "/contact" → "hiring". */
function topicOfPage(href: string): FollowUpTopic | null {
  const page = href.split("#", 1)[0]!;
  const product = /^\/work\/([a-z0-9-]+)$/.exec(page)?.[1];
  if (product && product in FOLLOW_UPS) return product as FollowUpTopic;
  if (page === "/hire" || page === "/contact") return "hiring";
  if (page === "/resume") return "resume";
  if (page === "/skills" || page === "/uses") return "skills";
  if (page === "/evals") return "evals";
  if (/^\/(?:writing|notes)(?:\/|$)/.test(page)) return "writing";
  return null;
}

/** The topic of an answer: that of the first cited page with one, else his profile. */
export function topicOf(cited: readonly { links: readonly { href: string }[] }[]): FollowUpTopic {
  for (const passage of cited) {
    for (const link of passage.links) {
      const topic = topicOfPage(link.href);
      if (topic) return topic;
    }
  }
  return "profile";
}

/**
 * Two or three questions to ask next: the topic's own first, then his
 * profile's, leaving out every question already asked in the conversation —
 * word for word, or (when the route can tell, `answered`) in substance, as
 * "What roles is Mubin open to?" is answered by "Who is Mubin and what roles
 * is he open to?".
 */
export function chooseFollowUps(
  topic: FollowUpTopic,
  asked: readonly string[],
  answered: (question: string) => boolean = () => false,
): string[] {
  const done = new Set(asked.map(normalized));
  const fresh = (question: string) => !done.has(normalized(question)) && !answered(question);
  const own = FOLLOW_UPS[topic].filter(fresh);
  const more = topic === "profile" ? [] : FOLLOW_UPS.profile.filter(fresh);
  return [...new Set([...own, ...more])].slice(0, MAX_FOLLOW_UPS);
}

/**
 * Read the `followups` event of a response: only curated questions, each once,
 * at most MAX_FOLLOW_UPS, and none the visitor has already asked.
 */
export function readFollowUps(value: unknown, asked: readonly string[] = []): string[] {
  if (!Array.isArray(value)) return [];
  const done = new Set(asked.map(normalized));
  const questions: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !ALL.has(item) || done.has(normalized(item)) || questions.includes(item)) continue;
    questions.push(item);
    if (questions.length === MAX_FOLLOW_UPS) break;
  }
  return questions;
}
