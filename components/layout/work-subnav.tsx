import Link from "next/link";
import { CaretLink } from "@/components/ui/caret-link";
import { ALL_WORK, WORK_ITEMS } from "@/config/nav";
import { NavIcon } from "./nav-icon";
import { SubnavScroller } from "./subnav-scroller";
import styles from "./work-subnav.module.css";

/**
 * WorkSubnav — the work switcher under the nav on every case study, flagship
 * and public (the Clerk product sub-nav): a tray tucked under the floating pill,
 * sticky with it, listing the two flagship products, then the four public
 * systems (`WORK_ITEMS`, config/nav.ts) and "All work" at the right. On phones
 * the list scrolls sideways with faded edges, the current item scrolled into
 * view.
 *
 * Props: `current` — the slug of the page shown (e.g. "careltc",
 * "dbwhisper"); any other value marks nothing current.
 * Place it as the first child of the page, before the hero. Its `data-subnav`
 * moves `--chrome-offset` below the tray (tokens.css), so the page's sticky
 * panels and anchors clear it.
 * A11y: `<nav aria-label="Work">`; the current item is `aria-current="page"`
 * (darker, heavier, underlined — never colour alone).
 */
export function WorkSubnav({ current }: { current: string }) {
  return (
    <div className={styles.wrap} data-chrome="" data-subnav="">
      <nav aria-label="Work" className={styles.tray}>
        <SubnavScroller className={`edge-fade ${styles.scroller}`}>
          <ul className={styles.list}>
            {WORK_ITEMS.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.href}
                  prefetch={false}
                  aria-current={item.slug === current ? "page" : undefined}
                  className={styles.link}
                >
                  <NavIcon name={item.icon} size={14} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </SubnavScroller>
        <span className={styles.all}>
          <CaretLink href={ALL_WORK.href} weight="regular">
            {ALL_WORK.label}
          </CaretLink>
        </span>
      </nav>
    </div>
  );
}
