/**
 * Small talk: a greeting, "how are you", thanks, a goodbye, or a question
 * about the assistant itself.
 *
 * None of these asks about Mubin's work, so searching the site for them can
 * only come back empty (or find a coincidence: "good night" is not CareLTC's
 * midnight round), and "I couldn't find that" is the wrong reply to "Hi". The
 * route answers them directly, without the model or its budget, and offers
 * questions the site does answer, or, to a visitor leaving, the ways to reach
 * him.
 *
 * A message counts only when it is nothing but small talk: "hi" does, "hi, what
 * is CareLTC?" does not (that is a question, and it is searched as one).
 */
export type SmallTalk = "greeting" | "check-in" | "thanks" | "farewell" | "about";

/** The longest message that can still be small talk. */
const MAX_SMALL_TALK_CHARS = 40;

const GREETING =
  /^(?:hi+|hey+|hello+|helo|hola|yo|namaste|namaskar|greetings|howdy|good (?:morning|afternoon|evening|day))(?: there| all| everyone| mubin| team| bot)?$/;
/** "How are you?", alone or after a greeting. */
const CHECK_IN =
  /^(?:(?:hi+|hey+|hello+) )?(?:how are you(?: doing)?(?: today)?|how are things|how's it going|hows it going|how is it going|how do you do|what's up|whats up|sup|kaise ho|kya haal hai)$/;
const THANKS =
  /^(?:thanks?|thank you(?: so much| very much)?|thanks a lot|thx|ty|cheers|ok(?:ay)?|cool|nice|great|awesome|perfect|got it|dhanyavad|shukriya)$/;
/** Leaving, alone or after thanks: "thanks, bye". */
const FAREWELL =
  /^(?:(?:ok(?:ay)?|thanks?|thank you|cool|great) )?(?:bye+|bye bye|goodbye|good bye|good night|see (?:you|ya)(?: later| soon| around)?|cya|take care|that's all|thats all|that is all|that's it|thats it|nothing else|no thanks|no thank you|alvida)$/;
const ABOUT =
  /^(?:who are you|what are you|what can you do|what do you do|how does this work|help|how can you help(?: me)?|what can i ask(?: you)?)$/;

/** Which kind of small talk a message is, or null when it asks something. */
export function smallTalk(text: string): SmallTalk | null {
  const plain = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain || plain.length > MAX_SMALL_TALK_CHARS) return null;
  if (GREETING.test(plain)) return "greeting";
  if (CHECK_IN.test(plain)) return "check-in";
  if (THANKS.test(plain)) return "thanks";
  if (FAREWELL.test(plain)) return "farewell";
  if (ABOUT.test(plain)) return "about";
  return null;
}

/** The reply to each kind. Every statement here is one the site makes (/privacy, the panel's disclosure). */
export const SMALL_TALK_REPLY: Readonly<Record<SmallTalk, string>> = {
  greeting:
    "Hi! I'm the assistant on Mubin's site. Ask me about his work — the products he built, his public projects, " +
    "his writing, evaluations and résumé — and I'll answer from the site's pages, with a link to each one I use.",
  "check-in":
    "All good, thanks for asking! I'm the assistant on Mubin's site. Ask me anything about his work, and I'll " +
    "answer from the site's pages, with a link to each one I use.",
  thanks: "Glad to help. Ask anything else about Mubin's work, or pick one of these.",
  farewell: "Thanks for stopping by. If you'd like to talk with Mubin, email him or book a call.",
  about:
    "I answer questions about Mubin's work from this site's own pages — his case studies, writing, evaluations, " +
    "résumé and hiring details — and link the page each answer comes from. This site doesn't store your questions.",
};
