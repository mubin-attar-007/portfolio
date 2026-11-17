import Image from "next/image";
import Link from "next/link";
import { Caret } from "@/components/ui/caret-link";
import styles from "./case-study.module.css";

/** A case study to move to: its page, name, one-line definition and a capture. */
export type Neighbour = {
  href: string;
  title: string;
  definition: string;
  shot: { src: string; width: number; height: number };
};

/**
 * NeighbourCards — the previous and next case studies in the site's order of
 * work, as two capture cards. A whole card is one link; the caret plays when
 * it is hovered or focused.
 *
 * Props: `previous`, `next` (either may be null), `labels` (the two kickers),
 * `label` (names the navigation landmark).
 */
export function NeighbourCards({
  previous,
  next,
  labels,
  label = "More case studies",
}: {
  previous: Neighbour | null;
  next: Neighbour | null;
  labels: { previous: string; next: string };
  label?: string;
}) {
  const items = [
    previous ? { item: previous, kicker: labels.previous, side: "previous" } : null,
    next ? { item: next, kicker: labels.next, side: "next" } : null,
  ].filter((entry) => entry !== null);
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={styles.neighbours}>
      {items.map(({ item, kicker, side }) => (
        <Link key={item.href} href={item.href} prefetch={false} className={styles.neighbour} data-side={side}>
          <span className={styles.neighbourText}>
            <span className={styles.neighbourLabel}>{kicker}</span>
            <span className={styles.neighbourTitle}>
              {item.title}
              <Caret />
            </span>
            <span className={styles.neighbourBody}>{item.definition}</span>
          </span>
          <span className={styles.neighbourShot}>
            <Image
              src={item.shot.src}
              alt=""
              width={item.shot.width}
              height={item.shot.height}
              sizes="(min-width: 1000px) 220px, 40vw"
            />
          </span>
        </Link>
      ))}
    </nav>
  );
}
