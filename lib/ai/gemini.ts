// -----------------------------------------------------------------------------
// Minimal Google Gemini streaming client (generativelanguage REST API).
//
// Uses `streamGenerateContent` with `alt=sse` to receive server-sent chunks and
// yields plain text deltas. No SDK dependency. The API key is read from
// process.env server-side only and is NEVER included in any thrown error or log.
// -----------------------------------------------------------------------------

import type { ChatMessage } from "./guard";

// gemini-2.5-flash is the current free-tier flash model. gemini-2.0-flash was
// moved to a 0-quota free tier, so it 429s immediately — do not revert.
const MODEL = "gemini-2.5-flash";
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

  const url = `${BASE}/${MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`;

  const body = {
    systemInstruction: { parts: [{ text: args.systemInstruction }] },
    contents: toContents(args.messages),
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 800,
      topP: 0.9,
      // 2.5-flash defaults to a thinking budget; grounded Q&A doesn't need it,
      // and it would burn free-tier tokens + add latency. Disable it.
      thinkingConfig: { thinkingBudget: 0 },
    },
    // Keep safety at defaults; content is professional Q&A about a portfolio.
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: args.signal,
    });
  } catch {
    // Network / abort — surface a generic message (never the URL, which holds the key).
    throw new GeminiError("Upstream request failed.", 502);
  }

  if (!res.ok || !res.body) {
    // Read a bounded amount of the error body for classification, but do NOT
    // propagate provider text verbatim to the client.
    let status = res.status;
    if (status === 0) status = 502;
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
              content?: { parts?: { text?: string }[] };
              finishReason?: string;
            }[];
          };
          const parts = json.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const p of parts) {
              if (p.text) yield p.text;
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
