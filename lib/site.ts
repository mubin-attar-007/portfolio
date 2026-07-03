// Canonical site origin — the single source of truth for absolute URLs across
// metadata, canonicals, sitemap, robots, JSON-LD, and OG image cards.
//
// Overridable per-deploy via NEXT_PUBLIC_SITE_URL (e.g. a preview or custom
// domain) so canonicals/OG never point at production from a preview build.
// Falls back to the live Vercel domain. Any trailing slash is stripped so
// `${SITE}/work` never doubles up.

const FALLBACK = "https://mubin-attar.vercel.app";

/** Absolute origin, no trailing slash. */
export const SITE: string = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK).replace(/\/+$/, "");

/** Absolute URL for a site-relative path (leading slash optional). */
export function url(path = ""): string {
  if (!path) return SITE;
  return `${SITE}/${path.replace(/^\/+/, "")}`;
}
