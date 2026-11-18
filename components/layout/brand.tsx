import Link from "next/link";
import { SITE } from "@/config/site";
import { cx } from "@/components/ui/cx";
import styles from "./brand.module.css";

/**
 * Brand — the home link: the monogram tile ("MA", `SITE.monogram`) and the
 * name. The header adds its divider through `className`; the footer uses it bare.
 *
 * A11y: one link named by the visible name; the monogram is decorative.
 * Performance: a server component; it never prefetches (the home route is one
 * click away from everywhere).
 */
export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" prefetch={false} className={cx(styles.brand, className)}>
      <span className={styles.mark} aria-hidden="true">
        {SITE.monogram}
      </span>
      {SITE.name}
    </Link>
  );
}
