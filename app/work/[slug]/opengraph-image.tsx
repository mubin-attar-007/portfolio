import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { projects, projectBySlug } from "@/content/projects";

export const alt = "Case study — Mubin Attar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

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
  const category = CATEGORY[slug] ?? "case study";
  return renderOg({
    eyebrow: `${category} · live`,
    title: p?.title ?? "Case study",
    subtitle: p?.summary,
    footerRight: `/work/${slug}`,
  });
}
