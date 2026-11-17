import { ArrowOut } from "@/components/ui/caret-link";
import { SmartLink, isWebLink } from "@/components/ui/smart-link";
import { FOOTER_NAV } from "@/config/nav";
import { FOOTER, SITE } from "@/config/site";
import { Brand } from "./brand";
import { Container } from "./container";
import styles from "./footer.module.css";

/**
 * Footer — the five-column footer (prototype `.footer`): the brand and its
 * one-line positioning, then Work, Writing, About, Connect and Site
 * (config/nav.ts), a base bar (© year, location, email) and the dot texture.
 * Dark on a page with a `DarkSurface` (`[data-chrome]` scope).
 *
 * The base bar ends clear of the floating "Ask AI" launcher, so at the bottom
 * of the page nothing sits under it.
 *
 * A11y: a `<footer>` landmark with one `<nav aria-label="Footer">`; each column
 * is titled by an `h2`; links to other sites open a new tab, say so and carry
 * the out-arrow ↗, as does the mail link.
 */
export function Footer({ year }: { year: number }) {
  return (
    <footer className={styles.footer} data-chrome="">
      <Container>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Brand />
            <p className={styles.positioning}>{FOOTER.positioning}</p>
          </div>
          <nav aria-label="Footer" className={styles.columns}>
            {FOOTER_NAV.map((column) => (
              <div key={column.heading}>
                <h2 className={styles.heading}>{column.heading}</h2>
                <ul className={styles.list}>
                  {column.links.map((link) => {
                    const external = isWebLink(link.href);
                    return (
                      <li key={link.href}>
                        <SmartLink href={link.href} newTab={external} className={styles.link}>
                          {link.label}
                          {external ? <ArrowOut inline /> : null}
                        </SmartLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.base}>
          <p>
            © {year} {SITE.name} · {SITE.location}
          </p>
          <a href={`mailto:${SITE.email}`}>
            {SITE.email}
            <ArrowOut inline />
          </a>
        </div>
      </Container>
    </footer>
  );
}
