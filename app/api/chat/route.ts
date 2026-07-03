// -----------------------------------------------------------------------------
// POST /api/chat — the grounded portfolio assistant.
//
// Pipeline:
//   1. Rate-limit by client IP (in-memory sliding window, 15/min) → 429.
//   2. Validate + sanitize { messages }; cap length; screen prompt-injection.
//      Injection / config attempts get a polite refusal — the model is NOT called.
//   3. Retrieve top-k real passages for the latest user message (network-free).
//   4. Stream a grounded Gemini synthesis over SSE, then emit the citations.
//   5. On ANY Gemini error/quota → GRACEFUL FALLBACK: stream the single best
//      retrieved FAQ answer verbatim + its citation. Never 500 to the user.
//
// The API key is server-side only and never logged or returned. No PII logged.
// -----------------------------------------------------------------------------

import { retrieve, fallbackAnswer } from "@/lib/ai/retrieval";
import { buildSystemInstruction } from "@/lib/ai/system-prompt";
import { streamGemini } from "@/lib/ai/gemini";
import {
  sanitizeMessages,
  looksLikeInjection,
  INJECTION_REFUSAL,
} from "@/lib/ai/guard";
import {
  checkRateLimit,
  clientKeyFromHeaders,
  consumeGeminiBudget,
} from "@/lib/ai/rate-limit";

// This route is inherently dynamic (reads the body + per-request headers) and
// must run on Node (uses fs at retrieval import). Never cache.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---- SSE framing -----------------------------------------------------------

type Citation = { source: string };

const enc = new TextEncoder();

/** Encode a named SSE event with a JSON payload. */
function sse(event: string, data: unknown): Uint8Array {
  return enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/** A one-shot stream that emits a single text answer + citation + meta. */
function staticStream(opts: {
  text: string;
  citations: Citation[];
  mode: "fallback" | "refusal";
  note?: string;
}): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(sse("meta", { mode: opts.mode, note: opts.note ?? null }));
      controller.enqueue(sse("token", { text: opts.text }));
      controller.enqueue(sse("sources", { citations: opts.citations }));
      controller.enqueue(sse("done", {}));
      controller.close();
    },
  });
}

function sseResponse(body: ReadableStream<Uint8Array>, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Defeat proxy buffering so tokens flush as they arrive.
      "X-Accel-Buffering": "no",
    },
  });
}

// ---- Handler ---------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // 1) Rate limit.
  const key = clientKeyFromHeaders(request.headers);
  const rl = checkRateLimit(key);
  if (!rl.allowed) {
    return sseResponse(
      staticStream({
        text:
          "You're sending messages a little too fast. Give it a few seconds and ask again — " +
          "I'll be right here.",
        citations: [],
        mode: "fallback",
        note: "rate-limited",
      }),
    );
  }

  // 2) Parse + sanitize.
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    input = null;
  }
  const sanitized = sanitizeMessages(input);
  if (!sanitized.ok) {
    const text =
      sanitized.reason === "too-long"
        ? "That message is a bit long for me — could you trim it to the essentials and ask again?"
        : "I didn't catch a question there. Try asking about Mubin's shipped work, a project's architecture, or his experience.";
    return sseResponse(
      staticStream({ text, citations: [], mode: "fallback", note: sanitized.reason }),
    );
  }

  const { messages, latestUser } = sanitized;

  // 3) Prompt-injection screen — refuse without calling the model. We screen
  // the latest turn AND the concatenation of recent user turns, so an attacker
  // can't split a pattern (e.g. "ignore all previous" / "instructions") across
  // two messages to slip past the single-message regex. Best-effort only — the
  // system prompt remains the real defense.
  const recentUserText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");
  if (looksLikeInjection(latestUser) || looksLikeInjection(recentUserText)) {
    return sseResponse(
      staticStream({
        text: INJECTION_REFUSAL,
        citations: [],
        mode: "refusal",
        note: "injection-screened",
      }),
    );
  }

  // 4) Retrieve grounded context for the latest user turn.
  const passages = retrieve(latestUser, { k: 4 });
  const citations: Citation[] = passages.map((p) => ({ source: p.source }));
  const systemInstruction = buildSystemInstruction(passages);

  // 4b) Global daily cost cap. If the shared-with-dbwhisper Gemini budget is
  // exhausted for the day, skip the model entirely and serve the grounded
  // retrieval fallback (still cited, never a 500). This is a real ceiling on
  // spend and isolates dbwhisper's quota from any burst here. Consuming a unit
  // here (rather than just peeking) also counts this served turn against the
  // budget so the cap can't be nibbled around by rapid retries.
  if (!consumeGeminiBudget()) {
    const fb = fallbackAnswer(latestUser);
    if (fb) {
      return sseResponse(
        staticStream({
          text:
            "*(High demand right now — here's the most relevant answer from Mubin's own content.)*\n\n" +
            fb.answer,
          citations: [{ source: fb.citation }],
          mode: "fallback",
          note: "daily-budget-reached",
        }),
      );
    }
    return sseResponse(
      staticStream({
        text:
          "I'm at my usage cap for the moment and couldn't find a matching answer on the site. " +
          "Try asking about what Mubin has shipped in production, the DBWhisper architecture, or his healthcare-AI experience.",
        citations: [],
        mode: "fallback",
        note: "daily-budget-reached",
      }),
    );
  }

  // 5) Stream Gemini; fall back to the best FAQ answer on any error/quota.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let produced = false;
      try {
        controller.enqueue(sse("meta", { mode: "live", note: null }));
        for await (const delta of streamGemini({ systemInstruction, messages })) {
          if (delta) {
            produced = true;
            controller.enqueue(sse("token", { text: delta }));
          }
        }
        // Attach the citations actually used for grounding.
        controller.enqueue(sse("sources", { citations }));
        controller.enqueue(sse("done", {}));
        controller.close();
      } catch {
        // GRACEFUL FALLBACK. If nothing was streamed yet, emit the best FAQ
        // answer verbatim + its citation. If some tokens already went out, we
        // still close cleanly with whatever citations we have.
        if (!produced) {
          const fb = fallbackAnswer(latestUser);
          // Re-signal that this turn is a fallback so the UI can label it.
          controller.enqueue(
            sse("meta", { mode: "fallback", note: "live-assistant-busy" }),
          );
          if (fb) {
            controller.enqueue(
              sse("token", {
                text:
                  "*(The live assistant is busy right now — here's the most relevant answer from Mubin's FAQ.)*\n\n" +
                  fb.answer,
              }),
            );
            controller.enqueue(sse("sources", { citations: [{ source: fb.citation }] }));
          } else {
            controller.enqueue(
              sse("token", {
                text:
                  "The live assistant is busy at the moment and I couldn't find a matching answer on the site. " +
                  "Try asking about what Mubin has shipped in production, the DBWhisper architecture, or his healthcare-AI experience.",
              }),
            );
            controller.enqueue(sse("sources", { citations: [] }));
          }
        } else {
          controller.enqueue(sse("sources", { citations }));
        }
        controller.enqueue(sse("done", {}));
        controller.close();
      }
    },
  });

  return sseResponse(stream);
}

// Reject non-POST verbs cleanly (no body reveal).
export async function GET(): Promise<Response> {
  return new Response("Method Not Allowed", { status: 405 });
}
