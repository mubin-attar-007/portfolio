import { nfcRoomRounds } from "./nfc-room-rounds";
import { recordsTriage } from "./records-triage";
import type { FieldReport } from "./types";

export type { FieldReport } from "./types";

/**
 * The field reports, in the work sub-nav's order. A report with
 * `published: false` renders for the owner's review only: a draft ribbon,
 * `noindex`, and no sitemap, RSS, llms.txt or assistant-index entry. Nothing
 * outside the report page reads this registry until a report is published.
 */
export const fieldReports: readonly FieldReport[] = [recordsTriage, nfcRoomRounds];

/** A lookup by `find`, so an object key like "constructor" is never a report. */
export const fieldReportBySlug = (slug: string): FieldReport | undefined =>
  fieldReports.find((report) => report.slug === slug);

/** Draft labels: one place, so the ribbon and the metadata agree. */
export const FIELD_DRAFT = {
  ribbon: "Draft for owner review",
  ribbonDetail: "Not published: hidden from search, feeds and the site index.",
} as const;

/** The badge every private report carries (FINAL-SPEC §6.3: the same words everywhere). */
export const PRIVATE_NOTICE = "Private repository · walkthrough on request";
