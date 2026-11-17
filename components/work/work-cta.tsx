import { Button } from "@/components/ui/button";
import styles from "./work-cta.module.css";

type Action = { label: string; href: string };

/** WorkCta — the closing band on /work and the case studies: one violet action, one quiet one. */
export function WorkCta({
  id,
  title,
  body,
  primary,
  secondary,
}: {
  id: string;
  title: string;
  body: string;
  primary: Action;
  secondary: Action;
}) {
  return (
    <div className={styles.cta}>
      <h2 id={id} className={styles.ctaTitle}>
        {title}
      </h2>
      <p className={styles.ctaBody}>{body}</p>
      <div className={styles.ctaActions}>
        <Button href={primary.href} variant="violet" size="lg" caret>
          {primary.label}
        </Button>
        <Button href={secondary.href} variant="light" size="lg">
          {secondary.label}
        </Button>
      </div>
    </div>
  );
}
