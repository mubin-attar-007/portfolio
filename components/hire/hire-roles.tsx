import { Button } from "@/components/ui/button";
import { Frame } from "@/components/ui/blueprint";
import { CaretLink } from "@/components/ui/caret-link";
import { Label } from "@/components/ui/label";
import { SITE } from "@/config/site";
import { hirePage } from "@/content/pages/hire";
import styles from "./hire.module.css";

/**
 * "Open to" (#roles): a split header with the "not sure it's a fit" note, then
 * one row per role. Each row's action is named "<label>: <role>" for screen
 * readers (visible text first, WCAG 2.5.3), so three "Get in touch" links stay
 * distinguishable out of context.
 */
export function HireRoles() {
  const { label, title, note, items } = hirePage.roles;
  return (
    <Frame>
      <section id="roles" aria-labelledby="roles-title" className={`${styles.roles} scroll-mt-24`}>
        <div className={styles.rolesHead}>
          <Label>{label}</Label>
          <div className={styles.splitHead}>
            <h2 id="roles-title" className="text-sub text-ink">
              {title}
            </h2>
            <div>
              <p>
                <strong>{note.strong}</strong> {note.body}
              </p>
              <CaretLink href={`mailto:${SITE.email}`} className="mt-4">
                {note.action}
              </CaretLink>
            </div>
          </div>
        </div>
        <ul>
          {items.map((role) => (
            <li key={role.title} className={styles.role}>
              <div>
                <h3>{role.title}</h3>
                <ul className={styles.terms}>
                  {role.terms.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </div>
              <Button
                variant="violet"
                caret
                href={role.action.href}
                aria-label={`${role.action.label}: ${role.title}`}
              >
                {role.action.label}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </Frame>
  );
}
