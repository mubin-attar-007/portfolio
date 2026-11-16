// -----------------------------------------------------------------------------
// Minimal Google Gemini streaming client (generativelanguage REST API).
//
// Uses `streamGenerateContent` with `alt=sse` to receive server-sent chunks and
// yields plain text deltas. No SDK dependency. The API key is read from
// process.env server-side only, sent as an `x-goog-api-key` header (never a
// query parameter), and is NEVER included in any thrown error or log.
//
// `args.signal` is forwarded to fetch, so a client disconnect stops generation
// upstream instead of burning quota on an answer nobody will read.
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

type GeminiPart = { text: string };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

/** Map our chat history to Gemini's contents (assistant → "model"). */
function toContents(messages: ChatMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export type StreamArgs = {
  systemInstruction: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
};

/**
 * Stream a grounded completion from Gemini. Async-generates text deltas.
 * Throws GeminiError on quota (429), server (5xx), missing key, or network fail
 * so the caller can trigger the graceful FAQ fallback.
 */
export async function* streamGemini(args: StreamArgs): AsyncGenerator<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiError("Assistant is not configured.", 503);
  }

  // The key goes in `x-goog-api-key`, never in the query string. Google accepts
  // either, but a URL-borne key ends up in access logs, error traces, and proxy
  // records — a header does not.
  const url = `${BASE}/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

  const body = {
    systemInstruction: { parts: [{ text: args.systemInstruction }] },
    contents: toContents(args.messages),
    generationConfig: {
      maxOutputTokens: 800,
      // Grounded Q&A over retrieved passages needs no reasoning pass; one would
      // only add latency and spend free-tier tokens. Gemini 3 replaces the
      // numeric thinking budget with a level, and MINIMAL ("little to no
      // thinking") is the nearest to the old budget of 0. It is 3.5 Flash-Lite's
      // default, stated so an override with a higher default keeps it too.
      // No temperature or topP: from 3.5 Flash-Lite on, Google deprecates the
      // sampling parameters (ignored now, an error in later models).
      // includeThoughts is false by default; it is stated so a later default
      // change cannot start returning reasoning parts (the parser below also
      // drops any part marked `thought`).
      thinkingConfig: { thinkingLevel: "MINIMAL", includeThoughts: false },
    },
    // Keep safety at defaults; content is professional Q&A about a portfolio.
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: args.signal,
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
    // every answer into the FAQ fallback. It logs the model and the status
    // only: never the key, the response body, or anything the visitor typed.
    console.warn(`[assistant] Gemini ${GEMINI_MODEL} returned HTTP ${status}; serving the grounded fallback`);
    throw new GeminiError(`Upstream error (${status}).`, status || 502);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by blank lines; each "data:" line is JSON.
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line || !line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const json = JSON.parse(payload) as {
            candidates?: {
              content?: { parts?: { text?: string; thought?: boolean }[] };
              finishReason?: string;
            }[];
          };
          const parts = json.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const p of parts) {
              // A thought part is the model's reasoning, never answer text.
              if (p.text && !p.thought) yield p.text;
            }
          }
        } catch {
          // Partial/non-JSON keep-alive frame — ignore and continue buffering.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
