"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import { PostCover } from "@/components/features/post-cover";
import { Spotlight } from "@/components/features/spotlight";

/**
 * WritingList — the active-blog index: topic-filter chips + a year archive.
 * Server passes the (serializable) post metadata; filtering/grouping is client
 * side.
 *
 * Props:
 * - `posts` — serializable post metadata, newest first.
 *
 * Motion: the archive fades up once via the shared `.reveal`. Deliberately NOT a
 * per-card `.reveal-stagger`: the list is filtered client-side, and the reveal is
 * driven by an observer that only re-scans on route change, so a card mounted by
 * a filter click would stay hidden. Every card IS a single link, so it earns the
 * shared `.lift` (hover/focus elevation) alongside `.spotlight`. One <Spotlight>
 * wraps the whole archive — one pointer listener for every year, not one per card.
 * Cards rest at `--shadow-md` (Clerk's card shadow) and `.lift` raises them to
 * `--shadow-lift`, so hover still buys a visible change in depth.
 *
 * A11y: chips are real toggle buttons (aria-pressed); each post is one link and
 * one tab stop; `.lift` also responds to `:focus-within`, so keyboard users get
 * the same affordance as pointer users. All effects are reduced-motion gated.
 */
type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: "essay" | "guide" | "note";
  topics: string[];
};

const LABEL: Record<Post["category"], string> = { essay: "Essay", guide: "Guide", note: "Note" };

export function WritingList({ posts }: { posts: Post[] }) {
  const topics = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.topics))).sort((a, b) => a.localeCompare(b)),
    [posts],
  );
  const [active, setActive] = useState<string | null>(null);

  const filtered = active ? posts.filter((p) => p.topics.includes(active)) : posts;
  const byYear = useMemo(() => {
    const m = new Map<string, Post[]>();
    for (const p of filtered) {
      const y = p.date.slice(0, 4);
      (m.get(y) ?? m.set(y, []).get(y)!).push(p);
    }
    return Array.from(m.entries()); // filtered is already newest-first
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter writing by topic">
        <Chip on={active === null} onClick={() => setActive(null)}>
          All
        </Chip>
        {topics.map((t) => (
          <Chip key={t} on={active === t} onClick={() => setActive(active === t ? null : t)}>
            {t}
          </Chip>
        ))}
      </div>

      <Spotlight>
        {/* The reveal sits on the ARCHIVE, not on each card. RevealObserver adds
            `.reveal-in` imperatively and only re-scans on route change, so a card
            (or a whole year) mounted by a filter click would never be observed and
            would stay at opacity 0 forever — invisible, but still focusable. This
            wrapper mounts once and survives every filter, so it is the only safe
            anchor. (Static, server-rendered grids keep `.reveal-stagger`.) */}
        <div className="reveal mt-12 flex flex-col gap-12">
          {byYear.map(([year, ps]) => (
            <section key={year}>
              <h2 className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
                {year}
              </h2>
              <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {ps.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/writing/${p.slug}`}
                      className="lift spotlight group flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-md)] transition-colors hover:border-border-strong"
                    >
                      {/* `relative` keeps content above the .spotlight layer (z-0) */}
                      <div className="relative aspect-[16/7] border-b border-border bg-bg-subtle">
                        <PostCover slug={p.slug} category={p.category} />
                      </div>
                      <div className="relative flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-xs uppercase text-ink-tertiary">
                            {LABEL[p.category]}
                          </span>
                          <time dateTime={p.date} className="font-mono text-xs text-ink-tertiary">
                            {formatDate(p.date)}
                          </time>
                        </div>
                        <h3 className="mt-3 text-lg text-ink transition-colors group-hover:text-accent">
                          {p.title}
                        </h3>
                        <p className="mt-1.5 flex-1 text-sm text-ink-secondary">{p.summary}</p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                          Read
                          <ArrowRight
                            size={14}
                            strokeWidth={1.6}
                            aria-hidden
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {filtered.length === 0 ? (
            <p className="text-ink-secondary">No posts tagged &ldquo;{active}&rdquo; yet.</p>
          ) : null}
        </div>
      </Spotlight>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors duration-fast ease-[var(--ease-out)] ${
        on
          ? "border-accent bg-accent text-on-accent"
          : "border-border-strong text-ink-secondary hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
