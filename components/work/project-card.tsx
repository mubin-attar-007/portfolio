import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/schema";
import styles from "./project-card.module.css";

/**
 * A shared editorial project row: product, engineering decision, method, capture.
 * Methods and measured values come directly from the project's metric record.
 * Text stays selectable; the labelled capture is an ordinary case-study link.
 * Intrinsic image dimensions reserve space before these lazy captures load.
 */
export function ProjectCard({
  project,
  labels,
}: {
  project: Project;
  labels: { caseStudy: string; live: string; source: string };
}) {
  const metric = project.metrics[0];
  const { card } = project;
  const caseStudyHref = `/work/${project.slug}`;

  return (
    <article className={styles.card} aria-labelledby={`project-${project.slug}`}>
      <div className={styles.body}>
        <p className={styles.meta}>{card.category}</p>
        <h3 id={`project-${project.slug}`} className={styles.name}>
          <Link href={caseStudyHref} prefetch={false} className={styles.titleLink}>
            {project.title}
          </Link>
        </h3>
        <p className={styles.definition}>{card.definition}</p>

        {metric ? (
          <div className={styles.decision}>
            <h4 className={styles.decisionTitle}>{card.decision.title}</h4>
            {card.decision.showResult ? (
              <Link
                href={`${caseStudyHref}#performance-cost`}
                prefetch={false}
                className={`text-link-control ${styles.resultLink}`}
                aria-label={`${metric.value} ${metric.label}. Read ${project.title}'s evaluation method.`}
              >
                <span>{metric.value}</span>
                <span className={styles.resultLabel}>{metric.label}</span>
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
              </Link>
            ) : null}
            <p className={styles.method}>{metric.method}</p>
          </div>
        ) : null}

        <div className={styles.actions}>
          <Link href={caseStudyHref} prefetch={false} className={`text-link-control ${styles.primaryAction}`}>
            {labels.caseStudy}
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden />
          </Link>
          {project.links.live ? (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-link-control ${styles.sideAction}`}
              aria-label={`${project.title} — ${labels.live} (opens in a new tab)`}
            >
              {labels.live}
              <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
            </a>
          ) : null}
          {project.links.repo ? (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-link-control ${styles.sideAction}`}
              aria-label={`${project.title} — ${labels.source} (opens in a new tab)`}
            >
              {labels.source}
              <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
            </a>
          ) : null}
        </div>
      </div>

      <figure className={styles.shot}>
        <Link
          href={caseStudyHref}
          prefetch={false}
          className={styles.shotFrame}
          aria-label={`${labels.caseStudy}: ${project.title}`}
        >
          <Image
            src={card.shot.src}
            alt={card.alt}
            width={card.shot.width}
            height={card.shot.height}
            className={styles.shotImg}
            sizes="(min-width: 79rem) 35.5rem, (min-width: 64rem) calc(50vw - 4rem), (min-width: 48rem) calc(50vw - 3.25rem), (min-width: 40rem) calc(100vw - 3rem), calc(100vw - 2.5rem)"
            loading="lazy"
          />
          <span className={styles.shotAction} aria-hidden>
            {labels.caseStudy}
            <ArrowUpRight size={15} strokeWidth={1.75} className={styles.shotArrow} />
          </span>
        </Link>
        <figcaption className={styles.caption}>{card.caption}</figcaption>
      </figure>
    </article>
  );
}
