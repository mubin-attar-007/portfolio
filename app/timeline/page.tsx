import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { SITE } from "@/config/site";
import { AuditLane } from "@/components/features/audit-lane";
import { home } from "@/content/site";
import { timeline, timelineIntro } from "@/content/timeline";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND, PANEL, PANEL_RAISED, stagger } from "@/constants/page";

const TIMELINE_PATH = "/timeline";

export const metadata: Metadata = {
  title: "Timeline",
  description: "What I built, learned, got wrong, and changed — phase by phase.",
  alternates: { canonical: `${SITE.url}${TIMELINE_PATH}` },
  openGraph: {
    title: "Timeline — Mubin Attar",
    description: "What I built, learned, got wrong, and changed — phase by phase.",
    url: `${SITE.url}${TIMELINE_PATH}`,
    type: "website",
    images: [{ url: `${SITE.url}${TIMELINE_PATH}/opengraph-image.png` }],
  },
};

/**
 * One term/description pair inside a phase — Built, Learned, Changed.
 *
 * Props: `label` (the term), `children` (the description).
 * A11y: renders a real `<dt>`/`<dd>` pair inside the phase's `<dl>`, wrapped in
 * the `<div>` the HTML content model permits, so the association survives with
 * styles off.
 */
function PhaseRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[7rem_1fr] sm:gap-6">
      <dt className={LABEL}>{label}</dt>
      <dd className="max-w-[var(--width-prose)] text-ink-secondary">{children}</dd>
    </div>
  );
}

/**
 * /timeline — growth over titles, phase by phase.
 *
 * THE MISTAKE LINE IS THE POINT OF THIS PAGE. Anyone can list what they built;
 * naming what you got wrong, per phase, is the only part a reader can't get from
 * a résumé, and it is the reason to believe the rest. So it is not a fourth row
 * in a uniform list — it is lifted onto its own surface inside each phase: a
 * `bg-bg-subtle` block with the 3px left rule the site uses for callouts, its
 * label at full `ink` instead of tertiary, and its sentence set one step up at
 * `text-lg text-ink` while its neighbours stay `ink-secondary`.
 *
 * That emphasis is deliberately built from CONTRAST AND WEIGHT, not from accent:
 * three phase cards can share a viewport, and three accent rules would blow the
 * two-accent-per-viewport budget (DESIGN §9) on a page whose only accent moment
 * should be the header. Nothing here depends on colour alone — the label text,
 * the indent and the surface all carry the same signal.
 *
 * A11y: one `<h1>` (PageHeader) and an `<h2>` per phase, so the page is navigable
 * by heading; each phase's four facts are a real `<dl>`. The ordered list reflects
 * that the phases have a sequence. Entrance is CSS-only and collapses under
 * `prefers-reduced-motion`.
 */
export default function TimelinePage() {
  return (
    <>
      <Section space="md" aurora className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={timelineIntro.kicker}
          title={timelineIntro.title}
          lede={timelineIntro.lede}
        >
          {/* `quiet`: the uniform header-link treatment — ink-secondary keeps AA on
              the `aurora` band where accent text loses contrast against the tint. */}
          <TextLink href={timelineIntro.cta.href} tone="quiet">
            {timelineIntro.cta.label}
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
        <ol className="reveal-stagger flex flex-col gap-8">
          {timeline.map((phase, i) => (
            <li key={phase.period} className="reveal" style={stagger(i)}>
              <article className={`${PANEL} ${PANEL_RAISED}`}>
                <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                  <div>
                    <h2 className="text-xl text-ink">{phase.role}</h2>
                    {phase.org ? (
                      <p className="mt-0.5 text-sm text-ink-secondary">{phase.org}</p>
                    ) : null}
                  </div>
                  <p className={LABEL}>{phase.period}</p>
                </header>

                <hr className="rule-fade my-6" />

                <dl className="flex flex-col gap-6">
                  <PhaseRow label={timelineIntro.labels.built}>{phase.built}</PhaseRow>
                  <PhaseRow label={timelineIntro.labels.learned}>{phase.learned}</PhaseRow>

                  {/* The credibility device — see the component note above. */}
                  <div className="rounded-[var(--radius-sm)] border-l-[length:var(--stripe-width)] border-l-ink bg-bg-subtle px-5 py-4 sm:px-6 sm:py-5">
                    <dt className="font-mono text-xs uppercase tracking-[0.06em] text-ink">
                      {timelineIntro.labels.mistake}
                    </dt>
                    <dd className="mt-2.5 max-w-[var(--width-prose)] text-lg text-ink">
                      {phase.mistake}
                    </dd>
                  </div>

                  <PhaseRow label={timelineIntro.labels.changed}>{phase.changed}</PhaseRow>
                </dl>
              </article>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
