/**
 * The site's security response headers, in one place for every host:
 * next.config.ts serves them on Vercel (and the local production server), and
 * scripts/stage-sites-build.mjs bakes them into the static Cloudflare copy's
 * Worker, so the two can never drift. Plain erasable TypeScript, so Node can
 * load it without a build step.
 *
 * Content-Security-Policy. No nonces: a nonce must be minted per request, which
 * would opt every route out of static rendering, so 'unsafe-inline' is the
 * price of keeping the whole site static:
 *   script-src:  Next's inline bootstrap scripts.
 *   style-src:   React `style={{…}}` attributes (animation delays, computed
 *                SVG geometry in components/diagrams/system-diagram.tsx).
 *   connect-src: 'self' covers the site's own fetches (including /api/chat);
 *                no page calls another origin.
 *
 * `https` adds `upgrade-insecure-requests` and HSTS, only where HTTPS exists
 * (a deploy): a local `next start` over http:// on a LAN IP has nothing to
 * upgrade to, and the upgrade would break every stylesheet on that preview.
 */
export type SecurityHeader = { key: string; value: string };

export function securityHeaders({ dev = false, https = false }: { dev?: boolean; https?: boolean } = {}): SecurityHeader[] {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://buttondown.com",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    ...(https ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  ];
}
