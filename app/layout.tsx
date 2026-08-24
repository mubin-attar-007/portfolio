import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
import { FOUNDATION_SCOPE, SITE } from "@/config/site";
import { AvailabilityBar } from "@/components/layout/availability-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";

/**
 * Fonts. Two families do the work: Geist Sans for everything read, Geist Mono
 * for values, labels and code. Both are subsetted and self-hosted by next/font,
 * so there is no third-party font request and no FOIT.
 *
 * Newsreader is loaded italic-only, unpreloaded, and reaches exactly one
 * component — the long-form `PullQuote` inside an article body. It is never used
 * in marketing type or on the homepage, so it stays out of the LCP-critical
 * request set entirely.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.role}`, template: `%s · ${SITE.name}` },
  description:
    "Mubin Attar designs and ships production AI systems end to end — agents, retrieval, deterministic guardrails, and task-level evaluations that show what actually works.",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    title: `${SITE.name} — ${SITE.role}`,
    description:
      "Production AI systems, built to be trusted: agents and retrieval, deterministic guardrails, and evaluations published with their method.",
    url: SITE.url,
  },
  twitter: { card: "summary_large_image" },
  alternates: {
    canonical: SITE.url,
    types: { "application/rss+xml": `${SITE.url}/rss.xml` },
  },
};

/**
 * The browser chrome follows the page, not the OS. Both values are the actual
 * `--color-bg` for that theme, so the address bar on mobile continues the page
 * surface instead of drawing a seam above it.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#03080a" },
  ],
};

/**
 * Pre-paint theme application (no flash).
 *
 * LIGHT is the brand: the page renders light unless the visitor has explicitly
 * chosen dark and that choice was stored. `prefers-color-scheme` is deliberately
 * not consulted — the light page with its dark bands IS the identity, not a mode
 * the OS gets to pick. The server renders `data-theme="light"` below, so the
 * first paint is already correct for everyone who has not opted in.
 */
const THEME_SCRIPT = `(function(){document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`;
const IS_VERCEL_DEPLOYMENT = process.env.VERCEL === "1";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const year = new Date().getFullYear();
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <JsonLd />
      </head>
      <body className="flex min-h-screen flex-col" data-scope={FOUNDATION_SCOPE.phase}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AvailabilityBar />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer year={year} />
        {/* The local production server does not expose Vercel's analytics
            endpoint. Rendering the client there creates a guaranteed 404 and a
            MIME-type console error; Vercel sets this build-time flag on the
            deployment where the endpoint actually exists. */}
        {IS_VERCEL_DEPLOYMENT ? <Analytics /> : null}
      </body>
    </html>
  );
}
