import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
import { ASK_AI, SITE, STATUS } from "@/config/site";
import { BROWSER_CHROME } from "@/constants/theme";
import { OG_LOCALE, SITE_FEED, TITLE_SUFFIX } from "@/lib/seo";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { AskLauncher } from "@/components/layout/ask-launcher";
import { Header } from "@/components/layout/header";
import { NavigationFeedback } from "@/components/layout/navigation-feedback";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";

/**
 * Fonts: Geist for everything read, Geist Mono for values, labels and code.
 * Both are subsetted and self-hosted by next/font (no third-party request).
 * Geist is preloaded: the hero text, the LCP element, is set in it. Geist Mono
 * is neither preloaded nor requested before the first paint; BOOT_SCRIPT
 * fetches it afterwards.
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

/** The site is light-only; dark pages set their own theme colour (constants/theme.ts). */
export const viewport: Viewport = { themeColor: BROWSER_CHROME.light };
/**
 * Runs in <head>, before the body is laid out.
 * - `js` switches off the no-JavaScript fallbacks (`html:not(.js)` in CSS).
 * - `mono-pending` keeps Geist Mono out of the first paint (styles/tokens.css):
 *   mono text sets in the system's monospace face while the first screen
 *   renders. Once the first contentful paint has happened, the script fetches
 *   the face and drops the class, so Geist Mono swaps in. A browser without
 *   paint timing fetches it three seconds after `load`.
 */
const BOOT_SCRIPT = [
  "(function(){",
  "var d=document,r=d.documentElement,started=false;",
  "r.classList.add('js','mono-pending');",
  "function show(){r.classList.remove('mono-pending')}",
  "function load(){if(started)return;started=true;",
  "var f=getComputedStyle(r).getPropertyValue('--font-geist-mono');",
  "if(!f||!d.fonts){show();return}",
  "d.fonts.load('1em '+f).then(show,show)}",
  "try{new PerformanceObserver(function(l,o){",
  "if(l.getEntriesByName('first-contentful-paint').length){o.disconnect();setTimeout(load,0)}",
  "}).observe({type:'paint',buffered:true})}catch(e){}",
  "addEventListener('load',function(){setTimeout(load,3000)})",
  "})()",
].join("");
const IS_VERCEL_DEPLOYMENT = process.env.VERCEL === "1";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const year = new Date().getFullYear();
  return (
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <JsonLd />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AnnouncementBar status={STATUS} askLabel={ASK_AI.announcement} />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer year={year} />
        <AskLauncher label={ASK_AI.label} name={ASK_AI.launcherName} />
        <NavigationFeedback />
        {/* The local production server does not expose Vercel's analytics
            endpoint. Rendering the client there creates a guaranteed 404 and a
            MIME-type console error; Vercel sets this build-time flag on the
            deployment where the endpoint actually exists. */}
        {IS_VERCEL_DEPLOYMENT ? <Analytics /> : null}
      </body>
    </html>
  );
}
