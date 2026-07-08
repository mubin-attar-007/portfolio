import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { SITE, STATUS } from "@/config/site";
import { loadNow } from "@/lib/now";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm building, exploring, and reading right now — a running snapshot.",
  alternates: { canonical: `${SITE.url}/now` },
};

/**
 * /now — a hand-updated snapshot of current work. Content is one MDX file
 * (content/now.mdx); the "Last updated" line reads the required `updated`
 * front-matter (never file mtime). The "Open to" tail is single-sourced from
 * STATUS so it can't diverge from /hire and the footer.
 */
export default async function NowPage() {
  const { meta, content } = await loadNow();

  return (
    <Section space="lg">
      <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">Now</p>
      <h1 className="mt-6 max-w-[18ch] text-4xl tracking-[-0.02em] text-ink sm:text-5xl">
        What I&apos;m doing now
      </h1>
      <p className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-ink-tertiary">
        <span className="h-1.5 w-1.5 rounded-full bg-positive" aria-hidden />
        Last updated {formatDate(meta.updated)}
      </p>
      <p className="mt-6 max-w-[var(--width-prose)] text-lg text-ink-secondary">{meta.lede}</p>

      <div className="mt-12 max-w-[var(--width-prose)]">{content}</div>

      {/* Open to — single-sourced from STATUS so it never diverges from /hire + footer */}
      <div className="mt-14 max-w-[var(--width-prose)] border-t border-border pt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">Open to</h2>
        <p className="mt-4 text-lg text-ink">{STATUS.text}.</p>
        <div className="mt-5">
          <Link href="/hire" className={buttonVariants("secondary", "sm")}>
            Work with me <ArrowUpRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
