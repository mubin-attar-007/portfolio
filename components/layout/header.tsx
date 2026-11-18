import { Assistant } from "@/components/features/assistant";
import { Caret } from "@/components/ui/caret-link";
import { cx } from "@/components/ui/cx";
import { Label } from "@/components/ui/label";
import { ASK_AI } from "@/config/site";
import {
  ABOUT_MENU,
  MENU_BUTTON,
  MENU_SECTIONS,
  MOBILE_NAV,
  NAV_ACTIONS,
  NAV_LINKS,
  WORK_MENU,
  type NavLink as NavItem,
} from "@/config/nav";
import { Brand } from "./brand";
import { MobileMenu, MobileMenuAsk } from "./mobile-menu";
import { NavIcon } from "./nav-icon";
import { NavLink } from "./nav-link";
import { NavMenu, NavMenus } from "./nav-menu";
import styles from "./nav.module.css";

/**
 * The open mobile menu is a modal sheet (ADR-018, amended 17 Nov 2026); this
 * names its dialog. The button's own names are MENU_BUTTON (config/nav.ts).
 */
const MENU_LABELS = { ...MENU_BUTTON, dialog: "Site menu" } as const;

/** The Work menu: the flagship and public case studies as rich rows, then "All work". */
function WorkPanel() {
  return (
    <>
      {WORK_MENU.groups.map((group, g) => {
        const labelId = `nav-work-group-${g}`;
        return (
          <div key={group.label} className={styles.rich}>
            <Label as="p" tone="tertiary" id={labelId} className={styles.menuLabel}>
              {group.label}
            </Label>
            <ul className={styles.menuList} aria-labelledby={labelId}>
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} className={styles.menuLink}>
                    <span className={styles.tile}>
                      <NavIcon name={item.icon} className={styles.menuIcon} />
                    </span>
                    <span>
                      <span className={styles.richTitle}>{item.label}</span>
                      <span className={styles.richText}>{item.description}</span>
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <p className={styles.menuFoot}>
        <NavLink href={WORK_MENU.footer.href} className={styles.menuLink}>
          {WORK_MENU.footer.label}
          <Caret />
        </NavLink>
      </p>
    </>
  );
}

/** The About menu: one labelled icon list. */
function AboutPanel() {
  return (
    <>
      <Label as="p" tone="tertiary" id="nav-about-label" className={styles.menuLabel}>
        {ABOUT_MENU.heading}
      </Label>
      <ul className={styles.menuList} aria-labelledby="nav-about-label">
        {ABOUT_MENU.items.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href} className={styles.menuLink}>
              <NavIcon name={item.icon} className={styles.menuIcon} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  );
}

function MobileItem({ item }: { item: NavItem }) {
  return (
    <li>
      <NavLink href={item.href} className={styles.mobileLink}>
        {item.icon ? <NavIcon name={item.icon} className={styles.menuIcon} /> : null}
        {item.label}
      </NavLink>
    </li>
  );
}

/** The mobile panel: Work, About me and Connect, with the assistant last. */
function MobilePanel() {
  return (
    <>
      {MOBILE_NAV.map((group, g) => {
        const labelId = `nav-mobile-group-${g}`;
        const isLast = g === MOBILE_NAV.length - 1;
        return (
          <div key={group.label}>
            <Label as="p" tone="tertiary" id={labelId} className={styles.mobileLabel}>
              {group.label}
            </Label>
            <ul className={styles.mobileList} aria-labelledby={labelId}>
              {group.items.map((item) => (
                <MobileItem key={item.href} item={item} />
              ))}
              {isLast ? (
                <li>
                  <MobileMenuAsk className={styles.mobileLink}>
                    <NavIcon name="sparkles" className={styles.menuIcon} />
                    {ASK_AI.label}
                  </MobileMenuAsk>
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </>
  );
}

/**
 * Header — the floating pill nav (prototype `.navwrap`): the brand, then Work ▾,
 * Evals, Writing, About ▾ and the assistant, and the Contact | Hire me ghost
 * pills on the right. Below 1000px: the brand, the pills and a menu button
 * that opens the grouped panel as a modal sheet (`MobileMenu`).
 *
 * Sticky with the pill 8px from the top (`--nav-top`), 1232px wide, blurred
 * glass with a hairline and a soft shadow. On a page with a `DarkSurface` it is
 * the dark pill (its `[data-chrome]` scope, tokens.css).
 *
 * The assistant (components/features/assistant.tsx) is mounted here as the
 * persistent first action (visible at every width, an icon on phones), so it
 * persists across navigation and keeps its transcript; its trigger is its own.
 *
 * A11y: a `<header>` landmark holding one `<nav aria-label="Primary">`; the
 * desktop menus are disclosure buttons and the mobile menu is a modal dialog;
 * every list is labelled by its group title.
 * Performance: a server component — only the menus, links and the mobile
 * button hydrate.
 */
export function Header() {
  return (
    <header className={styles.wrap} data-chrome="">
      <nav className={styles.nav} aria-label="Primary">
        <Brand className={styles.brand} />
        <NavMenus className={styles.links}>
          <NavMenu id="nav-work" label={WORK_MENU.label} wide sections={MENU_SECTIONS.work}>
            <WorkPanel />
          </NavMenu>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href} className={styles.item}>
                {link.label}
              </NavLink>
            </li>
          ))}
          <NavMenu id="nav-about" label={ABOUT_MENU.label} sections={MENU_SECTIONS.about}>
            <AboutPanel />
          </NavMenu>
        </NavMenus>
        <div className={styles.actions}>
          <span className={styles.askSlot}>
            <Assistant />
          </span>
          {NAV_ACTIONS.map((action, i) => (
            <span key={action.href} className="contents">
              {i > 0 ? <span className={styles.divider} aria-hidden="true" /> : null}
              <NavLink href={action.href} className={cx(styles.ghost, i === 0 && styles.contact)}>
                {action.label}
              </NavLink>
            </span>
          ))}
        </div>
        <MobileMenu labels={MENU_LABELS}>
          <MobilePanel />
        </MobileMenu>
      </nav>
    </header>
  );
}
