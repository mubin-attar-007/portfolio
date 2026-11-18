import type { Metadata, Viewport } from "next";
import { DarkSurface } from "@/components/layout/dark-surface";
import { Container } from "@/components/layout/container";
import { AboutHero } from "@/components/about/about-hero";
import { ExperienceGrid } from "@/components/about/experience-grid";
import { QuoteBand } from "@/components/about/quote-band";
import { StackBand } from "@/components/about/stack-band";
import { PrinciplesCard } from "@/components/about/principles-card";
import { AboutNext } from "@/components/about/about-next";
import { BROWSER_CHROME } from "@/constants/theme";
import { aboutPage } from "@/content/pages/about";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: aboutPage.meta.title,
  description: aboutPage.meta.description,
});

export const viewport: Viewport = { themeColor: BROWSER_CHROME.dark };

/**
 * /about — the dark page (spec/prototype/about.html, Clerk About + Careers).
 *
 * Hero (obsidian mark, h1, lead) → "Where I've worked" grid (content/resume.ts)
 * → the quote band with the halftone portrait → the stack band → the three
 * principles (content/site.ts) → a split CTA to /contact and /writing. The
 * blocks below the hero share one column of dashed rules, so they read as one
 * blueprint rather than separate cards.
 *
 * A11y: one h1; every block is a labelled section; the only motion is the
 * mark's float and the tile lift, both off under reduced motion.
 */
export default function AboutPage() {
  return (
    <DarkSurface>
      <AboutHero />
      <Container>
        <ExperienceGrid />
        <QuoteBand />
        <StackBand />
        <PrinciplesCard />
        <AboutNext />
      </Container>
    </DarkSurface>
  );
}
