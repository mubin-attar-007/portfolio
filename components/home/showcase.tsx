import type { ReactNode } from "react";
import { ShotFrame } from "@/components/flagship/shot-frame";
import { cx } from "@/components/ui/cx";
import { flagshipCapture, type Flagship } from "@/content/flagship";
import { benchDiscovery } from "@/content/flagship/bench-discovery";
import { careltc } from "@/content/flagship/careltc";
import { signflow } from "@/content/flagship/signflow";
import { SHOWCASE } from "@/content/pages/home";
import { AssistantDemo, DbWhisperGenerate, DbWhisperValidate } from "./showcase-demos";
import { Focus, Ghost } from "./showcase-parts";
import { ShowcaseTabs, type ShowcaseItem } from "./showcase-tabs";
import styles from "./showcase.module.css";

/*
 * The showcase under the hero. First the three flagships as they really are:
 * real captures of the apps running on dummy data, two to a screen, each
 * screen labelled so. Then two systems a visitor can try on illustrated
 * screens: every case is fixed in advance, and each card says so in its foot.
 * The captures and the illustrations render on the server; only the switching
 * and the cases a visitor picks ship to the browser.
 */

/**
 * One capture's place on a screen. `focus` marks the frame the sheen crosses
 * when the screen arrives; `label: false` leaves "Real app · dummy data" to
 * the screen's other frame (exactly one carries it); `labelAt: "top"` lifts it
 * off a frame whose foot the stage crops.
 */
type Layer = { className?: string; sizes: string; focus?: boolean; label?: boolean; labelAt?: "top" | "bottom" };
/** A screen's two captures, back then front. */
type Layout = readonly [back: Layer, front: Layer];

/**
 * A web app's main screen on the right, and a second screen in front of it on
 * the left. A browser frame in front runs past the stage's foot at some widths,
 * so its label sits at the top, in the same place on every screen.
 */
const OVERLAP: Layout = [
  { className: styles.mainRight, sizes: "(min-width: 1240px) 700px, 82vw", label: false },
  { className: styles.sideLeft, sizes: "(min-width: 1240px) 600px, 72vw", focus: true, labelAt: "top" },
];
/** The admin portal on the left, and a floor phone in front of it on the right. */
const PORTAL_AND_PHONE: Layout = [
  { className: styles.mainLeft, sizes: "(min-width: 1240px) 800px, 88vw", focus: true, labelAt: "top" },
  { className: styles.phoneRight, sizes: "(min-width: 1240px) 250px, 38vw", label: false },
];

type CaptureView = { id: string; label: string; caption: string; captures: readonly [back: string, front: string] };

/**
 * A flagship's tab: a screen per view, its two captures layered on the stage
 * and the screen named by its caption. `atLoad` marks the tab shown first: the
 * back capture of its first screen is above the fold (eager, high priority).
 * Every other capture is lazy, and a hidden screen loads nothing.
 */
function flagshipItem(flagship: Flagship, label: string, views: readonly CaptureView[], layout: Layout, atLoad = false): ShowcaseItem {
  return {
    id: flagship.slug,
    label,
    views: views.map((view, v) => ({
      id: view.id,
      label: view.label,
      panel: (
        <figure className={styles.realPanel} aria-label={view.caption}>
          {layout.map((layer, i) => (
            <div
              key={view.captures[i]}
              className={cx(styles.stageShot, layer.focus && styles.shotFocus, layer.className)}
              data-focus={layer.focus ? "" : undefined}
            >
              <ShotFrame
                shot={flagshipCapture(flagship, view.captures[i]!)}
                product={flagship.name}
                sizes={layer.sizes}
                priority={atLoad && v === 0 && i === 0}
                label={layer.label ?? true}
                labelAt={layer.labelAt}
              />
            </div>
          ))}
        </figure>
      ),
    })),
  };
}

type ViewId<K extends keyof typeof SHOWCASE.views> = (typeof SHOWCASE.views)[K][number]["id"];

const DB = SHOWCASE.dbwhisper;

/** DBWhisper's screens: the query the agent writes, what the validator decides, and the answer. */
const DBWHISPER_SCREENS: Record<ViewId<"dbwhisper">, ReactNode> = {
  generate: <DbWhisperGenerate copy={DB.generate} foot={SHOWCASE.noQuery} />,
  validate: <DbWhisperValidate copy={DB.validate} foot={SHOWCASE.noQuery} />,
  answer: (
    <Focus title={DB.answer.title} hint={DB.answer.hint} foot={SHOWCASE.noQuery} wide>
      <table className={styles.resultTable}>
        <thead>
          <tr>
            {DB.answer.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DB.answer.rows.map(([month, revenue]) => (
            <tr key={month}>
              <td>{month}</td>
              <td>{revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.tableNote}>{DB.answer.note}</p>
    </Focus>
  ),
};

/** The assistant's screens: questions it answers from the site, and hiring terms it does not guess. */
const ASSISTANT_SCREENS: Record<ViewId<"assistant">, ReactNode> = {
  ask: <AssistantDemo copy={SHOWCASE.ask} placeholder={SHOWCASE.askInput} foot={SHOWCASE.sample} />,
  hiring: <AssistantDemo copy={SHOWCASE.hiring} placeholder={SHOWCASE.askInput} foot={SHOWCASE.sample} />,
};

const ITEMS: readonly ShowcaseItem[] = [
  flagshipItem(benchDiscovery, SHOWCASE.tabs.benchDiscovery, SHOWCASE.views.benchDiscovery, OVERLAP, true),
  flagshipItem(careltc, SHOWCASE.tabs.careltc, SHOWCASE.views.careltc, PORTAL_AND_PHONE),
  flagshipItem(signflow, SHOWCASE.tabs.signflow, SHOWCASE.views.signflow, OVERLAP),
  {
    id: "dbwhisper",
    label: SHOWCASE.tabs.dbwhisper,
    // The context stays behind the card while its screens change.
    backdrop: (
      <>
        <Ghost title={DB.backdrop[0].title} rows={DB.backdrop[0].rows} className={styles.ghostLeft} />
        <Ghost title={DB.backdrop[1].title} rows={DB.backdrop[1].rows} className={styles.ghostRight} />
      </>
    ),
    views: SHOWCASE.views.dbwhisper.map((view) => ({ ...view, panel: DBWHISPER_SCREENS[view.id] })),
  },
  {
    id: "assistant",
    label: SHOWCASE.tabs.assistant,
    views: SHOWCASE.views.assistant.map((view) => ({ ...view, panel: ASSISTANT_SCREENS[view.id] })),
  },
];

/** The tabbed showcase under the hero: a tab per product, and a pill per screen of the chosen one. */
export function Showcase() {
  return <ShowcaseTabs label={SHOWCASE.label} items={ITEMS} />;
}
