import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import { AuditLane } from "@/components/features/audit-lane";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND, PANEL, PANEL_RAISED, stagger } from "@/constants/page";
import { home, trust } from "@/content/site";
import { SITE } from "@/config/site";

const TRUST_PATH = "/trust";

export const metadata: Metadata = {
  title: "Trust | Mubin Attar",
  description:
    "Evidence-first trust page for Mubin Attar: safety controls, engineering discipline, and quality standards.",
  alternates: { canonical: `${SITE.url}${TRUST_PATH}` },
  openGraph: {
    title: "Trust — Mubin Attar",
    description:
      "Evidence-first trust page for Mubin Attar: safety controls, engineering discipline, and quality standards.",
    url: `${SITE.url}${TRUST_PATH}`,
    type: "website",
    images: [{ url: `${SITE.url}${TRUST_PATH}/opengraph-image.png` }],
  },
};

const TRUST_METRICS = [
  { label: "Signal", value: "4 live production products" },
  { label: "Signal", value: "Reproducible evals and decision logs" },
  { label: "Signal", value: "Public changelog for trust-impacting decisions" },
];

export default function TrustPage() {
  return (
    <>
      <Section space="md" aurora className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={trust.kicker}
          title={trust.title}
          lede={trust.body}
        >
          <TextLink href="/changelog" tone="quiet">
            Open changelog
          </TextLink>
          <TextLink href="/hire">Talk about trust in production</TextLink>
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
        <div className="reveal-stagger grid gap-4 md:grid-cols-3">
          {TRUST_METRICS.map((metric, i) => (
            <article
              key={metric.value}
              className={`${PANEL} ${PANEL_RAISED} reveal`}
              style={stagger(i + 1)}
            >
              <p className={LABEL}>{metric.label} {i + 1}</p>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <SectionHeading kicker="Operating principles" size="compact">
            Evidence before statements
          </SectionHeading>

          <div className="mt-8 reveal-stagger grid gap-4 md:grid-cols-3">
            {trust.principles.map((principle, i) => (
              <article
                key={principle.title}
                className={`${PANEL} bg-bg-subtle reveal transition-all duration-fast ease-[var(--ease-out)] hover:-translate-y-0.5`}
                style={stagger(i + 1)}
              >
                <h3 className="text-base font-semibold text-ink">{principle.title}</h3>
                <p className="mt-2.5 text-sm leading-6 text-ink-secondary">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading kicker="Systems and controls" size="compact">
            How quality is protected
          </SectionHeading>

          <div className="mt-8 reveal-stagger space-y-4">
            {trust.controls.map((group, i) => (
              <article
                key={group.title}
                className="rounded-[var(--radius-md)] border-l-[length:var(--stripe-width)] border-l-ink py-1 transition-[border-color,transform] duration-fast hover:border-l-accent hover:-translate-x-0.5"
                style={stagger(i + 1)}
              >
                <div className="border border-border/80 bg-surface p-6">
                  <p className={LABEL}>{group.title}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-secondary">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span aria-hidden="true">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="reveal mt-16 border-t border-border pt-8">
          <div className="flex flex-wrap items-start justify-between gap-6 sm:items-center">
            <p className="max-w-[45ch] text-sm text-ink-secondary">
              Want to see the rollout history of changes, experiments, and
              reliability updates?
            </p>
            <TextLink href="/changelog">Open changelog</TextLink>
          </div>
        </div>
      </Section>
    </>
  );
}
