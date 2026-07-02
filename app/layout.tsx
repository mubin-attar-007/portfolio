import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile, projects } from "@/lib/content";

const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jbmono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"], display: "swap" });

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
      className={`${space.variable} ${inter.variable} ${jbmono.variable} antialiased`}
    >
      <body className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a
          href="#work"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-[#05130d]"
        >
          Skip to content
        </a>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
