import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FieldReportPage } from "@/components/field/field-report";
import { fieldReportBySlug, fieldReports } from "@/content/field";
import { pageMetadata } from "@/lib/seo";

/** Only the two reports exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return fieldReports.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const report = fieldReportBySlug(slug);
  if (!report) return {};
  const metadata = pageMetadata({
    path: `/work/field/${slug}`,
    title: `${report.name} — field report`,
    description: report.summary,
    social: { title: `${report.headline} · Field report` },
  });
  if (report.published) return metadata;
  // A draft stays out of search until the owner publishes it and, like every
  // unindexed route (lib/seo.ts, ADR-007), names no URL as its own: no
  // canonical and no og:url. The metadata gate checks both.
  return {
    ...metadata,
    alternates: { types: metadata.alternates?.types },
    openGraph: { ...metadata.openGraph, url: undefined },
    robots: { index: false, follow: false },
  };
}

export default async function FieldReportRoute({ params }: Props) {
  const { slug } = await params;
  const report = fieldReportBySlug(slug);
  if (!report) notFound();
  return <FieldReportPage report={report} />;
}
