import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/schema";
import { Caret } from "@/components/ui/caret-link";
import styles from "./case-study.module.css";

/**
 * NeighbourCards — the previous and next case studies in the registry's
 * curated order, as two capture cards. A whole card is one link; the caret
 * plays when it is hovered or focused.
 */
export function NeighbourCards({
  previous,
  next,
  labels,
}: {
  previous: Project | null;
  next: Project | null;
  labels: { previous: string; next: string };
}) {
  const items = [
    previous ? { project: previous, label: labels.previous, side: "previous" } : null,
    next ? { project: next, label: labels.next, side: "next" } : null,
  ].filter((item) => item !== null);
  if (items.length === 0) return null;

  return (
    <nav aria-label="More case studies" className={styles.neighbours}>
      {items.map(({ project, label, side }) => (
        <Link
          key={project.slug}
          href={`/work/${project.slug}`}
          prefetch={false}
          className={styles.neighbour}
          data-side={side}
        >
          <span className={styles.neighbourText}>
            <span className={styles.neighbourLabel}>{label}</span>
            <span className={styles.neighbourTitle}>
              {project.title}
              <Caret />
            </span>
            <span className={styles.neighbourBody}>{project.card.definition}</span>
          </span>
          <span className={styles.neighbourShot}>
            <Image
              src={project.card.shot.src}
              alt=""
              width={project.card.shot.width}
              height={project.card.shot.height}
              sizes="(min-width: 1000px) 220px, 40vw"
            />
          </span>
        </Link>
      ))}
    </nav>
  );
}
