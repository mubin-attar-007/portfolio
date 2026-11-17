import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { ResumeDownloadLink } from "@/components/features/resume-download-link";
import { resumePage } from "@/content/pages/resume";
import styles from "@/components/resume/resume.module.css";
import { buttonClassName } from "@/components/ui/button";
import { Caret, CaretLink } from "@/components/ui/caret-link";
import { Chip } from "@/components/ui/chip";
import { Kicker } from "@/components/ui/kicker";
import { SmartLink } from "@/components/ui/smart-link";
import { Timeline, TimelineEntry } from "@/components/ui/timeline";
import { Toc } from "@/components/ui/toc";
import { PAGE_TOP } from "@/constants/page";
import { SITE } from "@/config/site";
import { resume } from "@/content/resume";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/resume",
  title: "Résumé",
  description: `${SITE.name} — ${SITE.role}. Experience, featured projects, skills, and education.`,
});

const S = resumePage.sections;
const TOC_ITEMS = [S.summary, S.experience, S.projects, S.skills, S.education].map(({ id, label }) => ({ id, label }));

/** "2024 – present" → "2024": the machine-readable start of a period. */
const periodStart = (period: string): string => period.slice(0, 4);

/**
 * /resume — the same facts as /public/Mubin_Attar_Resume.pdf and LinkedIn, from
 * one source (content/resume.ts), in the Clerk document layout: a header with
 * the download, then a body column beside a sticky table of contents.
 *
 * Print: the nav, footer, TOC and download are chrome (`data-print="hide"`);
 * the layout collapses to one column, ink on white, and the contact links print
 * their addresses (resume.module.css; gate: scripts/print-check.mjs).
 *
 * A11y: one `<h1>` (the name), an `<h2>` per section, an `<h3>` per entry. Every
 * metric links to the page that documents how it was measured; the link's
 * accessible name leads with its visible word (WCAG 2.5.3).
 */
export default function ResumePage() {
  const contacts = [
    { label: resumePage.contact.email, text: SITE.email, href: `mailto:${SITE.email}` },
    { label: resumePage.contact.github, text: resumePage.contact.github, href: SITE.socials.github },
    { label: resumePage.contact.linkedin, text: resumePage.contact.linkedin, href: SITE.socials.linkedin },
  ];

  return (
    <Section space="lg" className={PAGE_TOP}>
      <header className={styles.header}>
        <div>
          <Kicker className="mb-4">{resume.kicker}</Kicker>
          <h1 className="text-display text-ink">{SITE.name}</h1>
          <p className="mt-3 text-xl font-medium text-ink-secondary">
            {SITE.role} · {SITE.location}
          </p>
          <ul className={styles.contact}>
            {contacts.map((c) => (
              <li key={c.label}>
                <SmartLink href={c.href}>
                  {c.text}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.actions} data-print="hide">
          <ResumeDownloadLink href={resume.pdf} className={buttonClassName("violet", "lg")}>
            {resume.download}
            <Caret />
          </ResumeDownloadLink>
          <CaretLink href={resume.cta.href} tone="muted">
            {resume.cta.label}
          </CaretLink>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.aside} data-print="hide">
          <Toc items={TOC_ITEMS} title={resumePage.toc} />
        </aside>

        <div className={styles.doc}>
          <section className={styles.section} aria-labelledby={S.summary.id}>
            <h2 id={S.summary.id} className={styles.h2}>
              {S.summary.label}
            </h2>
            <p className={styles.summary}>{resume.summary}</p>
          </section>

          <section className={styles.section} aria-labelledby={S.experience.id}>
            <h2 id={S.experience.id} className={styles.h2}>
              {S.experience.label}
            </h2>
            <Timeline label={S.experience.label}>
              {resume.experience.map((e) => (
                <TimelineEntry
                  key={e.org}
                  date={e.period}
                  dateTime={periodStart(e.period)}
                  title={e.role}
                  tags={
                    <>
                      <Chip variant="soft">{e.org}</Chip>
                      <Chip>{e.place}</Chip>
                    </>
                  }
                >
                  <ul className={styles.points}>
                    {e.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </TimelineEntry>
              ))}
            </Timeline>
          </section>

          <section className={styles.section} aria-labelledby={S.projects.id}>
            <h2 id={S.projects.id} className={styles.h2}>
              {S.projects.label}
            </h2>
            <ul className={styles.projects}>
              {resume.projects.map((p) => (
                <li key={p.slug} className={styles.project}>
                  <div className={styles.projectHead}>
                    <h3 className={styles.projectName}>
                      <SmartLink href={p.caseStudy}>{p.name}</SmartLink>
                    </h3>
                    <span className={styles.projectLinks} data-print="hide">
                      {p.demo ? (
                        <CaretLink href={p.demo} tone="muted" weight="regular">
                          {resume.labels.demo}
                        </CaretLink>
                      ) : null}
                      {p.source ? (
                        <CaretLink href={p.source} tone="muted" weight="regular">
                          {resume.labels.source}
                        </CaretLink>
                      ) : null}
                    </span>
                  </div>
                  <p className={styles.tagline}>{p.tagline}</p>
                  <ul className={styles.metrics}>
                    {p.metrics.map((m) => (
                      <li key={m.text} className={styles.metric}>
                        <span>
                          {m.text}
                          <SmartLink
                            href={m.method}
                            className={styles.method}
                            aria-label={`${resume.labels.method} for ${p.name}'s ${m.topic}`}
                            data-print="hide"
                          >
                            {resume.labels.method}
                          </SmartLink>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className={styles.stack}>{p.stack}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby={S.skills.id}>
            <h2 id={S.skills.id} className={styles.h2}>
              {S.skills.label}
            </h2>
            <dl className={styles.skills}>
              {resume.skills.map((s) => (
                <div key={s.group} className={styles.skill}>
                  <dt>{s.group}</dt>
                  <dd>{s.items}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.section} aria-labelledby={S.education.id}>
            <h2 id={S.education.id} className={styles.h2}>
              {S.education.label}
            </h2>
            <div className={styles.education}>
              <div>
                <p className={styles.degree}>{resume.education.degree}</p>
                <p className={styles.school}>{resume.education.school}</p>
              </div>
              <p className={styles.year}>{resume.education.year}</p>
            </div>
          </section>
        </div>
      </div>
    </Section>
  );
}
