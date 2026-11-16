import { notFound } from "next/navigation";
import { formatOgEyebrow, renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { projects, projectBySlug } from "@/content/projects";

export const alt = "Case study — Mubin Attar";
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
  return renderOg({
    eyebrow: formatOgEyebrow(`${category} · live`),
    title: p.title,
    subtitle: p.summary,
    footerRight: `/work/${slug}`,
  });
}
