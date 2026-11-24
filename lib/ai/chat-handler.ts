// -----------------------------------------------------------------------------
// The assistant's request handler, behind POST /api/chat (app/api/chat/route.ts).
//
// Pipeline:
//   1. Screen the request: a cross-site POST → 403, a body not declared JSON →
//      415 (lib/ai/guard.ts).
//   2. Rate-limit by client (a salted hash of the address) → 429.
//   3. Parse and sanitize: malformed or empty → 400; too long → a request to
//      shorten it. A `page` that is not a page of this site is ignored.
//   4. Screen the conversation for prompt injection → a refusal; nothing else
//      runs, and no model is called.
//   5. A hiring term the site does not publish (a salary, relocation, a
//      specific start date, a visa) → "ask Mubin directly", with what the site
//      does say (for a start date, his notice period) and the ways to reach
//      him. A question about his private life → "not covered". No model.
//   6. Retrieve, following up on the previous question when the latest one
//      points back at it, with the page the panel is open on as a mild prior.
//   7. Nothing found → when live answers are available, ONE routing call may
//      choose passages from the site's index (lib/ai/router.ts). Still nothing
//      → an honest "not covered".
//   8. No key → the grounded fallback; no allowance is reserved, since no
//      model call can happen. Otherwise reserve a live answer within the
//      client's daily allowance and the instance's daily budget (a routing
//      call counted against both too); over either → the fallback.
//   9. Stream Gemini under a first-token watchdog and an overall timeout. Any
//      failure before the first token serves the grounded fallback instead. A
//      failure after it ends the answer marked incomplete.
//  10. Every answer ends with the pages it cites, its actions and its
//      follow-up questions, all chosen here, never from model text.
//  11. Log one line per answered turn. Never the question, the answer, the
//      key or the address.
//
// The handler lives here rather than in the route file so tests can drive it
// with a fake model stream, a fake router and short timeouts: a route file may
// export only handlers and segment config.
// -----------------------------------------------------------------------------

import { GEMINI_MODEL } from "@/lib/env";
import { chooseActions } from "./actions";
import type { ActionKind, AnswerMode, AnswerNote, AssistantAction, CitationLink, StreamEvent } from "./chat-contract";
import { MAX_REQUEST_BYTES } from "./chat-contract";
import { citedPages, isSitePath } from "./citation-links";
import { HIRING_FACTS, HIRING_PASSAGE } from "./corpus";
import { chooseFollowUps, topicOf, type FollowUpTopic } from "./follow-ups";
import {
  GeminiError,
  GeminiNotConfiguredError,
  isLiveConfigured,
  streamGemini,
  type FinishReason,
  type StreamArgs,
  type StreamOutcome,
} from "./gemini";
import { INJECTION_REFUSAL, sanitizeMessages, screenConversation, screenRequest, type ChatMessage } from "./guard";
import { GAP_OPENING } from "./hiring-gaps";
import { readIntent, type Intent } from "./intent";
import { checkRateLimit, clientKeyFromHeaders, reserveLiveAnswer, type LiveAnswerReservation } from "./rate-limit";
import { SMALL_TALK_REPLY, smallTalk } from "./small-talk";
import {
  backgroundProfile,
  chooseFallback,
  passagesById,
  searchSite,
  tokenize,
  type RetrievedPassage,
  type SiteSearch,
} from "./retrieval";
import { ROUTER_TIMEOUT_MS, routeWithGemini, type RouteResult, type Router } from "./router";
import { buildSystemInstruction } from "./system-prompt";

/**
 * Give up on the model when no text has arrived after this long, counted from
 * the answer's start and shared by a hedged second call. A slow live answer
 * beats a verbatim passage for a recruiter: in a slow period Flash-Lite's first
 * token took 8.2–10.5 s on every call (2026-11-17), past the old 8 s.
 */
export const FIRST_TOKEN_TIMEOUT_MS = 12_000;

/**
 * Give up on the model when the whole answer takes longer than this, counted
 * from the answer's start. It leaves 13 s to stream after a first token at the
 * watchdog's limit, and with a routing call ahead of it (ROUTER_TIMEOUT_MS)
 * still ends 1.5 s inside the platform's limit (maxDuration, 30 s), so the
 * fallback is always sent before the function is stopped.
 */
