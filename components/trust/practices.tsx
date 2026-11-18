import { Check, Code2, Radar, ShieldCheck, type LucideIcon } from "lucide-react";
import { Bento, Card, CardBody } from "@/components/ui/card";
import { CaretLink } from "@/components/ui/caret-link";
import { trust } from "@/content/site";
import { PRACTICE_LINKS } from "@/content/pages/trust";
import styles from "./trust.module.css";

const ICONS: Record<string, LucideIcon> = {
  "Code quality gates": Code2,
  "AI safety controls": ShieldCheck,
  "Operational trust": Radar,
};

/** The practice cards: each control group from content/site.ts, with an icon and the place to check it. */
export function Practices() {
  return (
    <Bento columns={3}>
      {trust.controls.map((group) => {
        const Icon = ICONS[group.title] ?? ShieldCheck;
        const link = PRACTICE_LINKS[group.title];
        return (
          <Card key={group.title} className={styles.practice}>
            <CardBody className="mt-0 flex h-full flex-col">
              <span className={styles.icon} aria-hidden="true">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <h3 className="mt-5">{group.title}</h3>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item}>
                    <Check size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {link ? (
                <span className={styles.practiceLink}>
                  <CaretLink href={link.href}>{link.label}</CaretLink>
                </span>
              ) : null}
            </CardBody>
          </Card>
        );
      })}
    </Bento>
  );
}
