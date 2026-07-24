import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { PAGE_BODY_BAND, PAGE_HEADER_BAND } from "@/constants/page";
import { resume } from "@/content/resume";
import { SITE } from "@/config/site";

const SKILLS_PATH = "/skills";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Technology stack, LLM practices, and engineering disciplines I use to ship production AI/ML systems.",
  alternates: { canonical: `${SITE.url}${SKILLS_PATH}` },
  openGraph: {
    siteName: SITE.name,
    title: "Skills — Mubin Attar",
    description:
      "Technology stack, LLM practices, and engineering disciplines used across four live AI products.",
    url: `${SITE.url}${SKILLS_PATH}`,
    type: "website",
  },
};

export default function SkillsPage() {
  return (
    <>
      <Section space="md" className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker="Skills"
          title="Skills"
          lede="A practical stack map for building production AI/ML systems: language tooling, model architecture, data layers, and safety disciplines."
        >
          <Link href="/resume" className={buttonVariants("secondary")}>
            Résumé context
          </Link>
          <TextLink href="/uses" tone="quiet">
            Stack details
          </TextLink>
        </PageHeader>
      </Section>

      <Section space="md" className={PAGE_BODY_BAND}>
        <h2 className="text-2xl font-medium text-ink">Capabilities in context</h2>
        <p className="mt-4 max-w-[var(--width-prose)] text-ink-secondary">
          This is an inventory, not a self-rating. The case studies show where
          each capability was used, what boundary it owned, and how the result
          was measured.
        </p>

        <dl className="mt-10 border-t border-border">
          {resume.skills.map((skillGroup) => (
            <div
              key={skillGroup.group}
              className="grid gap-3 border-b border-border py-6 sm:grid-cols-[minmax(10rem,0.35fr)_minmax(0,1fr)] sm:gap-8"
            >
              <dt className="font-medium text-ink">{skillGroup.group}</dt>
              <dd className="leading-7 text-ink-secondary">
                {skillGroup.items}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          <TextLink href="/work">View skills in real projects</TextLink>
          <TextLink href="/resume">See experience backing this stack</TextLink>
        </div>
      </Section>
    </>
  );
}
