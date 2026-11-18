import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";
import { CircuitArt } from "@/components/ui/circuit-art";
import { PageHeader } from "@/components/ui/page-header";
import { Plate } from "@/components/ui/plate";
import { SectionHeader } from "@/components/ui/section-header";
import { projectFrontmatter } from "@/components/work/project-frontmatter";
import { FlagshipCard, PublicCard } from "@/components/work/work-cards";
import { WorkCta } from "@/components/work/work-cta";
import styles from "@/components/work/work-index.module.css";
import { FLAGSHIP_WORK } from "@/config/nav";
import { flagships } from "@/content/flagship";
import { workIndexPage as copy } from "@/content/pages/work";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/work",
  title: copy.meta.title,
  description: copy.meta.description,
});

/**
 * /work — the product overview: the three flagship products built at Sevina
 * Technologies on a dark plate (the real app in frames, the approved usage
 * figure, a link to each case study), the four public systems with their
 * real captures and one method-linked figure each, what each system runs on,
 * and the walkthrough CTA. Section ids `flagship` and `public` are link
 * targets (the footer, the nav and /hire point at them).
 */
export default function WorkIndex() {
  const ordered = [...projects].sort((a, b) => a.order - b.order);
  // One line per system, in the page's order: a flagship's curated technology
  // line (its cards show the same), a public system's own stack list.
  const stacks = [
    ...flagships.map((flagship) => ({ key: flagship.slug, name: flagship.name, tech: flagship.card.tech })),
    ...ordered.map((project) => ({
      key: project.slug,
      name: project.title,
      tech: projectFrontmatter(project.slug).stack.join(" · "),
    })),
  ];

  return (
    <>
      <Section space="head" className={styles.head}>
        <CircuitArt fade="top" className={styles.headArt} />
        <PageHeader kicker={copy.hero.kicker} title={copy.hero.title} lede={copy.hero.lede} align="center">
          <Button href="#flagship" variant="dark" size="lg" caret>
            {copy.flagship.kicker}
          </Button>
          <Button href="#public" variant="light" size="lg" caret>
            {copy.public.kicker}
          </Button>
        </PageHeader>
      </Section>

      <Plate id="flagship" labelledBy="flagship-title">
        <SectionHeader id="flagship-title" kicker={copy.flagship.kicker} kickerTone="cyan" title={copy.flagship.title} lead={copy.flagship.lead} align="center">
          <CaretLink href={copy.flagship.cta.href} size="md">
            {copy.flagship.cta.label}
          </CaretLink>
        </SectionHeader>
        <div className={styles.flagshipGrid}>
          {flagships.map((flagship) => {
            const item = FLAGSHIP_WORK.find((entry) => entry.slug === flagship.slug);
            if (!item) throw new Error(`/work: no Work menu entry for "${flagship.slug}" (config/nav.ts)`);
            return <FlagshipCard key={flagship.slug} flagship={flagship} item={item} labels={copy.flagship} />;
          })}
        </div>
      </Plate>

      <Section space="lg" id="public" ariaLabelledBy="public-title">
        <SectionHeader id="public-title" kicker={copy.public.kicker} title={copy.public.title} lead={copy.public.lead}>
          <CaretLink href={copy.public.more.href} size="md">
            {copy.public.more.label}
          </CaretLink>
        </SectionHeader>
        <div className={styles.publicGrid}>
          {ordered.map((project) => (
            <PublicCard key={project.slug} project={project} labels={copy.public} />
          ))}
        </div>
      </Section>

      <Section space="md" tone="subtle" ariaLabelledBy="stack-title">
        <div className={styles.stackBand}>
          <SectionHeader id="stack-title" kicker={copy.stack.kicker} title={copy.stack.title} size="sm" />
          <dl className={styles.stackRows}>
            {stacks.map((system) => (
              <div key={system.key} className={styles.stackRow}>
                <dt className={styles.stackName}>{system.name}</dt>
                <dd className={styles.stackTech}>{system.tech}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section space="lg" ariaLabelledBy="work-cta-title">
        <WorkCta id="work-cta-title" {...copy.cta} />
      </Section>
    </>
  );
}
