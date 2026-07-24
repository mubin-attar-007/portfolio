"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

/**
 * NoteList — the digital-garden index: tag-filter chips + compact note cards
 * (title · date · tags). Server passes serializable note metadata; filtering is
 * client-side.
 *
 * Props:
 * - `notes` — serializable note metadata, newest first.
 *
 * A11y: chips are real toggle buttons (aria-pressed); each note is one link and
 * one tab stop. Hover is border + title colour only.
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

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((n) => (
          <li key={n.slug}>
            <Link
              href={`/notes/${n.slug}`}
              prefetch={false}
              className="group flex h-full flex-col justify-between gap-6 rounded-[var(--radius-md)] border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <span className="text-ink transition-colors group-hover:text-accent">
                {n.title}
              </span>
              <div className="flex items-center justify-between gap-3">
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
      className={`rounded-[var(--radius-sm)] border px-3 py-1 font-mono text-xs transition-colors duration-fast ease-[var(--ease-out)] ${
        on
          ? "border-accent bg-accent text-on-accent"
          : "border-border-strong text-ink-secondary hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
