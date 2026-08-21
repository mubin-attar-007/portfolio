import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ProofBand } from "@/components/home/proof-band";
import { FlagshipWalkthroughSection } from "@/components/home/flagship-walkthrough";
import { ReliabilityBento } from "@/components/home/reliability-bento";
import { SelectedWork } from "@/components/home/selected-work";
import { RegistryStrip } from "@/components/home/registry-strip";
import { EngineerStrip } from "@/components/home/engineer-strip";
import { WritingAndNow } from "@/components/home/writing-and-now";
import { FinalContactCTA } from "@/components/home/final-cta";
import { Reveal } from "@/components/ui/reveal";
import { SITE } from "@/config/site";
import { allWriting } from "@/lib/writing";
import { loadNow } from "@/lib/now";

const HOME_PATH = "/";

export const metadata: Metadata = {
  // `absolute` bypasses the "%s · Mubin Attar" template so the home title reads
  // as the brand line rather than as a page inside it. The exact string is
  // asserted by scripts/lighthouse-budget.mjs — change both together.
  title: { absolute: `${SITE.name} — ${SITE.role}` },
  description:
    "Mubin Attar designs and ships production AI systems end to end — agents and retrieval, deterministic guardrails, and task-level evaluations published with their method.",
  alternates: { canonical: `${SITE.url}${HOME_PATH}` },
  openGraph: {
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.role}`,
    description:
      "Production AI systems, built to be trusted: agents and retrieval, deterministic guardrails, and evaluations that show what actually works.",
    url: `${SITE.url}${HOME_PATH}`,
    type: "website",
  },
};

/**
 * The homepage — Clerk's observed choreography (ADR-012), carrying this
 * portfolio's evidence:
 *
 *   1  Hero + product stage      the claim, and the product making it
 *   2  Proof band                the record + the stack wall
 *   3  Flagship walkthrough      accordion-rail product section (light)
 *   4  Reliability bento         chamfered dark plate of guarantees
 *   5  Selected work             the other three products, three equal tiles
 *   6  Registry strip            the eval ledger, on the page
 *   7  The engineer              person, principles, road here
 *   8  Writing + now             the human beat
 *   9  Close                     one ask, on the second dark plate
 *
 * Exactly two dark plates (4 and 10), both chamfered. Sections below the fold
 * enter through <Reveal> — scroll-triggered, triple-gated against ever hiding
 * content (globals.css). Data is fetched here at the route so every section
 * stays a pure server component; the only client islands are the header
 * controls, the stack wall's timer, and the walkthrough's accordion.
 */
export default async function Home() {
  const [writing, now] = await Promise.all([allWriting(), loadNow()]);

  const posts = writing.slice(0, 3).map(({ slug, title, summary, date, category }) => ({
    slug,
    title,
    summary,
    date,
    category,
  }));

  return (
    <>
      <Hero />
      <ProofBand />
      <Reveal>
        <FlagshipWalkthroughSection />
      </Reveal>
      <Reveal>
        <ReliabilityBento />
      </Reveal>
      <Reveal>
        <SelectedWork />
      </Reveal>
      <Reveal>
        <RegistryStrip />
      </Reveal>
      <Reveal>
        <EngineerStrip />
      </Reveal>
      <Reveal>
        <WritingAndNow writing={posts} exploring={now.meta.exploring.slice(0, 3)} />
      </Reveal>
      <Reveal>
        <FinalContactCTA />
      </Reveal>
    </>
  );
}
