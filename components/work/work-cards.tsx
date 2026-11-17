import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { PillStatus } from "@/config/site";
import type { WorkItem } from "@/config/nav";
import type { Project } from "@/content/schema";
import { evalAnchor, publishedEvals } from "@/content/evals";
import { BrowserFrame } from "@/components/ui/browser-frame";
import { CaretLink } from "@/components/ui/caret-link";
import { StatusPill } from "@/components/ui/status-pill";
import { NavIcon } from "@/components/layout/nav-icon";
import styles from "./work-index.module.css";

/** The one figure a public card leads with, and where its method lives. */
type Headline = { value: string; label: string; href: string };

/**
 * A project's headline: its first published registry row (never a retired
 * one), or — for a project with no scored run — its first design claim, which
 * links to the case study's results section where the check is described.
 */
export function headlineMetric(project: Project): Headline | null {
  const row = publishedEvals.find((e) => e.system === project.title);
  if (row) return { value: row.result, label: row.metric, href: `/evals#${evalAnchor(row)}` };
  const claim = project.metrics[0];
  return claim ? { value: claim.value, label: claim.label, href: `/work/${project.slug}#results` } : null;
}

/** One anonymous field system on the dark plate: report link, live states, private note. */
export function FieldCard({
  item,
  title,
  body,
  pills,
  readReport,
  privateNote,
}: {
  item: WorkItem;
  title: string;
  body: string;
  pills: readonly { status: PillStatus; label: string }[];
  readReport: string;
  privateNote: string;
}) {
  return (
    <article className={styles.field} aria-labelledby={`field-${item.slug}`} data-caret-trigger="">
      <div className={styles.fieldTop}>
        <span className={styles.fieldIcon} aria-hidden="true">
          <NavIcon name={item.icon} size={18} />
        </span>
        <span className={styles.fieldPrivate}>
          <Lock size={12} strokeWidth={1.8} aria-hidden="true" />
          {privateNote}
        </span>
      </div>
      <h3 id={`field-${item.slug}`} className={styles.fieldTitle}>
        <Link href={item.href} prefetch={false} className={styles.stretch}>
          {title}
        </Link>
      </h3>
      <p className={styles.fieldBody}>{body}</p>
      <div className={styles.pills}>
        {pills.map((pill) => (
          <StatusPill key={pill.label} status={pill.status}>
            {pill.label}
          </StatusPill>
        ))}
      </div>
      <span className={styles.fieldMore} aria-hidden="true">
        {readReport}
        <span className="caret-swap" />
      </span>
    </article>
  );
}

/** One public system: its real capture in a frame, the headline figure with its method, and the links. */
export function PublicCard({
  project,
  labels,
}: {
  project: Project;
  labels: { caseStudy: string; demo: string; source: string; method: string };
}) {
  const headline = headlineMetric(project);
  const href = `/work/${project.slug}`;
  return (
    <article className={styles.public} aria-labelledby={`public-${project.slug}`}>
      <Link href={href} prefetch={false} className={styles.shot} tabIndex={-1} aria-hidden="true">
        <BrowserFrame url={project.links.live ? new URL(project.links.live).hostname : project.title}>
          <Image
            src={project.card.shot.src}
            alt=""
            width={project.card.shot.width}
            height={project.card.shot.height}
            sizes="(min-width: 1000px) 560px, calc(100vw - 48px)"
          />
        </BrowserFrame>
      </Link>
      <div className={styles.publicBody}>
        <div className={styles.publicHead}>
          <p className={styles.category}>{project.card.category}</p>
          <StatusPill status="deployed-demo" />
        </div>
        <h3 id={`public-${project.slug}`} className={styles.publicTitle}>
          <Link href={href} prefetch={false}>
            {project.title}
          </Link>
        </h3>
        <p className={styles.publicDef}>{project.card.definition}</p>
        {headline ? (
          <p className={styles.metric}>
            <span className={styles.metricValue}>{headline.value}</span>
            <span className={styles.metricLabel}>
              {headline.label} ·{" "}
              <Link href={headline.href} prefetch={false} className={styles.methodLink}>
                {labels.method}
                <span className="sr-only"> for {project.title}</span>
              </Link>
            </span>
          </p>
        ) : null}
        <div className={styles.links}>
          <CaretLink href={href}>
            {labels.caseStudy}
            <span className="sr-only">: {project.title}</span>
          </CaretLink>
          {project.links.live ? (
            <CaretLink href={project.links.live} tone="muted">
              {labels.demo}
              <span className="sr-only">: {project.title}</span>
            </CaretLink>
          ) : null}
          {project.links.repo ? (
            <CaretLink href={project.links.repo} tone="muted">
              {labels.source}
              <span className="sr-only">: {project.title}</span>
            </CaretLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}
