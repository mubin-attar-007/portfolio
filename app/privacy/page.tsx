import Link from "next/link";
import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import {
  LABEL,
  PAGE_BODY_BAND,
  PAGE_HEADER_BAND,
  PANEL,
  PANEL_RAISED,
  stagger,
} from "@/constants/page";
import { SITE } from "@/config/site";

const PRIVACY_PATH = "/privacy";
const LAST_UPDATED = "July 23, 2026";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Privacy policy for this portfolio: local preferences, assistant interactions, third-party integrations, and contact handling.",
  alternates: { canonical: `${SITE.url}${PRIVACY_PATH}` },
  openGraph: {
    siteName: SITE.name,
    title: "Privacy Policy — Mubin Attar",
    description:
      "Minimal collection, deterministic behavior, and explicit controls for this portfolio site.",
    url: `${SITE.url}${PRIVACY_PATH}`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Section space="md" className={PAGE_HEADER_BAND}>
        <PageHeader
          kicker="Privacy"
          title="Privacy policy"
          lede="I build portfolio infrastructure as deliberately as I build products: minimal data, explicit purpose, and measurable behavior."
        >
          <TextLink href="/trust" tone="quiet">
            Open trust policy
          </TextLink>
          <TextLink href="/hire">Ask privacy questions</TextLink>
        </PageHeader>
      </Section>

      <Section space="md" className={PAGE_BODY_BAND}>
        <div className="reveal-stagger space-y-6">
          <article className={`${PANEL} ${PANEL_RAISED} reveal`} style={stagger(1)}>
            <p className={LABEL}>What this site handles</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-ink-secondary">
              <p>
                This is a static portfolio with small utility endpoints for assistant chat and
                assistant support. No sign-in, no account profiles, and no shopping cart.
              </p>
              <p>
                I do not run ad tracking or build a user database on this site. Interaction
                telemetry is limited to what is required for rendering, delivery, and uptime.
              </p>
            </div>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-ink-secondary">
              <li className="flex items-start gap-2">
                <span aria-hidden="true">•</span>
                <span>Theme preference is stored locally as a browser key, not sent to the server.</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true">•</span>
                <span>
                  <strong>Assistant messages</strong> are used to generate a grounded answer for that
                  request and are not persisted in custom site storage.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true">•</span>
                <span>
                  <strong>Contact links</strong> (including {SITE.email}) go directly to your mail
                  client.
                </span>
              </li>
            </ul>
          </article>

          <article className={`${PANEL} reveal`} style={stagger(2)}>
            <SectionHeading kicker="Third-party integrations" size="compact">
              External services used by this site
            </SectionHeading>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-ink-secondary">
              <li className="flex items-start gap-2">
                <span aria-hidden="true">•</span>
                <span>Vercel Analytics receives anonymous page-level events for product telemetry.</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true">•</span>
                <span>
                  Buttondown and Cal.com are only loaded when their public integration settings are
                  enabled for opt-in newsletter or scheduling actions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true">•</span>
                <span>
                  Social buttons are outbound links (GitHub, LinkedIn, Hugging Face) to platforms you
                  already visit outside this site.
                </span>
              </li>
            </ul>
          </article>

          <article className={`${PANEL} reveal`} style={stagger(3)}>
            <SectionHeading kicker="Cookies and local storage" size="compact">
              Preferences and persistence
            </SectionHeading>
            <p className="mt-5 text-sm leading-6 text-ink-secondary">
              I do not use marketing cookies. Theme preference is saved in local browser storage so
              your display choice stays stable across reloads. If you clear site data, the theme
              setting is removed.
            </p>
          </article>

          <article className={`${PANEL} reveal`} style={stagger(4)}>
            <SectionHeading kicker="Your data rights" size="compact">
              If you want changes or deletion
            </SectionHeading>
            <p className="mt-5 text-sm leading-6 text-ink-secondary">
              If you have questions about data sent through form fields, assistant prompts, or any
              external contact, email{" "}
              <a href={`mailto:${SITE.email}`} className="link-underline">
                {SITE.email}
              </a>{" "}
              and I will respond directly.
            </p>
            <p className="mt-4 text-sm leading-6 text-ink-secondary">
              Operational requests and abuse reports can also be raised in{" "}
              <Link href="/hire" className="link-underline">
                /hire
              </Link>{" "}
              or through direct email.
            </p>
          </article>

          <article className={`${PANEL} reveal`} style={stagger(5)}>
            <p className={LABEL}>Change log</p>
            <p className="mt-4 text-sm leading-6 text-ink-secondary">
              Last updated: <time dateTime="2026-07-23">{LAST_UPDATED}</time>
            </p>
            <p className="mt-3 text-sm leading-6 text-ink-secondary">
              This page may be revised to reflect updated integrations or hosting policy.
            </p>
          </article>
        </div>
      </Section>
    </>
  );
}
