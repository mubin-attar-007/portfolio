import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/config/site";
import { aboutPage } from "@/content/pages/about";
import styles from "./about.module.css";

/**
 * The Careers-style quote band: a line from the essay, attributed and linked,
 * beside a halftone treatment of the real portrait (CSS dot screen over the
 * photo; plain greyscale where masks are unsupported). Static by design, so
 * reduced motion needs nothing extra.
 * A11y: a `<figure>` holding a blockquote and its caption; the portrait keeps
 * the alt "Mubin Attar".
 */
export function QuoteBand() {
  const { text, essay } = aboutPage.quote;
  return (
    <section className={styles.quote} aria-label="A principle, in one line">
      <figure>
        <blockquote>
          <p>&ldquo;{text}&rdquo;</p>
        </blockquote>
        <figcaption className={styles.who}>
          <span className={styles.monoMark} aria-hidden="true">
            {SITE.monogram}
          </span>
          <span>
            <b>{SITE.name}</b>{" "}
            From the essay{" "}
            <Link href={essay.href} prefetch={false}>
              {essay.label}
            </Link>
          </span>
        </figcaption>
      </figure>
      <div className={styles.portrait}>
        <Image src="/mubin.png" alt={SITE.name} fill sizes="(max-width: 1000px) 240px, 320px" />
      </div>
    </section>
  );
}
