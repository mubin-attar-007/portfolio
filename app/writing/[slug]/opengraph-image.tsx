import { notFound } from "next/navigation";
import { renderOg, articleLine, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { SITE } from "@/config/site";
import { ARTICLE_KICKER } from "@/content/article";
import { routableWritingSlugs, loadWriting } from "@/lib/writing";

// One alt for every writing card (see CASE_STUDY_CARD_ALT, components/work/case-study-card.tsx).
export const alt = `Writing card from ${SITE.name}'s portfolio: the article's kind, title, month and reading time`;
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

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await loadWriting(slug);
  // Checked here as well as by `dynamicParams`, which metadata image routes have
  // ignored before (webpack builds below 16.3.8, GHSA-f87g-xv8r-7p7x).
  if (!w) notFound();
  // The kicker and the line use the article header's own words.
  return renderOg({
    kicker: ARTICLE_KICKER.writing(w.meta.category, w.readingMinutes),
    title: w.meta.title,
    description: articleLine(w.meta.date, w.readingMinutes),
  });
}
