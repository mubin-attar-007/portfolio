import { Code, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";
import { DottedGuides, DottedRule } from "@/components/ui/dotted-guides";
import { Container } from "@/components/layout/container";
import { SITE } from "@/config/site";
import { contactPage } from "@/content/pages/contact";
import { AssistantOpener } from "./assistant-opener";
import styles from "./contact.module.css";

const ICON_SIZE = 16;

/**
 * The contact card (Clerk Contact): two routes in (a role by email, a project
 * by booked call), then three lighter ways to check the work first. The
 * aurora, the dotted guides and the viewport-wide rule are decorative.
 * A11y: a labelled section; h2 per route, h3 per sub-card.
 */
export function ContactCard() {
  const { label, hiring, freelance, assistant, resume, source, foot } = contactPage;
  return (
    <section className={styles.stage} aria-label={label}>
      <Container className={styles.grid}>
        <DottedGuides />
        <div className={styles.card}>
          <DottedRule />
          <div className={styles.cols}>
            <div>
              <h2>{hiring.title}</h2>
              <p>{hiring.body}</p>
              <Button variant="dark" caret href={hiring.action.href}>
                {hiring.action.label}
              </Button>
            </div>
            <div>
              <h2>{freelance.title}</h2>
              <p>
                {freelance.body[0]} <a href={`mailto:${SITE.email}`}>{SITE.email}</a> {freelance.body[1]}
              </p>
              <Button variant="dark" caret href={freelance.action.href} newTab>
                {freelance.action.label}
              </Button>
            </div>
          </div>
          <ul className={styles.subcards}>
            <li className={styles.subcard}>
              <h3>
                <Sparkles size={ICON_SIZE} aria-hidden="true" />
                {assistant.title}
              </h3>
              <p>{assistant.body}</p>
              <AssistantOpener>{assistant.action}</AssistantOpener>
            </li>
            <li className={styles.subcard}>
              <h3>
                <FileText size={ICON_SIZE} aria-hidden="true" />
                {resume.title}
              </h3>
              <p>{resume.body}</p>
              <CaretLink href={resume.action.href}>{resume.action.label}</CaretLink>
            </li>
            <li className={styles.subcard}>
              <h3>
                <Code size={ICON_SIZE} aria-hidden="true" />
                {source.title}
              </h3>
              <p>{source.body}</p>
              <CaretLink href={source.action.href}>{source.action.label}</CaretLink>
            </li>
          </ul>
        </div>
        <p className={styles.foot}>{foot}</p>
      </Container>
    </section>
  );
}
