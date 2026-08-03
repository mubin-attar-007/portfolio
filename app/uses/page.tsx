import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { PageHeader } from "@/components/ui/page-header";
import { TextLink } from "@/components/ui/text-link";
import { SITE } from "@/config/site";
import { uses } from "@/content/site";
import {
  LABEL,
  PAGE_BODY_BAND,
  PAGE_HEADER_BAND,
  PANEL,
  stagger,
} from "@/constants/page";

const USES_PATH = "/uses";

export const metadata: Metadata = {
  title: "Uses",
  description: "The stack behind four live products — a deliberately boring, $0 free-tier stack.",
  alternates: { canonical: `${SITE.url}${USES_PATH}` },
  openGraph: {
    siteName: SITE.name,
    title: "Uses — Mubin Attar",
    description: "The stack behind four live products — a deliberately boring, $0 free-tier stack.",
    url: `${SITE.url}${USES_PATH}`,
    type: "website",
  },
};

/**
 * /uses — the stack page. All content from content/site.ts (Law 3).
 *
 * Design: the shared PageHeader, then four flat hairline groups. This is a
 * reference list, so nothing implies a clickable card or raised surface.
 *
 * A11y: each group is a real `<section>` with an `<h2>` that labels its list, so
 * the page is navigable by heading; the leading arrows are decoration and hidden
 * from assistive technology. `h-full` on the panel keeps two side-by-side cards
 * the same height without faking it with a fixed measure.
 */
export default function UsesPage() {
  return (
    <>
      <Section space="md" className={PAGE_HEADER_BAND}>
        <PageHeader kicker={uses.kicker} title={uses.title} lede={uses.intro}>
          <TextLink href={uses.cta.href} tone="quiet">
            {uses.cta.label}
          </TextLink>
        </PageHeader>
      </Section>

      <Section space="md" className={PAGE_BODY_BAND}>
        {/* `.reveal` sits on the <li> wrapper, never on the panel itself — the
            stagger keyframe holds `transform: none` after it finishes and would
            out-rank any transform the card wanted later (globals.css). */}
        <ul className="reveal-stagger grid gap-6 sm:grid-cols-2">
          {uses.groups.map((g, i) => (
            <li key={g.title} className="reveal" style={stagger(i)}>
              <section className={`${PANEL} h-full`}>
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
