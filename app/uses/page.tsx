import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { AuditLane } from "@/components/features/audit-lane";
import { SITE } from "@/config/site";
import { home, uses } from "@/content/site";
import {
  LABEL,
  PAGE_BODY_BAND,
  PAGE_HEADER_BAND,
  PANEL,
  PANEL_REST,
  stagger,
} from "@/constants/page";

const USES_PATH = "/uses";

export const metadata: Metadata = {
  title: "Uses",
  description: "The stack behind four live products — a deliberately boring, $0 free-tier stack.",
  alternates: { canonical: `${SITE.url}${USES_PATH}` },
  openGraph: {
    title: "Uses — Mubin Attar",
    description: "The stack behind four live products — a deliberately boring, $0 free-tier stack.",
    url: `${SITE.url}${USES_PATH}`,
    type: "website",
    images: [{ url: `${SITE.url}${USES_PATH}/opengraph-image.png` }],
  },
};

/**
 * /uses — the stack page. All content from content/site.ts (Law 3).
 *
 * Design: the shared PageHeader on an `aurora` band, then the four groups as
 * panels in the site's one card vocabulary (hairline + `radius-md` + resting
 * --shadow-sm). They are deliberately the QUIET elevation: this is a reference
 * list, nothing here is clickable, and elevation on the site means "this surface
 * does something" (see components/ui/card.tsx). Entrance is staggered by index,
 * so the grid assembles rather than appearing all at once.
 *
 * A11y: each group is a real `<section>` with an `<h2>` that labels its list, so
 * the page is navigable by heading; the leading arrows are decoration and hidden
 * from assistive technology. `h-full` on the panel keeps two side-by-side cards
 * the same height without faking it with a fixed measure.
 */
export default function UsesPage() {
  return (
    <>
      <Section space="md" aurora className={PAGE_HEADER_BAND}>
        <PageHeader kicker={uses.kicker} title={uses.title} lede={uses.intro}>
          {/* `quiet`: a forward link in a header sits on the `aurora` band, where
              accent TEXT loses AA against the violet tint (PageHeader documents the
              same swap for its kicker). ink-secondary keeps the chevron affordance
              without the contrast risk, and it is the uniform header-link treatment
              across all six utility routes. */}
          <TextLink href={uses.cta.href} tone="quiet">
            {uses.cta.label}
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
        {/* `.reveal` sits on the <li> wrapper, never on the panel itself — the
            stagger keyframe holds `transform: none` after it finishes and would
            out-rank any transform the card wanted later (globals.css). */}
        <ul className="reveal-stagger grid gap-6 sm:grid-cols-2">
          {uses.groups.map((g, i) => (
            <li key={g.title} className="reveal" style={stagger(i)}>
              <section className={`${PANEL} ${PANEL_REST} h-full`}>
                <h2 className={LABEL}>{g.title}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {g.items.map((item) => (
                    <li key={item} className="flex items-baseline gap-3 text-ink-secondary">
                      <span className="font-mono text-ink-tertiary" aria-hidden>
                        →
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
