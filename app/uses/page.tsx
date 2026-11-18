import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { CaretLink } from "@/components/ui/caret-link";
import { PageHeader } from "@/components/ui/page-header";
import { Toc } from "@/components/ui/toc";
import { JumpBar } from "@/components/misc/jump-bar";
import { ToolCard } from "@/components/misc/tool-card";
import { evidenceFor } from "@/components/misc/stack-evidence";
import { TOOL_NOTES } from "@/content/pages/uses";
import styles from "@/components/misc/misc.module.css";
import { uses } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/uses",
  title: "Uses",
  description:
    "The tools I build with, from model APIs to deployment, and the case studies that list them: four public projects on free tiers, three flagship products on AWS.",
});

/** A stable anchor for a category title ("AI / ML" → "ai-ml"). */
const anchor = (title: string) =>
  title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const CATEGORIES = uses.groups.map((group) => ({ id: anchor(group.title), label: group.title }));

/**
 * /uses — the stack as a Clerk-glossary-style reference: a sticky category nav
 * (a sidebar on desktop, a jump bar on phones) beside one grid of tool cards per
 * category. Every item comes from content/site.ts; the "Used in" links come
 * only from each case study's own stack list (components/misc/stack-evidence.ts).
 */
export default function UsesPage() {
  return (
    <>
      <Section space="head">
        <PageHeader kicker={uses.kicker} title={uses.title} lede={uses.intro}>
          <CaretLink href={uses.cta.href} tone="accent" size="md">
            {uses.cta.label}
          </CaretLink>
        </PageHeader>
        {/* The writing and the case studies call the hosting a "$0 stack";
            this page states how that is actually met, and its limits. */}
        <p className="mt-10 max-w-[720px] border-l-2 border-border-strong pl-5 text-sm leading-relaxed text-ink-secondary">
          {uses.costNote}
        </p>
      </Section>

      <Section space="md" className="!pt-0">
        <JumpBar items={CATEGORIES} label="Categories" className="lg:hidden" />
        <div className="mt-8 grid gap-12 lg:mt-0 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <Toc items={CATEGORIES} title="Categories" />
          </aside>
          <div className="flex flex-col gap-16">
            {uses.groups.map((group) => {
              const id = anchor(group.title);
              return (
                <section key={group.title} aria-labelledby={id} className={styles.anchor}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
                    <h2 id={id} className="text-2xl font-semibold tracking-[-0.02em] text-ink">
                      {group.title}
                    </h2>
                    <span className="font-mono text-xs text-ink-tertiary">{group.items.length} tools</span>
                  </div>
                  <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2.5">
                    {group.items.map((item) => (
                      <li key={item}>
                        <ToolCard name={item} note={TOOL_NOTES[item]} usedIn={evidenceFor(item)} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
}
