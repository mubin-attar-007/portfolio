import type { ReactNode } from "react";
import { Section } from "@/components/layout/section";
import { Bento, Card, CardArt, CardBody } from "@/components/ui/card";
import { CaretLink } from "@/components/ui/caret-link";
import { SectionHeader } from "@/components/ui/section-header";
import { SmartLink } from "@/components/ui/smart-link";
import { cx } from "@/components/ui/cx";
import { projectBySlug } from "@/content/projects";
import { PUBLIC, type PublicCard } from "@/content/pages/home";
import art from "./bento-art.module.css";
import styles from "./sections.module.css";

/* Each card's mini-UI. Illustrations only: the CrownWager split is labelled an
   illustrative pick, and none of them is a result. */
const CHART = "M0 110 L30 100 L60 104 L90 86 L120 90 L150 70 L180 76 L210 56 L240 62 L270 40 L300 46 L320 30";

const ART: Record<PublicCard["slug"], ReactNode> = {
  dbwhisper: (
    <div className={art.mini}>
      <p className={art.q}>“Revenue by month, Jan–Apr 2024”</p>
      <p className={art.miniSql}>SELECT … FROM orders GROUP BY 1;</p>
      <p className={art.check}>Read-only</p>
      <p className={art.check}>Enrolled schema</p>
    </div>
  ),
  tradepulse: (
    <>
      <svg className={art.chart} viewBox="0 0 320 140">
        <defs>
          <linearGradient id="home-tradepulse-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity=".22" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className={art.chartArea} d={`${CHART} L320 140 L0 140Z`} fill="url(#home-tradepulse-area)" />
        <path className={art.chartLine} d={CHART} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
      </svg>
      <span className={art.chartPill}>✓ closed bars only</span>
    </>
  ),
  crownwager: (
    <div className={cx(art.mini, art.pick)}>
      <p className={art.q}>Model pick, graded after the final score</p>
      <div className={art.odds}>
        <span>
          62%<small>home</small>
        </span>
        <span className={art.oddsAway}>
          38%<small>away</small>
        </span>
      </div>
      <div className={art.prob}>
        <i />
      </div>
      <span className={art.sample}>{PUBLIC.illustrativePick}</span>
    </div>
  ),
  "llm-studio": (
    <div className={art.mini}>
      <p className={art.bubbleQ}>Summarise my last chat</p>
      <p className={art.bubbleA}>Only your own conversations are visible to you.</p>
    </div>
  ),
};

/**
 * PublicWork — the four public systems as light cards: a mini-UI that plays
 * its moment on hover, a one-line description, the one result each leads
 * with (read from the eval registry, with its method and a link to it), and
 * the case-study and source links.
 */
export function PublicWork() {
  return (
    <Section space="lg" id="public" ariaLabelledBy="public-title">
      <SectionHeader kicker={PUBLIC.kicker} title={PUBLIC.title} lead={PUBLIC.lead} id="public-title">
        <CaretLink href={PUBLIC.more.href} size="md">
          {PUBLIC.more.label}
        </CaretLink>
      </SectionHeader>
      <Bento columns={2} className={cx("mt-16", art.scope)}>
        {PUBLIC.cards.map((card) => {
          const project = projectBySlug(card.slug);
          if (!project) throw new Error(`home: no project "${card.slug}" in content/projects.ts`);
          return (
            <Card key={card.slug}>
              <CardArt>{ART[card.slug]}</CardArt>
              <CardBody className="mt-0">
                <h3>{project.title}</h3>
                <p>{card.body}</p>
                <p className={styles.metric}>
                  {card.metric.value}
                  <small>
                    {card.metric.method} ·{" "}
                    <SmartLink href={card.metric.href} className={styles.methodLink}>
                      {PUBLIC.methodLink}
                      <span className="sr-only"> for {project.title}</span>
                    </SmartLink>
                  </small>
                </p>
                <div className={styles.cardLinks}>
                  <CaretLink href={`/work/${project.slug}`}>
                    {PUBLIC.caseStudy}
                    <span className="sr-only">: {project.title}</span>
                  </CaretLink>
                  {project.links.repo ? (
                    <CaretLink href={project.links.repo}>
                      {PUBLIC.source}
                      <span className="sr-only">: {project.title}</span>
                    </CaretLink>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </Bento>
    </Section>
  );
}
