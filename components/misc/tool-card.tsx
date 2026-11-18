import { cx } from "@/components/ui/cx";
import { SmartLink } from "@/components/ui/smart-link";
import { TechMark, techLogo } from "@/components/ui/tech-mark";
import type { Evidence } from "./stack-evidence";
import { monogram } from "@/content/pages/uses";
import styles from "./misc.module.css";

/**
 * ToolCard — one /uses entry: a tile with the tool's mark in grey (or its
 * monogram where the site has no mark), the name, what it is for, and the case
 * studies that list it. Hover or focus inside brings up the ghost border and
 * lifts the tile, which turns dark with the mark in its brand colour (as the
 * framework grid on Clerk's home page lights a logo).
 */
export function ToolCard({
  name,
  note,
  usedIn,
}: {
  name: string;
  note?: string;
  usedIn: readonly Evidence[];
}) {
  const logo = techLogo(name);
  return (
    <div className={styles.tool}>
      <span className={cx(styles.tile, logo && styles.markTile)} aria-hidden="true">
        {logo ? <TechMark logo={logo} size={20} /> : monogram(name)}
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
