import Link from "next/link";
import { flagshipHome } from "@/content/home-visual";
import { TechWall } from "./tech-wall";
import styles from "./proof-band.module.css";

/**
 * ProofBand — ONE ruled block directly under the hero, carrying two rows.
 *
 * This is the consolidation the redesign was commissioned for. The site
 * previously ran a proof strip and a separate audit lane as two competing
 * sections making overlapping claims. There is now one band: the record on top,
 * the stack underneath, sharing a single hairline grid.
 *
 * Every number here links to the page where a visitor can check it — that is the
 * difference between evidence and assertion, and it is why the labels stay
 * underlined at rest rather than revealing an affordance on hover.
 *
 * The two measured values (82% / 100%) are read from the eval registry through
 * `DBWHISPER_GOLDEN` rather than typed here, so renaming or removing that row
 * fails the build instead of leaving a stale number on the homepage.
 *
 * The stack wall below is the page's only client island outside the header, and
 * it is handed its data as props. Letting it import the content layer itself
 * dragged the eval registry and Zod across the client boundary — see the note in
 * `tech-wall.tsx`.
 *
 * A11y: each cell is a single link whose accessible name is the full
 * "value label" phrase, so "4" is never announced on its own. The band is
 * labelled by a visually-hidden heading so it is a real landmark rather than an
 * anonymous run of links.
 */
export function ProofBand() {
  const { proof, techWall } = flagshipHome;

  return (
    <section className={styles.band} aria-labelledby="proof-band-title">
      <h2 id="proof-band-title" className="sr-only">
        {proof.label}
      </h2>

      <div className={`${styles.row} ${styles.metrics}`}>
        {proof.items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            prefetch={false}
            className={styles.metric}
          >
            <span className={styles.value}>{item.value}</span>
            <span className={styles.metricLabel}>{item.label}</span>
            <span className={styles.metricMethod}>{item.method}</span>
          </Link>
        ))}
      </div>

      <TechWall lead={techWall.lead} columns={techWall.columns} />
    </section>
  );
}
