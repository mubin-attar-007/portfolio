import { Frame } from "@/components/ui/blueprint";
import { Label } from "@/components/ui/label";
import { StatsRow } from "@/components/ui/stats-row";
import { hirePage } from "@/content/pages/hire";
import styles from "./hire.module.css";

/** "At a glance": a split header over the four headline figures (approved facts). */
export function HireGlance() {
  const { label, title, body, stats } = hirePage.glance;
  return (
    <Frame>
      <section aria-labelledby="glance-title">
        <div className={`${styles.glance} px-8 max-sm:px-5`}>
          <Label>{label}</Label>
          <div className={styles.splitHead}>
            <h2 id="glance-title" className="text-sub text-ink">
              {title}
            </h2>
            <p>{body}</p>
          </div>
        </div>
        <StatsRow stats={stats} className={styles.stats} />
      </section>
    </Frame>
  );
}
