import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader } from "next/font/google";
import "@/styles/globals.css";
import { SITE } from "@/config/site";
import { Header } from "@/components/layout/header";
import { StatusBar } from "@/components/layout/status-bar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";

// Display serif — italic only (essay titles, pull-quotes). Geist Sans/Mono come
// self-hosted from the `geist` package (their .variable = --font-geist-sans/mono).
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.role}`, template: `%s · ${SITE.name}` },
  description:
    "Mubin Attar — AI/ML engineer. Evidence over claims: architecture, decisions, and measured results. Every metric links to how it was measured.",
  alternates: { canonical: SITE.url },
};

// Pre-paint theme application (no flash). The light page with dark section-bands
// is the brand default and always renders unless the visitor has explicitly
// chosen dark (stored) — we intentionally do NOT follow the OS colour-scheme.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const year = new Date().getFullYear();
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`}
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
        <StatusBar />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer year={year} />
      </body>
    </html>
  );
}
