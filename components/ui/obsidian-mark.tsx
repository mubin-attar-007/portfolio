import { Float } from "@/components/motion/float";
import { SITE } from "@/config/site";
import { cx } from "./cx";
import styles from "./obsidian-mark.module.css";

/**
 * ObsidianMark — the dark pages' hero mark (/about, /evaluate): the monogram
 * cut in an obsidian tile, floating 7px over 8s, with a sheen that crosses it
 * once while hovered. `className` places it on the page (its margins).
 * A11y: decorative; the page's h1 names the section.
 */
export function ObsidianMark({ className }: { className?: string }) {
  return (
    <Float distance={7} duration={8} className={cx(styles.mark, className)}>
      <span aria-hidden="true">{SITE.monogram}</span>
    </Float>
  );
}