export const ANSWER_TIMEOUT_MS = 25_000;

/**
 * No text after this long: a second, identical call races the first (a hedged
 * request), and whichever sends text first answers. The free tier's latency
 * varies call to call — the same request takes 1.5 s, then 7 s — so one extra
 * call for a slow moment is cheaper than an answer from site search.
 *
 * At most one per answer; reserved against the client's allowance and the
 * daily budget like any model call (no reservation, no hedge); never after the
 * first call has failed (a 429 or any other error falls back at once); and the
 * losing call is aborted the moment the winner's first text arrives.
 */
export const HEDGE_AFTER_MS = 3_500;

/** Most pages one answer cites. */
const MAX_CITED_PAGES = 5;

/** The longest page path a request may send. */
const MAX_PAGE_CHARS = 200;

const TOO_LONG = "That message is a bit long for me — could you trim it to the essentials and ask again?";

const NOT_COVERED =
  "I couldn't find that on Mubin's site. I answer only from its pages — his case studies, writing, " +
  "evaluations, résumé and hiring details — and link the page each answer comes from.";

// What the site does not answer is said for what was asked: something other
// than his work, something about him the site leaves out, or a search that
// could not finish. Each reply says what to do instead.

/** Not about him or his work at all: the weather, a poem, someone else. */
const OFF_TOPIC =
  "I only answer questions about Mubin and his work, so that one is outside what I can help with. " +
  "Here are some I can answer.";

/** About him, but not on the site: his to answer, so the ways to ask him come with it. */
const NOT_ON_SITE = "That isn't covered on the site, so ask Mubin directly, or ask me about his work.";

/** His private life: never on the site. */
const PERSONAL_GAP =
  "The site covers Mubin's work, not his personal life, so I can't answer that. " +
  "Ask me about his projects, his experience or how to reach him.";

/** The routing call failed or was too slow: the site may well answer it. */
const SEARCH_SLOW = "I couldn't search the site for that just now. Try again in a moment, or ask it another way.";

/** Site search found nothing, and the allowance for a second search is spent (the label says so). */
const SEARCH_NO_MATCH = "Site search couldn't find that. Try asking it another way, or pick one of these.";

/** Nothing to search for at all ("tell me more" with nothing before it). */
const NO_TOPIC = "Ask me anything about Mubin's work, or pick one of these.";

/** A request for work of the assistant's own (a poem, code, a translation), not a question about his. */
const TASK_REQUEST =
  /^(?:please |pls |can you |could you |would you )?(?:write|compose|generate|draft|translate|solve|calculate|code|debug|tell me a (?:joke|story|poem))\b/i;

/** To reach him, and nothing else: the actions a visitor leaving, or asking what only he can answer, gets. */
const CONTACT_ONLY: Intent = { personal: false, contact: true, privateContact: false, resume: false, gap: null };

/** A contact or hiring question the site has no page for. */
const CONTACT_GAP = "That isn't on the site — ask Mubin directly.";

/** His phone number or address: what the site publishes, and the ways to reach him. */
const PRIVATE_CONTACT =
  "His home address isn't published. His phone number is only on the downloadable résumé (the Résumé page), " +
  "and the quickest ways to reach him are email or a booked call.";

/** How the passages behind a turn were found. */
export type RetrievalPath = "lexical" | "fuzzy" | "router" | "none";

/** One line per answered turn. No question, answer, key or address. */
export type TurnLog = {
  evt: "assistant";
  mode: AnswerMode;
  note: AnswerNote | null;
  /** Passages the answer was written from. */
  hits: number;
  /** Their ids: content ids, never visitor text. */
  passages: string[];
  /** Lexical search, lexical after a spelling correction, the routing call, or nothing. */
  retrieval: RetrievalPath;
  /** The routing call's result, when one ran. */
  router?: "chose" | "none" | "failed" | "timeout" | "over-budget";
  routerTokens?: { prompt?: number; output?: number };
  /** The page-aware assistant: the request named a page of this site. */
  page?: true;
  /** The actions the answer offered, by kind. */
  actions: ActionKind[];
  latencyMs: number;
  /** The model the turn was routed to: set once a live answer is attempted. */
  model?: string;
  firstTokenMs?: number;
  finish?: FinishReason;
  /** Why the model call failed: a timeout, an upstream status, an empty or blocked reply, no key. */
  failure?: string;
  /** A hedged second call started (HEDGE_AFTER_MS). */
  hedged?: true;
  /** …and it wrote the answer. */
  hedgeWon?: true;
  incomplete?: true;
  promptTokens?: number;
  outputTokens?: number;
};

