import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND, PANEL, stagger } from "@/constants/page";
import { trust } from "@/content/site";
import { SITE } from "@/config/site";

const TRUST_PATH = "/trust";

export const metadata: Metadata = {
  title: "Trust",
  description:
    "Evidence-first trust page for Mubin Attar: safety controls, engineering discipline, and quality standards.",
  alternates: { canonical: `${SITE.url}${TRUST_PATH}` },
  openGraph: {
    siteName: SITE.name,
    title: "Trust — Mubin Attar",
    description:
      "Evidence-first trust page for Mubin Attar: safety controls, engineering discipline, and quality standards.",
    url: `${SITE.url}${TRUST_PATH}`,
    type: "website",
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
      <Section space="md" className={PAGE_HEADER_BAND}>
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
      <Section space="md" className={PAGE_BODY_BAND}>
        <dl className="divide-y divide-border border-y border-border">
          {TRUST_METRICS.map((metric, i) => (
            <div
              key={metric.value}
              className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-8"
              style={stagger(i + 1)}
            >
              <dt className={LABEL}>
                {metric.label} {i + 1}
              </dt>
              <dd className="text-sm leading-6 text-ink-secondary">{metric.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-16">
          <SectionHeading kicker="Operating principles" size="compact">
            Evidence before statements
          </SectionHeading>

          <div className="mt-8 reveal-stagger grid gap-4 md:grid-cols-3">
            {trust.principles.map((principle, i) => (
              <article
                key={principle.title}
                className={`${PANEL} bg-bg-subtle reveal transition-colors duration-fast ease-[var(--ease-out)] hover:border-border-strong`}
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
                className="rounded-[var(--radius-md)] border-l-[length:var(--stripe-width)] border-l-ink py-1 transition-colors duration-fast hover:border-l-accent"
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
