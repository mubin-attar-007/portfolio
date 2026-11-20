import type { NextConfig } from "next";
import { securityHeaders } from "./config/security-headers.ts";

const isDev = process.env.NODE_ENV === "development";

// Security headers live in config/security-headers.ts, shared with the static
// Cloudflare copy (scripts/stage-sites-build.mjs). Vercel sets VERCEL=1.
const headers = securityHeaders({ dev: isDev, https: Boolean(process.env.VERCEL) });

const nextConfig: NextConfig = {
  output: "standalone",
  // Render-blocking CSS: Next's default merging, kept explicit because it is a
  // measured choice. A page loads two or three stylesheets (34–39 KB gzip),
  // some of it other routes' CSS. `graph` chunking sends a page closer to only
  // its own CSS, but in five to nine files, and under the Lighthouse budget's
  // model (six HTTP/1.1 connections, a round trip per request) those requests
  // cost more than the 2–14 KB they save: the case study goes from 9 files to
  // 2 for 1.7 KB more (spec/ENGINEERING.md §5).
  experimental: {
    cssChunking: true,
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
        headers,
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
  // Side projects retired on 2026-11-20 (ADR-021) send their old links home:
  //   /work/crownwager, /work/llm-studio → /work
  //   /notes/grade-picks-against-the-final-score → /notes
  async redirects() {
    return [
      { source: "/talks", destination: "/about", permanent: true },
      { source: "/timeline", destination: "/about", permanent: true },
      { source: "/changelog", destination: "/now", permanent: true },
      { source: "/cv", destination: "/resume", permanent: true },
      { source: "/work/field/records-triage", destination: "/work/bench-discovery", permanent: true },
      { source: "/work/field/nfc-room-rounds", destination: "/work/careltc", permanent: true },
      { source: "/work/crownwager", destination: "/work", permanent: true },
      { source: "/work/llm-studio", destination: "/work", permanent: true },
      { source: "/notes/grade-picks-against-the-final-score", destination: "/notes", permanent: true },
    ];
  },
};

export default nextConfig;
