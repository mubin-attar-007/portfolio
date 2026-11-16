import { notFound } from "next/navigation";
import { formatOgEyebrow, renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { projects, projectBySlug } from "@/content/projects";
import { PROJECT_STATUS_LABEL } from "@/content/article";

// One alt for every case-study card: `alt` is a static export, and a per-page
// alt (generateImageMetadata) would move each card to …/opengraph-image/<id>.
// So it describes what every card prints rather than naming one project.
export const alt = "Case study card from Mubin Attar's portfolio: the project's name, category, status, and summary";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Only the case studies below get a card; any other slug is a 404, as on the
 * page itself. Otherwise every made-up URL renders an uncached branded image.
 */
export const dynamicParams = false;

/** One OG image per case study (static, at build time). */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/** Short, sentence-case category label per project (no invented claims). */
const CATEGORY: Record<string, string> = {
  dbwhisper: "natural-language → sql agent",
  "llm-studio": "multi-user ai chat platform",
  tradepulse: "quant backtesting platform",
  crownwager: "sports-betting analytics",
};

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  // Checked here as well as by `dynamicParams`, which metadata image routes have
  // ignored before (webpack builds below 16.3.8, GHSA-f87g-xv8r-7p7x).
  if (!p) notFound();
  const category = CATEGORY[slug] ?? "case study";
  // The status, never "live": social platforms cache this card for weeks, long
  // after a free-tier demo may have gone to sleep.
  const status = PROJECT_STATUS_LABEL[p.status].toLowerCase();
  return renderOg({
    eyebrow: formatOgEyebrow(`${category} · ${status}`),
    title: p.title,
    subtitle: p.summary,
    footerRight: `/work/${slug}`,
  });
}
