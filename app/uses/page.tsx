import type { Metadata } from "next";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";
import { uses } from "@/content/site";

export const metadata: Metadata = {
  title: "Uses",
  description: "The stack behind four live products — a deliberately boring, $0 free-tier stack.",
  alternates: { canonical: `${SITE.url}/uses` },
};

/**
 * /uses — the stack page. Static content from content/site.ts (Law 3); grouped
 * lists. A11y: a heading per group labels its list; decorative arrows are hidden.
 */
export default function UsesPage() {
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">Uses</p>
      <h1 className="mt-6 max-w-[16ch] text-4xl tracking-[-0.02em] text-ink sm:text-5xl">The stack</h1>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">{uses.intro}</p>

      <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2">
        {uses.groups.map((g) => (
          <section key={g.title}>
            <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-accent">{g.title}</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {g.items.map((item) => (
                <li key={item} className="flex items-baseline gap-3 text-ink-secondary">
                  <span className="font-mono text-ink-tertiary" aria-hidden>
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