export type HandlerOptions = {
  /** The model stream. Tests pass a fake; production uses Gemini. */
  stream?: (args: StreamArgs) => AsyncGenerator<string, StreamOutcome>;
  /** The routing call. Tests pass a fake; `null` turns it off; production uses Gemini. */
  route?: Router | null;
  /** Whether live answers can be attempted. Defaults to whether a key is set; tests with a fake model set it. */
  live?: boolean;
  firstTokenMs?: number;
  totalMs?: number;
  routeMs?: number;
  /** When a hedged second call starts; `null` turns hedging off. */
  hedgeMs?: number | null;
  /** Where the per-turn line goes. */
  log?: (entry: TurnLog) => void;
};

const defaultLog = (entry: TurnLog): void => console.info(JSON.stringify(entry));

// ---- Responses ---------------------------------------------------------------

const encoder = new TextEncoder();

function frame(event: StreamEvent): Uint8Array {
  return encoder.encode(`event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`);
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  // Defeat proxy buffering so tokens flush as they arrive.
  "X-Accel-Buffering": "no",
} as const;

/** A refusal that is not an answer: JSON, never cached. */
function rejection(status: number, error: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return Response.json({ error, ...extra }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** What follows an answer's text: the pages it cites, its actions and its follow-up questions. */
type Extras = { citations: CitationLink[]; actions: AssistantAction[]; followups: string[] };

const NO_EXTRAS: Extras = { citations: [], actions: [], followups: [] };

/** The events after an answer's text, in contract order; empty lists are not sent. */
function extrasEvents(extras: Extras, incomplete = false): StreamEvent[] {
  return [
    { event: "sources", data: { citations: extras.citations } },
    ...(extras.actions.length > 0 ? [{ event: "actions" as const, data: { actions: extras.actions } }] : []),
    ...(extras.followups.length > 0 ? [{ event: "followups" as const, data: { questions: extras.followups } }] : []),
    { event: "done", data: incomplete ? { incomplete: true } : {} },
  ];
}

/** A complete answer in one stream: meta, the text, then what follows it. */
function staticAnswer(mode: AnswerMode, note: AnswerNote, text: string, extras: Extras = NO_EXTRAS): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(frame({ event: "meta", data: { mode, note } }));
      controller.enqueue(frame({ event: "token", data: { text } }));
      for (const event of extrasEvents(extras)) controller.enqueue(frame(event));
      controller.close();
    },
  });
  return new Response(body, { headers: SSE_HEADERS });
}

/**
 * The questions to offer next: the topic's curated ones, without any the
 * conversation has already asked, word for word or in substance (every topic
 * word of the follow-up was in one question).
 */
function nextQuestions(topic: FollowUpTopic, asked: readonly string[]): string[] {
  const askedTerms = asked.map((question) => new Set(tokenize(question)));
  const answered = (question: string) => {
    const terms = tokenize(question);
    return terms.length > 0 && askedTerms.some((seen) => terms.every((term) => seen.has(term)));
  };
  return chooseFollowUps(topic, asked, answered);
}

/** The pages cited passages point to: one per page, at most MAX_CITED_PAGES. */
function citationsFor(passages: readonly RetrievedPassage[]): CitationLink[] {
  return citedPages(passages.filter((p) => p.cited).map((p) => p.links)).slice(0, MAX_CITED_PAGES);
}

/**
 * What follows an answer written from these passages: their pages, the
 * actions their topic and the question's intent call for, and what to ask
 * next. Background passages (a named project's uncited overview) count for
 * none of it.
 */
