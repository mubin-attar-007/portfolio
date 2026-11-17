import { createHash, randomBytes } from "node:crypto";
import { ASSISTANT_DAILY_CAP } from "@/lib/env";

// -----------------------------------------------------------------------------
// Best-effort abuse limits for the assistant, held in one server instance's
// memory.
//
// Three limits, all per instance: on serverless every warm instance keeps its
// own counters, and a restart clears them. They bound what one client can do
// to one instance; they are not a global ceiling. The real ceilings live
// outside the function — a quota or budget cap on the Gemini key's Google
// Cloud project, and a platform firewall rule (DEPLOY.md §3).
//
//   1. A sliding window of MAX_REQUESTS per WINDOW_MS per client.
//   2. CLIENT_DAILY_LIVE_ANSWERS model calls per client per UTC day, so one
//      client cannot spend the shared budget for every other visitor.
//   3. ASSISTANT_DAILY_CAP model calls per UTC day for the instance.
//
// A client is a salted SHA-256 of its address, never the address itself. The
// salt is random per process, so a key means nothing outside this instance
// and nothing after it restarts.
// -----------------------------------------------------------------------------

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 15; // per client per window

/**
 * Model calls one client may cause per UTC day. Past it, the client still gets
 * grounded site-search answers; only live synthesis stops until midnight UTC.
 */
export const CLIENT_DAILY_LIVE_ANSWERS = 30;

/** Max Gemini generation calls per UTC day, per instance (ASSISTANT_DAILY_CAP). */
export const GEMINI_DAILY_BUDGET = ASSISTANT_DAILY_CAP;

/**
 * Most clients tracked for the daily allowance. A flood of fresh addresses
 * evicts the oldest entries instead of growing the map without bound.
 */
const MAX_TRACKED_CLIENTS = 10_000;

const MS_PER_DAY = 86_400_000;

/** Random per process: a client key cannot be reversed or matched elsewhere. */
const SALT = randomBytes(16).toString("hex");

// ---------------------------------------------------------------------------
// Client keys
// ---------------------------------------------------------------------------

/** A salted, truncated SHA-256 of a client address. */
function hashClient(address: string): string {
  return createHash("sha256").update(`${SALT}:${address}`).digest("hex").slice(0, 32);
}

/**
 * Derive the client key from a request's forwarding headers: a salted hash of
 * the address the platform saw. Falls back to one shared key when no address
 * is present (dev / direct). The address itself is never stored or logged.
 *
 * Trust order matters: the LEFTMOST `x-forwarded-for` entry is fully
 * client-controlled (an attacker can send `X-Forwarded-For: 1.2.3.4` to forge a
 * fresh bucket per request and defeat the limiter), so it is never used.
 *   1. `x-real-ip`               — Vercel sets this to the real client IP.
 *   2. `x-vercel-forwarded-for`  — platform header; first entry is the client.
 *   3. LAST hop of `x-forwarded-for` — the entry appended by the trusted proxy
 *      nearest us, not the spoofable leftmost one.
 *   4. "unknown"                 — dev / direct; a shared key.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  return hashClient(clientAddress(headers));
}

function clientAddress(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;

  const vercel = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;

  const hops = headers.get("x-forwarded-for")?.split(",") ?? [];
  for (let i = hops.length - 1; i >= 0; i--) {
    const hop = hops[i]?.trim();
    if (hop) return hop;
  }
  return "unknown";
}

// ---------------------------------------------------------------------------
// 1) Per-minute window
// ---------------------------------------------------------------------------

type Bucket = number[]; // ascending request timestamps (ms)

const buckets = new Map<string, Bucket>();

// Opportunistic global prune so the map can't grow unbounded over a long-lived
// process. Runs at most once per pruning interval.
let lastPrune = 0;
const PRUNE_INTERVAL_MS = 5 * WINDOW_MS;

function prune(now: number): void {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, timestamps] of buckets) {
    const kept = timestamps.filter((t) => now - t < WINDOW_MS);
    if (kept.length === 0) buckets.delete(key);
    else buckets.set(key, kept);
  }
}

export type RateResult = {
  allowed: boolean;
  /** seconds until the client may retry (only meaningful when !allowed) */
  retryAfterSec: number;
  remaining: number;
};

/** Record a request for `key` and report whether it is within the window. */
export function checkRateLimit(key: string, now: number = Date.now()): RateResult {
  prune(now);

  const recent = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0]!; // length >= MAX_REQUESTS >= 1
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    buckets.set(key, recent);
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true, retryAfterSec: 0, remaining: MAX_REQUESTS - recent.length };
}

// ---------------------------------------------------------------------------
// 2 + 3) Daily model calls: per client, and for the instance
// ---------------------------------------------------------------------------

let day = -1; // floor(now / MS_PER_DAY); -1 forces initialisation
let instanceCalls = 0;
const clientCalls = new Map<string, number>();

/** Reset every daily counter when the UTC day changes. */
function rollDay(now: number): void {
  const today = Math.floor(now / MS_PER_DAY);
  if (today === day) return;
  day = today;
  instanceCalls = 0;
  clientCalls.clear();
}

/** Why a live answer was refused, or "ok" when one was reserved. */
export type LiveAnswerReservation = "ok" | "client-allowance-reached" | "daily-budget-reached";

/**
 * Reserve one model call for `key`: within the client's daily allowance and
 * the instance's daily budget. Both counters move together or not at all, so
 * a refused reservation never spends either. Call it immediately before the
 * model call; on anything but "ok", serve the grounded fallback instead.
 */
export function reserveLiveAnswer(key: string, now: number = Date.now()): LiveAnswerReservation {
  rollDay(now);
  const used = clientCalls.get(key) ?? 0;
  if (used >= CLIENT_DAILY_LIVE_ANSWERS) return "client-allowance-reached";
  if (instanceCalls >= GEMINI_DAILY_BUDGET) return "daily-budget-reached";
  instanceCalls += 1;
  // Re-inserted so the map's insertion order stays least-recently-used first.
  clientCalls.delete(key);
  clientCalls.set(key, used + 1);
  if (clientCalls.size > MAX_TRACKED_CLIENTS) {
    const oldest = clientCalls.keys().next().value;
    if (oldest !== undefined) clientCalls.delete(oldest);
  }
  return "ok";
}
