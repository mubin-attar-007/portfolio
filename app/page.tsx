import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ProofBand } from "@/components/home/proof-band";
import { FlagshipProject } from "@/components/home/flagship";
import { SelectedWork } from "@/components/home/selected-work";
import { CapabilitySection } from "@/components/home/capabilities";
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

/**
 * The homepage.
 *
 * ONE narrative, seven sections:
 *
 *   1  Hero + product stage   who this is, what he builds, and the product
 *   2  Proof band             the record, plus the stack behind it
 *   3  Flagship               DBWhisper, in depth              (dark plate 1)
 *   4  Selected work          the other three, as a bento
 *   5  Method                 how the systems are engineered
 *   6  Writing + now          the human beat
 *   7  Close                  one conversion ask               (dark plate 2)
 *
 * What is deliberately absent, and why: no FAQ (it answered questions the page
 * had already answered), no skills marquee, no second proof strip competing with
 * the first, no mid-page hiring CTA stealing from the close, and no separate Now
 * band — it is folded into section 6. The page went from a sequence of
 * independent widgets to one argument.
 *
 * Data is fetched here, at the route, rather than inside the sections: every
 * section stays a pure server component that renders what it is given, which is
 * what keeps them testable and reorderable.
 *
 * Client JavaScript on this route: the header shell, the nav, the mobile menu,
 * the theme toggle, the assistant launcher, and the stack wall's single timer.
 * The hero, the product stage, both dark plates and every card are static
 * server-rendered markup.
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
      <FlagshipProject />
      <SelectedWork />
      <CapabilitySection />
      <WritingAndNow writing={posts} exploring={now.meta.exploring.slice(0, 3)} />
      <FinalContactCTA />
    </>
  );
}
