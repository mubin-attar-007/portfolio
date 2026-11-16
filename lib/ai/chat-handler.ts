// -----------------------------------------------------------------------------
// The assistant's request handler, behind POST /api/chat (app/api/chat/route.ts).
//
// Pipeline:
//   1. Screen the request: a cross-site POST → 403, a body not declared JSON →
//      415 (lib/ai/guard.ts).
//   2. Rate-limit by client (a salted hash of the address) → 429.
//   3. Parse and sanitize: malformed or empty → 400; too long → a request to
//      shorten it.
//   4. Screen the conversation for prompt injection → a refusal; the model is
//      not called.
//   5. Retrieve, following up on the previous question when the latest one
//      points back at it. Nothing relevant → an honest "not covered"; the
//      model is not called and no budget is spent.
//   6. Reserve a live answer within the client's daily allowance and the
//      instance's daily budget; otherwise serve the grounded fallback.
//   7. Stream Gemini under a first-token watchdog and an overall timeout. Any
//      failure before the first token — an error, a timeout, a blocked or
//      empty reply — serves the grounded fallback instead. A failure after it
//      ends the answer marked incomplete, so a cut-off answer never reads as
//      a finished one.
//   8. Log one line per answered turn: mode, note, timings, hits and token
//      counts. Never the question, the answer, the key or the address.
//
// The handler lives here rather than in the route file so tests can drive it
// with a fake model stream and short timeouts: a route file may export only
// handlers and segment config.
// -----------------------------------------------------------------------------

import { GEMINI_MODEL } from "@/lib/env";
import type { AnswerMode, AnswerNote, Citation, StreamEvent } from "./chat-contract";
import { dedupeCitationLinks, mergeLinks } from "./citation-links";
import {
  GeminiError,
  GeminiNotConfiguredError,
  streamGemini,
  type FinishReason,
  type StreamArgs,
  type StreamOutcome,
} from "./gemini";
import { INJECTION_REFUSAL, sanitizeMessages, screenConversation, screenRequest, type ChatMessage } from "./guard";
import { checkRateLimit, clientKeyFromHeaders, reserveLiveAnswer } from "./rate-limit";
import { chooseFallback, retrieveForQuestion, type RetrievedPassage } from "./retrieval";
import { buildSystemInstruction } from "./system-prompt";

/** Give up on the model when no text has arrived after this long. */
export const FIRST_TOKEN_TIMEOUT_MS = 8_000;

/** Give up on the model when the whole answer takes longer than this. */
export const ANSWER_TIMEOUT_MS = 20_000;

const TOO_LONG = "That message is a bit long for me — could you trim it to the essentials and ask again?";

const NOT_COVERED =
  "I couldn't find that on Mubin's site. I answer only from its published pages — case studies, writing, " +
  "evaluations and his résumé — and link the page each answer comes from. Try asking what he's shipped in " +
  "production, how DBWhisper validates SQL, or how to contact him.";

/** One line per answered turn. No question, answer, key or address. */
export type TurnLog = {
  evt: "assistant";
  mode: AnswerMode;
  note: AnswerNote | null;
  /** Passages retrieved for the question. */
  hits: number;
  latencyMs: number;
  /** Set when the model was called. */
  model?: string;
  firstTokenMs?: number;
  finish?: FinishReason;
  /** Why the model call failed: a timeout, an upstream status, an empty or blocked reply. */
  failure?: string;
  incomplete?: true;
  promptTokens?: number;
  outputTokens?: number;
};

export type HandlerOptions = {
  /** The model stream. Tests pass a fake; production uses Gemini. */
  stream?: (args: StreamArgs) => AsyncGenerator<string, StreamOutcome>;
  firstTokenMs?: number;
  totalMs?: number;
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

/** A complete answer in one stream: meta, the text, its sources, done. */
function staticAnswer(mode: AnswerMode, note: AnswerNote, text: string, citations: Citation[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(frame({ event: "meta", data: { mode, note } }));
      controller.enqueue(frame({ event: "token", data: { text } }));
      controller.enqueue(frame({ event: "sources", data: { citations } }));
      controller.enqueue(frame({ event: "done", data: {} }));
      controller.close();
    },
  });
  return new Response(body, { headers: SSE_HEADERS });
}

/** The cited passages as wire citations: one line per source, each page linked once. */
function citationsFor(passages: readonly RetrievedPassage[]): Citation[] {
  const seen = new Set<string>();
  const citations: Citation[] = [];
  for (const passage of passages) {
    if (!passage.cited || seen.has(passage.source)) continue;
    seen.add(passage.source);
    citations.push({ source: passage.source, links: mergeLinks(passage.links) });
  }
  return dedupeCitationLinks(citations);
}

