import { SmartLink } from "@/components/ui/smart-link";
import type { Evidence } from "./stack-evidence";
import { monogram } from "@/content/pages/uses";
import styles from "./misc.module.css";

/** The four tile tints (violet, cyan, green, amber), cycled by category. */
const TONES = 4;

/**
 * ToolCard — one /uses entry: a tinted monogram tile (no brand logos), the
 * name, what it is for, and the case studies that list it. Hover or focus
 * inside brings up the ghost border and lifts the tile.
 */
export function ToolCard({
  name,
  note,
  tone,
  usedIn,
}: {
  name: string;
  note?: string;
  tone: number;
  usedIn: readonly Evidence[];
}) {
  return (
    <div className={styles.tool}>
      <span className={styles.tile} data-tone={tone % TONES} aria-hidden="true">
        {monogram(name)}
      </span>
      <div className="min-w-0">
        <h3 className={styles.toolName}>{name}</h3>
        {note ? <p className={styles.toolNote}>{note}</p> : null}
        {usedIn.length > 0 ? (
          <p className={styles.used}>
            Used in{" "}
            {usedIn.map((project, i) => (
              <span key={project.slug}>
                {i > 0 ? ", " : null}
                <SmartLink href={project.href}>{project.title}</SmartLink>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </div>
  );
}
