import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import { buttonVariants, ButtonGlyph } from "@/components/ui/button";
import { AuditLane } from "@/components/features/audit-lane";
import { ProofStrip } from "@/components/features/proof-strip";
import { about, home } from "@/content/site";
import { SITE } from "@/config/site";
import { FIGURE, PAGE_BODY_BAND, PAGE_HEADER_BAND, stagger } from "@/constants/page";

const ABOUT_PATH = "/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mubin Attar — AI/ML engineer. Who I am, how I think, and the one rule across all of it.",
  alternates: { canonical: `${SITE.url}${ABOUT_PATH}` },
  openGraph: {
    title: "About — Mubin Attar",
    description:
      "Mubin Attar — AI/ML engineer. Who I am, how I think, and the one rule across all of it.",
    url: `${SITE.url}${ABOUT_PATH}`,
    type: "website",
    images: [{ url: `${SITE.url}${ABOUT_PATH}/opengraph-image.png` }],
  },
};

/**
 * /about — identity, then "how I think".
 *
 * Structure: the shared PageHeader on an `aurora` band (the same entrance every
 * route now opens with) beside a framed portrait → the honest proof strip → the
 * biography prose → the three principles (home.principles) as a hairline-divided
 * list rather than a card grid (DESIGN §9).
 *
 * Design notes — why this shape:
 * - The header band and the body band each spend HALF a section gap
 *   (PAGE_HEADER_BAND / PAGE_BODY_BAND), so the page opens on content instead of
 *   the ~340px void it used to.
 * - The action row is the site's standard primary/secondary pair. It previously
 *   paired one small primary button with four bare text links, which read as
 *   unfinished next to the homepage's CTA pair; the supporting links are now the
 *   shared TextLink affordance, so a visitor recognises them from every other page.
 * - The portrait is a framed FIGURE (radius-lg, hairline, --shadow-md) rather
 *   than a bare `<img>` — the same object vocabulary as every card on the site,
 *   so it reads as a deliberate figure instead of an image dropped on the page.
 *
 * A11y: one `<h1>` (from PageHeader); the principles are a real description list,
 * so the pairing of rule and explanation survives without CSS. The portrait keeps
 * its author-written alt text. All entrance motion is CSS and collapses under
 * `prefers-reduced-motion`.
 */
export default function AboutPage() {
  return (
    <>
      <Section space="md" aurora className={PAGE_HEADER_BAND}>
        {/* `items-center` (not `items-start`): the portrait is shorter than the
            text column, and top-aligning it left a heavy block of white under the
            frame. Vertically centring the two is the split-layout rule the rest of
            the site follows. */}
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-16">
          <div className="min-w-0">
            <PageHeader kicker={about.kicker} title={about.headline} lede={about.body[0]}>
              <Link href="/hire" className={buttonVariants("primary")}>
                <ButtonGlyph />
                {about.ctas.primary}
              </Link>
              <Link href="/resume" className={buttonVariants("secondary")}>
                {about.ctas.secondary}
              </Link>
            </PageHeader>
            <div className="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {about.links.map((l) => (
                // `quiet`: these are supporting links sitting one row under a
                // primary button, and DESIGN §9 caps accent at two elements per
                // viewport — three accent chevrons here would spend the whole
                // budget on the least important row on the page.
                <TextLink key={l.label} href={l.href} external={l.external} tone="quiet">
                  {l.label}
                </TextLink>
              ))}
            </div>
          </div>
          {/* `order-first` on mobile: at one column the portrait belongs above the
              headline, where it introduces the person before the claim. */}
          <figure className={`${FIGURE} order-first w-40 shrink-0 sm:w-48 md:order-none md:w-56`}>
            <Image
              src="/mubin.png"
              alt="Mubin Attar"
              width={369}
              height={461}
              sizes="(max-width: 768px) 12rem, 14rem"
              priority
              className="h-auto w-full"
            />
          </figure>
        </div>
      </Section>

      {/* Honest proof anchor — the same credibility strip as the home page. */}
      <ProofStrip />
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
        {/* The rest of the biography. It sits BELOW the proof strip rather than in
            the header, because the header's job is one claim and one action; the
            detail is what a reader who kept going came for. */}
        <div className="reveal flex max-w-[var(--width-prose)] flex-col gap-4 text-lg text-ink-secondary">
          {about.body.slice(1).map((para) => (
            <p key={para}>{para}</p>
          ))}
        </div>

        <hr className="rule-fade mt-14" />

        {/* How I think — the three principles as a hairline-divided list, not a
            card grid (DESIGN §9). Staggered so the rules arrive one at a time. */}
        <div className="mt-14">
          <SectionHeading kicker={about.thinking.kicker}>{about.thinking.title}</SectionHeading>
          <dl className="reveal-stagger mt-10 divide-y divide-border border-y border-border">
            {home.principles.map((pr, i) => (
              <div
                key={pr.title}
                className="reveal grid gap-2 py-7 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-12"
                style={stagger(i)}
              >
                <dt className="text-lg text-ink">{pr.title}</dt>
                <dd className="max-w-[var(--width-prose)] text-ink-secondary">{pr.body}</dd>
              </div>
            ))}
          </dl>
          <TextLink href={about.thinking.href} className="mt-8">
            {about.thinking.cta}
          </TextLink>
        </div>
      </Section>
    </>
  );
}
