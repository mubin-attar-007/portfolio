import { notFound } from "next/navigation";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { SITE } from "@/config/site";
import { flagshipBySlug, flagships } from "@/content/flagship";
import { projects, projectBySlug } from "@/content/projects";
import { PROJECT_STATUS_LABEL } from "@/content/article";

// One alt for every case-study card: `alt` is a static export, and a per-page
// alt (generateImageMetadata) would move each card to …/opengraph-image/<id>.
// So it describes what every card prints rather than naming one project.
export const alt = `Case study card from ${SITE.name}'s portfolio: the product's name, what kind of case study it is, and what it is in one line`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Only the case studies below get a card; any other slug is a 404, as on the
 * page itself. Otherwise every made-up URL renders an uncached branded image.
 */
export const dynamicParams = false;

/** One OG image per case study, flagship and public (static, at build time). */
export function generateStaticParams() {
  return [...flagships.map((f) => ({ slug: f.slug })), ...projects.map((p) => ({ slug: p.slug }))];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // A flagship's card names the product and where it was built; its line is
  // the product's one-line definition, the same one its card on / and /work shows.
  const flagship = flagshipBySlug(slug);
  if (flagship) {
    return renderOg({
      kicker: "Flagship case study · Sevina Technologies",
      title: flagship.name,
      description: flagship.definition,
    });
  }
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
