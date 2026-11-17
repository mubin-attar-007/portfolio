import { notFound } from "next/navigation";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { SITE } from "@/config/site";
import { fieldReportBySlug, fieldReports } from "@/content/field";

// One alt for every field-report card (see app/work/[slug]/opengraph-image.tsx).
export const alt = `Field report card from ${SITE.name}'s portfolio: an anonymous statement of the system, from a private repository`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * The field reports' cards print only the page headline: an anonymous
 * statement of what the system does. No organisation, product, client,
 * facility, repository or figure appears on a card.
 */
const KICKER = "Field report · private repository";
/** What every report covers, as the homepage's field-work section words it. */
const LINE = "The problem, the constraints, what broke and what I changed.";

/** Any other slug is a 404, as on the page itself. */
export const dynamicParams = false;

/** One OG image per field report (static, at build time). */
export function generateStaticParams() {
  return fieldReports.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // A lookup by `find`, not by key, so "constructor" is no report. Checked here
  // as well as by `dynamicParams` (see the case-study card).
  const report = fieldReportBySlug(slug);
  if (!report) notFound();
  return renderOg({ kicker: KICKER, title: report.headline, description: LINE });
}
