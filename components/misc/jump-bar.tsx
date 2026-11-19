import { FadeScroller } from "@/components/layout/fade-scroller";
import { cx } from "@/components/ui/cx";
import styles from "./misc.module.css";

/**
 * JumpBar — the phone stand-in for a sticky sidebar nav: a sticky, horizontally
 * scrolling row of pill links to the page's top-level sections (/uses,
 * /privacy). Plain anchor jumps; the row fades an edge that hides links
 * (`FadeScroller`), so a cut pill reads as "more this way".
 *
 * A11y: a named `<nav>` of real links; it scrolls natively and by Tab.
 */
export function JumpBar({
  items,
  label,
  className,
}: {
  items: readonly { id: string; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cx(styles.jump, className)}>
      <FadeScroller className={styles.jumpScroller}>
        <ul className={styles.jumpList}>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={styles.jumpLink}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </FadeScroller>
    </nav>
  );
}
