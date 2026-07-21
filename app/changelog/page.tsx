import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import { AuditLane } from "@/components/features/audit-lane";
import { LABEL, PAGE_BODY_BAND, PAGE_HEADER_BAND, PANEL, PANEL_RAISED, stagger } from "@/constants/page";
import { changelog } from "@/content/site";
import { home } from "@/content/site";
import { SITE } from "@/config/site";

const CHANGELOG_PATH = "/changelog";

export const metadata: Metadata = {
  title: "Changelog | Mubin Attar",
  description:
    "Chronological updates for portfolio changes, launches, and engineering decisions.",
  alternates: { canonical: `${SITE.url}${CHANGELOG_PATH}` },
  openGraph: {
    title: "Changelog — Mubin Attar",
    description:
      "Chronological updates for portfolio changes, launches, and engineering decisions.",
    url: `${SITE.url}${CHANGELOG_PATH}`,
    type: "website",
    images: [{ url: `${SITE.url}${CHANGELOG_PATH}/opengraph-image.png` }],
  },
};

export default function ChangelogPage() {
  return (
    <>
      <Section space="md" aurora className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker={changelog.kicker}
          title={changelog.title}
          lede={changelog.intro}
        >
          <TextLink href="/trust" tone="quiet">
            Open trust page
          </TextLink>
          <TextLink href="/hire">Need this level of rigor on your team?</TextLink>
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
        <SectionHeading kicker="Release history" size="compact">
          What changed, when, and why
        </SectionHeading>

        <div className="reveal-stagger mt-8 space-y-6">
          {changelog.entries.map((entry, i) => (
            <article
              key={entry.title}
              className={`${PANEL} ${PANEL_RAISED} reveal`}
              style={stagger(i + 1)}
            >
              <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
                <p className={LABEL}>{entry.quarter}</p>
                <div>
                  <h3 className="text-2xl font-semibold leading-snug text-ink md:text-[1.875rem]">{entry.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-secondary">
                    {entry.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2">
                        <span aria-hidden="true">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="reveal mt-12 border-t border-border pt-8">
          <p className="max-w-[var(--width-prose)] text-sm leading-6 text-ink-secondary">
            Each entry is curated from production updates and code-level decisions.
            If you need a deeper audit trail, contact me from the{" "}
            <TextLink href="/hire" className="text-sm">
              hire
            </TextLink>{" "}
            route.
          </p>
        </div>
      </Section>
    </>
  );
}
