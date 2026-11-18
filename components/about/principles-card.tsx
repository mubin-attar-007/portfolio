import { Gauge, ShieldCheck, Target, type LucideIcon } from "lucide-react";
import { home } from "@/content/site";
import { aboutPage } from "@/content/pages/about";
import styles from "./about.module.css";

/** One icon per principle, in content/site.ts order. */
const ICONS: readonly LucideIcon[] = [Target, ShieldCheck, Gauge];

/**
 * "How I approach the work": the three principles (content/site.ts) as icon
 * tiles on a lit card. The tile lifts on hover (spring; still under reduced motion).
 */
export function PrinciplesCard() {
  const { title, body } = aboutPage.principles;
  return (
    <section className={styles.pcard} aria-labelledby="principles-title">
      <h2 id="principles-title">{title}</h2>
      <p>{body}</p>
      <ul className={styles.principles}>
        {home.principles.map((principle, i) => {
          const Icon = ICONS[i] ?? Target;
          return (
            <li key={principle.title}>
              <span className={styles.tile} aria-hidden="true">
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
