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
  return {
    ...pageMetadata({
      path: `/work/field/${slug}`,
      title: `${report.name} — field report`,
      description: report.summary,
      social: { title: `${report.headline} · Field report` },
    }),
    // A draft stays out of search until the owner publishes it.
    robots: report.published ? undefined : { index: false, follow: false },
  };
}

export default async function FieldReportRoute({ params }: Props) {
  const { slug } = await params;
  const report = fieldReportBySlug(slug);
  if (!report) notFound();
  return <FieldReportPage report={report} />;
}
