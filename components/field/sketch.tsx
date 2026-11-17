import { Fragment, type CSSProperties } from "react";
import { FIELD_LABELS } from "@/content/field/labels";
import type { Sketch, SketchFocus } from "@/content/field/types";
import { cx } from "@/components/ui/cx";
import styles from "./sketch.module.css";

/**
 * ArchitectureSketch — an original boundary diagram: zones framed by the
 * boundary they state ("Facility PC · documents stay here"), their parts in
 * data-flow order, and labelled crossings between adjacent zones. HTML, not a
 * picture, so it reflows to any width and reads in order to a screen reader.
 *
 * Props: `sketch` (content/field), `orientation` — `row` puts zones side by
 * side from 760px (the hero), `column` always stacks them (the sticky frame);
 * `focus` lights one zone, node or crossing (the trace); `caption` toggles the
 * "Simplified architecture" line; `titleId` names the figure.
 *
 * A11y: a `<figure>` holding one ordered list in reading order — zone, the
 * crossing to the next zone ("Crosses the boundary: …"), zone. Arrows and the
 * moving pulse are decorative. Motion: a pulse travels each wire while the
 * sketch's frame (the element that holds it) is hovered or holds focus, and is
 * hidden at rest and under reduced motion; hovering a zone lifts its frame.
 */
export function ArchitectureSketch({
  sketch,
  orientation = "row",
  focus,
  caption = true,
  titleId,
  className,
}: {
  sketch: Sketch;
  orientation?: "row" | "column";
  focus?: SketchFocus;
  caption?: boolean;
  titleId?: string;
  className?: string;
}) {
  return (
    <figure
      className={cx(styles.sketch, orientation === "row" ? styles.row : styles.column, focus && styles.focused, className)}
      aria-labelledby={titleId}
    >
      <ol className={styles.flow}>
        {sketch.zones.map((zone, z) => {
          const crossing = sketch.crossings[z];
          const zoneActive = focus?.zone === z;
          return (
            <Fragment key={zone.label}>
              <li
                className={styles.zone}
                data-active={zoneActive ? "" : undefined}
                style={{ "--grow": zone.nodes.length + 2 } as CSSProperties}
              >
                <p className={styles.zoneLabel}>{zone.label}</p>
                <ol className={styles.nodes}>
                  {zone.nodes.map((node, n) => (
                    <li
                      key={node}
                      className={styles.node}
                      data-active={zoneActive && focus?.node === n ? "" : undefined}
                    >
                      {node}
                    </li>
                  ))}
                </ol>
              </li>
              {crossing && z < sketch.zones.length - 1 ? (
                <li
                  className={styles.crossing}
                  data-direction={crossing.direction}
                  data-active={focus?.crossing === z ? "" : undefined}
                >
                  <span className={styles.wire} aria-hidden="true">
                    <span className={styles.pulse} />
                  </span>
                  <span className={styles.crossingLabel}>
                    <span className="sr-only">{FIELD_LABELS.crossingPrefix} </span>
                    {crossing.label}
                  </span>
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
      {sketch.notes?.length ? (
        <ul className={styles.notes}>
          {sketch.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
      {caption ? <figcaption className={styles.caption}>{FIELD_LABELS.sketchCaption}</figcaption> : null}
    </figure>
  );
}
