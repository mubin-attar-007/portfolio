import { notFound } from "next/navigation";
import { formatOgEyebrow, renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { routableWritingSlugs, loadWriting } from "@/lib/writing";

// One alt for every writing card (see app/work/[slug]/opengraph-image.tsx).
export const alt = "Writing card from Mubin Attar's portfolio: the article's title and category";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Only published posts get a card; any other slug is a 404, as on the page
 * itself. Otherwise every made-up URL renders an uncached branded image.
 */
export const dynamicParams = false;

/** One OG image per post (static, at build time). */
export async function generateStaticParams() {
  return (await routableWritingSlugs()).map((slug) => ({ slug }));
}

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await loadWriting(slug);
  // Checked here as well as by `dynamicParams`, which metadata image routes have
  // ignored before (webpack builds below 16.3.8, GHSA-f87g-xv8r-7p7x).
  if (!w) notFound();
  return renderOg({
    eyebrow: formatOgEyebrow(`writing · ${w.meta.category}`),
    title: w.meta.title,
    footerRight: `/writing/${slug}`,
  });
}