function extrasFor(intent: Intent, passages: readonly RetrievedPassage[], asked: readonly string[]): Extras {
  const cited = passages.filter((p) => p.cited);
  return {
    citations: citationsFor(cited),
    actions: chooseActions(intent, cited),
    followups: nextQuestions(topicOf(cited), asked),
  };
}

/** Why a live call could not be reserved. */
type SpentAllowance = Exclude<LiveAnswerReservation, "ok">;

/** What a reply that answers nothing from the site says, and what follows it. */
type Unanswered = { note: AnswerNote; text: string; extras: Extras; passages: string[] };

/**
 * The reply when neither search found a page, chosen by what was asked: a way
 * to reach him for a contact question; "try again" when the routing call failed
 * or was too slow, since the site may well answer it; "try other words" when no
 * second search could run today (the note's label says why); a prompt to ask
 * something when nothing was asked; "ask Mubin" for a question about him the
 * site leaves out; and "only his work" for anything else.
 */
function unanswered({
  latest,
  search,
  intent,
  asked,
  router,
  allowance,
}: {
  latest: string;
  search: SiteSearch;
  intent: Intent;
  asked: readonly string[];
  router: TurnLog["router"];
  allowance: SpentAllowance | null;
}): Unanswered {
  if (intent.contact) {
    return { note: "not-covered", text: `${CONTACT_GAP} ${HIRING_FACTS}`, extras: hiringExtras(intent, asked), passages: [HIRING_PASSAGE] };
  }
  const followups = nextQuestions("profile", asked);
  const reply = (text: string, note: AnswerNote = "not-covered", actions: AssistantAction[] = []): Unanswered => ({
    note,
    text,
    extras: { ...NO_EXTRAS, actions, followups },
    passages: [],
  });
  if (router === "failed" || router === "timeout") return reply(SEARCH_SLOW);
  if (allowance) return reply(SEARCH_NO_MATCH, allowance);
  if (!search.topical) return reply(NO_TOPIC);
  if (search.person && !TASK_REQUEST.test(latest.trim())) return reply(NOT_ON_SITE, "not-covered", chooseActions(CONTACT_ONLY, []));
  return reply(OFF_TOPIC);
}

/**
 * What follows an answer that says a hiring question is not on the site: the
 * hiring passage's pages (where HIRING_FACTS comes from), the ways to reach
 * him, and the hiring questions the site does answer.
 */
function hiringExtras(intent: Intent, asked: readonly string[]): Extras {
  return {
    citations: citationsFor(passagesById([HIRING_PASSAGE])),
    actions: chooseActions(intent, []),
    followups: nextQuestions("hiring", asked),
  };
}

/** The grounded fallback for retrieved passages: one passage, verbatim, cited. */
function fallbackFor(
  passages: readonly RetrievedPassage[],
  anchor: string | null,
  intent: Intent,
  asked: readonly string[],
): { text: string; extras: Extras; served: string[] } {
  const chosen = chooseFallback(passages, anchor);
  // retrieve() never returns passages without a cited one, so this is a guard.
  if (!chosen) return { text: NOT_COVERED, extras: { ...NO_EXTRAS, followups: nextQuestions("profile", asked) }, served: [] };
  return { text: chosen.answer, extras: extrasFor(intent, [chosen.passage], asked), served: [chosen.passage.id] };
}

/** Why a model call failed, for the log: never a message from upstream. */
function describeFailure(error: unknown, reason: string | null): string {
  if (reason) return reason;
  if (error instanceof GeminiNotConfiguredError) return "not-configured";
  if (error instanceof GeminiError) return `upstream-${error.status}`;
  if (error instanceof Error && (error.message === "empty" || error.message === "blocked")) return error.message;
  return "error";
}

/** The page a request names, when it is a page of this site; anything else is ignored. */
function pageOf(input: unknown): string | null {
  const page = typeof input === "object" && input !== null ? (input as { page?: unknown }).page : undefined;
  return typeof page === "string" && page.length <= MAX_PAGE_CHARS && isSitePath(page) ? page : null;
}

/** Thrown when the routing call outlasts its budget. */
class RouteTimeout extends Error {}

