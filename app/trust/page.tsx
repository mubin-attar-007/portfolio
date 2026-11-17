import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CircuitArt } from "@/components/ui/circuit-art";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { EvidenceTable } from "@/components/trust/evidence-table";
import { Practices } from "@/components/trust/practices";
import { EVIDENCE, TRUST_PAGE } from "@/content/pages/trust";
import styles from "@/components/trust/trust.module.css";
import { SITE } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/trust",
  title: "Trust",
  description: `Evidence-first trust page for ${SITE.name}: every claim with its status and a source you can check, including what is not claimed.`,
});

/** /trust — the Clerk Security pattern: a light hero, the evidence table, principles, practices, a CTA. */
export default function TrustPage() {
  const { glance, principles, practices, cta, actions } = TRUST_PAGE;
  return (
    <>
      <Section space="head" className={styles.hero}>
        <CircuitArt fade="top" />
        <div className={styles.heroInner}>
          <PageHeader kicker={TRUST_PAGE.kicker} title={TRUST_PAGE.title} lede={TRUST_PAGE.lead}>
            <Button variant="violet" size="lg" caret href={actions.primary.href}>
              {actions.primary.label}
            </Button>
            <Button variant="light" size="lg" caret href={actions.secondary.href}>
              {actions.secondary.label}
            </Button>
          </PageHeader>
        </div>
      </Section>

      <Section space="sm" ariaLabelledBy="glance-title">
        <SectionHeader id="glance-title" kicker={glance.kicker} title={glance.title} size="sm" />
        <div className="mt-8">
          <EvidenceTable rows={EVIDENCE} />
        </div>
      </Section>

      <Section space="md" tone="subtle" ariaLabelledBy="principles-title">
        <SectionHeader id="principles-title" kicker={principles.kicker} title={principles.title} />
        <ul className={`mt-10 ${styles.principles}`}>
          {principles.items.map((item) => (
            <li key={item.title} className={styles.principle}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section space="md" ariaLabelledBy="practices-title">
        <SectionHeader id="practices-title" kicker={practices.kicker} title={practices.title} />
        <div className="mt-10">
          <Practices />
        </div>
      </Section>

      <Section space="lg" tone="subtle" ariaLabelledBy="trust-cta-title">
        <SectionHeader id="trust-cta-title" title={cta.title} lead={cta.body} align="center">
          <Button variant="dark" size="lg" caret href={cta.primary.href}>
            {cta.primary.label}
          </Button>
          <Button variant="light" size="lg" caret href={cta.secondary.href}>
            {cta.secondary.label}
          </Button>
        </SectionHeader>
      </Section>
    </>
  );
}
