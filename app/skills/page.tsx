import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CaretLink } from "@/components/ui/caret-link";
import { Chip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { SmartLink } from "@/components/ui/smart-link";
import { evidenceForAny } from "@/components/misc/stack-evidence";
import { PUBLIC_WORK } from "@/config/nav";
import { resume } from "@/content/resume";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/skills",
  title: "Skills",
  description:
    "Technology stack, LLM practices, and engineering disciplines I use to ship production AI/ML systems.",
  social: {
    description:
      "Technology stack, LLM practices, and engineering disciplines used across four shipped AI products.",
  },
});

/** Split a résumé line on the commas outside parentheses: one chip per skill. */
function skillsOf(line: string): string[] {
  return line.split(/,(?![^()]*\))/).map((s) => s.trim()).filter(Boolean);
}

/** The names a skill can be listed under in a case study's stack ("Django / DRF" → Django, DRF). */
function termsOf(skill: string): string[] {
  return skill
    .replace(/\(.*\)/, "")
    .split(/\s*(?:\/|&)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const GROUPS = resume.skills.map((group) => {
  const skills = skillsOf(group.items);
  const evidence = evidenceForAny(skills.flatMap(termsOf));
  return { ...group, skills, evidence, slugs: new Set(evidence.map((e) => e.slug)) };
});

/**
 * /skills — a capability map, not a self-rating. Each group from
 * content/resume.ts is a card of skills; a comparison table then marks which
 * public case study lists a tool from that group in its own stack. A mark is
 * drawn only from that evidence (components/misc/stack-evidence.ts); a group the
 * case studies do not show points to the résumé instead.
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
            Résumé context
          </Button>
          <Button href="/uses" variant="ghost">
            Stack details
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
        <div className="mt-10 overflow-x-auto rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">Skill groups by public case study</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-5 py-4 font-medium text-ink-tertiary">
                  Skill group
                </th>
                {PUBLIC_WORK.map((project) => (
                  <th key={project.slug} scope="col" className="px-3 py-4 text-center font-semibold text-ink">
                    <SmartLink href={project.href} className="hover:text-accent">
                      {project.label}
                    </SmartLink>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((group) => (
                <tr key={group.group} className="border-b border-border last:border-b-0">
                  <th scope="row" className="px-5 py-3.5 font-medium text-ink">
                    {group.group}
                  </th>
                  {PUBLIC_WORK.map((project) => (
                    <td key={project.slug} className="px-3 py-3.5 text-center">
                      {group.slugs.has(project.slug) ? (
                        <Check size={16} strokeWidth={2.2} className="inline text-accent" role="img" aria-label="Listed" />
                      ) : (
                        <Minus size={14} className="inline text-border-strong" role="img" aria-label="Not shown" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
