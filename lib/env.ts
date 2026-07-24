/**
 * Runtime environment configuration used by production and local code paths.
 *
 * This file intentionally keeps parsing logic explicit and fail-safe:
 * - invalid optional values fall back to curated defaults
 * - all outputs are canonicalized to stable forms used across metadata, robots,
 *   sitemap, and OG routes
 */

const DEFAULT_SITE_URL = "https://mubin-attar.vercel.app";
const DEFAULT_DAILY_CAP = 500;
const MAX_DAILY_CAP = 20_000;
const MIN_DAILY_CAP = 1;

/**
 * Read `NEXT_PUBLIC_SITE_URL` and return a canonical origin (no path/query, no
 * trailing slash).
 *
 * Examples:
 * - `"https://example.com/app"` -> `"https://example.com"`
 * - `"example.com"` -> `"https://example.com"`
 * - `""` / invalid -> `"https://mubin-attar.vercel.app"`
 *
 * We do not fail fast on missing/invalid public env vars because this value is
 * optional and must not block local preview.
 */
function coerceSiteUrl(rawUrl: string | undefined): string {
  const value = rawUrl?.trim();
  if (!value) return DEFAULT_SITE_URL;

  const normalized = /^(https?:\/\/)/i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(normalized);
    return parsed.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

/**
 * Parse a strictly-positive integer env value with a safe clamp.
 *
 * `ASSISTANT_DAILY_CAP` bounds per-instance Gemini budget checks in
 * `lib/ai/rate-limit.ts`. Invalid values are treated as the default to avoid
 * introducing accidental hard breaks from non-production-safe env editing.
 */
function coerceDailyCap(rawValue: string | undefined): number {
  const value = rawValue?.trim();
  if (!value) return DEFAULT_DAILY_CAP;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) return DEFAULT_DAILY_CAP;
  if (parsed < MIN_DAILY_CAP) return MIN_DAILY_CAP;
  if (parsed > MAX_DAILY_CAP) return MAX_DAILY_CAP;
  return parsed;
}

/** Canonical public site origin used throughout metadata, sitemap and robots. */
export const SITE_URL = coerceSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/** Adjustable per-instance Gemini call cap; defaults to free-tier-safe 500. */
export const ASSISTANT_DAILY_CAP = coerceDailyCap(process.env.ASSISTANT_DAILY_CAP);
