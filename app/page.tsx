import type { Metadata } from "next";
import { AgentSection } from "@/components/home/agent-section";
import { FlagshipWork } from "@/components/home/flagship-work";
import { Hero } from "@/components/home/hero";
import { FactsStrip, HomeCta, HowIWork, WritingBand, type WritingCard } from "@/components/home/home-bands";
import { PublicWork } from "@/components/home/public-work";
import { SITE } from "@/config/site";
import { WRITING } from "@/content/pages/home";
import { pageMetadata } from "@/lib/seo";
import { allNotes, noteDescription } from "@/lib/notes";
import { allWriting } from "@/lib/writing";

export const metadata: Metadata = pageMetadata({
  path: "/",
  // `absolute` bypasses the "%s · Mubin Attar" template so the home title reads
  // as the brand line rather than as a page inside it. The exact string is
  // asserted by scripts/lighthouse-budget.mjs — change both together.
  title: { absolute: `${SITE.name} — ${SITE.role}` },
  description: SITE.description,
  social: {
    description:
      "Production AI systems, built to be trusted: agents and retrieval, deterministic guardrails, and evaluations that show what actually works.",
  },
});

/** Essays and guides shown beside the quote; the rest of the four cards are notes. */
const WRITING_CARDS = 3;
const TOTAL_CARDS = 4;

/** The home page: a short route through the work; depth lives on the flagship and public case studies. */
export default async function Home() {
  const [writing, notes] = await Promise.all([allWriting(), allNotes()]);

  const quoted = writing.find((w) => w.slug === WRITING.quoteSlug);
  if (!quoted) throw new Error(`home: the quoted essay "${WRITING.quoteSlug}" is not published`);

  const essays: WritingCard[] = writing
    .filter((w) => w.slug !== quoted.slug)
    .slice(0, WRITING_CARDS)
    .map((w) => ({ href: `/writing/${w.slug}`, title: w.title, summary: w.summary, category: w.category }));
  const latestNotes: WritingCard[] = notes
    .slice(0, TOTAL_CARDS - essays.length)
    .map((n) => ({ href: `/notes/${n.slug}`, title: n.title, summary: noteDescription(n), category: "note" }));

  return (
    <>
      <Hero />
      <FactsStrip />
      <FlagshipWork />
      <PublicWork />
      <AgentSection />
      <HowIWork />
      <WritingBand quoteEssay={{ href: `/writing/${quoted.slug}`, title: quoted.title }} cards={[...essays, ...latestNotes]} />
      <HomeCta />
    </>
  );
}
