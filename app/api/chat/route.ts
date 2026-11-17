// -----------------------------------------------------------------------------
// POST /api/chat — the grounded portfolio assistant (spec/AI_ASSISTANT.md §4).
//
// This file is the HTTP adapter only. The pipeline — request screening, rate
// limits, injection screening, retrieval, the live model call and its grounded
// fallback — lives in lib/ai/chat-handler.ts, where tests can drive it without
// a server. A route file may export only handlers and segment config.
// -----------------------------------------------------------------------------

import { handleChat } from "@/lib/ai/chat-handler";

// Inherently dynamic (reads the body and per-request headers) and on Node,
// because retrieval reads content files with `fs`. Never cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Seconds the platform allows one request. Longer than a routing call
 * (ROUTER_TIMEOUT_MS, 3.5 s) and the handler's own ANSWER_TIMEOUT_MS (25 s)
 * together, so the handler's timeout and fallback always run before the
 * platform stops the function. The panel waits longer still
 * (CLIENT_TIMEOUT_MS). Must stay a literal: Next reads segment config
 * statically.
 */
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  return handleChat(request);
}

function unsupportedMethodResponse(method: string): Response {
  return Response.json(
    {
      error: "method_not_allowed",
      message: `The ${method} method is not supported for this endpoint.`,
      hint: "Use POST with a JSON body containing messages.",
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Cache-Control": "no-store",
      },
    },
  );
}

// Reject non-POST verbs cleanly (no body reveal). OPTIONS answering 405 with no
// CORS headers is what makes a cross-site JSON request fail its preflight.
export async function GET(): Promise<Response> {
  return unsupportedMethodResponse("GET");
}

export async function PUT(): Promise<Response> {
  return unsupportedMethodResponse("PUT");
}

export async function PATCH(): Promise<Response> {
  return unsupportedMethodResponse("PATCH");
}

export async function DELETE(): Promise<Response> {
  return unsupportedMethodResponse("DELETE");
}

export async function OPTIONS(): Promise<Response> {
  return unsupportedMethodResponse("OPTIONS");
}

export async function HEAD(): Promise<Response> {
  return unsupportedMethodResponse("HEAD");
}
