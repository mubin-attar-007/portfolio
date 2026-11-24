// -----------------------------------------------------------------------------
// What Google's Gemini API terms require of this site, for the tier its key runs
// on (Gemini API Additional Terms of Service; ADR-022).
//
// - Unpaid Services (the free tier): Google may use what is sent to improve its
//   products, and people may review it. And: "You may use only Paid Services
//   when making API Clients available to users in the European Economic Area,
//   Switzerland, or the United Kingdom."
// - Paid Services (billing enabled on the key's Google Cloud project): Google
//   does not use prompts or responses to improve its products, and the regional
//   rule does not apply.
//
// The route asks `liveAllowed` before any model call (the routing call and the
// answer), so on the free tier a visitor in those countries gets the grounded
// site-search answer instead. The privacy page, the panel's footer and the FAQ
// answer about privacy say what the tier means, and a test holds them to it.
//
// Switch to "paid" only once billing is enabled, and update content/faq.json's
// privacy answer in the same change (test/provider-terms.test.mts fails until
// it matches).
// -----------------------------------------------------------------------------

/** The Gemini API tier the site's key runs on. */
export const GEMINI_TIER: "free" | "paid" = "free";

/** The European Union's member states, as ISO 3166-1 alpha-2 codes. */
const EU = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
] as const;

/**
 * Where the free tier may not serve visitors: the European Economic Area (the
 * EU, Iceland, Liechtenstein and Norway), Switzerland and the United Kingdom.
 */
export const PAID_ONLY_COUNTRIES: ReadonlySet<string> = new Set([...EU, "IS", "LI", "NO", "CH", "GB"]);

/**
 * The visitor's country, as the platform reports it (Vercel sets
 * `x-vercel-ip-country` at its edge; a client cannot supply it), or null when
 * nothing reports one, as in local development.
 */
export function countryOf(headers: Headers): string | null {
  const code = headers.get("x-vercel-ip-country")?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

/** True when this request may get a model answer under the tier's terms. */
export function liveAllowed(headers: Headers, tier: "free" | "paid" = GEMINI_TIER): boolean {
  if (tier === "paid") return true;
  const country = countryOf(headers);
  return country === null || !PAID_ONLY_COUNTRIES.has(country);
}
