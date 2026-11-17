import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Live backends this site talks to from the browser.
const DBWHISPER = "https://heisenbergblue-dbwhisper.hf.space";

// Content-Security-Policy. No nonces — a nonce must be minted per request, which
// would opt every route out of static rendering, so 'unsafe-inline' is the price
// of keeping the whole site static:
//   script-src: Next's inline bootstrap scripts (the site is light-only, so
//               there is no pre-paint theme script any more).
//   style-src:  React `style={{…}}` attributes — hero animation delays and the
//               computed SVG geometry in components/diagrams/system-diagram.tsx.
// connect-src: 'self' covers the site's own fetches (including /api/chat). The
// dbwhisper backend origin predates the redesign; no page calls it now, so it
// can go the next time this policy changes.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self' ${DBWHISPER}${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://buttondown.com",
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
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(
    process.env.VERCEL
      ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
      : []
  ),
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Render-blocking CSS per route. Turbopack's default chunking merged CSS from
  // every route (the home showcase, the flagship template, the evals table,
  // the lazy assistant panel) into one shared chunk that every page loaded,
  // which more than doubled each page's CSS and pushed LCP past the Lighthouse
  // budget (spec/ENGINEERING.md §5). `graph` groups CSS by what each route
  // imports, weighing bytes against requests, so a route loads close to only
  // its own CSS.
  experimental: {
    cssChunking: "graph",
    // Fewer, larger JavaScript chunks per page. Every page loads all of its
    // chunks before it can hydrate, and the Lighthouse budget's model fetches
    // them over six HTTP/1.1 connections a round trip apiece, so a request
    // costs about as much as the bytes in it. At the default (50 KB of source)
    // a case study split its own components into two chunks and the layout's a
    // 300-byte third; at 200 KB they merge (case study 11 -> 9 scripts, writing
    // and home 10 -> 9) with the same bytes. Most visits are a single page, so
    // the chunk reuse this gives up between routes is worth little here.
    turbopackChunking: {
      minChunkSize: 200_000,
    },
  },
  // The assistant's corpus (lib/ai/corpus.ts) reads these MDX folders with fs
  // when /api/chat loads. The tracer follows the literal reads too; this list
  // makes the bundle's contents a stated fact rather than an inference, so an
  // essay or note can never silently drop out of the assistant on Vercel.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/projects/*.mdx", "./content/writing/*.mdx", "./content/notes/*.mdx"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Permanent redirects (308), never a silent 404. The metadata gate
  // (scripts/lighthouse-budget.mjs) checks each one and that none is in the sitemap.
  // Consolidated routes keep their inbound links alive:
  //   /talks    → /about  (removed until there is a real talk to list)
  //   /timeline → /about  (the career narrative now lives inside /about)
  //   /changelog→ /now     (the running record folded into the "now" surface)
  // The paths recruiters, autocomplete and agents guess first:
  //   /cv       → /resume
  // The anonymous field-report drafts became the named flagship case studies:
  //   /work/field/records-triage  → /work/bench-discovery
  //   /work/field/nfc-room-rounds → /work/careltc
  async redirects() {
    return [
      { source: "/talks", destination: "/about", permanent: true },
      { source: "/timeline", destination: "/about", permanent: true },
      { source: "/changelog", destination: "/now", permanent: true },
      { source: "/cv", destination: "/resume", permanent: true },
      { source: "/work/field/records-triage", destination: "/work/bench-discovery", permanent: true },
      { source: "/work/field/nfc-room-rounds", destination: "/work/careltc", permanent: true },
    ];
  },
};

export default nextConfig;
