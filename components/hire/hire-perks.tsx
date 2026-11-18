import { ChartColumn, Cpu, FileText, ListChecks, Route, Shield, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Frame } from "@/components/ui/blueprint";
import { Label } from "@/components/ui/label";
import { hirePage, type PerkIcon } from "@/content/pages/hire";
import styles from "./hire.module.css";

const ICONS: Record<PerkIcon, LucideIcon> = {
  route: Route,
  list: ListChecks,
  shield: Shield,
  cpu: Cpu,
  bars: ChartColumn,
  file: FileText,
};

const PERK_ICON_SIZE = 44;

/** "Working with me": six line-icon perks on a white band, a CTA, and the caption on a hatched strip. */
export function HirePerks() {
  const { label, title, cta, items, caption } = hirePage.perks;
  return (
    <div className={styles.perksBand}>
      <Frame>
        <section aria-labelledby="perks-title">
          <div className={`${styles.perksHead} px-8 max-sm:px-5`}>
            <Label>{label}</Label>
            <h2 id="perks-title" className="text-sub text-ink">
              {title}
            </h2>
            <Button variant="violet" caret href={cta.href} className="mt-7">
              {cta.label}
            </Button>
          </div>
          <ul className={styles.perks}>
            {items.map((perk) => {
              const Icon = ICONS[perk.icon];
              return (
                <li key={perk.title}>
                  <Icon size={PERK_ICON_SIZE} strokeWidth={1.1} className={styles.perkIcon} aria-hidden="true" />
                  <h3>{perk.title}</h3>
                  <p>{perk.body}</p>
                </li>
              );
            })}
          </ul>
        </section>
        {/* The footnote on a hatched strip, as Clerk's careers page closes a band. */}
        <div className={styles.caption}>
          <p>{caption}</p>
        </div>
      </Frame>
    </div>
  );
}
