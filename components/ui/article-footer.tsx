import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TextLink } from "@/components/ui/text-link";
import { ARTICLE_FOOTER, type ArticleCollection } from "@/content/article";

/**
 * ArticleFooter — the ONE ending for every long-form page.
 *
 * The three templates previously stopped dead: a bare "← All writing" link and
 * nothing else. A reader who had just finished an essay had exactly one move
 * available — back to a list they had already seen — at the moment they were
 * most willing to read a second thing. This adds the missing continuation (the
 * entries either side of this one) and keeps the back-to-index link as the
 * quiet secondary option it should always have been.
 *
 * Case studies get the same device, so an article closes the same way whichever
 * template the reader is in. Where a collection has no neighbour to offer — the
 * first or last entry, a one-entry collection, or a draft previewed in dev —
 * that side collapses; the footer never renders an empty slot or a dead link.
 *
 * Props:
 * - `collection` — which index this belongs to. Selects the href and ALL labels,
 *   including the direction words, which differ per collection because the
 *   indexes are ordered differently (see content/article.ts).
 * - `previous` / `next` — the adjacent entries in the collection's own order, or
 *   null. Deliberately positional, not temporal: this component does not know
 *   whether a collection is sorted by date, and must not imply that it is.
 *
 * A11y: a `<nav>` with an accessible name, so it is exposed as a landmark and a
 * screen-reader user can jump straight to it. Each card is ONE link whose
 * accessible name is direction + title ("Older, A validator is not a better
 * prompt"): direction alone would leave two links called "Newer" and "Older"
 * with no idea what is behind them, and title alone would drop the ordering the
 * arrows carry visually. The arrows are `aria-hidden` — the direction is
 * already in the text, so it is never conveyed by a glyph alone. The hover
 * state changes the border AND the title colour, so it is not colour-only.
 *
 * Motion: colour and border-colour only, at --motion-fast, plus TextLink's own
 * chevron nudge. Nothing transforms and nothing animates on load, so the global
 * prefers-reduced-motion rules already cover everything here.
 */
export function ArticleFooter({
  collection,
  previous = null,
  next = null,
}: {
  collection: ArticleCollection;
  previous?: { slug: string; title: string } | null;
  next?: { slug: string; title: string } | null;
}) {
  const labels = ARTICLE_FOOTER[collection];
  const base = `/${collection}`;
  const hasNeighbours = previous !== null || next !== null;

  return (
    <nav
      aria-label={`More ${labels.label}`}
      className="mt-20 max-w-[var(--width-prose)] border-t border-border pt-8"
    >
      {hasNeighbours ? (
        <>
          <h2 className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">
            {ARTICLE_FOOTER.heading}
          </h2>
          {/* Two equal columns from sm up. Grid's default `stretch` is what keeps
              a one-line title and a three-line title on cards of the SAME height,
              so the pair reads as one control rather than two unrelated boxes. */}
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {previous ? (
              <li>
                <NeighbourCard
                  href={`${base}/${previous.slug}`}
                  direction="previous"
                  label={labels.previous}
                  title={previous.title}
                />
              </li>
            ) : null}
            {next ? (
              // The first entry in a collection has no `previous`. Its card is
              // still pushed to the right-hand column, so which side a direction
              // appears on never changes meaning between pages.
              <li className={previous ? "" : "sm:col-start-2"}>
                <NeighbourCard
                  href={`${base}/${next.slug}`}
                  direction="next"
                  label={labels.next}
                  title={next.title}
                />
              </li>
            ) : null}
          </ul>
        </>
      ) : null}
      <div className={hasNeighbours ? "mt-8" : ""}>
        {/* Quiet tone on purpose: this is the fallback move, not the invitation.
            Spending accent here would compete with the two cards above, and
            DESIGN §9 caps accent at two elements per viewport. */}
        <TextLink href={base} tone="quiet">
          {labels.index}
        </TextLink>
      </div>
    </nav>
  );
}

/**
 * One neighbour: a full-height card whose whole area is the link target.
 * Private to this module — it is a detail of the footer's layout, not a device
 * other pages should reach for.
 */
function NeighbourCard({
  href,
  direction,
  label,
  title,
}: {
  href: string;
  direction: "previous" | "next";
  label: string;
  title: string;
}) {
  const back = direction === "previous";
  const Glyph = back ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={href}
      className="group/card flex h-full flex-col gap-2 rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-colors duration-fast ease-[var(--ease-out)] hover:border-border-strong"
    >
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary ${
          back ? "" : "self-end"
        }`}
      >
        {back ? <Glyph size={12} strokeWidth={1.8} aria-hidden /> : null}
        {label}
        {back ? null : <Glyph size={12} strokeWidth={1.8} aria-hidden />}
      </span>
      <span
        className={`text-ink transition-colors duration-fast ease-[var(--ease-out)] group-hover/card:text-accent ${
          back ? "" : "text-right"
        }`}
      >
        {title}
      </span>
    </Link>
  );
}
