"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { Spotlight } from "@/components/features/spotlight";

/**
 * NoteList — the digital-garden index: tag-filter chips + compact note cards
 * (title · date · tags). Server passes serializable note metadata; filtering is
 * client-side.
 *
 * Props:
 * - `notes` — serializable note metadata, newest first.
 *
 * Motion: the whole grid fades up once via the shared `.reveal`. Deliberately
 * NOT a per-card `.reveal-stagger`: the list is filtered client-side, and the
 * reveal is driven by an observer that only re-scans on route change, so a card
 * mounted by a filter click would stay hidden. Each card IS a single link, so it
 * earns the shared `.lift` on top of `.spotlight`; one <Spotlight> serves the
 * whole grid from a single pointer listener. Cards rest at `--shadow-md`
 * (Clerk's card shadow) and `.lift` raises them to `--shadow-lift`, so hover
 * still buys a visible change in depth rather than only movement.
 *
 * A11y: chips are real toggle buttons (aria-pressed); each note is one link and
 * one tab stop; `.lift` responds to `:focus-within` so keyboard traversal gets
 * the same affordance. All effects are reduced-motion gated.
 */
type Note = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
};

export function NoteList({ notes }: { notes: Note[] }) {
  const tags = useMemo(
    () => Array.from(new Set(notes.flatMap((n) => n.tags))).sort((a, b) => a.localeCompare(b)),
    [notes],
  );
  const [active, setActive] = useState<string | null>(null);

  const filtered = active ? notes.filter((n) => n.tags.includes(active)) : notes;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter notes by tag">
        <Chip on={active === null} onClick={() => setActive(null)}>
          All
        </Chip>
        {tags.map((t) => (
          <Chip key={t} on={active === t} onClick={() => setActive(active === t ? null : t)}>
            {t}
          </Chip>
        ))}
      </div>

      <Spotlight>
        {/* The reveal sits on the LIST, not on each <li>. RevealObserver adds
            `.reveal-in` imperatively and only re-scans on route change, so a card
            mounted by a filter click would never be observed and would stay at
            opacity 0 forever — invisible, but still focusable. The <ul> mounts
            once and survives every filter, so it is the only safe anchor here.
            (Static, server-rendered grids keep the per-card `.reveal-stagger`.) */}
        <ul className="reveal mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <li key={n.slug}>
              <Link
                href={`/notes/${n.slug}`}
                className="lift spotlight group flex h-full flex-col justify-between gap-6 rounded-[var(--radius-md)] border border-border bg-surface p-4 shadow-[var(--shadow-md)] transition-colors hover:border-border-strong"
              >
                {/* `relative` keeps content above the .spotlight layer (z-0) */}
                <span className="relative text-ink transition-colors group-hover:text-accent">
                  {n.title}
                </span>
                <div className="relative flex items-center justify-between gap-3">
                  <time dateTime={n.date} className="shrink-0 font-mono text-xs text-ink-tertiary">
                    {formatDate(n.date)}
                  </time>
                  <span className="flex flex-wrap justify-end gap-x-2 gap-y-1">
                    {n.tags.map((t) => (
                      <span key={t} className="font-mono text-xs text-ink-tertiary">
                        #{t}
                      </span>
                    ))}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Spotlight>
      {filtered.length === 0 ? (
        <p className="mt-12 text-ink-secondary">No notes tagged &ldquo;{active}&rdquo; yet.</p>
      ) : null}
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
