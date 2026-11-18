import { CopyButton } from "@/components/features/copy-button";
import { OpenAssistantAction } from "@/components/home/agent-actions";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";
import { cx } from "@/components/ui/cx";
import { ObsidianMark } from "@/components/ui/obsidian-mark";
import { SmartLink } from "@/components/ui/smart-link";
import { SITE } from "@/config/site";
import { evaluatePage } from "@/content/pages/evaluate";
import { Rain } from "./rain";
import styles from "./evaluate.module.css";

/*
 * /evaluate's sections, after the hero of Clerk's MCP page: falling lines
 * behind the mark, the prompt to copy, a grid of prompts to try, what the AI
 * reads, the numbered privacy points, and the way to ask here instead.
 */

/** The hero: the mark over the falling lines, the h1, and the prompt and llms.txt to copy. */
export function EvaluateHero() {
  const { hero } = evaluatePage;
  return (
    <section className={styles.hero} aria-labelledby="evaluate-title">
      <Rain labels={{ pause: hero.pause, play: hero.play }} />
      <ObsidianMark className={styles.markPlace} />
      <div className={styles.heroText}>
        <h1 id="evaluate-title" className={cx("text-display", styles.title)}>
          {hero.title}
        </h1>
        <p className={styles.lead}>{hero.lead}</p>
        <div className={styles.command}>
          <code>
            <span className={styles.shell} aria-hidden="true">
              ›
            </span>
            {hero.preview}
          </code>
          <CopyButton text={hero.prompt} label={hero.copy} />
        </div>
        <p className={styles.or}>{hero.or}</p>
        <div className={styles.endpoint}>
          <code>{`${SITE.url}${hero.llms}`}</code>
          <CopyButton text={hero.llms} label={hero.copyLink} icon="link" />
        </div>
      </div>
    </section>
  );
}

/** "Ask your AI to check the work": a card per prompt, each copying the whole prompt. */
export function PromptCards() {
  const { prompts } = evaluatePage;
  return (
    <section className={styles.block} aria-labelledby="prompts-title">
      <h2 id="prompts-title" className={styles.h2}>
        {prompts.title}
      </h2>
      <p className={styles.blockLead}>{prompts.lead}</p>
      <ul className={styles.cards}>
        {prompts.items.map((prompt) => (
          <li key={prompt.id} className={styles.card}>
            <div className={styles.cardHead}>
              <h3>{prompt.label}</h3>
              <CopyButton text={prompt.full} label={prompts.copy} />
            </div>
            <p className={styles.ask}>&ldquo;{prompt.ask}&rdquo;</p>
            <p className={styles.leads}>
              <span>{prompts.reads}</span>
              {prompt.pages.map((page) => (
                <SmartLink key={page} href={page} className={styles.pageChip}>
                  {page}
                </SmartLink>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "What your AI reads": six cells joined by dashed hairlines. */
export function ReadsGrid() {
  const { reads } = evaluatePage;
  return (
    <section className={styles.block} aria-labelledby="reads-title">
      <h2 id="reads-title" className={styles.h2}>
        {reads.title}
      </h2>
      <p className={styles.blockLead}>{reads.lead}</p>
      <ul className={styles.reads}>
        {reads.items.map((item) => (
          <li key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Checkable, and private by default": the claim on the left, four numbered points on the right. */
export function PrivacySteps() {
  const { privacy } = evaluatePage;
  return (
    <section className={cx(styles.block, styles.privacy)} aria-labelledby="privacy-title">
      <div>
        <h2 id="privacy-title" className={styles.h2}>
          {privacy.title}
        </h2>
        <p className={styles.blockLead}>{privacy.body}</p>
        <CaretLink href={privacy.more.href} className="mt-5">
          {privacy.more.label}
        </CaretLink>
      </div>
      <ol className={styles.steps}>
        {privacy.steps.map((step, i) => (
          <li key={step}>
            <span className={styles.stepN} aria-hidden="true">
              {i + 1}
            </span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The close: ask the site's own assistant, or get in touch. */
export function EvaluateCta() {
  const { cta } = evaluatePage;
  return (
    <section className={cx(styles.block, styles.cta)} aria-labelledby="evaluate-cta-title">
      <h2 id="evaluate-cta-title" className={styles.h2}>
        {cta.title}
      </h2>
      <p className={styles.blockLead}>{cta.body}</p>
      <div className={styles.ctaActions}>
        <Button variant="violet" caret href={cta.contact.href}>
          {cta.contact.label}
        </Button>
        <OpenAssistantAction label={cta.assistant} />
      </div>
    </section>
  );
}
