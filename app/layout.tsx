import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
import { SITE } from "@/config/site";
import { BROWSER_CHROME } from "@/constants/theme";
import { OG_LOCALE, SITE_FEED, TITLE_SUFFIX } from "@/lib/seo";
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

/**
 * Defaults that are true of ANY page. Metadata merges shallowly, so nothing
 * here may name a URL: a root canonical or og:url is inherited by every page
 * that sets neither — the 404 once declared the homepage canonical. Each public
 * page states its own canonical, social card and feeds through `pageMetadata`
 * (lib/seo.ts); a page without a card still gets its own title and description
 * on one, because Next fills og:title and og:description from the page.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.role}`, template: `%s${TITLE_SUFFIX}` },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, locale: OG_LOCALE },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": [SITE_FEED] } },
};

/** Light is the brand default; a stored dark preference is applied before paint. */
export const viewport: Viewport = { themeColor: BROWSER_CHROME.light };
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
      <body className="flex min-h-screen flex-col">
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
