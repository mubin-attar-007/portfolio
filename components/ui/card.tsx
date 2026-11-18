import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./card.module.css";

/**
 * Bento — the card grid (prototype `.bento`): 2 or 3 equal columns with a
 * 10px gap, one column from 1000px down. A `Card` with `span={2}` takes two.
 * No outer margin (the prototype puts 64px above it: `className="mt-16"`).
 */
export function Bento({
  columns = 3,
  as: Tag = "div",
  className,
  children,
}: {
  columns?: 2 | 3;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cx(styles.bento, columns === 2 ? styles.cols2 : styles.cols3, className)}>{children}</Tag>;
}

/**
 * Card — the bento card (prototype `.card`). Light by default; inside a `Plate`
 * or a dark page it becomes the plate card by itself (tokens.css), so there is
 * no tone prop to get wrong.
 *
 * Compose it: `<Card><CardArt>…</CardArt><CardBody><h3/><p/></CardBody></Card>`.
 * CardBody styles its own `h2`/`h3` (15.5px, 650) and `p` (14.5px, secondary).
 *
 * Props: `as` (default `article`; `li` inside a list), `span` (2 = two bento
 * columns), `hover` (default `true`: a deeper shadow, a lifted dark ground, the
 * art leaning in — on pointer hover and on keyboard focus inside).
 *
 * A11y: a plain container; put the link inside (its own focus ring shows), and
 * name the region with a heading. Motion: transitions only on hover/focus;
 * reduced motion makes them instant.
 */
export function Card({
  as: Tag = "article",
  span = 1,
  hover = true,
  className,
  children,
}: {
  as?: ElementType;
  span?: 1 | 2;
  hover?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cx(styles.card, span === 2 && styles.span2, hover && styles.hover, className)}>{children}</Tag>;
}

/**
 * CardArt — the card's illustration area: 230px on light (with a faint top-down
 * wash and a hairline under it), 210px on dark. Decorative by default
 * (`aria-hidden`); pass `decorative={false}` when the art carries meaning, and
 * label it.
 */
export function CardArt({
  decorative = true,
  className,
  children,
}: {
  decorative?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.art, className)} aria-hidden={decorative || undefined}>
      {children}
    </div>
  );
}

/** CardBody — the card's text, pinned to the bottom: a title (`h3`), copy (`p`), then links or chips. */
export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx(styles.body, className)}>{children}</div>;
}
