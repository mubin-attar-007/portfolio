import { DemoPlayer } from "@/components/work/demo-player";
import { FLAGSHIP_LABELS, FLAGSHIP_SECTION_IDS } from "@/content/flagship/labels";
import { REAL_APP } from "@/content/flagship/shared";
import type { Flagship, Recording } from "@/content/flagship/types";
import { FlagshipSection } from "./flagship-section";
import { MediaGallery } from "./media-gallery";
import { Frame } from "./shot-frame";
import frames from "./frames.module.css";
import styles from "./flagship.module.css";

const L = FLAGSHIP_LABELS.sections.recordings;

/** The id of a recording's frame: "Watch the demo" scrolls to it and plays the player of the same id. */
export const recordingAnchor = (id: string): string => `recording-${id}`;

/** The frame's rendered widths: the wider column of `.recording` from 1000px, the full width below. */
const POSTER_SIZES = "(min-width: 1000px) 720px, calc(100vw - 32px)";

/** Seconds as m:ss ("0:07", "1:15"). */
function clock(seconds: number): string {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/** One recording in its frame, beside the list of what it shows, scene by scene. */
function RecordingView({ recording, product }: { recording: Recording; product: string }) {
  const anchor = recordingAnchor(recording.id);
  const titleId = `${anchor}-title`;
  return (
    <article id={anchor} className={styles.recording} aria-labelledby={titleId}>
      <Frame kind={recording.frame} product={product}>
        <div className={frames.shot}>
          <DemoPlayer
            id={anchor}
            src={recording.src}
            poster={recording.poster}
            captions={recording.captions}
            alt={recording.alt}
            width={recording.width}
            height={recording.height}
            playLabel={FLAGSHIP_LABELS.play}
            sizes={POSTER_SIZES}
          />
          <span className={frames.label}>{REAL_APP}</span>
        </div>
      </Frame>
      <div>
        <h3 id={titleId} className={styles.recordingTitle}>
          {recording.title}
        </h3>
        <p className={styles.recordingSummary}>{recording.summary}</p>
        <p className={styles.recordingMeta}>
          {L.length} {clock(recording.duration)}
        </p>
        <h4 className={styles.scenesTitle}>{L.scenes}</h4>
        <ol className={styles.scenes}>
          {recording.scenes.map((scene) => (
            <li key={scene.start}>
              <span className={styles.sceneTime}>{clock(scene.start)}</span>
              <span>{scene.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

/**
 * Recordings — "Watch it run": each screen recording of the real app in its
 * frame, beside the list of what it shows, scene by scene. Several recordings
 * share one place, switched by a segmented control.
 *
 * The recordings are silent; the scene list is their text alternative, and the
 * caption track (.vtt) carries the same lines in time. Nothing downloads until
 * play is pressed (`preload="none"`; the poster is a lazy image, so a recording
 * below the fold or on a hidden tab costs nothing at load), nothing autoplays,
 * and the native controls appear once it plays. The frame's "Real app · dummy
 * data" label shows on the poster and steps aside once playback starts, so it
 * never covers the controls.
 */
export function Recordings({ flagship }: { flagship: Flagship }) {
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.recordings} kicker={L.kicker} title={L.title} lead={L.lead} tone="subtle">
      <MediaGallery
        label={`${flagship.name}: ${L.kicker}`}
        listLabel={L.kicker}
        stage={false}
        captions={false}
        tabs={flagship.recordings.map((recording) => ({
          id: recording.id,
          label: recording.label,
          shots: [
            {
              id: recording.id,
              title: recording.title,
              proves: recording.summary,
              portrait: false,
              media: <RecordingView recording={recording} product={flagship.name} />,
            },
          ],
        }))}
      />
    </FlagshipSection>
  );
}
