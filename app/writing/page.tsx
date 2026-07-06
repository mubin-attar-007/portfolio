import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { SITE } from "@/config/site";
import { allWriting } from "@/lib/writing";
import { formatDate } from "@/lib/format";
import type { WritingMeta } from "@/content/schema";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and guides on AI systems, evaluation, and honest ML.",
  alternates: { canonical: `${SITE.url}/writing` },
};

const LABEL: Record<WritingMeta["category"], string> = { essay: "Essay", guide: "Guide", note: "Note" };

export default async function WritingIndex() {
  const posts = await allWriting();
  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase text-ink-tertiary">Writing</p>
      <h1 className="mt-6 max-w-[20ch] text-4xl text-ink sm:text-5xl">Writing</h1>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">
        Essays and guides on AI systems, evaluation, and honest ML — mined from the decisions and
        failures in my case studies.
      </p>
      <ul className="mt-10 divide-y divide-border border-y border-border">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/writing/${p.slug}`}
              className="group grid gap-1 py-6 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
            >
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-xl text-ink transition-colors group-hover:text-accent">{p.title}</h2>
                  <span className="font-mono text-xs uppercase text-ink-tertiary">{LABEL[p.category]}</span>
                </div>
                <p className="mt-1 max-w-[var(--width-prose)] text-sm text-ink-secondary">{p.summary}</p>
              </div>
              <time dateTime={p.date} className="font-mono text-xs text-ink-tertiary">
                {formatDate(p.date)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
