import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
import { FOUNDATION_SCOPE, SITE } from "@/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";

// All three families are subsetted and self-hosted by next/font. The display
// serif is italic-only and not preloaded because it appears below the fold;
// this keeps it out of the LCP-critical font request set.
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
    "Mubin Attar — AI software engineer. Evidence over claims: architecture, decisions, and measured results. Every metric links to how it was measured.",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    title: `${SITE.name} — ${SITE.role}`,
    description:
      "Mubin Attar — AI software engineer. Evidence over claims: architecture, decisions, and measured results.",
    url: SITE.url,
  },
  twitter: { card: "summary_large_image" },
  alternates: {
    canonical: SITE.url,
    types: { "application/rss+xml": `${SITE.url}/rss.xml` },
  },
};

// Pre-paint theme application (no flash). The light page with dark section-bands
// is the brand default and always renders unless the visitor has explicitly
// chosen dark (stored) — we intentionally do NOT follow the OS colour-scheme.
const THEME_SCRIPT = `(function(){document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
const IS_VERCEL_DEPLOYMENT = process.env.VERCEL === "1";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const year = new Date().getFullYear();
  return (
    <html
      lang="en"
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
