import { SmartLink, linkKind } from "@/components/ui/smart-link";
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
 * A11y: a `<footer>` landmark with one `<nav aria-label="Footer">`; each column
 * is titled by an `h2`; links to other sites open a new tab and say so.
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
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <SmartLink href={link.href} newTab={linkKind(link.href) === "external"} className={styles.link}>
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.base}>
          <p>
            © {year} {SITE.name} · {SITE.location}
          </p>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
      </Container>
    </footer>
  );
}
