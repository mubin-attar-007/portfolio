import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";
import { Kicker } from "@/components/ui/kicker";
import { Plate } from "@/components/ui/plate";
import { SectionHeader } from "@/components/ui/section-header";
import { SmartLink } from "@/components/ui/smart-link";
import { CTA, FACTS, HOW, WRITING } from "@/content/pages/home";
import styles from "./sections.module.css";

/** The facts strip under the hero, in place of a logo wall. */
export function FactsStrip() {
  return (
    <section className={styles.strip} aria-label={FACTS.label}>
      <Container>
        <ul className={styles.facts}>
          {FACTS.items.map((fact) => (
            <li key={fact.value}>
              {fact.value}
              <small>{fact.note}</small>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** "How I work": five numbered steps on a dark plate, each linked to its proof. */
export function HowIWork() {
  return (
    <Plate id="how" labelledBy="how-title">
      <SectionHeader kicker={HOW.kicker} kickerTone="cyan" title={HOW.title} lead={HOW.lead} align="center" id="how-title" />
      <ol className={styles.steps}>
        {HOW.steps.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepN} aria-hidden="true">
              {i + 1}
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <CaretLink href={step.link.href} className="mt-3.5">
              {step.link.label}
            </CaretLink>
          </li>
        ))}
      </ol>
    </Plate>
  );
}

export type WritingCard = { href: string; title: string; summary: string; category: keyof typeof WRITING.categories };

/** Writing: the featured quote with its essay, and the latest pieces. */
export function WritingBand({ quoteEssay, cards }: { quoteEssay: { href: string; title: string }; cards: readonly WritingCard[] }) {
  return (
    <Section space="md" ariaLabelledBy="writing-title">
      <div className={styles.wgrid}>
        <div>
          <Kicker className="mb-4">{WRITING.kicker}</Kicker>
          <h2 id="writing-title" className="text-section text-ink">
            {WRITING.title}
          </h2>
          <figure className={styles.featured}>
            <span className={styles.quoteMark} aria-hidden="true">
              “
            </span>
            <blockquote>{WRITING.quote}</blockquote>
            <figcaption>
              {WRITING.from}{" "}
              <CaretLink href={quoteEssay.href} className="ml-1">
                {quoteEssay.title}
              </CaretLink>
            </figcaption>
          </figure>
          <CaretLink href={WRITING.more.href} size="md" className="mt-6">
            {WRITING.more.label}
          </CaretLink>
        </div>
        <ul className={styles.wcards}>
          {cards.map((card) => (
            <li key={card.href} className={styles.wcard}>
              <h3>
                <SmartLink href={card.href} className={styles.wcardLink}>
                  {card.title}
                </SmartLink>
              </h3>
              <p>{card.summary}</p>
              <p className={styles.meta}>{WRITING.categories[card.category]}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/** The closing call to action. */
export function HomeCta() {
  return (
    <Section space="sm" id="contact" ariaLabelledBy="cta-title">
      <SectionHeader title={CTA.title} lead={CTA.lead} align="center" id="cta-title">
        <Button href={CTA.primary.href} variant="dark" size="lg" caret>
          {CTA.primary.label}
        </Button>
        <Button href={CTA.secondary.href} variant="light" size="lg">
          {CTA.secondary.label}
        </Button>
      </SectionHeader>
      <p className={styles.avail}>{CTA.availability}</p>
    </Section>
  );
}
