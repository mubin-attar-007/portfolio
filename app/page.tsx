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

/** Two lists, one item from each in turn, so both of the wall's columns mix essays and notes. */
function interleave<T>(a: readonly T[], b: readonly T[]): T[] {
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i], b[i]]).flat().filter((x): x is T => x !== undefined);
}

/** The home page: a short route through the work; depth lives on the flagship and public case studies. */
export default async function Home() {
  const [writing, notes] = await Promise.all([allWriting(), allNotes()]);

  const quoted = writing.find((w) => w.slug === WRITING.quoteSlug);
  if (!quoted) throw new Error(`home: the quoted essay "${WRITING.quoteSlug}" is not published`);

  // Every published essay and guide but the quoted one, and every note: the wall shows them all.
  const essays: WritingCard[] = writing
    .filter((w) => w.slug !== quoted.slug)
    .map((w) => ({ href: `/writing/${w.slug}`, title: w.title, summary: w.summary, category: w.category }));
  const allNotesCards: WritingCard[] = notes.map((n) => ({ href: `/notes/${n.slug}`, title: n.title, summary: noteDescription(n), category: "note" }));

  return (
    <>
      <Hero />
      <FactsStrip />
      <FlagshipWork />
      <PublicWork />
      <AgentSection />
      <HowIWork />
      <WritingBand quoteEssay={{ href: `/writing/${quoted.slug}`, title: quoted.title }} cards={interleave(essays, allNotesCards)} />
      <HomeCta />
    </>
  );
}
