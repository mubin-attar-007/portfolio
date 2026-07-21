import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";

/**
 * ArticleHeader — the ONE opening for every long-form page: a case study, an
 * essay, and a note now enter identically.
 *
 * Before this, the three templates each built their own header: the case study
 * fused `status · role · timeline` into one meta line, the essay hand-rolled a
 * `text-4xl` h1 with the date above it, and the note used a `text-3xl sm:text-4xl`
 * h1 with its tags in a bespoke row. Three heading scales, three meta
 * placements, three spacing rhythms — on the pages a hiring manager actually
 * reads. This component fixes the STRUCTURE so the three templates can only
 * differ in their content:
 *
 *   kicker  →  h1  →  lede  →  meta row  →  actions
 *
 * Type and spacing are NOT redefined here. Title, kicker and lede are delegated
 * to `PageHeader`, which owns the site-wide h1 scale — that delegation is the
 * whole point, since a second heading scale defined here would be the same bug
 * this component exists to remove. ArticleHeader adds only the part PageHeader
 * has no opinion about: the meta row.
 *
 * WHY META SITS BELOW THE LEDE: date, reading time and tags are things a reader
 * checks after the headline and standfirst have told them whether they care.
 * Above the title they are an obstacle between the reader and the point.
 *
 * WHY THE KICKER USES PageHeader's `meta` SLOT: PageHeader distinguishes a
 * branded eyebrow (`kicker`, accent dot — for index and landing routes) from a
 * factual record about the document (`meta`). An article's category or status is
 * the latter, so it gets the quieter treatment and the accent stays unspent for
 * the content below (DESIGN §9 caps accent at two elements per viewport).
 *
 * Props:
 * - `kicker` — what kind of document this is (category, project status).
 * - `title` — the h1. One per page.
 * - `lede` — the standfirst. The same summary the index card shows, so the card
 *   and the article agree rather than paraphrasing each other.
 * - `meta` — meta-row items (date, reading time, tags, source link). Taken as
 *   nodes, not strings, so a caller supplies a real `<time dateTime>` or a link
 *   and this component never needs to know what a date is. Nullish entries are
 *   dropped, so callers can inline conditionals without leaving empty items.
 * - `children` — actions belonging to the article itself (live/repo links).
 *
 * A11y: the meta row is a real `<ul>`, so it is announced as a list of N items
 * and each item is a separate stop, rather than one run-on string. The
 * interpunct between items is a decorative `aria-hidden` element, so it is seen
 * but never read aloud and never becomes part of an item's accessible NAME —
 * which matters where an item is a link, as a note's source link is. The single
 * `<h1>` remains PageHeader's.
 *
 * Performance: server component, no client boundary. The meta row and actions
 * are handed to PageHeader as ONE child so they occupy a single slot in its
 * entrance stagger — passing them as two children would give the row and the
 * buttons different delays and break the header's one-beat entrance.
 */
export function ArticleHeader({
  kicker,
  title,
  lede,
  meta,
  children,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  meta?: ReactNode[];
  children?: ReactNode;
}) {
  const items = (meta ?? []).filter((item) => item !== null && item !== undefined && item !== false);
  const hasBelow = items.length > 0 || Boolean(children);

  return (
    <PageHeader meta={kicker} title={title} lede={lede}>
      {hasBelow ? (
        // `w-full` because PageHeader's actions slot is a wrapping ROW: as a
        // lone flex item this stack would otherwise shrink to its content and
        // the meta row would no longer start at the text's left edge.
        <div className="flex w-full flex-col gap-6">
          {items.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-tertiary">
              {items.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  {/* Leading separator on every item after the first. It lives
                      INSIDE the li (not between li's) so it can never be orphaned
                      at the end of a wrapped row, and it is aria-hidden so the
                      li's — or a link's — accessible name never includes it. */}
                  {i > 0 ? <span aria-hidden>·</span> : null}
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {children ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">{children}</div>
          ) : null}
        </div>
      ) : null}
    </PageHeader>
  );
}
