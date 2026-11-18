import { TechMark, techLogo } from "@/components/ui/tech-mark";
import { aboutPage } from "@/content/pages/about";
import { monogram } from "@/content/pages/uses";
import styles from "./about.module.css";

/**
 * The tools I ship with, as a grid of cells on the dotted band (the framework
 * grid on Clerk's home page): each tool's mark in grey above its name, and on
 * hover the mark takes its brand colour and lifts. The name is always shown,
 * so nothing waits for a pointer. A tool without a mark shows its monogram.
 */
export function StackBand() {
  const { label, items } = aboutPage.stack;
  return (
    <section className={styles.stack} aria-label={label}>
      <ul className={styles.stackGrid}>
        {items.map((tool) => {
          const logo = techLogo(tool);
          return (
            <li key={tool}>
              {logo ? (
                <TechMark logo={logo} size={28} className={styles.stackMark} />
              ) : (
                <span className={styles.stackMono} aria-hidden="true">
                  {monogram(tool)}
                </span>
              )}
              <span>{tool}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
