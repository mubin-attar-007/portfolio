import { cx } from "./cx";
import styles from "./dotted-guides.module.css";

/**
 * DottedGuides — the contact card's blueprint verticals (prototype
 * `.contact-lines`): five dotted lines at 0, 25, 50, 75 and 100% of the
 * content width, reaching 140px above the card and fading at both ends.
 *
 * Place it first inside a `position: relative` wrapper that holds the card;
 * give the card `position: relative; z-index: 1` so the lines pass behind it.
 * Pair it with `DottedRule` across the card's top edge.
 *
 * A11y: decorative (`aria-hidden`). Performance: CSS gradients only.
 */
export function DottedGuides({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx(styles.columns, className)} />;
}

/**
 * DottedRule — a dotted horizontal guide running the full viewport width
 * through its positioned parent's top edge (prototype `.contact-hline`).
 *
 * It overhangs the page by design: an ancestor must clip it horizontally
 * (`overflow-x: clip`), or the page gains a horizontal scrollbar.
 * A11y: decorative (`aria-hidden`).
 */
export function DottedRule({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx(styles.rule, className)} />;
}
