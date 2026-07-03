// -----------------------------------------------------------------------------
// In-memory sliding-window rate limiter, keyed by client IP.
//
// Intentionally simple and dependency-free. On serverless this is per-instance
// (not globally shared), which is acceptable for a portfolio: it curbs abusive
// bursts from a single client without external infra. No PII is stored — only
// a coarse IP key and request timestamps, held in memory and pruned.
// -----------------------------------------------------------------------------

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 15; // per IP per window

type Bucket = number[]; // ascending request timestamps (ms)

const buckets = new Map<string, Bucket>();

// Opportunistic global prune so the map can't grow unbounded over a long-lived
// process. Runs at most once per pruning interval.
let lastPrune = 0;
const PRUNE_INTERVAL_MS = 5 * WINDOW_MS;

function prune(now: number): void {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, ts] of buckets) {
    const kept = ts.filter((t) => now - t < WINDOW_MS);
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

// -----------------------------------------------------------------------------
// Global daily budget (cost cap) for Gemini generation calls.
//
// The per-IP limiter above can't fully bound abuse on serverless (it's
// per-instance, and IPs rotate), and the Gemini key is SHARED with dbwhisper —
// so runaway calls here could starve dbwhisper's quota. This is a hard-ish
// ceiling: a module-level counter of generation calls that resets on UTC-day
// change. When it's exhausted the route stops calling Gemini and serves the
// grounded retrieval fallback only (still cited, never a 500).
//
// RESIDUAL (documented, not solved here): on serverless this counter lives in a
// single instance's memory, so with N warm instances the true global cap is up
// to N × GEMINI_DAILY_BUDGET. It still bounds any ONE instance and dramatically
// lowers the blast radius vs. no cap. A globally-exact cap would need shared
// state (KV/Redis), which this dependency-free portfolio intentionally avoids.
// -----------------------------------------------------------------------------

/** Max Gemini generation calls per UTC day, per instance. Tuned to free-tier. */
export const GEMINI_DAILY_BUDGET = 500;

let dailyCount = 0;
let dailyEpochDay = -1; // floor(now / 86_400_000); -1 forces first-call init

const MS_PER_DAY = 86_400_000;

/** Roll the counter over when the UTC day changes. */
function rollDay(now: number): void {
  const day = Math.floor(now / MS_PER_DAY);
  if (day !== dailyEpochDay) {
    dailyEpochDay = day;
    dailyCount = 0;
  }
}

/**
 * Report whether the global daily Gemini budget still has headroom, WITHOUT
 * consuming it. The route checks this before deciding to call Gemini vs. serve
 * the retrieval fallback.
 */
export function geminiBudgetAvailable(now: number = Date.now()): boolean {
  rollDay(now);
  return dailyCount < GEMINI_DAILY_BUDGET;
}

/**
 * Consume one unit of the global daily Gemini budget. Call this immediately
 * before actually invoking Gemini. Returns true if the call is within budget
 * (and was counted); false if the budget is exhausted (call should be skipped).
 */
export function consumeGeminiBudget(now: number = Date.now()): boolean {
  rollDay(now);
  if (dailyCount >= GEMINI_DAILY_BUDGET) return false;
  dailyCount += 1;
  return true;
}

/** Record a request for `key` and report whether it's within the window budget. */
export function checkRateLimit(key: string, now: number = Date.now()): RateResult {
  prune(now);

  const bucket = buckets.get(key) ?? [];
  // Drop timestamps outside the window.
  const recent = bucket.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0];
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    buckets.set(key, recent);
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true, retryAfterSec: 0, remaining: MAX_REQUESTS - recent.length };
}

/**
 * Derive a coarse client key from a request's forwarding headers. Falls back to
 * a shared bucket when no IP is present (dev / direct). Never logged.
 *
 * Trust order matters: the LEFTMOST `x-forwarded-for` entry is fully
 * client-controlled (an attacker can send `X-Forwarded-For: 1.2.3.4` to forge a
 * fresh bucket per request and defeat the limiter), so we NEVER key on it.
 * Instead we prefer headers our trusted proxy sets:
 *   1. `x-real-ip`               — Vercel sets this to the real client IP.
 *   2. `x-vercel-forwarded-for`  — platform header; first entry is the client.
 *   3. LAST hop of `x-forwarded-for` — the entry appended by our trusted proxy
 *      (the rightmost hop), not the spoofable leftmost one.
 *   4. "unknown"                 — dev / direct; a shared bucket.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const real = headers.get("x-real-ip");
  if (real?.trim()) return real.trim();

  const vercelFwd = headers.get("x-vercel-forwarded-for");
  if (vercelFwd) {
    const ip = vercelFwd.split(",")[0]?.trim();
    if (ip) return ip;
  }

  // Fall back to the LAST (rightmost) XFF hop — the one appended by the trusted
  // proxy nearest us. The leftmost entries are attacker-supplied and ignored.
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",");
    for (let i = parts.length - 1; i >= 0; i--) {
      const ip = parts[i]?.trim();
      if (ip) return ip;
    }
  }

  return "unknown";
}
