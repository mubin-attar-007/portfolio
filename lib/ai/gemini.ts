// -----------------------------------------------------------------------------
// Minimal Google Gemini client (generativelanguage REST API).
//
// Two calls, no SDK dependency:
//   - `streamGemini`: `streamGenerateContent` with `alt=sse`, yielding the
//     answer's text deltas as they arrive;
//   - `generateJson`: one small `generateContent` call that must answer JSON
//     (the router's choice of passages, lib/ai/router.ts).
//
// The API key is read from process.env server-side only, sent as an
// `x-goog-api-key` header (never a query parameter), and is NEVER included in
// any thrown error or log. `args.signal` is forwarded to fetch, so a client
// disconnect or a timeout in the caller stops generation upstream instead of
// burning quota on an answer nobody will read.
// -----------------------------------------------------------------------------

import type { ChatMessage } from "./guard";
import { GEMINI_MODEL } from "@/lib/env";

// The model is GEMINI_MODEL (lib/env.ts), `gemini-3.5-flash-lite` by default.
// Google retires gemini-2.5-flash on 2026-12-01 and routes its requests to 3.5
// Flash-Lite from then on, so the site names that model instead of inheriting
// the reroute. An override must accept the `MINIMAL` thinking level below:
// Google documents it for gemini-3.5-flash-lite, 3.6-flash, 3.1-flash-lite and
// 3-flash-preview, not for Gemini 4, 3.8-flash or any model before Gemini 3.
// If the API refuses a request, the route serves its grounded fallback.
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** Thrown for any upstream failure. Message is safe to surface — no key. */
export class GeminiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

/**
 * Thrown before any request when GEMINI_API_KEY is unset. A separate class so
 * the route's log says "not configured" rather than reporting an upstream 503
 * that Google never sent.
 */
export class GeminiNotConfiguredError extends GeminiError {
  constructor() {
    super("Assistant is not configured.", 503);
    this.name = "GeminiNotConfiguredError";
  }
}

/**
 * True when a key is set, so a live answer can be attempted at all. The route
 * checks it before reserving any allowance: without a key no model call can
 * happen, so none is counted.
 */
export function isLiveConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

type GeminiPart = { text: string };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

