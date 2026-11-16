import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { buttonVariants } from "@/components/ui/button";
import { ResumeDownloadLink } from "@/components/features/resume-download-link";
import { SITE } from "@/config/site";
import { resume } from "@/content/resume";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND, PANEL } from "@/constants/page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/resume",
  title: "Résumé",
  description: `${SITE.name} — ${SITE.role}. Experience, featured projects, skills, and education.`,
});

/**
 * /resume — the same facts as /public/Mubin_Attar_Resume.pdf and LinkedIn, from
 * one source (content/resume.ts). Site, PDF and LinkedIn must never disagree.
 *
 * Design: the shared PageHeader carries the name as the h1
 * (on a résumé the person IS the title), the role/location as its `meta` line,
 * and the PDF download as the primary action — so the thing a recruiter came for
 * is in the header rather than floated opposite it, which is where it used to sit
 * as a small secondary button with no relationship to the type beside it.
 *
 * The body is one column of `.rule-fade`-separated groups plus a skills panel in
 * the site's card vocabulary. Section labels use the shared LABEL style, so
 * "Experience" here is the same object as "Built" in the /about timeline and
 * "Open to" on /now.
 *
 * A11y: one `<h1>`, an `<h2>` per group and `<h3>` per entry — the outline reads
 * as a résumé with styles off. Every metric links to the page documenting how it
 * was measured, with a persistent underline (colour is never the only cue) and a
 * disambiguating accessible name that LEADS with the visible word (WCAG 2.5.3).
 */
export default function ResumePage() {
  return (
    <>
      <Section space="md" className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={resume.kicker}
          meta={`${SITE.role} · ${SITE.location}`}
          title={SITE.name}
          lede={resume.summary}
        >
          <ResumeDownloadLink href={resume.pdf} className={buttonVariants("primary")}>
            {resume.download}
          </ResumeDownloadLink>
          {/* `quiet`: the kicker's accent mark and the primary button have already
              spent this viewport's two-accent budget (design-system.md §11.2). */}
          <TextLink href={resume.cta.href} tone="quiet">
            {resume.cta.label}
          </TextLink>
        </PageHeader>
      </Section>

      <Section space="md" className={PAGE_BODY_BAND}>
        <div className="reveal grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="min-w-0">
            <h2 className={LABEL}>{resume.labels.experience}</h2>
            <div className="mt-6 flex flex-col gap-8">
              {resume.experience.map((e) => (
                <div key={e.org}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg text-ink">
                      {e.role} <span className="text-ink-secondary">· {e.org}</span>
                    </h3>
                    <span className="font-mono text-xs text-ink-tertiary">
                      {e.place} · {e.period}
                    </span>
                  </div>
                  <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-ink-tertiary">
                    {e.points.map((pt) => (
                      <li
                        key={pt}
                        className="max-w-[var(--width-prose)] leading-[1.7] text-ink-secondary"
                      >
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <hr className="rule-fade my-12" />

            {/* The qualifier stays the SAME tertiary as the label — it is already
                the lowest-contrast text the site ships (at the AA floor), so it
                cannot be dimmed further; the em-dash carries the separation. */}
            <h2 className={LABEL}>
              {resume.labels.projects} — {resume.labels.projectsNote}
            </h2>
            <div className="mt-6 flex flex-col gap-6">
              {resume.projects.map((p) => (
                <div key={p.name}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    {/* The name is the way into the case study the heading above
                        promises. Underlined at rest, so it never reads as a link by
                        colour alone (WCAG 1.4.1). */}
                    <h3 className="text-lg text-ink">
                      <Link
                        href={p.caseStudy}
                        prefetch={false}
                        className="underline decoration-border-strong underline-offset-4 hover:decoration-accent"
                      >
                        {p.name}
                      </Link>
                    </h3>
                    <span className="flex items-center gap-3">
                      {/* A demo link only while the deployed demo is up; the
                          source is always public. */}
                      {p.demo ? (
                        <TextLink href={p.demo} external tone="quiet">
                          {resume.labels.demo}
                        </TextLink>
                      ) : null}
                      {p.source ? (
                        <TextLink href={p.source} external tone="quiet">
                          {resume.labels.source}
                        </TextLink>
                      ) : null}
                    </span>
                  </div>
                  <p className="mt-1 max-w-[var(--width-prose)] text-sm leading-[1.65] text-ink-secondary">
                    {p.tagline}
                  </p>
                  {/* No naked numbers: every metric line carries a link to the
                      page that documents how it was measured, with its scope and
                      date in the line itself (site rule — evidence over claims). */}
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {p.metrics.map((m) => (
                      <li
                        key={m.text}
                        className="max-w-[var(--width-prose)] font-mono text-xs leading-relaxed tabular-nums text-ink-secondary"
                      >
                        {m.text}{" "}
                        <span className="text-ink-tertiary">
                          ·{" "}
                          {/* Accessible name leads with the visible word so voice-control
                              users can say "click method" (WCAG 2.5.3 Label in Name); the
                              suffix names the figure, so the links stay distinguishable.
                              The underline is persistent, not hover-only: this link sits
                              inside a run of text, so colour alone would be its only
                              distinguishing cue (WCAG 1.4.1 Use of Colour). */}
                          <Link
                            href={m.method}
                            prefetch={false}
                            aria-label={`${resume.labels.method} for ${p.name}'s ${m.topic}`}
                            className="text-accent underline decoration-from-font underline-offset-2 hover:text-accent-hover"
                          >
                            {resume.labels.method}
                          </Link>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 font-mono text-xs text-ink-tertiary">{p.stack}</p>
                </div>
              ))}
            </div>

            <hr className="rule-fade my-12" />

            <h2 className={LABEL}>{resume.labels.education}</h2>
            <div className="mt-4">
              <p className="text-ink">{resume.education.degree}</p>
              <p className="text-ink-secondary">{resume.education.school}</p>
              <p className="font-mono text-xs text-ink-tertiary">{resume.education.year}</p>
            </div>
          </div>

          {/* Skills as a panel, not a bare column: at this width it is a sidebar,
              and a surface is what tells a reader it is a reference block beside
              the narrative rather than the next section of it. Resting elevation
              only — nothing in it is clickable. */}
          <aside className={`${PANEL} h-fit`}>
            <h2 className={LABEL}>{resume.labels.skills}</h2>
            <dl className="mt-5 flex flex-col gap-4">
              {resume.skills.map((s) => (
                <div key={s.group}>
                  <dt className="text-sm text-ink">{s.group}</dt>
                  <dd className="mt-0.5 font-mono text-xs leading-relaxed text-ink-secondary">
                    {s.items}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Section>
    </>
  );
}
