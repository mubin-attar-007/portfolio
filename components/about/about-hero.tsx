import { CircuitArt } from "@/components/ui/circuit-art";
import { Float } from "@/components/motion/float";
import { SITE } from "@/config/site";
import { aboutPage } from "@/content/pages/about";
import styles from "./about.module.css";

/**
 * The /about hero: circuit traces behind the obsidian monogram (a gentle 7px
 * float over 8s), the page's h1 and the lead with its two white highlights.
 * A11y: the mark is decorative; the h1 labels the section.
 */
export function AboutHero() {
  const { title, lead } = aboutPage.hero;
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <CircuitArt fade="center" />
      <Float distance={7} duration={8} className={styles.mark}>
        <span aria-hidden="true">{SITE.monogram}</span>
      </Float>
      <div className="relative mx-auto max-w-[var(--width-container)] px-[var(--gutter)]">
        <h1 id="about-title" className={`text-display ${styles.title}`}>
          {title}
        </h1>
        <p className={styles.lead}>
          {lead.map((part) => ("strong" in part ? <strong key={part.text}>{part.text}</strong> : part.text))}
        </p>
      </div>
    </section>
  );
}