/** Map our chat history to Gemini's contents (assistant → "model"). */
function toContents(messages: readonly ChatMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export type StreamArgs = {
  systemInstruction: string;
  messages: readonly ChatMessage[];
  signal?: AbortSignal;
  /**
   * The output ceiling, thinking included (DEFAULT_MAX_OUTPUT_TOKENS unless a
   * task needs more room: see ROLE_FIT_MAX_OUTPUT_TOKENS in the route).
   */
  maxOutputTokens?: number;
};

/** The output ceiling of an ordinary answer: measured on 2026-11-17 (spec/AI_ASSISTANT.md §8). */
export const DEFAULT_MAX_OUTPUT_TOKENS = 800;

/**
 * How a stream ended. `stop` is a finished answer; `max-tokens` was cut off
 * by the output limit; `blocked` was stopped by a safety or recitation filter;
 * `other` is any other reason Google gives; `unknown` means no reason arrived.
 */
export type FinishReason = "stop" | "max-tokens" | "blocked" | "other" | "unknown";

/** What a call reports once it ends: its finish reason and token counts. */
export type StreamOutcome = {
  finish: FinishReason;
  promptTokens?: number;
  outputTokens?: number;
  /** Thinking tokens: they count against maxOutputTokens, so they explain a cut-off answer. */
  thinkingTokens?: number;
};

/** Gemini's finish reasons that mean a filter stopped the answer. */
const BLOCKED = new Set(["SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "IMAGE_SAFETY"]);

function classify(reason: string | undefined): FinishReason {
  if (reason === undefined) return "unknown";
  if (reason === "STOP") return "stop";
  if (reason === "MAX_TOKENS") return "max-tokens";
  return BLOCKED.has(reason) ? "blocked" : "other";
}

/** The parts of one response (or one streamed chunk) this client reads. */
type Chunk = {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
};

/** One `data:` payload as JSON, or null for a keep-alive or partial frame. */
function parseChunk(payload: string): Chunk | null {
  try {
    const value: unknown = JSON.parse(payload);
    return typeof value === "object" && value !== null ? (value as Chunk) : null;
  } catch {
    return null;
  }
}

/** The answer text of a chunk: its parts, without any reasoning ("thought") part. */
const textOf = (chunk: Chunk): string =>
  (chunk.candidates?.[0]?.content?.parts ?? [])
    .filter((part) => part.text && !part.thought)
    .map((part) => part.text!)
    .join("");

/**
 * Grounded Q&A over retrieved passages needs no reasoning pass; one would only
 * add latency and spend free-tier tokens. Gemini 3 replaces the numeric
 * thinking budget with a level, and MINIMAL ("little to no thinking") is the
 * nearest to the old budget of 0. It is 3.5 Flash-Lite's default, stated so an
 * override with a higher default keeps it too. No temperature or topP: from
 * 3.5 Flash-Lite on, Google deprecates the sampling parameters (ignored now,
 * an error in later models). includeThoughts is false by default; it is stated
 * so a later default change cannot start returning reasoning parts (the
 * parsers below also drop any part marked `thought`).
 *
 * Measured on 2026-11-17 (spec/AI_ASSISTANT.md §8): LOW spent 150–810 thinking
 * tokens an answer, which count against maxOutputTokens, so at 800 a fifth of
 * answers came back empty or cut off, and the median first token took twice
 * as long. Raise maxOutputTokens before raising the level.
 */
const THINKING = { thinkingLevel: "MINIMAL", includeThoughts: false } as const;

/**
 * POST one request to the model and return the response, or throw a
 * GeminiError on a missing key, a network failure or a non-OK status.
 */
async function post(method: string, body: unknown, signal: AbortSignal | undefined): Promise<Response> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiNotConfiguredError();

  // The key goes in `x-goog-api-key`, never in the query string. Google accepts
  // either, but a URL-borne key ends up in access logs, error traces, and proxy
  // records — a header does not.
  let res: Response;
  try {
    res = await fetch(`${BASE}/${GEMINI_MODEL}:${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    // Network / abort — surface a generic message, never the upstream detail.
    throw new GeminiError("Upstream request failed.", 502);
  }

  if (!res.ok || !res.body) {
    // Classify on the HTTP status alone. The provider's error body is never
    // read or propagated: it can echo request content back, and the caller only
    // needs the status to decide between "retryable" and "fall back".
    let status = res.status;
    if (status === 0) status = 502;
    // Without this line a rejected model id or setting would silently turn
    // every answer into the fallback. It logs the model and the status only:
    // never the key, the response body, or anything the visitor typed.
    console.warn(`[assistant] Gemini ${GEMINI_MODEL} returned HTTP ${status}; serving the grounded fallback`);
    throw new GeminiError(`Upstream error (${status}).`, status || 502);
  }
  return res;
}

/**
 * Stream a grounded completion from Gemini: yields text deltas and returns how
 * the stream ended. Throws GeminiError on a missing key, a network failure, a
 * non-OK status (quota 429, server 5xx, a rejected model), or a prompt Google
 * blocks outright — every case where the caller should serve its fallback.
 */
export async function* streamGemini(args: StreamArgs): AsyncGenerator<string, StreamOutcome> {
  const res = await post(
    "streamGenerateContent?alt=sse",
    {
      systemInstruction: { parts: [{ text: args.systemInstruction }] },
      contents: toContents(args.messages),
      generationConfig: { maxOutputTokens: args.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS, thinkingConfig: THINKING },
      // Keep safety at defaults; content is professional Q&A about a portfolio.
    },
    args.signal,
  );

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finishReason: string | undefined;
  let promptTokens: number | undefined;
  let outputTokens: number | undefined;
  let thinkingTokens: number | undefined;
  const outcome = (): StreamOutcome => ({ finish: classify(finishReason), promptTokens, outputTokens, thinkingTokens });

  // The data lines of the event being read. An event's payload is usually one
  // `data:` line of JSON, but SSE lets it span several (joined with "\n"), so a
  // line that does not parse alone waits for the rest of its event.
  let pending: string[] = [];

  /** The chunk the pending data lines make, "done", or null while they are still partial. */
  const takePending = (final: boolean): Chunk | "done" | null => {
    if (pending.length === 0) return null;
    const payload = pending.join("\n");
    if (payload === "[DONE]") {
      pending = [];
      return "done";
    }
    const chunk = parseChunk(payload);
    if (chunk || final) {
      pending = [];
      return chunk;
    }
    // A complete event after a stray partial line: read it, and drop the stray.
    const alone = pending.length > 1 ? parseChunk(pending[pending.length - 1]!) : null;
    if (alone) pending = [];
    return alone;
  };

  /** One chunk's text, after recording its finish reason and token counts. */
  function* consume(chunk: Chunk): Generator<string> {
    // A blocked prompt arrives as feedback with no candidates at all.
    if (chunk.promptFeedback?.blockReason) throw new GeminiError("Prompt blocked.", 502);
    const candidate = chunk.candidates?.[0];
    if (candidate?.finishReason) finishReason = candidate.finishReason;
    if (chunk.usageMetadata) {
      promptTokens = chunk.usageMetadata.promptTokenCount ?? promptTokens;
      outputTokens = chunk.usageMetadata.candidatesTokenCount ?? outputTokens;
      thinkingTokens = chunk.usageMetadata.thoughtsTokenCount ?? thinkingTokens;
    }
    const text = textOf(chunk);
    if (text) yield text;
  }

  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });

      // Every complete line, and once the stream has ended, the last one too:
      // the final event (often the rest of the answer and its finish reason)
      // may arrive without a closing newline, and dropping it would cut the
      // answer short while it still looked complete.
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1 || (done && buffer.length > 0)) {
        const end = idx === -1 ? buffer.length : idx;
        const line = buffer.slice(0, end).replace(/\r$/, "");
        buffer = buffer.slice(end + 1);
        // A blank line ends an event; other fields (`event:`, `id:`, comments) carry nothing here.
        if (line.trim() === "") {
          const chunk = takePending(true);
          if (chunk === "done") return outcome();
          if (chunk) yield* consume(chunk);
          continue;
        }
        if (!line.startsWith("data:")) continue;
        pending.push(line.slice(5).trim());
        const chunk = takePending(false);
        if (chunk === "done") return outcome();
        if (chunk) yield* consume(chunk);
      }
      if (done) break;
    }
    const last = takePending(true);
    if (last && last !== "done") yield* consume(last);
  } finally {
    reader.releaseLock();
  }
  return outcome();
}

export type JsonArgs = {
  systemInstruction: string;
  prompt: string;
  /** The JSON shape the answer must take (Gemini's OpenAPI-style schema). */
  schema: Record<string, unknown>;
  maxOutputTokens: number;
  signal?: AbortSignal;
};

/** A JSON answer's raw text, with how the call ended. */
export type JsonOutcome = StreamOutcome & { text: string };

/**
 * One small, non-streaming call that must answer JSON. Returns the raw text;
 * the caller validates it, so a malformed answer is just an answer it rejects.
 * Throws GeminiError on the same failures as `streamGemini`.
 */
export async function generateJson(args: JsonArgs): Promise<JsonOutcome> {
  const res = await post(
    "generateContent",
    {
      systemInstruction: { parts: [{ text: args.systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: args.prompt }] }],
      generationConfig: {
        maxOutputTokens: args.maxOutputTokens,
        responseMimeType: "application/json",
        responseSchema: args.schema,
        thinkingConfig: THINKING,
      },
    },
    args.signal,
  );
  let chunk: Chunk | null;
  try {
    chunk = parseChunk(await res.text());
  } catch {
    throw new GeminiError("Upstream response unreadable.", 502);
  }
  if (!chunk) throw new GeminiError("Upstream response unreadable.", 502);
  if (chunk.promptFeedback?.blockReason) throw new GeminiError("Prompt blocked.", 502);
  return {
    text: textOf(chunk),
    finish: classify(chunk.candidates?.[0]?.finishReason),
    promptTokens: chunk.usageMetadata?.promptTokenCount,
    outputTokens: chunk.usageMetadata?.candidatesTokenCount,
  };
}
