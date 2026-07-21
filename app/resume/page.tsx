import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { buttonVariants } from "@/components/ui/button";
import { AuditLane } from "@/components/features/audit-lane";
import { SITE } from "@/config/site";
import { resume } from "@/content/resume";
import { home } from "@/content/site";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND, PANEL, PANEL_REST } from "@/constants/page";

const RESUME_PATH = "/resume";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Mubin Attar — AI/ML Engineer. Experience, skills, and education.",
  alternates: { canonical: `${SITE.url}${RESUME_PATH}` },
  openGraph: {
    title: "Résumé — Mubin Attar",
    description: "Mubin Attar — AI/ML Engineer. Experience, skills, and education.",
    url: `${SITE.url}${RESUME_PATH}`,
    type: "website",
    images: [{ url: `${SITE.url}${RESUME_PATH}/opengraph-image.png` }],
  },
};

/**
 * /resume — the same facts as /public/Mubin_Attar_Resume.pdf and LinkedIn, from
 * one source (content/resume.ts). Site, PDF and LinkedIn must never disagree.
 *
 * Design: the shared PageHeader on an `aurora` band carries the name as the h1
 * (on a résumé the person IS the title), the role/location as its `meta` line,
 * and the PDF download as the primary action — so the thing a recruiter came for
 * is in the header rather than floated opposite it, which is where it used to sit
 * as a small secondary button with no relationship to the type beside it.
 *
 * The body is one column of `.rule-fade`-separated groups plus a skills panel in
 * the site's card vocabulary. Section labels use the shared LABEL style, so
 * "Experience" here is the same object as "Built" on /timeline and "Open to" on
 * /now.
 *
 * A11y: one `<h1>`, an `<h2>` per group and `<h3>` per entry — the outline reads
 * as a résumé with styles off. Every metric links to the page documenting how it
 * was measured, with a persistent underline (colour is never the only cue) and a
 * disambiguating accessible name that LEADS with the visible word (WCAG 2.5.3).
 */
export default function ResumePage() {
  return (
    <>
      <Section space="md" aurora className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={resume.kicker}
          meta={`${SITE.role} · ${SITE.location}`}
          title={SITE.name}
          lede={resume.summary}
        >
          <a href={resume.pdf} className={buttonVariants("primary")}>
            {resume.download}
          </a>
          {/* `quiet`: the kicker's accent mark and the primary button have already
              spent this viewport's two-accent budget (DESIGN §9). */}
          <TextLink href={resume.cta.href} tone="quiet">
            {resume.cta.label}
          </TextLink>
        </PageHeader>
      </Section>

      <AuditLane
        title="Audit lane"
        items={[
          ...home.proof.stats.map((stat) => ({
            href: stat.href,
            value: stat.value,
            label: stat.label,
          })),
          { href: "/trust", label: "trust policy" },
          { href: "/changelog", label: "changelog" },
        ]}
        className="mt-8"
      />

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
                    <h3 className="text-lg text-ink">{p.name}</h3>
                    <span className="flex items-center gap-3">
                      <TextLink href={p.live} external tone="quiet">
                        live
                      </TextLink>
                      <TextLink href={p.github} external tone="quiet">
                        github
                      </TextLink>
                    </span>
                  </div>
                  <p className="mt-1 max-w-[var(--width-prose)] text-sm leading-[1.65] text-ink-secondary">
                    {p.tagline}
                  </p>
                  {/* No naked numbers: every metric carries a link to the page that
                      documents how it was measured (site rule — evidence over claims). */}
                  <p className="mt-1.5 font-mono text-xs tabular-nums text-ink-secondary">
                    {p.metric} <span className="text-ink-tertiary">· {p.stack}</span>{" "}
                    <span className="text-ink-tertiary">
                      ·{" "}
                      {/* Accessible name leads with the visible word so voice-control users
                          can say "click method" (WCAG 2.5.3 Label in Name); the suffix
                          disambiguates the four otherwise-identical links.
                          The underline is persistent, not hover-only: this link sits inside
                          a run of text, so colour alone would be its only distinguishing
                          cue (WCAG 1.4.1 Use of Colour). */}
                      <Link
                        href={p.method}
                        aria-label={`method — how the ${p.name} numbers were measured`}
                        className="text-accent underline decoration-from-font underline-offset-2 hover:text-accent-hover"
                      >
                        method
                      </Link>
                    </span>
                  </p>
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
          <aside className={`${PANEL} ${PANEL_REST} h-fit`}>
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
