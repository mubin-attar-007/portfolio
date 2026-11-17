import { notFound } from "next/navigation";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { CASE_STUDY_CARD_ALT } from "@/components/work/case-study-card";
import { projects, projectBySlug } from "@/content/projects";
import { PROJECT_STATUS_LABEL } from "@/content/article";

export const alt = CASE_STUDY_CARD_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Only the case studies below get a card; any other slug is a 404, as on the
 * page itself. Otherwise every made-up URL renders an uncached branded image.
 */
export const dynamicParams = false;

/** One OG image per public case study (static, at build time); the flagships draw their own. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  // Checked here as well as by `dynamicParams`, which metadata image routes have
  // ignored before (webpack builds below 16.3.8, GHSA-f87g-xv8r-7p7x).
  if (!p) notFound();
  // The status, never "live": social platforms cache this card for weeks, long
  // after a free-tier demo may have gone to sleep. "Deployed demo" is named
  // only while the project links a demo (design-system §7.2), as on its page.
  // The line is the project's one-line definition, the same one its preview
  // card on / and /work shows.
  const status = p.status === "deployed-demo" && !p.links.live ? null : PROJECT_STATUS_LABEL[p.status];
  return renderOg({
    kicker: status ? `Case study · ${status}` : "Case study",
    title: p.title,
    description: p.card.definition,
  });
}
