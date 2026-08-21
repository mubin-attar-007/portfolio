import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Breadcrumb — the visible trail on a detail route.
 *
 * It exists because all three detail templates (`/work/[slug]`,
 * `/writing/[slug]`, `/notes/[slug]`) emit `BreadcrumbJsonLd`, but only the case
 * study rendered a trail a human could see. Structured data that describes
 * navigation the page does not actually have is a claim to a crawler that the
 * reader cannot verify — the same defect as an unbacked metric, in a different
 * medium. The fix is to add the trail, never to drop the JSON-LD.
 *
 * The parent link carries a back arrow rather than a separator glyph, because
 * the useful action here is "go up a level", not "observe where you are". The
 * current page is plain text, not a link to itself.
 *
 * A11y: a `<nav aria-label="Breadcrumb">` landmark containing an ordered list —
 * the shape assistive technology expects. The current item is marked
 * `aria-current="page"`, and the "/" separators are `aria-hidden` so the trail
 * is announced as "Work, DBWhisper" rather than "Work slash DBWhisper".
 *
 * @param parent  the index route this document belongs to.
 * @param current the document's own title. Truncates rather than wrapping — a
 *                breadcrumb that runs to two lines has stopped being chrome.
 */
export function Breadcrumb({
  parent,
  current,
}: {
  parent: { label: string; href: string };
  current: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="relative z-10 mb-8 font-mono text-xs text-ink-tertiary"
    >
      <ol className="flex items-center gap-2">
        <li>
          <Link
            href={parent.href}
            prefetch={false}
            className="group/crumb inline-flex items-center gap-1.5 transition-colors duration-fast ease-[var(--ease-out)] hover:text-ink"
          >
            <ArrowLeft
              size={13}
              strokeWidth={2}
              aria-hidden
              className="transition-transform duration-fast ease-[var(--ease-out)] group-hover/crumb:-translate-x-0.5"
            />
            {parent.label}
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li className="min-w-0 truncate text-ink-secondary" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  );
}
