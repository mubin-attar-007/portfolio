import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import { EngineerStrip } from "@/components/home/engineer-strip";
import { WritingAndNow } from "@/components/home/writing-and-now";
import { FinalContactCTA } from "@/components/home/final-cta";
import { SITE } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { allWriting } from "@/lib/writing";
import { loadNow } from "@/lib/now";

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

/** A short route through the work; technical depth lives on the case-study pages. */
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
      <SelectedWork />
      <EngineerStrip />
      <WritingAndNow writing={posts} exploring={now.meta.exploring.slice(0, 3)} />
      <FinalContactCTA />
    </>
  );
}
