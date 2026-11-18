import { Building2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { CircuitArt } from "@/components/ui/circuit-art";
import { StatusPill } from "@/components/ui/status-pill";
import { AskAiButton } from "@/components/work/ask-ai";
import { WatchDemoButton } from "@/components/work/demo-player";
import { FLAGSHIP_LABELS, FLAGSHIP_SECTION_IDS } from "@/content/flagship/labels";
import { AGENT_DIRECTION, PRIVATE_NOTICE } from "@/content/flagship/shared";
import type { Flagship } from "@/content/flagship/types";
import { askAiLabel } from "@/content/pages/work";
import { recordingAnchor } from "./recordings";
import { ShotFrame } from "./shot-frame";
import styles from "./flagship.module.css";

const L = FLAGSHIP_LABELS;

/** The id of the page's h1: the hero section is named by it. */
export const FLAGSHIP_TITLE_ID = "flagship-title";

/**
 * FlagshipHero — the top of a flagship case study (the Clerk product page):
 * the employer, status and private-repository pills, the product name, the
 * product statement (h1), the lead, the actions (the walkthrough; "Watch the
 * demo", which scrolls to the first recording and plays it; "Ask AI about
 * <product>", which opens the assistant on this case study's questions), the
 * credit and how the work is built (two labelled lines), the figures row, then
 * the real app in its frames: the main capture with a second one layered over
 * its lower right.
 *
 * The h1 and lead are plain server HTML (the LCP rule). Only the main capture
 * loads eagerly with high priority; the layered one is lazy. On phones the
 * actions stack at one width.
 */
export function FlagshipHero({ flagship }: { flagship: Flagship }) {
  const { hero, recordings } = flagship;
  const firstRecording = recordings[0];
  return (
    <section className={styles.hero} aria-labelledby={FLAGSHIP_TITLE_ID}>
      <CircuitArt fade="center" className={styles.heroArt} />
      <div className={styles.heroInner}>
        <div className={styles.pills}>
          <Chip icon={<Building2 size={13} strokeWidth={1.75} aria-hidden="true" />}>{L.pills.employer}</Chip>
          <StatusPill status="in-use" />
          <Chip mono icon={<Lock size={12} strokeWidth={1.75} aria-hidden="true" />}>
            {PRIVATE_NOTICE}
          </Chip>
        </div>
        <p className={styles.heroProduct}>{flagship.name}</p>
        <h1 id={FLAGSHIP_TITLE_ID} className={styles.heroTitle}>
          {flagship.headline}
        </h1>
        <p className={styles.heroLead}>{flagship.summary}</p>
        <div className={styles.heroActions}>
          <Button href={L.cta.href} variant="violet" size="lg" caret>
            {L.cta.walkthrough}
          </Button>
          {firstRecording ? (
            <WatchDemoButton label={L.cta.watch} target={recordingAnchor(firstRecording.id)} variant="button" />
          ) : null}
          <AskAiButton label={askAiLabel(flagship.name)} variant="ghost" />
        </div>
        <dl className={styles.credit}>
          <div>
            <dt>{L.credit.role}</dt>
            <dd>{flagship.credit.role}</dd>
          </div>
          <div>
            <dt>{L.credit.agents}</dt>
            <dd>{AGENT_DIRECTION}</dd>
          </div>
        </dl>
      </div>

      <ul className={styles.figures} aria-label={L.figures.label}>
        {flagship.figures.map((figure) => (
          <li key={figure.label} className={styles.figure}>
            <span className={styles.figureValue}>{figure.value}</span>
            <span className={styles.figureLabel}>{figure.label}</span>
          </li>
        ))}
      </ul>
      <p className={styles.figuresNote}>
        {L.figures.approved} <a href={`#${FLAGSHIP_SECTION_IDS.verification}`}>{L.figures.method}</a>
      </p>

      <figure className={styles.heroFigure}>
        <div className={styles.composition}>
          <ShotFrame
            shot={hero.primary}
            product={flagship.name}
            sizes="(min-width: 1140px) 950px, 90vw"
            priority
            className={styles.compositionMain}
          />
          <div className={styles.compositionSide} data-kind={hero.secondary.frame}>
            {/* The main capture carries the "Real app · dummy data" label for both. */}
            <ShotFrame
              shot={hero.secondary}
              product={flagship.name}
              sizes={hero.secondary.frame === "phone" ? "(min-width: 1140px) 230px, 32vw" : "(min-width: 1140px) 500px, 56vw"}
              label={false}
            />
          </div>
        </div>
        <figcaption className={styles.heroCaption}>{hero.caption}</figcaption>
      </figure>
    </section>
  );
}
