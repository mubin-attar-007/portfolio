import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Live backends this site talks to from the browser.
const DBWHISPER = "https://heisenbergblue-dbwhisper.hf.space";

// Content-Security-Policy. No nonces — a nonce must be minted per request, which
// would opt every route out of static rendering, so 'unsafe-inline' is the price
// of keeping the whole site static:
//   script-src: Next's inline bootstrap + the pre-paint theme script in
//               app/layout.tsx (it must run before first paint to avoid a flash).
//   style-src:  React `style={{…}}` attributes — hero animation delays and the
//               computed SVG geometry in components/diagrams/system-diagram.tsx.
// connect-src explicitly allows the dbwhisper backend the hero drives; 'self'
// covers the site's own fetches (including /api/chat).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self' ${DBWHISPER}${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Only force http→https upgrades where HTTPS actually exists (the Vercel
  // deploy). A local `next start` served over http:// on a LAN IP has no HTTPS
  // to upgrade to, so this would break every stylesheet/script on that preview
  // (localhost is exempt from the upgrade; a raw LAN IP is not). Production
  // (Vercel sets VERCEL=1) is unchanged.
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