/**
 * Ask the router once, under its own timeout, aborting it if the visitor
 * leaves. A failure of any kind is simply "no passages".
 */
async function routeOnce(
  router: Router,
  question: string,
  request: Request,
  ms: number,
): Promise<{ result: RouteResult | null; outcome: "chose" | "none" | "failed" | "timeout" }> {
  const controller = new AbortController();
  const onClientGone = () => controller.abort();
  request.signal.addEventListener("abort", onClientGone, { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new RouteTimeout());
    }, ms);
  });
  try {
    const result = await Promise.race([router({ question, signal: controller.signal }), timeout]);
    return { result, outcome: result.ids.length > 0 ? "chose" : "none" };
  } catch (error) {
    return { result: null, outcome: error instanceof RouteTimeout ? "timeout" : "failed" };
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", onClientGone);
  }
}

// ---- Handler -----------------------------------------------------------------

/**
 * Answer one POST /api/chat request.
 *
 * Never throws: an unexpected error becomes a 503, and every model failure
 * becomes a grounded fallback or an answer marked incomplete.
 */
export async function handleChat(request: Request, options: HandlerOptions = {}): Promise<Response> {
  const started = Date.now();
  const log = options.log ?? defaultLog;

  try {
    const blocked = screenRequest(request.headers, request.url);
    if (blocked) return rejection(blocked.status, blocked.error);

    const client = clientKeyFromHeaders(request.headers);
    const limit = checkRateLimit(client);
    if (!limit.allowed) {
      // A refusal is not an answer, so it is not a stream: 429 + Retry-After is
      // the contract every HTTP client understands, and the panel reads the
      // header to tell the visitor how long to wait.
      return rejection(429, "rate_limited", { retryAfterSec: limit.retryAfterSec }, {
        "Retry-After": String(limit.retryAfterSec),
      });
    }

    // Refused before parsing: the declared size first, then the bytes read
    // (a chunked body declares none).
    if (Number(request.headers.get("content-length") ?? 0) > MAX_REQUEST_BYTES) return rejection(413, "too_large");
    let input: unknown;
    try {
      const raw = await request.text();
      if (raw.length > MAX_REQUEST_BYTES) return rejection(413, "too_large");
      input = JSON.parse(raw);
    } catch {
      return rejection(400, "bad_request");
    }
    const page = pageOf(input);
    const base = { evt: "assistant" as const, ...(page ? { page: true as const } : {}) };
    const logStatic = (mode: AnswerMode, note: AnswerNote, entry: Partial<TurnLog> = {}) =>
      log({ ...base, mode, note, hits: 0, passages: [], retrieval: "none", actions: [], latencyMs: Date.now() - started, ...entry });

    const sanitized = sanitizeMessages(input);
    if (!sanitized.ok) {
      if (sanitized.reason !== "too-long") return rejection(400, "bad_request");
      logStatic("fallback", "too-long");
      return staticAnswer("fallback", "too-long", TOO_LONG);
    }

    const screened = screenConversation(sanitized.messages);
    if (screened.refuse) {
      logStatic("refusal", "injection-screened");
      return staticAnswer("refusal", "injection-screened", INJECTION_REFUSAL);
    }

    const { messages } = screened;
    const latest = messages[messages.length - 1]!.content;
    const earlier = messages.slice(0, -1).filter((m) => m.role === "user").map((m) => m.content);
    const asked = [...earlier, latest];

    // "Hi", "how are you", "thanks", "bye", "who are you": nothing to search, so
    // answer in kind rather than "I couldn't find that". A visitor leaving gets
    // the ways to reach him; anyone else, questions the site answers.
    const talk = smallTalk(latest);
    if (talk) {
      const extras: Extras =
        talk === "farewell"
          ? { ...NO_EXTRAS, actions: chooseActions(CONTACT_ONLY, []) }
          : { ...NO_EXTRAS, followups: nextQuestions("profile", asked) };
      logStatic("fallback", "small-talk", { actions: extras.actions.map((a) => a.kind) });
      return staticAnswer("fallback", "small-talk", SMALL_TALK_REPLY[talk], extras);
    }

    const intent = readIntent(latest);

    // A hiring term the site does not publish: say so, say what it does say,
    // and offer the ways to ask him. No model can answer it better.
    if (intent.gap) {
      const extras = hiringExtras(intent, asked);
      logStatic("fallback", "not-covered", { passages: [HIRING_PASSAGE], actions: extras.actions.map((a) => a.kind) });
      return staticAnswer("fallback", "not-covered", `${GAP_OPENING[intent.gap]} ${HIRING_FACTS}`, extras);
    }

    // His phone number or address: say what the site publishes and how to reach him,
    // without searching for a coincidence ("a floor phone's home").
    if (intent.privateContact) {
      const extras = hiringExtras(intent, asked);
      logStatic("fallback", "not-covered", { passages: [HIRING_PASSAGE], actions: extras.actions.map((a) => a.kind) });
      return staticAnswer("fallback", "not-covered", PRIVATE_CONTACT, extras);
    }

    // His private life is not on the site: say so without searching for a coincidence.
    if (intent.personal) {
      const followups = nextQuestions("profile", asked);
      logStatic("fallback", "not-covered");
      return staticAnswer("fallback", "not-covered", PERSONAL_GAP, { ...NO_EXTRAS, followups });
    }

    const search = searchSite(latest, earlier, { page });
    let passages = search.passages;
    let retrieval: RetrievalPath = passages.length === 0 ? "none" : search.corrected ? "fuzzy" : "lexical";
    const live = options.live ?? isLiveConfigured();
    const routing: Pick<TurnLog, "router" | "routerTokens"> = {};

    // Second chance: one routing call, only when it can run and has something to route.
    const router = options.route === undefined ? routeWithGemini : options.route;
    let allowance: SpentAllowance | null = null;
    if (passages.length === 0 && live && router && search.topical) {
      const reservation = reserveLiveAnswer(client);
      if (reservation !== "ok") {
        routing.router = "over-budget";
        allowance = reservation;
      } else {
        const { result, outcome } = await routeOnce(router, latest, request, options.routeMs ?? ROUTER_TIMEOUT_MS);
        routing.router = outcome;
        if (result) routing.routerTokens = { prompt: result.promptTokens, output: result.outputTokens };
        passages = result ? passagesById(result.ids) : [];
        if (passages.length > 0) retrieval = "router";
      }
    }

    if (passages.length === 0) {
      const reply = unanswered({ latest, search, intent, asked, router: routing.router, allowance });
      logStatic("fallback", reply.note, {
        ...routing,
        passages: reply.passages,
        actions: reply.extras.actions.map((a) => a.kind),
      });
      return staticAnswer("fallback", reply.note, reply.text, reply.extras);
    }

    const served = (note: AnswerNote, entry: Partial<TurnLog> = {}) => {
      const fallback = fallbackFor(passages, search.anchor, intent, asked);
      logStatic("fallback", note, {
        ...routing,
        hits: fallback.served.length,
        passages: fallback.served,
        retrieval,
        actions: fallback.extras.actions.map((a) => a.kind),
        ...entry,
      });
      return staticAnswer("fallback", note, fallback.text, fallback.extras);
    };

    // No key: no model call can happen, so none is reserved.
    if (!live) return served("live-unavailable", { failure: "not-configured" });

    const reservation = reserveLiveAnswer(client);
    if (reservation !== "ok") return served(reservation);

    return liveAnswer({
      request,
      client,
      messages,
      passages,
      anchor: search.anchor,
      intent,
      asked,
      options,
      log,
      started,
      entry: { ...base, ...routing, retrieval },
    });
  } catch {
    return rejection(503, "unavailable");
  }
}