/** The grounded fallback for retrieved passages: one passage, verbatim, cited. */
function fallbackFor(passages: readonly RetrievedPassage[]): { text: string; citations: Citation[] } {
  const chosen = chooseFallback(passages);
  // retrieve() never returns passages without a cited one, so this is a guard.
  if (!chosen) return { text: NOT_COVERED, citations: [] };
  return { text: chosen.answer, citations: citationsFor([chosen.passage]) };
}

/** Why a model call failed, for the log: never a message from upstream. */
function describeFailure(error: unknown, reason: string | null): string {
  if (reason) return reason;
  if (error instanceof GeminiNotConfiguredError) return "not-configured";
  if (error instanceof GeminiError) return `upstream-${error.status}`;
  if (error instanceof Error && (error.message === "empty" || error.message === "blocked")) return error.message;
  return "error";
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
  const logStatic = (mode: AnswerMode, note: AnswerNote, hits: number) =>
    log({ evt: "assistant", mode, note, hits, latencyMs: Date.now() - started });

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

    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return rejection(400, "bad_request");
    }
    const sanitized = sanitizeMessages(input);
    if (!sanitized.ok) {
      if (sanitized.reason !== "too-long") return rejection(400, "bad_request");
      logStatic("fallback", "too-long", 0);
      return staticAnswer("fallback", "too-long", TOO_LONG, []);
    }

    const screened = screenConversation(sanitized.messages);
    if (screened.refuse) {
      logStatic("refusal", "injection-screened", 0);
      return staticAnswer("refusal", "injection-screened", INJECTION_REFUSAL, []);
    }

    const { messages } = screened;
    const latest = messages[messages.length - 1]!.content;
    const earlier = messages.slice(0, -1).filter((m) => m.role === "user").map((m) => m.content);
    const passages = retrieveForQuestion(latest, earlier);
    if (passages.length === 0) {
      logStatic("fallback", "not-covered", 0);
      return staticAnswer("fallback", "not-covered", NOT_COVERED, []);
    }

    const reservation = reserveLiveAnswer(client);
    if (reservation !== "ok") {
      const fallback = fallbackFor(passages);
      logStatic("fallback", reservation, passages.length);
      return staticAnswer("fallback", reservation, fallback.text, fallback.citations);
    }

    return liveAnswer({ request, messages, passages, options, log, started });
  } catch {
    return rejection(503, "unavailable");
  }
}

type LiveContext = {
  request: Request;
  messages: ChatMessage[];
  passages: RetrievedPassage[];
  options: HandlerOptions;
  log: (entry: TurnLog) => void;
  started: number;
};

/** Stream a live answer, falling back to site search if the model fails first. */
function liveAnswer({ request, messages, passages, options, log, started }: LiveContext): Response {
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

      const entry: TurnLog = { evt: "assistant", mode: "live", note: null, hits: passages.length, latencyMs: 0, model: GEMINI_MODEL };
      let produced = false;
      try {
        const generator = stream({ systemInstruction: buildSystemInstruction(passages), messages, signal: upstream.signal });
        let outcome: StreamOutcome;
        for (;;) {
          const next = await generator.next();
          if (next.done) {
            outcome = next.value;
            break;
          }
          if (!next.value) continue;
          if (!produced) {
            produced = true;
            clearTimeout(watchdog);
            watchdog = undefined;
            entry.firstTokenMs = Date.now() - started;
            send({ event: "meta", data: { mode: "live", note: null } });
          }
          send({ event: "token", data: { text: next.value } });
        }
        entry.finish = outcome.finish;
        entry.promptTokens = outcome.promptTokens;
        entry.outputTokens = outcome.outputTokens;
        if (!produced) throw new Error(outcome.finish === "blocked" ? "blocked" : "empty");
        const incomplete = outcome.finish === "max-tokens" || outcome.finish === "blocked" || outcome.finish === "other";
        if (incomplete) entry.incomplete = true;
        send({ event: "sources", data: { citations: citationsFor(passages) } });
        send({ event: "done", data: incomplete ? { incomplete: true } : {} });
      } catch (error) {
        entry.failure = describeFailure(error, reason);
        if (reason === "client-gone" || request.signal.aborted) return; // nobody to answer
        if (!produced) {
          const fallback = fallbackFor(passages);
          entry.mode = "fallback";
          entry.note = "live-unavailable";
          send({ event: "meta", data: { mode: "fallback", note: "live-unavailable" } });
          send({ event: "token", data: { text: fallback.text } });
          send({ event: "sources", data: { citations: fallback.citations } });
          send({ event: "done", data: {} });
        } else {
          entry.incomplete = true;
          send({ event: "sources", data: { citations: citationsFor(passages) } });
          send({ event: "done", data: { incomplete: true } });
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
