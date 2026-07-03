import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { profile, projects } from "@/lib/content";
import { Assistant } from "@/components/chat/assistant";

// Display / headings — Fraunces (variable, with true italic for the accent).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
});
// Body — Instrument Sans (variable).
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});
// Data / labels / code / eyebrows — Geist Mono (variable).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE = "https://mubin-attar.vercel.app";
const DESC =
  "Mubin Attar — AI/ML engineer who ships real, live AI products. Four production apps: NL→SQL agents, an AI SaaS platform, honest backtesting, and +EV sports models. No faked demos, no vanity metrics.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Mubin Attar — AI/ML Engineer",
    template: "%s · Mubin Attar",
  },
  description: DESC,
  keywords: [
    "AI Engineer", "ML Engineer", "GenAI", "LLM", "RAG", "LangGraph", "agents",
    "FastAPI", "Next.js", "Mubin Attar",
  ],
  authors: [{ name: profile.name, url: profile.socials.github }],
  openGraph: {
    type: "website",
    url: SITE,
    title: "Mubin Attar — AI/ML Engineer",
    description: DESC,
    siteName: "Mubin Attar",
  },
  twitter: { card: "summary_large_image", title: "Mubin Attar — AI/ML Engineer", description: DESC },
  alternates: { canonical: SITE },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "AI / ML Engineer",
  email: profile.email,
  url: SITE,
  address: { "@type": "PostalAddress", addressLocality: "Ahmedabad", addressCountry: "IN" },
  sameAs: [profile.socials.github, profile.socials.linkedin, profile.socials.huggingface],
  knowsAbout: ["Generative AI", "Large Language Models", "RAG", "Agents", "Machine Learning", "MLOps"],
  makesOffer: projects.map((p) => ({
    "@type": "Offer",
    itemOffered: { "@type": "SoftwareApplication", name: p.name, applicationCategory: "WebApplication", url: p.live },
  })),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrument.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a
          href="#work"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-bg"
        >
          Skip to content
        </a>
        {children}
        <Assistant />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
