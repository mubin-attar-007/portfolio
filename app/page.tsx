import Link from "next/link";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";

/**
 * Home (placeholder hero, Sprint 1). Structure follows DESIGN §5; the real
 * positioning copy + proof strip + section tempo arrive in Sprint 3 from
 * content/site/home.md. No image, no animation beyond a single fade (added
 * with the design system). Accent budget: one primary button.
 */
export default function Home() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase text-ink-tertiary">
        {SITE.name} · {SITE.role} · {SITE.location}
      </p>

      <h1 className="mt-6 max-w-[20ch] text-4xl font-[560] text-ink sm:text-5xl">
        I design, build, and operate production AI systems.
      </h1>

      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
        Retrieval agents, evaluation harnesses, and deterministic-plus-LLM pipelines — shipped and
        running. Everything on this page is real; every metric links to how it was measured.
      </p>

      <p className="mt-4 font-mono text-xs text-ink-tertiary">
        Open to AI/ML roles — remote or {SITE.location}.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Link
          href="/work"
          className="inline-flex h-9 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Read the flagship case study
        </Link>
        <Link
          href="/writing"
          className="text-sm text-ink underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
        >
          How I make decisions
        </Link>
      </div>
    </Section>
  );
}