type LiveContext = {
  request: Request;
  /** The client's key, to reserve a hedged call against its allowance. */
  client: string;
  messages: ChatMessage[];
  passages: RetrievedPassage[];
  anchor: string | null;
  intent: Intent;
  asked: readonly string[];
  options: HandlerOptions;
  log: (entry: TurnLog) => void;
  started: number;
  /** What the log line already knows: how the passages were found, the page, the routing call. */
  entry: Pick<TurnLog, "evt" | "page" | "retrieval" | "router" | "routerTokens">;
};

/** One model call of an answer: its stream, the abort that stops only it, and its pending step. */
type Attempt = { generator: AsyncGenerator<string, StreamOutcome>; stop: AbortController; next: Promise<Step> };

/** A generator's next step, or the error it threw: never a rejection. */
type Step = { attempt: Attempt; result?: IteratorResult<string, StreamOutcome>; error?: unknown };

function stepOf(attempt: Attempt): Promise<Step> {
  return attempt.generator.next().then(
    (result) => ({ attempt, result }),
    (error: unknown) => ({ attempt, error }),
  );
}

/** Resolves when `signal` aborts, so a stream that ignores its signal can never hang the answer. */
function abortedBy(signal: AbortSignal): Promise<"aborted"> {
  return new Promise((resolve) => {
    if (signal.aborted) resolve("aborted");
    else signal.addEventListener("abort", () => resolve("aborted"), { once: true });
  });
}

