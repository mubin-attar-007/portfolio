import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Breadcrumb — the visible trail on a detail route (the Clerk blog's back link).
 *
 * All three detail templates (`/work/[slug]`, `/writing/[slug]`,
 * `/notes/[slug]`) emit `BreadcrumbJsonLd`; this is the trail a person can see,
 * so the structured data never describes navigation the page does not have.
 * The parent link carries a back arrow, because the useful action is "go up a
 * level"; the current page is plain text.
 *
 * @param parent  the index route this document belongs to.
 * @param current the document's own title. Truncates rather than wrapping.
 *
 * A11y: a `<nav aria-label="Breadcrumb">` with an ordered list; the current item
 * is `aria-current="page"`; the "/" separator is hidden from screen readers.
 * Motion: the arrow nudges left on hover (instant under reduced motion).
 */
export function Breadcrumb({
  parent,
  current,
}: {
  parent: { label: string; href: string };
  current: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="relative z-10 mb-8 text-sm text-ink-tertiary">
      <ol className="flex min-w-0 items-center gap-2">
        <li className="shrink-0">
          <Link
            href={parent.href}
            prefetch={false}
            className="group/crumb inline-flex min-h-6 items-center gap-1.5 font-medium text-ink-secondary transition-colors duration-fast hover:text-ink"
          >
            <ArrowLeft
              size={14}
              strokeWidth={2}
              aria-hidden
              className="transition-transform duration-fast group-hover/crumb:-translate-x-0.5"
            />
            {parent.label}
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li className="min-w-0 truncate" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  );
}
