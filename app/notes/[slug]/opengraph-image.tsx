import { notFound } from "next/navigation";
import { renderOg, articleLine, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { SITE } from "@/config/site";
import { ARTICLE_KICKER } from "@/content/article";
import { routableNoteSlugs, loadNote } from "@/lib/notes";

// One alt for every note card (see app/work/[slug]/opengraph-image.tsx).
export const alt = `Note card from ${SITE.name}'s portfolio: the note's title, month and reading time`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Only published notes get a card; any other slug is a 404, as on the page
 * itself. Otherwise every made-up URL renders an uncached branded image.
 */
export const dynamicParams = false;

/** One OG image per note (static, at build time). */
export async function generateStaticParams() {
  return (await routableNoteSlugs()).map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await loadNote(slug);
  // Checked here as well as by `dynamicParams`, which metadata image routes have
  // ignored before (webpack builds below 16.3.8, GHSA-f87g-xv8r-7p7x).
  if (!n) notFound();
  return renderOg({
    kicker: ARTICLE_KICKER.note,
    title: n.meta.title,
    description: articleLine(n.meta.date, n.readingMinutes),
  });
}