/** How the race for an answer's first text ended. */
type FirstText =
  | { winner: Attempt; text: string; hedged: boolean; hedgeWon: boolean }
  | { winner: null; failure: unknown; ended: StreamOutcome | null; hedged: boolean };

/**
 * The first text of an answer, from the first of at most two identical calls
 * to send any. The second starts only after `hedgeMs` without text, and only
 * when `allowHedge` reserves it within the budget; the call that wins keeps
 * streaming, and the other is stopped. When every call ends without text, or
 * `signal` aborts, there is no winner.
 */
async function firstText(
  start: () => Attempt,
  signal: AbortSignal,
  hedgeMs: number | null,
  allowHedge: () => boolean,
): Promise<FirstText> {
  const first = start();
  const attempts: Attempt[] = [first];
  let hedged = false;
  let wake: () => void = () => {};
  let woken = new Promise<"hedge">((resolve) => (wake = () => resolve("hedge")));
  const timer =
    hedgeMs === null
      ? undefined
      : setTimeout(() => {
          if (signal.aborted || attempts.length === 0 || !allowHedge()) return;
          hedged = true;
          attempts.push(start());
          wake();
        }, hedgeMs);
  const aborted = abortedBy(signal);
  let failure: unknown = null;
  let ended: StreamOutcome | null = null;
  const remove = (attempt: Attempt) => attempts.splice(attempts.indexOf(attempt), 1);
  try {
    while (attempts.length > 0) {
      const raced = await Promise.race([aborted, woken, ...attempts.map((a) => a.next)]);
      if (raced === "aborted") break;
      if (raced === "hedge") {
        woken = new Promise<"hedge">((resolve) => (wake = () => resolve("hedge")));
        continue;
      }
      const { attempt, result, error } = raced;
      if (!result) {
        failure = error;
        remove(attempt);
      } else if (result.done) {
        ended = result.value;
        remove(attempt);
      } else if (!result.value) {
        attempt.next = stepOf(attempt);
      } else {
        for (const other of attempts) if (other !== attempt) other.stop.abort();
        return { winner: attempt, text: result.value, hedged, hedgeWon: attempt !== first };
      }
    }
    return { winner: null, failure, ended, hedged };
  } finally {
    clearTimeout(timer);
  }
}

