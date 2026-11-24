// Tests for streamGemini's reading of the SSE stream (lib/ai/gemini.ts), with
// fetch mocked: raw bytes in, text and the finish reason out. A dummy key is
// set so the client gets as far as fetch; nothing leaves the machine.

import test, { after, before } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_MAX_OUTPUT_TOKENS, streamGemini, type StreamOutcome } from "../lib/ai/gemini.ts";

const realFetch = globalThis.fetch;
const realKey = process.env.GEMINI_API_KEY;

before(() => {
  process.env.GEMINI_API_KEY = "test-key-not-real";
});
after(() => {
  globalThis.fetch = realFetch;
  if (realKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = realKey;
});

/** The last request body sent, parsed. */
let lastBody: { generationConfig?: { maxOutputTokens?: number } } = {};

/** fetch answering with these byte chunks as the response body. */
function serve(chunks: readonly string[]): void {
  globalThis.fetch = (async (_url: unknown, init?: { body?: string }) => {
    lastBody = JSON.parse(init?.body ?? "{}");
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    });
    return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
  }) as typeof fetch;
}

/** Everything the stream yields, and how it ended. */
async function read(): Promise<{ text: string; outcome: StreamOutcome }> {
  const generator = streamGemini({ systemInstruction: "rules", messages: [{ role: "user", content: "q" }] });
  let text = "";
  for (;;) {
    const step = await generator.next();
    if (step.done) return { text, outcome: step.value };
    text += step.value;
  }
}

const event = (text: string, finishReason?: string) =>
  JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, ...(finishReason ? { finishReason } : {}) }] });

test("events separated by blank lines are read in order, with the finish reason", async () => {
  serve([`data: ${event("Hello ")}\r\n\r\n`, `data: ${event("world.", "STOP")}\r\n\r\n`]);
  const { text, outcome } = await read();
  assert.equal(text, "Hello world.");
  assert.equal(outcome.finish, "stop");
});

test("a last event without a closing newline is still read: the answer is not cut short", async () => {
  // The regression: the final event, holding the rest of the answer and STOP,
  // arrived without a trailing newline and was dropped, so the answer stopped
  // mid-sentence while the stream looked finished.
  serve([`data: ${event("- Build evaluation pipelines")}\r\n\r\n`, `data: ${event(": Shown.", "STOP")}`]);
  const { text, outcome } = await read();
  assert.equal(text, "- Build evaluation pipelines: Shown.");
  assert.equal(outcome.finish, "stop");
});

test("an event whose JSON spans several data lines, or several network chunks, is joined", async () => {
  const json = event("Joined text.", "STOP");
  const middle = Math.floor(json.length / 2);
  serve([`data: ${json.slice(0, middle)}\n`, `data: ${json.slice(middle)}\n\n`]);
  assert.deepEqual(await read(), {
    text: "Joined text.",
    outcome: { finish: "stop", promptTokens: undefined, outputTokens: undefined, thinkingTokens: undefined },
  });
  // Split mid-line across reads, and mid-character for a multi-byte letter.
  serve([`data: ${event("Résumé")}`.slice(0, 30), `data: ${event("Résumé", "STOP")}`.slice(30) + "\n\n"]);
  assert.equal((await read()).text, "Résumé");
});

test("the output ceiling is the measured default unless a call asks for more; thinking tokens are reported", async () => {
  const usage = JSON.stringify({
    candidates: [{ content: { parts: [{ text: "Done." }] }, finishReason: "MAX_TOKENS" }],
    usageMetadata: { promptTokenCount: 900, candidatesTokenCount: 40, thoughtsTokenCount: 760 },
  });
  serve([`data: ${usage}\r\n\r\n`]);
  const { outcome } = await read();
  assert.equal(lastBody.generationConfig?.maxOutputTokens, DEFAULT_MAX_OUTPUT_TOKENS);
  assert.deepEqual(outcome, { finish: "max-tokens", promptTokens: 900, outputTokens: 40, thinkingTokens: 760 });
  serve([`data: ${event("Done.", "STOP")}\r\n\r\n`]);
  const generator = streamGemini({ systemInstruction: "rules", messages: [{ role: "user", content: "q" }], maxOutputTokens: 2048 });
  while (!(await generator.next()).done);
  assert.equal(lastBody.generationConfig?.maxOutputTokens, 2048);
});

test("a stream that ends with no finish reason reports it as unknown", async () => {
  serve([`data: ${event("Partial answer")}\r\n\r\n`]);
  const { text, outcome } = await read();
  assert.equal(text, "Partial answer");
  assert.equal(outcome.finish, "unknown");
});
