import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { WorkItem } from "@/config/nav";
import type { Flagship } from "@/content/flagship";
import { PRIVATE_NOTICE, USAGE } from "@/content/flagship/shared";
import type { Project } from "@/content/schema";
import { evalAnchor, publishedEvals } from "@/content/evals";
import { ShotFrame } from "@/components/flagship/shot-frame";
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

/**
 * One flagship product on the dark plate: the real app in its frames (main
 * capture, a second one layered over it), the employer, the approved usage
 * figure, the technology and the private note. The title link covers the
 * card; the capture rises into view and the icon's halo spreads while the card
 * is hovered or holds focus.
 */
export function FlagshipCard({
  flagship,
  item,
  labels,
}: {
  flagship: Flagship;
  item: WorkItem;
  labels: { readCaseStudy: string; employer: string };
}) {
  const usage = USAGE[flagship.slug];
  const titleId = `flagship-${flagship.slug}`;
  const { primary, secondary } = flagship.hero;
  return (
    <article className={styles.flagship} aria-labelledby={titleId} data-caret-trigger="">
      <div className={styles.flagshipShot}>
        {/* The stage crops the capture's foot on narrow cards, so the label sits at its top. */}
        <ShotFrame
          shot={primary}
          product={flagship.name}
          sizes="(min-width: 1000px) 400px, 92vw"
          labelAt="top"
          className={styles.flagshipMain}
        />
        <div className={styles.flagshipSide} data-kind={secondary.frame}>
          <ShotFrame
            shot={secondary}
            product={flagship.name}
            sizes={secondary.frame === "phone" ? "(min-width: 1000px) 100px, 26vw" : "(min-width: 1000px) 210px, 48vw"}
            label={false}
          />
        </div>
      </div>
      <div className={styles.flagshipBody}>
        <div className={styles.fieldTop}>
          <span className={styles.fieldIcon} aria-hidden="true">
            <NavIcon name={item.icon} size={18} />
          </span>
          <span className={styles.fieldPrivate}>
            <Lock size={12} strokeWidth={1.8} aria-hidden="true" />
            {PRIVATE_NOTICE}
          </span>
        </div>
        <p className={styles.employer}>{labels.employer}</p>
        <h3 id={titleId} className={styles.fieldTitle}>
          <Link href={item.href} prefetch={false} className={styles.stretch}>
            {flagship.name}
          </Link>
        </h3>
        <p className={styles.fieldBody}>{flagship.card.body}</p>
        <p className={styles.usage}>
          <span className={styles.usageValue}>{usage.figure}</span>
          <span className={styles.usageLabel}>{usage.label}</span>
        </p>
        <div className={styles.pills}>
          <StatusPill status="in-use" />
        </div>
        <p className={styles.tech}>{flagship.card.tech}</p>
        <span className={styles.fieldMore} aria-hidden="true">
          {labels.readCaseStudy}
          <span className="caret-swap" />
        </span>
      </div>
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
          {/* "Deployed demo" only while there is a demo to open (design-system §7.2). */}
          {project.links.live ? <StatusPill status="deployed-demo" /> : null}
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
