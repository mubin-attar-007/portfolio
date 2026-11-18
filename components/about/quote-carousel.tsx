"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./about.module.css";

type Quote = { text: string; essay: { label: string; href: string } };

/**
 * QuoteCarousel — lines from my essays, one at a time, with arrows above them
 * (the quote band on Clerk's careers page). It never moves on its own: only the
 * arrows change the line, which crossfades in. Every line shares one grid cell,
 * so the band keeps the height of the longest and nothing below it moves.
 *
 * Props: `quotes` (content/pages/about.ts, each with the essay it is from),
 * `labels` (the carousel's name and the buttons'), `name` and `monogram` (the
 * attribution).
 * A11y: a carousel group whose lines are slides named "2 of 4"; the lines not
 * shown are hidden from assistive tech and from the Tab order, and the line a
 * button brings in is announced politely.
 */
export function QuoteCarousel({
  quotes,
  labels,
  name,
  monogram,
}: {
  quotes: readonly Quote[];
  labels: { label: string; previous: string; next: string; from: string };
  name: string;
  monogram: string;
}) {
  const [index, setIndex] = useState(0);
  const go = (step: number) => setIndex((current) => (current + step + quotes.length) % quotes.length);
  return (
    <div className={styles.carousel} role="group" aria-roledescription="carousel" aria-label={labels.label}>
      <div className={styles.arrows}>
        <button type="button" className={styles.arrow} aria-label={labels.previous} onClick={() => go(-1)}>
          <ArrowLeft size={14} strokeWidth={2} aria-hidden />
        </button>
        <button type="button" className={styles.arrow} aria-label={labels.next} onClick={() => go(1)}>
          <ArrowRight size={14} strokeWidth={2} aria-hidden />
        </button>
        <span className={styles.count} aria-hidden="true">
          {index + 1} / {quotes.length}
        </span>
      </div>
      <div className={styles.slides} aria-live="polite">
        {quotes.map((quote, i) => (
          <figure
            key={quote.text}
            className={styles.slide}
            data-current={i === index}
            aria-hidden={i !== index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${quotes.length}`}
          >
            <blockquote>
              <p>&ldquo;{quote.text}&rdquo;</p>
            </blockquote>
            <figcaption className={styles.who}>
              <span className={styles.monoMark} aria-hidden="true">
                {monogram}
              </span>
              <span>
                <b>{name}</b> {labels.from}{" "}
                <Link href={quote.essay.href} prefetch={false}>
                  {quote.essay.label}
                </Link>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
