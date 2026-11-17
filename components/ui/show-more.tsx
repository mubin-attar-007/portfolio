import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "./cx";
import styles from "./show-more.module.css";

/**
 * ShowMore — progressive disclosure for phones: the rest of a long list sits
 * behind a native `<details>` below 760px, with a full-width "Show 4 more …"
 * control under the items that stay visible. From 760px the control is gone
 * and the content renders in place, as if the wrapper were not there
 * (`display: contents` on the details and its `::details-content`), so a grid
 * or a stack around it keeps its layout: put the first items before it and the
 * rest inside, in the same parent.
 *
 * Props: `more` (the closed label: "Show 4 more incidents"), `less` (the open
 * label: "Show fewer incidents"), `className` (lays out the revealed items on
 * phones, e.g. a grid with the parent's gap), `children` (the rest).
 *
 * A11y: native disclosure — one tab stop, Enter and Space, its expanded state
 * announced, found by find-in-page (Chromium opens it), printed open. The
 * label names how many items it holds. Content always stays in the DOM.
 * Browsers without `::details-content` keep the control at every width, which
 * still works. Performance: no JS.
 */
export function ShowMore({
  more,
  less,
  className,
  children,
}: {
  more: string;
  less: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <details className={cx(styles.more, className)}>
      <summary className={styles.summary}>
        <span className={styles.closed}>{more}</span>
        <span className={styles.open}>{less}</span>
        <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" className={styles.icon} />
      </summary>
      {children}
    </details>
  );
}
