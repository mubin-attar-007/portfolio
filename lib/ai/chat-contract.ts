// -----------------------------------------------------------------------------
// The contract between the assistant panel and POST /api/chat.
//
// Both ends import this module, so the limits and the wire shapes cannot drift
// apart: the panel's character limit is the server's character limit, and the
// notes the route sends are the notes the panel knows how to label. The panel
// is a client component, so this file holds constants, types and one pure
// function only — nothing that reads content or the network.
// -----------------------------------------------------------------------------

/** Max characters in one question. The panel's field and the route share it. */
export const MAX_MESSAGE_CHARS = 1000;

/** Max turns of history the route keeps (bounds prompt size and cost). */
export const MAX_HISTORY_TURNS = 8;

/**
 * Max characters kept from each assistant turn a client sends back. Those turns
 * are untrusted: a client can write anything into "the assistant said". The
 * route caps them before they reach the model; the panel trims to the same
 * length so it never sends what the route would discard.
 */
export const MAX_ASSISTANT_TURN_CHARS = 600;

/** Most actions one answer carries. */
export const MAX_ACTIONS = 3;

/** Most follow-up questions one answer offers. */
export const MAX_FOLLOW_UPS = 3;

/** How an answer was produced. */
export type AnswerMode = "live" | "fallback" | "refusal";

/**
 * Why an answer is not a normal live answer. The route sends the first group;
 * the panel adds the second for failures it sees on its own side.
 */
export type AnswerNote =
  // sent by the route
  | "injection-screened" // refused without calling the model
  | "not-covered" // the site does not answer it; the model wrote nothing
  | "too-long" // over MAX_MESSAGE_CHARS
  | "live-unavailable" // no key, upstream error, timeout, empty or blocked reply
  | "daily-budget-reached" // the instance's daily model budget is spent
  | "client-allowance-reached" // this visitor's daily live answers are spent
  // set by the panel
  | "rate-limited" // HTTP 429
  | "stopped" // the visitor pressed Stop, cleared, or closed the panel
  | "timed-out" // the panel gave up waiting
  | "unavailable"; // network or server failure

/**
 * A site page where a reader can check an answer, with the label its chip
 * shows. A cited page is one of these: the wire carries pages, never the
 * internal source line a passage was built from.
 */
export type CitationLink = { label: string; href: string };

/** What an action does: write, book, open a page, or get the résumé. */
export type ActionKind = "email" | "book" | "contact" | "resume-pdf" | "resume" | "case-study";

/**
 * A next step offered under an answer ("Email Mubin", "Open the case study").
 * Chosen by the route from the question's intent and the cited pages, never
 * from model text, and checked again by the panel (lib/ai/actions.ts).
 */
export type AssistantAction = { kind: ActionKind; label: string; href: string };

/**
 * The server-sent events of one answer, in order: one `meta`, any number of
 * `token`s, one `sources`, then `actions` and `followups` when there are
 * any, and one `done`. `done.incomplete` marks an answer that ended before the
 * model finished it (cut off, or failed part-way).
 */
export type StreamEvent =
  | { event: "meta"; data: { mode: AnswerMode; note: AnswerNote | null } }
  | { event: "token"; data: { text: string } }
  | { event: "sources"; data: { citations: CitationLink[] } }
  | { event: "actions"; data: { actions: AssistantAction[] } }
  | { event: "followups"; data: { questions: string[] } }
  | { event: "done"; data: { incomplete?: true } };

/** One turn of the conversation as the panel keeps it. */
export type ChatTurn = {
  /** Stable within a conversation, so a late update can never land on another turn. */
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: AnswerMode;
  note?: AnswerNote | null;
  /** The pages the answer cites. */
  sources?: CitationLink[];
  actions?: AssistantAction[];
  /** Curated questions to ask next (lib/ai/follow-ups.ts). */
  followups?: string[];
  /** True while tokens are still arriving. */
  streaming?: boolean;
  /** True when the answer ended before the model finished it. */
  incomplete?: boolean;
};

/** A turn as the route accepts it. */
export type WireTurn = { role: "user" | "assistant"; content: string };

/**
 * The body of POST /api/chat. `page` is the site path the panel was opened on
 * (the page-aware assistant); the route ignores anything that is not a page of
 * this site.
 */
export type ChatRequest = { messages: WireTurn[]; page?: string };

/**
 * Notes whose assistant turn is not an answer worth sending back as context.
 * A stopped or timed-out turn keeps whatever text had arrived; when nothing
 * had, its content is empty and the pair is dropped by the emptiness check.
 */
const NOT_AN_ANSWER: ReadonlySet<AnswerNote> = new Set<AnswerNote>([
  "injection-screened",
  "not-covered",
  "too-long",
  "rate-limited",
  "unavailable",
]);

/**
 * The history the panel sends with a new question: earlier question-and-answer
 * pairs that produced a real answer, then the question itself.
 *
 * A refused question is left out together with its refusal. Sending it again
 * would make every later question in the conversation look like the same
 * attack, which is how one false positive used to refuse everything after it.
 * Rate-limit notices, failures and empty stops are left out for the same
 * reason: they are not answers, so they are not context.
 */
export function historyForRequest(turns: readonly ChatTurn[], question: string): WireTurn[] {
  const pairs: WireTurn[] = [];
  for (let i = 0; i + 1 < turns.length; i++) {
    const asked = turns[i]!;
    const answered = turns[i + 1]!;
    if (asked.role !== "user" || answered.role !== "assistant") continue;
    i++; // the pair is consumed whether or not it is kept
    if (answered.streaming || answered.mode === "refusal") continue;
    if (answered.note && NOT_AN_ANSWER.has(answered.note)) continue;
    const content = answered.content.trim();
    if (!content) continue;
    pairs.push(
      { role: "user", content: asked.content },
      { role: "assistant", content: content.slice(0, MAX_ASSISTANT_TURN_CHARS) },
    );
  }
  // Whole pairs only, so the route never receives an answer without its
  // question: as many pairs as fit in MAX_HISTORY_TURNS beside the question.
  const room = MAX_HISTORY_TURNS - 1;
  const pairTurns = room - (room % 2);
  const kept = pairs.slice(Math.max(0, pairs.length - pairTurns));
  return [...kept, { role: "user", content: question }];
}

/** Every question the visitor asked in a conversation, oldest first. */
export const askedQuestions = (turns: readonly ChatTurn[]): string[] =>
  turns.filter((turn) => turn.role === "user").map((turn) => turn.content);
