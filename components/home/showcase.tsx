import type { ReactNode } from "react";
import { ShotFrame } from "@/components/flagship/shot-frame";
import { benchDiscovery } from "@/content/flagship/bench-discovery";
import { careltc } from "@/content/flagship/careltc";
import type { Screenshot } from "@/content/flagship/types";
import { SHOWCASE } from "@/content/pages/home";
import { cx } from "@/components/ui/cx";
import { ShowcaseTabs } from "./showcase-tabs";
import styles from "./showcase.module.css";

/*
 * The first two panels show the flagship products as they really are: real
 * captures of the apps running on dummy data, each frame labelled so. The
 * other two are illustrations of a system's main screen; every value in them
 * is synthetic, and each frame says so in its footer. All render on the
 * server; only the tab switching ships to the browser.
 */

/**
 * A capture placed on the stage. `focus` marks the frame the sheen sweeps when
 * the panel arrives (a browser or window frame); `priority` the one capture
 * that is above the fold at load (eager, high priority; the rest are lazy, and
 * a hidden panel loads nothing); `labelAt` moves "Real app · dummy data" to
 * the top of a frame whose foot the stage crops.
 */
function StageShot({
  shot,
  product,
  sizes,
  className,
  focus = false,
  priority = false,
  label = true,
  labelAt = "bottom",
}: {
  shot: Screenshot;
  product: string;
  sizes: string;
  className?: string;
  focus?: boolean;
  priority?: boolean;
  label?: boolean;
  labelAt?: "bottom" | "top";
}) {
  return (
    <div className={cx(styles.stageShot, focus && styles.shotFocus, className)} data-focus={focus ? "" : undefined}>
      <ShotFrame shot={shot} product={product} sizes={sizes} priority={priority} label={label} labelAt={labelAt} />
    </div>
  );
}

const BenchDiscoveryPanel = (
  <figure className={styles.realPanel} aria-label={SHOWCASE.captions.benchDiscovery}>
    <StageShot
      shot={benchDiscovery.hero.primary}
      product={benchDiscovery.name}
      sizes="(min-width: 1240px) 700px, 82vw"
      className={styles.bdWeb}
      priority
      label={false}
    />
    <StageShot
      shot={benchDiscovery.hero.secondary}
      product={benchDiscovery.name}
      sizes="(min-width: 1240px) 600px, 72vw"
      className={styles.bdDesktop}
      focus
    />
  </figure>
);

const CareLtcPanel = (
  <figure className={styles.realPanel} aria-label={SHOWCASE.captions.careltc}>
    <StageShot
      shot={careltc.hero.primary}
      product={careltc.name}
      sizes="(min-width: 1240px) 800px, 88vw"
      className={styles.careltcPortal}
      focus
      labelAt="top"
    />
    <StageShot
      shot={careltc.hero.secondary}
      product={careltc.name}
      sizes="(min-width: 1240px) 250px, 38vw"
      className={styles.careltcPhone}
      label={false}
    />
  </figure>
);

type GhostRow = readonly [label: string, value: string];

function Ghost({ title, rows, className }: { title: string; rows: readonly GhostRow[]; className?: string }) {
  return (
    <div className={cx(styles.ghost, className)} aria-hidden="true">
      <b>{title}</b>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.ghostRow}>
          <span>{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}

function Focus({ title, hint, foot, wide, children }: { title: string; hint: string; foot?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cx(styles.focus, wide && styles.wide)} data-focus>
      <div className={styles.focusBody}>
        {/* The mock screen's own title: part of the illustration, not a heading
            of the page (its tab panel is already named by its tab). */}
        <p className={styles.focusTitle}>{title}</p>
        <p className={styles.hint}>{hint}</p>
        {children}
      </div>
      {foot ? (
        <div className={styles.focusFoot}>
          <span className={styles.sample}>{foot}</span>
        </div>
      ) : null}
    </div>
  );
}

/** A non-interactive picture of the panel's primary action. */
function MockButton({ children }: { children: ReactNode }) {
  return (
    <span className={styles.mockButton} aria-hidden="true">
      {children}
    </span>
  );
}

const DbWhisperPanel = (
  <>
    <Ghost title="Schema retrieval" rows={[["Tables matched", "2"], ["Dialect", "Postgres"]]} className={styles.ghostLeft} />
    <Ghost title="Policy" rows={[["Writes", "denied"], ["Multiple statements", "denied"]]} className={styles.ghostRight} />
    <Focus title="Ask your database" hint="“Revenue by month, January to April 2024”" foot={SHOWCASE.noQuery}>
      <pre className={styles.sql}>
        {"SELECT date_trunc('month', created_at) AS month,\n  SUM(amount) AS revenue\nFROM orders GROUP BY 1 ORDER BY 1;"}
      </pre>
      <ul className={styles.checks}>
        <li>Single statement</li>
        <li>Read-only</li>
        <li>Enrolled schema</li>
      </ul>
      <MockButton>Run read-only</MockButton>
    </Focus>
  </>
);

const AssistantPanel = (
  <Focus title="Ask about my work" hint="Answers come from this site and cite the page they used" foot={SHOWCASE.sample} wide>
    <p className={styles.chatQ}>{SHOWCASE.assistant.question}</p>
    <div className={styles.chatA}>
      {SHOWCASE.assistant.answer}
      <div className={styles.cite}>
        {SHOWCASE.assistant.cites.map((cite) => (
          <span key={cite}>{cite}</span>
        ))}
      </div>
    </div>
    <p className={styles.askInput} aria-hidden="true">
      Ask a question…
    </p>
  </Focus>
);

/** The tabbed showcase under the hero: the two flagship products as they really run, then two illustrated screens. */
export function Showcase() {
  return (
    <ShowcaseTabs
      label={SHOWCASE.label}
      items={[
        { id: "bench-discovery", label: SHOWCASE.tabs.benchDiscovery, panel: BenchDiscoveryPanel },
        { id: "careltc", label: SHOWCASE.tabs.careltc, panel: CareLtcPanel },
        { id: "dbwhisper", label: SHOWCASE.tabs.dbwhisper, panel: DbWhisperPanel },
        { id: "assistant", label: SHOWCASE.tabs.assistant, panel: AssistantPanel },
      ]}
    />
  );
}
