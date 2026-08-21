import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/schema";
import styles from "./project-card.module.css";

/**
 * ProjectCard — the site's ONE project tile, shared by the homepage bento and
 * the /work index.
 *
 * It exists because those two surfaces had grown separate card treatments: a
 * rich one on the homepage and a plain bordered one on /work, so clicking
 * "See all four projects" took the visitor from a designed gallery to what
 * looked like a different site. One component, two sizes.
 *
 * Everything it renders comes from the project itself (`content/projects.ts`) —
 * including `card.definition`, `card.category` and the screenshot. Nothing about
 * a project is described in a page's copy file, so the homepage and /work cannot
 * describe the same product differently.
 *
 * The single result shown is `metrics[0]`, which `MetricSchema` already forces
 * to carry a `method` — so no card can display a number that nobody had to
 * justify.
 *
 * Interaction: a 4px lift on the card, and the SHOT scales rather than the card
 * (scaling a whole card blurs its own border and its type). Both are removed
 * under `prefers-reduced-motion`.
 *
 * A11y: ONE tab stop per card. The project title is the link and a stretched
 * pseudo-element makes the whole surface clickable; the live/source links sit
 * above that overlay so they stay independently reachable. `:focus-within`
 * mirrors the hover state, so keyboard users get the same affordance.
 *
 * @param size    `lead` is the tall bento hero tile; `standard` is everything
 *                else. The only differences are the title step and the crop.
 * @param priority Pass on the one card likely to be the LCP element.
 */
export function ProjectCard({
  project,
  size = "standard",
  priority = false,
  labels,
}: {
  project: Project;
  size?: "lead" | "standard";
  priority?: boolean;
  labels: { caseStudy: string; live: string; source: string };
}) {
  const metric = project.metrics[0];
  const { card } = project;

  return (
    <article className={`${styles.card} ${size === "lead" ? styles.lead : ""}`}>
      <div className={styles.body}>
        <p className={styles.meta}>
          <span>{card.category}</span>
          <span className={styles.metaDot}>{project.status}</span>
        </p>

        <h3 className={styles.name}>
          <Link href={`/work/${project.slug}`} prefetch={false} className={styles.titleLink}>
            {project.title}
          </Link>
        </h3>

        <p className={styles.definition}>{card.definition}</p>

        {metric ? (
          <div className={styles.result}>
            <span className={styles.resultValue}>{metric.value}</span>
            <span className={styles.resultLabel}>{metric.label}</span>
          </div>
        ) : null}

        {/* The lead-only evidence block: the remaining measured results and
            the system list. This — not a taller crop of the screenshot — is
            what the tall tile spends its extra height on. */}
        {size === "lead" ? (
          <div className={styles.leadExtra}>
            {project.metrics.length > 1 ? (
              <dl className={styles.leadMetrics}>
                {project.metrics.slice(1, 3).map((m) => (
                  <div key={m.label} className={styles.leadMetric}>
                    <dt>{m.label}</dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <ul className={styles.leadSystems} aria-label="Systems">
              {project.systems.slice(0, 4).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={styles.actions}>
          <span className={styles.primaryAction}>
            {labels.caseStudy}
            <ArrowRight className={styles.arrow} strokeWidth={2.25} aria-hidden />
          </span>
          {project.links.live ? (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sideAction}
            >
              {labels.live}
              <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden />
            </a>
          ) : null}
          {project.links.repo ? (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sideAction}
            >
              {labels.source}
              <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden />
            </a>
          ) : null}
        </div>
      </div>

      <div className={styles.shot}>
        <div className={styles.chrome} aria-hidden>
          <span className={styles.chromeDots}>
            <span />
            <span />
            <span />
          </span>
          <span className={styles.chromeName}>{project.slug}.app</span>
        </div>
        <div className={styles.shotFrame}>
          <Image
            src={card.shot.src}
            alt={card.alt}
            fill
            className={styles.shotImg}
            sizes="(min-width: 64rem) 44vw, (min-width: 40rem) 92vw, 100vw"
            priority={priority}
            // Never lazy. These WebPs are 14-44KB; deferring them saved nothing
            // and shipped BLANK evidence frames to anyone scrolling faster than
            // the observer — the one failure mode this site cannot afford.
            loading="eager"
          />
        </div>
      </div>
    </article>
  );
}
