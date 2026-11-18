import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ArrowOut, CaretLink } from "@/components/ui/caret-link";
import { CircuitArt } from "@/components/ui/circuit-art";
import { Toc, type TocItem } from "@/components/ui/toc";
import { JumpBar } from "@/components/misc/jump-bar";
import { NEWSLETTER_ENABLED } from "@/components/features/newsletter-form";
import styles from "@/components/misc/misc.module.css";
import { SITE } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

/** When this policy last changed: the date the page shows, and its machine-readable form. */
const LAST_UPDATED = { label: "November 17, 2026", iso: "2026-11-17" } as const;

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/privacy",
    title: "Privacy policy",
    description:
      "How this site handles your data: no cookies or browser storage, how the assistant uses a question, the third-party services, and contact by email.",
    social: {
      description:
        "No cookies, no browser storage and no stored assistant transcripts: how this portfolio site handles your data.",
    },
  }),
  robots: { index: true, follow: true },
};

/**
 * The scheduling section names Buttondown only while the newsletter sign-up is
 * on (NEXT_PUBLIC_BUTTONDOWN_USERNAME), so the policy is true in either state.
 */
const SCHEDULING_LABEL = NEWSLETTER_ENABLED ? "Cal.com and Buttondown" : "Cal.com";

/** The policy's outline: the ids below and the nested table of contents. */
const OUTLINE = [
  { id: "handles", label: "What this site handles" },
  {
    id: "third-party",
    label: "Third-party integrations",
    items: [
      { id: "analytics", label: "Vercel Analytics" },
      { id: "assistant", label: "Ask this site" },
      { id: "scheduling", label: SCHEDULING_LABEL },
      { id: "social", label: "Social buttons" },
    ],
  },
  { id: "storage", label: "Cookies and local storage" },
  { id: "rights", label: "Your data rights" },
  { id: "changes", label: "Change log" },
] as const satisfies readonly TocItem[];

/**
 * /privacy — the Clerk legal layout: a light header with faint circuit art, the
 * title, the intro and "Last updated"; then a 720px prose column beside a sticky
 * nested table of contents (a horizontal jump bar on phones).
 *
 * Each former kicker is an h2 and each service an h3. Every statement here must
 * stay true of the code: no cookies or browser storage (the theme toggle is
 * gone), the assistant's one-answer handling (spec/AI_ASSISTANT.md), Cal.com
 * as a plain outbound link, and Buttondown only while the newsletter sign-up
 * on /writing is switched on.
 */
export default function PrivacyPage() {
  return (
    <>
      <header className="relative overflow-clip border-b border-border">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[60%]" aria-hidden="true">
          <CircuitArt fade="sides" />
        </div>
        <Container className="relative pt-[clamp(3.5rem,6vw,6rem)] pb-[clamp(2.5rem,4vw,3.5rem)]">
          <h1 className={styles.legalTitle}>Privacy policy</h1>
          <p className="mt-6 max-w-[740px] text-[1.0625rem] leading-relaxed text-ink">
            I build portfolio infrastructure as deliberately as I build products: minimal data, explicit
            purpose, and measurable behavior.
          </p>
          <p className="mt-6 text-sm text-ink-tertiary">
            Last updated: <time dateTime={LAST_UPDATED.iso}>{LAST_UPDATED.label}</time>
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <CaretLink href="/trust" tone="muted">
              Open trust policy
            </CaretLink>
            <CaretLink href="/contact" tone="accent">
              Ask privacy questions
            </CaretLink>
          </div>
        </Container>
      </header>

      <Section space="md" className="!pt-0 lg:!pt-[var(--space-section-sm)]">
        <JumpBar items={OUTLINE} label="Sections" className="lg:hidden" />
        <div className="mt-10 grid gap-16 lg:mt-0 lg:grid-cols-[minmax(0,720px)_220px] lg:justify-between">
          <article className={styles.legal}>
            <section aria-labelledby="handles">
              <h2 id="handles">What this site handles</h2>
              <p>
                This is a static portfolio with small utility endpoints for assistant chat and assistant
                support. No sign-in, no account profiles, and no shopping cart.
              </p>
              <p>
                I do not run ad tracking or build a user database on this site. Telemetry is limited to
                anonymous page-level events (Vercel Analytics, below) and one log line per assistant answer,
                which never holds what you typed.
              </p>
              <ul>
                <li>Nothing is stored on your device: the site sets no cookies and uses no browser storage.</li>
                <li>
                  <strong>Assistant messages</strong> are used to generate a grounded answer for that request
                  and are not persisted in custom site storage.
                </li>
                <li>
                  <strong>Contact links</strong> (including {SITE.email}) go directly to your mail client.
                </li>
              </ul>
            </section>

            <section aria-labelledby="third-party">
              <h2 id="third-party">Third-party integrations</h2>
              <p>External services used by this site:</p>
              <h3 id="analytics">Vercel Analytics</h3>
              <p>Vercel Analytics receives anonymous page-level events for product telemetry.</p>
              <h3 id="assistant">Ask this site</h3>
              <p>
                <strong>Ask this site</strong> sends your question and the recent conversation to
                Google&apos;s Gemini API to find the pages that answer it and to write the answer. This site
                stores no transcript, and logs one line per answer — how it was answered, which of the
                site&apos;s pages it used, whether a second request was needed, timings and token counts —
                never the question, the answer or your address.
              </p>
              <h3 id="scheduling">{SCHEDULING_LABEL}</h3>
              <p>
                The &ldquo;Book a call&rdquo; links open Cal.com in a new tab. Nothing from Cal.com loads on
                this site; what you enter there is covered by Cal.com&apos;s own privacy policy.{" "}
                {NEWSLETTER_ENABLED
                  ? "The newsletter form at the foot of /writing and /notes sends the email address you enter to Buttondown, which emails you to confirm the subscription; nothing else about you is sent."
                  : "This site has no newsletter sign-up."}
              </p>
              <h3 id="social">Social buttons</h3>
              <p>
                Social buttons are outbound links (GitHub, LinkedIn, Hugging Face) to platforms you already
                visit outside this site.
              </p>
            </section>

            <section aria-labelledby="storage">
              <h2 id="storage">Cookies and local storage</h2>
              <p>
                This site sets no cookies and saves nothing in your browser&apos;s local storage. The
                assistant keeps a conversation in memory only while the page is open; closing or reloading
                the page clears it.
              </p>
            </section>

            <section aria-labelledby="rights">
              <h2 id="rights">Your data rights</h2>
              <p>
                If you have questions about data sent through form fields, assistant prompts, or any external
                contact, email{" "}
                <a href={`mailto:${SITE.email}`}>
                  {SITE.email}
                  <ArrowOut inline />
                </a>{" "}
                and I will respond directly.
              </p>
              <p>
                Operational requests and abuse reports can also be raised through the{" "}
                <Link href="/contact" prefetch={false}>
                  contact page
                </Link>{" "}
                or by email.
              </p>
            </section>

            <section aria-labelledby="changes">
              <h2 id="changes">Change log</h2>
              <p>
                Last updated: <time dateTime={LAST_UPDATED.iso}>{LAST_UPDATED.label}</time>
              </p>
              <p>This page may be revised to reflect updated integrations or hosting policy.</p>
            </section>
          </article>

          <aside className="hidden lg:block">
            <Toc items={OUTLINE} title="On this page" />
          </aside>
        </div>
      </Section>
    </>
  );
}
