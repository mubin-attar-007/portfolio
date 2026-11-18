import type { CSSProperties } from "react";
import { cx } from "@/components/ui/cx";
import { SmartLink } from "@/components/ui/smart-link";
import { WallMotion } from "./wall-motion";
import styles from "./sections.module.css";

export type WallCard = { href: string; title: string; summary: string; meta: string };

/** Each column's loop: the second runs slower, the other way, so they drift apart. */
const COLUMNS = [
  { seconds: 70, reverse: false },
  { seconds: 88, reverse: true },
] as const;

/** One column's cards. The loop's second copy is `aria-hidden` and `inert`, so each card is read and tabbed to once. */
function CardSet({ cards, clone = false }: { cards: readonly WallCard[]; clone?: boolean }) {
  return (
    <ul className={cx(styles.wallSet, clone && styles.wallClone)} aria-hidden={clone || undefined} inert={clone || undefined}>
      {cards.map((card) => (
        <li key={card.href} className={styles.wcard}>
          <h3>
            <SmartLink href={card.href} className={styles.wcardLink}>
              {card.title}
            </SmartLink>
          </h3>
          <p>{card.summary}</p>
          <p className={styles.meta}>{card.meta}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * WritingWall — the essays and notes as two columns of cards drifting past in
 * opposite directions under a fade, as the testimonial wall on Clerk's home
 * page moves (sections.module.css `.wall`). The cards are server-rendered;
 * WallMotion holds the drift under the pointer, while keyboard focus is inside
 * (bringing a card focused out of view into view first, without a jump) and
 * when paused by its button. Reduced motion, and phones: still, the first two
 * cards of each column.
 */
export function WritingWall({ cards, labels }: { cards: readonly WallCard[]; labels: { pause: string; play: string } }) {
  const columns = COLUMNS.map((_, c) => cards.filter((_, i) => i % COLUMNS.length === c));
  return (
    <WallMotion labels={labels}>
      {columns.map((list, c) => (
        <div key={COLUMNS[c]!.seconds} className={styles.wallCol} data-wall-column="">
          <div
            className={cx(styles.wallTrack, COLUMNS[c]!.reverse && styles.wallReverse)}
            style={{ "--wall-seconds": `${COLUMNS[c]!.seconds}s` } as CSSProperties}
          >
            <CardSet cards={list} />
            <CardSet cards={list} clone />
          </div>
        </div>
      ))}
    </WallMotion>
  );
}
