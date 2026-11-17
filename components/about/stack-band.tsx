import { aboutPage } from "@/content/pages/about";
import styles from "./about.module.css";

/** The tools I ship with, set as type on a dotted band (no logos). */
export function StackBand() {
  const { label, items } = aboutPage.stack;
  return (
    <section className={styles.stack} aria-label={label}>
      <ul>
        {items.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>
    </section>
  );
}
