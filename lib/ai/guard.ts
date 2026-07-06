// -----------------------------------------------------------------------------
// Input validation, sanitization, and prompt-injection screening for the
// chatbot route. Pure functions, no I/O — trivially testable.
// -----------------------------------------------------------------------------

/** Max characters accepted for a single user message. */
export const MAX_MESSAGE_CHARS = 1000;

/** Max turns of history we keep/forward (keeps prompts + cost bounded). */
export const MAX_HISTORY_TURNS = 8;

export type ChatRole = "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export type SanitizeResult =
  | { ok: true; messages: ChatMessage[]; latestUser: string }
  | { ok: false; reason: "empty" | "too-long" | "malformed" };

/**
 * Validate + trim an incoming { messages } payload. Caps message length,
 * bounds history, coerces roles, and returns the latest user message.
 */
export function sanitizeMessages(input: unknown): SanitizeResult {
  if (!input || typeof input !== "object" || !("messages" in input)) {
    return { ok: false, reason: "malformed" };
  }
  const raw = (input as { messages: unknown }).messages;
  if (!Array.isArray(raw)) return { ok: false, reason: "malformed" };

  // Track the normalized (whitespace-collapsed) length of the latest user turn
  // so the too-long check measures the SAME string we forward — a message that
  // only exceeds the cap because of runs of whitespace shouldn't be rejected.
  let latestUserNormalizedLen = 0;

  const cleaned: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.replace(/\s+/g, " ").trim();
    if (!trimmed) continue;
    if (role === "user") latestUserNormalizedLen = trimmed.length;
    cleaned.push({ role, content: trimmed.slice(0, MAX_MESSAGE_CHARS) });
  }

  if (cleaned.length === 0) return { ok: false, reason: "empty" };

  // Keep only the last N turns.
  const bounded = cleaned.slice(-MAX_HISTORY_TURNS);

  // The latest message must be from the user.
  const last = bounded[bounded.length - 1];
  if (last.role !== "user") return { ok: false, reason: "malformed" };

  // Reject a genuinely over-long latest user message. Measure the NORMALIZED
  // (whitespace-collapsed) length — the same string we forward — so a message
  // that fits once redundant whitespace is collapsed isn't wrongly rejected.
  if (latestUserNormalizedLen > MAX_MESSAGE_CHARS) {
    return { ok: false, reason: "too-long" };
  }

  return { ok: true, messages: bounded, latestUser: last.content };
}

// ---------------------------------------------------------------------------
// Prompt-injection screening
// ---------------------------------------------------------------------------

/**
 * Obvious prompt-injection / jailbreak patterns. We DON'T try to catch every
 * possible attack (the system prompt itself is the real defense) — this is a
 * cheap first gate that refuses the blatant ones without spending LLM quota.
 */
const INJECTION_PATTERNS: RegExp[] = [
  // Allow any run of qualifier words between the verb and the object so the
  // canonical "ignore all previous instructions" (two qualifiers) is caught.
  /ignore\s+(?:(?:all|your|the|previous|above|prior|any|these|those)\s+)*(instructions|rules|prompt|context|guidelines)/i,
  /disregard\s+(?:(?:all|your|the|previous|above|prior|any|these|those)\s+)*(instructions|rules|prompt|context|guidelines)/i,
  /forget\s+(?:(?:all|your|the|previous|above|prior|any|everything|these|those)\s+)*(instructions|rules|prompt|above|context)/i,
  /(reveal|show|print|repeat|expose|leak|output|tell me) (me )?(your |the )?(system )?(prompt|instructions|rules)/i,
  /what (is|are) your (system )?(prompt|instructions)/i,
  /you are (now|no longer)\b/i,
  /(act|behave|pretend|roleplay) as (?!mubin|the assistant)/i,
  /\b(dan mode|developer mode|jailbreak|do anything now)\b/i,
  /system prompt/i,
  /override (your |the )?(instructions|rules|safety|guardrails)/i,
  /new (instructions|rules|system prompt)\s*:/i,
];

/** True if the message looks like a prompt-injection / jailbreak attempt. */
export function looksLikeInjection(message: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(message));
}

/** The polite refusal streamed back when injection is detected. */
export const INJECTION_REFUSAL =
  "I can only answer questions about Mubin Attar and his work, grounded in the real content on this site — I can't change those rules or share my instructions. " +
  "Happy to help with something like **what he's shipped in production**, **the DBWhisper architecture**, or **his healthcare-AI experience**.";
