import type { ReactNode } from "react";
import { MessageCircle, ShieldCheck, SquareTerminal, type LucideIcon } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Marquee, MarqueeGroup } from "@/components/motion/marquee";
import { CaretLink } from "@/components/ui/caret-link";
import { Chip } from "@/components/ui/chip";
import { SectionHeader } from "@/components/ui/section-header";
import { AGENT, AGENT_PROMPT } from "@/content/pages/home";
import { CopyPromptAction, OpenAssistantAction } from "./agent-actions";
import styles from "./sections.module.css";

/** Seconds per loop and start offset for each row, so the rows drift apart. */
const ROWS = [
  { duration: 64, delay: 0 },
  { duration: 48, delay: -9 },
  { duration: 40, delay: -17 },
] as const;

function Column({ icon: Icon, title, body, children }: { icon: LucideIcon; title: string; body: string; children: ReactNode }) {
  return (
    <div className={styles.col}>
      <h3>
        <Icon size={16} strokeWidth={1.6} aria-hidden className={styles.colIcon} />
        {title}
      </h3>
      <p>{body}</p>
      <div className={styles.colAction}>{children}</div>
    </div>
  );
}

/**
 * AgentSection — "Evaluate me with your own AI": three drifting rows of
 * sample questions (decorative), then the three ways to ask.
 */
export function AgentSection() {
  const { columns } = AGENT;
  return (
    <Section space="md" id="agent" ariaLabelledBy="agent-title">
      <SectionHeader title={AGENT.title} lead={AGENT.lead} align="center" id="agent-title" />
      <MarqueeGroup decorative className={styles.rows}>
        {AGENT.questions.map((row, i) => (
          <Marquee key={i} duration={ROWS[i]!.duration} delay={ROWS[i]!.delay} fade={false}>
            {row.map((question) => (
              <Chip key={question} variant="raised" size="md" mono>
                <b className={styles.prompt} aria-hidden="true">
                  ›
                </b>
                {question}
              </Chip>
            ))}
          </Marquee>
        ))}
      </MarqueeGroup>
      <div className={styles.cols}>
        <Column icon={MessageCircle} title={columns.site.title} body={columns.site.body}>
          <OpenAssistantAction label={columns.site.action} />
        </Column>
        <Column icon={SquareTerminal} title={columns.agent.title} body={columns.agent.body}>
          <CopyPromptAction
            prompt={AGENT_PROMPT.full}
            label={columns.agent.action}
            copied={columns.agent.copied}
            failed={columns.agent.failed}
            copiedMessage={AGENT_PROMPT.copied}
            failedMessage={AGENT_PROMPT.failed}
          />
        </Column>
        <Column icon={ShieldCheck} title={columns.privacy.title} body={columns.privacy.body}>
          <CaretLink href={columns.privacy.action.href}>{columns.privacy.action.label}</CaretLink>
        </Column>
      </div>
    </Section>
  );
}
