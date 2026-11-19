import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { ScrollRegion } from "@/components/layout/scroll-region";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";
import { Chip } from "@/components/ui/chip";
import { cx } from "@/components/ui/cx";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { SmartLink } from "@/components/ui/smart-link";
import { evidenceForAny } from "@/components/misc/stack-evidence";
import styles from "@/components/misc/misc.module.css";
import { WORK_MENU } from "@/config/nav";
import { resume } from "@/content/resume";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/skills",
  title: "Skills",
  description:
    "Technology stack, LLM practices, and engineering disciplines I use to ship production AI/ML systems.",
  social: {
    description:
      "Technology stack, LLM practices and engineering disciplines, and where each shows up across seven case studies: three flagship products and four public projects.",
  },
});

/** Split a résumé line on the commas outside parentheses: one chip per skill. */
function skillsOf(line: string): string[] {
  return line.split(/,(?![^()]*\))/).map((s) => s.trim()).filter(Boolean);
}

/**
 * The names a skill can be listed under in a case study's stack: the skill,
 * each name it joins, and each tool it names in parentheses ("Django / DRF" →
 * Django, DRF; "agents (LangGraph)" → agents, LangGraph; "C# (.NET, WPF)" →
 * C#, .NET, WPF).
 */
function termsOf(skill: string): string[] {
  const inner = /\(([^)]*)\)/.exec(skill)?.[1] ?? "";
  return [skill.replace(/\s*\(.*\)/, ""), ...inner.split(",")]
    .flatMap((part) => part.split(/\s*(?:\/|&)\s*/))
    .map((s) => s.trim())
    .filter(Boolean);
}

const GROUPS = resume.skills.map((group) => {
  const skills = skillsOf(group.items);
  const evidence = evidenceForAny(skills.flatMap(termsOf));
  return { ...group, skills, evidence, slugs: new Set(evidence.map((e) => e.slug)) };
});

/**
 * The table's columns: every case study, flagships first. These are
 * `WORK_ITEMS` (the sub-nav's list and order), grouped as the Work menu
 * groups them, so the header can name each group over its columns.
 */
const COLUMN_GROUPS = WORK_MENU.groups;
const COLUMNS = COLUMN_GROUPS.flatMap((group) => group.items);

const TABLE = {
  caption: "Skill groups by case study",
  /** Names the sideways scroller on narrow screens (distinct from the caption). */
  scroller: "Skill groups table, scrolls sideways",
  rowHeader: "Skill group",
  listed: "Listed",
  notShown: "Not shown",
} as const;

/** The hairline between body rows (the last row ends on the card's edge). */
const ROW_RULE = "border-b border-border";

/**
 * /skills — a capability map, not a self-rating. Each group from
 * content/resume.ts is a card of skills; a comparison table then marks which
 * case study (the three flagship products, then the four public systems) lists a
 * tool from that group in its own stack. A mark is drawn only from that
 * evidence (components/misc/stack-evidence.ts); a group the case studies do not
 * show points to the résumé instead.
 *
 * The table scrolls sideways inside its card on narrow screens (`ScrollRegion`:
 * a named region with a tab stop only while it overflows), with the skill-group
 * column pinned so each row keeps its name.
 */
