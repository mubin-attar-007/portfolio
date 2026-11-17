import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";
import { Chip } from "@/components/ui/chip";
import { CircuitArt } from "@/components/ui/circuit-art";
import { PageHeader } from "@/components/ui/page-header";
import { Plate } from "@/components/ui/plate";
import { SectionHeader } from "@/components/ui/section-header";
import { projectFrontmatter } from "@/components/work/project-frontmatter";
import { FieldCard, PublicCard } from "@/components/work/work-cards";
import { WorkCta } from "@/components/work/work-cta";
import styles from "@/components/work/work-index.module.css";
import { FIELD_WORK } from "@/config/nav";
import { workIndexPage as copy } from "@/content/pages/work";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/work",
  title: copy.meta.title,
  description: copy.meta.description,
});

/**
 * /work — the product overview: the two anonymous field systems on a dark
 * plate (each linking to its field report), the four public systems with
 * their real captures and one method-linked figure each, the combined stack,
 * and the walkthrough CTA. Section ids `field` and `public` are link targets
 * (the footer and the nav point at them).
 */
export default function WorkIndex() {
  const ordered = [...projects].sort((a, b) => a.order - b.order);
  const stack = [...new Set(ordered.flatMap((p) => projectFrontmatter(p.slug).stack))];

  return (
    <>
      <Section space="head" className={styles.head}>
        <CircuitArt fade="top" className={styles.headArt} />
        <PageHeader kicker={copy.hero.kicker} title={copy.hero.title} lede={copy.hero.lede} align="center">
          <Button href="#field" variant="dark" size="lg" caret>
            {copy.field.kicker}
          </Button>
          <Button href="#public" variant="light" size="lg" caret>
            {copy.public.kicker}
          </Button>
        </PageHeader>
      </Section>

      <Plate id="field" labelledBy="field-title">
        <SectionHeader id="field-title" kicker={copy.field.kicker} kickerTone="cyan" title={copy.field.title} lead={copy.field.lead} align="center">
          <CaretLink href={copy.field.cta.href} size="md">
            {copy.field.cta.label}
          </CaretLink>
        </SectionHeader>
        <div className={styles.fieldGrid}>
          {FIELD_WORK.map((item) => {
            const card = copy.field.cards[item.slug as keyof typeof copy.field.cards];
            return (
              <FieldCard
                key={item.slug}
                item={item}
                title={card.title}
                body={card.body}
                pills={card.pills}
                readReport={copy.field.readReport}
                privateNote={copy.field.privateNote}
              />
            );
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
          <ul className={styles.stack} aria-label={copy.stack.title}>
            {stack.map((tool) => (
              <li key={tool}>
                <Chip variant="raised" size="md">
                  {tool}
                </Chip>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section space="lg" ariaLabelledBy="work-cta-title">
        <WorkCta id="work-cta-title" {...copy.cta} />
      </Section>
    </>
  );
}
