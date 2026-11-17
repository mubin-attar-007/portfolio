import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { aboutPage } from "@/content/pages/about";
import styles from "./about.module.css";

/** The closing split: work with me (the page's one violet action) and the writing. */
export function AboutNext() {
  const { label, primary, secondary } = aboutPage.cta;
  return (
    <section className={styles.split} aria-label={label}>
      <div>
        <Kicker className="mb-4">{primary.kicker}</Kicker>
        <h2>{primary.title}</h2>
        <p>{primary.body}</p>
        <Button variant="violet" caret href={primary.action.href}>
          {primary.action.label}
        </Button>
      </div>
      <div>
        <Kicker tone="ink" className="mb-4">
          {secondary.kicker}
        </Kicker>
        <h2 className={styles.sub}>{secondary.title}</h2>
        <p>{secondary.body}</p>
        <Button variant="grey" caret href={secondary.action.href}>
          {secondary.action.label}
        </Button>
      </div>
    </section>
  );
}