export default function SkillsPage() {
  return (
    <>
      <Section space="head">
        <PageHeader
          kicker="Skills"
          title="Skills"
          lede="A practical stack map for building production AI/ML systems: language tooling, model architecture, data layers, and safety disciplines."
        >
          <Button href="/resume" variant="dark" caret>
            Read the résumé
          </Button>
          <Button href="/uses" variant="light" caret>
            See the tools I use
          </Button>
        </PageHeader>
      </Section>

      <Section space="md" className="!pt-0">
        <SectionHeader
          title="Capabilities in context"
          size="sm"
          lead="This is an inventory, not a self-rating. The case studies show where each capability was used, what boundary it owned, and how the result was measured."
        />
        <ul className="mt-10 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {GROUPS.map((group) => (
            <li
              key={group.group}
              className="flex flex-col rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-card)]"
            >
              <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink">{group.group}</h3>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${group.group} skills`}>
                {group.skills.map((skill) => (
                  <li key={skill}>
                    {/* A long label wraps inside its chip instead of pushing a
                        360px viewport into horizontal scroll. */}
                    <Chip className="max-w-full whitespace-normal">{skill}</Chip>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-5 text-sm text-ink-tertiary">
                {group.evidence.length > 0 ? (
                  <>
                    In the stack of{" "}
                    {group.evidence.map((project, i) => (
                      <span key={project.slug}>
                        {i > 0 ? ", " : null}
                        <SmartLink
                          href={project.href}
                          className="text-ink-secondary underline decoration-border-strong underline-offset-[3px] transition-colors duration-[var(--motion-fast)] hover:text-accent"
                        >
                          {project.title}
                        </SmartLink>
                      </span>
                    ))}
                  </>
                ) : (
                  <>
                    Shown in work experience on the{" "}
                    <SmartLink
                      href="/resume"
                      className="text-ink-secondary underline decoration-border-strong underline-offset-[3px] hover:text-accent"
                    >
                      résumé
                    </SmartLink>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section space="md" tone="subtle">
        <SectionHeader
          title="Where each group shows up"
          size="sm"
          lead="A mark means that case study lists a tool from the group in its own stack. No mark means the case studies don't show it, not that it was never used."
        />
        <ScrollRegion
          label={TABLE.scroller}
          className={cx(styles.matrix, "mt-10 rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)]")}
        >
          <table className="w-full border-separate border-spacing-0 text-left text-sm">
            <caption className="sr-only">{TABLE.caption}</caption>
            <colgroup />
            {COLUMN_GROUPS.map((group) => (
              <colgroup key={group.label} span={group.items.length} />
            ))}
            <thead>
              <tr>
                <th
                  scope="col"
                  rowSpan={2}
                  className={cx(styles.pinned, ROW_RULE, "min-w-[10rem] px-5 pb-4 align-bottom font-medium text-ink-tertiary")}
                >
                  {TABLE.rowHeader}
                </th>
                {COLUMN_GROUPS.map((group) => (
                  <th key={group.label} scope="colgroup" colSpan={group.items.length} className="px-3 pt-5">
                    <Label as="span" tone="tertiary" className="block border-b border-border pb-2 text-center">
                      {group.label}
                    </Label>
                  </th>
                ))}
              </tr>
              <tr>
                {COLUMNS.map((item) => (
                  <th
                    key={item.slug}
                    scope="col"
                    className={cx(ROW_RULE, "whitespace-nowrap px-3 pt-2.5 pb-4 text-center font-semibold text-ink")}
                  >
                    <SmartLink href={item.href} className="hover:text-accent">
                      {item.label}
                    </SmartLink>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((group, row) => {
                const rule = row < GROUPS.length - 1 ? ROW_RULE : undefined;
                return (
                  <tr key={group.group}>
                    <th scope="row" className={cx(styles.pinned, rule, "px-5 py-3.5 font-medium text-ink")}>
                      {group.group}
                    </th>
                    {COLUMNS.map((item) => (
                      <td key={item.slug} className={cx(rule, "px-3 py-3.5 text-center")}>
                        {group.slugs.has(item.slug) ? (
                          <Check
                            size={16}
                            strokeWidth={2.2}
                            className="inline text-accent"
                            role="img"
                            aria-label={TABLE.listed}
                          />
                        ) : (
                          <Minus size={14} className="inline text-border-strong" role="img" aria-label={TABLE.notShown} />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollRegion>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <CaretLink href="/work" tone="accent" size="md">
            View skills in real projects
          </CaretLink>
          <CaretLink href="/resume" tone="muted" size="md">
            See experience backing this stack
          </CaretLink>
        </div>
      </Section>
    </>
  );
}
