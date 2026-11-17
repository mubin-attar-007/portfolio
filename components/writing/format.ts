import { formatDate } from "@/lib/format";

/**
 * A post's date with its day ("Jun 20, 2026"), as a blog dates its posts.
 * Built on lib/format's month-year form, so it stays deterministic (no locale
 * or timezone).
 */
export function formatPostDate(iso: string): string {
  const day = Number(iso.split("-")[2]);
  const [month, year] = formatDate(iso).split(" ");
  return Number.isFinite(day) && day > 0 ? `${month} ${day}, ${year}` : formatDate(iso);
}
