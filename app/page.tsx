import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { SelectedWork } from "@/components/home/selected-work";
import { EngineerStrip } from "@/components/home/engineer-strip";
import { WritingAndNow } from "@/components/home/writing-and-now";
import { FinalContactCTA } from "@/components/home/final-cta";
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
