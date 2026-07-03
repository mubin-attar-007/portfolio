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
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    // First hop is the client.
    const ip = fwd.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
