import { notFound } from "next/navigation";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { SITE } from "@/config/site";

// One alt for every field-report card (see app/work/[slug]/opengraph-image.tsx).
export const alt = `Field report card from ${SITE.name}'s portfolio: an anonymous statement of the system, from a private repository`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * The two field reports and the anonymous statement each card prints. The work
 * is disclosed without names: no organisation, product, client, facility,
 * repository or figure appears on a card, only what the system does. When the
 * reports' content modules land (content/field/*.ts), read the slugs and
 * headlines from there instead.
 */
const FIELD_REPORTS = [
  { slug: "records-triage", title: "Records triage that never leaves the PC" },
  { slug: "nfc-room-rounds", title: "NFC room rounds for care floors" },
] as const;

const KICKER = "Field report · private repository";
/** What every report covers, as the homepage's field-work section words it. */
const LINE = "The problem, the constraints, what broke and what I changed.";

/** Any other slug is a 404, as on the page itself. */
export const dynamicParams = false;

/** One OG image per field report (static, at build time). */
export function generateStaticParams() {
  return FIELD_REPORTS.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // A lookup by `find`, not by key: an object index would answer "constructor".
  // Checked here as well as by `dynamicParams` (see the case-study card).
  const report = FIELD_REPORTS.find((entry) => entry.slug === slug);
  if (!report) notFound();
  return renderOg({ kicker: KICKER, title: report.title, description: LINE });
}