/** Stream a live answer, falling back to site search if the model fails first. */
function liveAnswer({ request, client, messages, passages, anchor, intent, asked, options, log, started, entry: known }: LiveContext): Response {
  const stream = options.stream ?? streamGemini;
  const upstream = new AbortController();
  let reason: string | null = null;
  const abort = (why: string) => {
    if (upstream.signal.aborted) return;
    reason = why;
    upstream.abort();
  };

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;
      const send = (event: StreamEvent) => {
        if (!open) return;
        try {
          controller.enqueue(frame(event));
        } catch {
          open = false; // the reader is gone
          abort("client-gone");
        }
      };
      const onClientGone = () => abort("client-gone");
      request.signal.addEventListener("abort", onClientGone, { once: true });
      if (request.signal.aborted) onClientGone();
      let watchdog: ReturnType<typeof setTimeout> | undefined = setTimeout(
        () => abort("first-token-timeout"),
        options.firstTokenMs ?? FIRST_TOKEN_TIMEOUT_MS,
      );
      const deadline = setTimeout(() => abort("timeout"), options.totalMs ?? ANSWER_TIMEOUT_MS);

      const extras = extrasFor(intent, passages, asked);
      const entry: TurnLog = {
        ...known,
        mode: "live",
        note: null,
        hits: passages.length,
        passages: passages.map((p) => p.id),
        actions: extras.actions.map((a) => a.kind),
        latencyMs: 0,
        model: GEMINI_MODEL,
      };
      let produced = false;
      const systemInstruction = buildSystemInstruction(passages, backgroundProfile());
      // Each call has its own abort, so the loser of a hedged race can be
      // stopped alone; every call stops when the answer does.
      const start = (): Attempt => {
        const stop = new AbortController();
        upstream.signal.addEventListener("abort", () => stop.abort(), { once: true });
        const attempt = { generator: stream({ systemInstruction, messages, signal: stop.signal }), stop } as Attempt;
        attempt.next = stepOf(attempt);
        return attempt;
      };
      const aborted = abortedBy(upstream.signal);
      try {
        const race = await firstText(
          start,
          upstream.signal,
          options.hedgeMs === undefined ? HEDGE_AFTER_MS : options.hedgeMs,
          () => reserveLiveAnswer(client) === "ok",
        );
        if (race.hedged) entry.hedged = true;
        if (race.winner && race.hedgeWon) entry.hedgeWon = true;
        if (!race.winner) {
          if (race.ended) {
            entry.finish = race.ended.finish;
            entry.promptTokens = race.ended.promptTokens;
            entry.outputTokens = race.ended.outputTokens;
          }
          throw race.failure ?? new Error(race.ended?.finish === "blocked" ? "blocked" : "empty");
        }
        produced = true;
        clearTimeout(watchdog);
        watchdog = undefined;
        entry.firstTokenMs = Date.now() - started;
        send({ event: "meta", data: { mode: "live", note: null } });
        send({ event: "token", data: { text: race.text } });
        let outcome: StreamOutcome;
        for (;;) {
          const raced = await Promise.race([aborted, stepOf(race.winner)]);
          if (raced === "aborted") throw new Error(reason ?? "aborted");
          if (!raced.result) throw raced.error;
          if (raced.result.done) {
            outcome = raced.result.value;
            break;
          }
          if (raced.result.value) send({ event: "token", data: { text: raced.result.value } });
        }
        entry.finish = outcome.finish;
        entry.promptTokens = outcome.promptTokens;
        entry.outputTokens = outcome.outputTokens;
        const incomplete = outcome.finish === "max-tokens" || outcome.finish === "blocked" || outcome.finish === "other";
        if (incomplete) entry.incomplete = true;
        for (const event of extrasEvents(extras, incomplete)) send(event);
      } catch (error) {
        entry.failure = describeFailure(error, reason);
        if (reason === "client-gone" || request.signal.aborted) return; // nobody to answer
        if (!produced) {
          const fallback = fallbackFor(passages, anchor, intent, asked);
          entry.mode = "fallback";
          entry.note = "live-unavailable";
          entry.hits = fallback.served.length;
          entry.passages = fallback.served;
          entry.actions = fallback.extras.actions.map((a) => a.kind);
          send({ event: "meta", data: { mode: "fallback", note: "live-unavailable" } });
          send({ event: "token", data: { text: fallback.text } });
          for (const event of extrasEvents(fallback.extras)) send(event);
        } else {
          entry.incomplete = true;
          for (const event of extrasEvents(extras, true)) send(event);
        }
      } finally {
        clearTimeout(watchdog);
        clearTimeout(deadline);
        request.signal.removeEventListener("abort", onClientGone);
        upstream.abort(); // a no-op after a finished call; stops a half-read one
        entry.latencyMs = Date.now() - started;
        log(entry);
        if (open) {
          try {
            controller.close();
          } catch {
            // Already closed by the platform on disconnect — nothing to do.
          }
        }
      }
    },
    cancel() {
      abort("client-gone");
    },
  });
  return new Response(body, { headers: SSE_HEADERS });
}
