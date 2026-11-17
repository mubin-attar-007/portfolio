import { Container } from "@/components/layout/container";
import { AGENT_PROMPT, HERO } from "@/content/pages/home";
import { PromptChip } from "./prompt-chip";
import { Showcase } from "./showcase";
import styles from "./hero.module.css";

/**
 * Hero — the h1 and sub line (plain server HTML: the LCP element, never
 * animated in), the copy-prompt chip, and the tabbed showcase below them.
 */
export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Container>
        <div className={styles.top}>
          <div>
            <h1 id="hero-title" className={styles.title}>
              {HERO.title}
            </h1>
            <p className={styles.sub}>{HERO.sub}</p>
          </div>
          <PromptChip
            prompt={AGENT_PROMPT.full}
            preview={AGENT_PROMPT.preview}
            label={AGENT_PROMPT.label}
            hint={AGENT_PROMPT.hint}
            copied={AGENT_PROMPT.copied}
            failed={AGENT_PROMPT.failed}
          />
        </div>
        <Showcase />
      </Container>
    </section>
  );
}
