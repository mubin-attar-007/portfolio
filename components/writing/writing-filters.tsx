"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { POST_KINDS, writingPage, type PostFilter } from "@/content/pages/writing";
import { cx } from "@/components/ui/cx";

const FILTERS: readonly PostFilter[] = ["all", ...POST_KINDS];

function isFilter(value: string | null): value is PostFilter {
  return value !== null && (FILTERS as readonly string[]).includes(value);
}

/** The URL's `?type=` never changes under us (we write it), so nothing to subscribe to. */
const noSubscribe = () => () => {};
function urlFilter(): PostFilter | null {
  const requested = new URLSearchParams(window.location.search).get("type");
  return isFilter(requested) ? requested : null;
}

/**
 * WritingFilters — the type chips above the writing index (Clerk Blog). A
 * small client island: the posts themselves are server-rendered and carry
 * `data-kind`; this only toggles their `hidden` attribute, so the list ships no
 * client JS and every post is in the HTML before hydration.
 *
 * Props:
 * - `targetId` — the element whose `[data-kind]` descendants are filtered. A
 *   `[data-filter-group]` inside it hides when none of its posts is visible.
 * - `initial` — the server's preselection (/notes renders with "note").
 * - `syncUrl` — read `?type=` on load and keep it in the URL without a
 *   navigation (history.replaceState). Off on /notes, which is its own URL.
 *
 * A11y: real toggle buttons with `aria-pressed`, in a named group; the new
 * count is announced in a polite live region. Motion: colour only.
 */
export function WritingFilters({
  targetId,
  initial,
  syncUrl,
}: {
  targetId: string;
  initial: PostFilter;
  syncUrl: boolean;
}) {
  // The URL may preselect a type (/writing?type=guide, linked from the footer).
  // Read after hydration (the server snapshot is null), so the HTML matches.
  const fromUrl = useSyncExternalStore(noSubscribe, () => (syncUrl ? urlFilter() : null), () => null);
  const [chosen, setChosen] = useState<PostFilter | null>(null);
  const [status, setStatus] = useState("");
  const filter = chosen ?? fromUrl ?? initial;

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    for (const post of root.querySelectorAll<HTMLElement>("[data-kind]")) {
      post.hidden = filter !== "all" && post.dataset.kind !== filter;
    }
    for (const group of root.querySelectorAll<HTMLElement>("[data-filter-group]")) {
      group.hidden = group.querySelector("[data-kind]:not([hidden])") === null;
    }
  }, [filter, targetId]);

  function choose(next: PostFilter) {
    setChosen(next);
    const root = document.getElementById(targetId);
    const count = root?.querySelectorAll(`[data-list] [data-kind]${next === "all" ? "" : `[data-kind="${next}"]`}`).length ?? 0;
    setStatus(writingPage.filter.status(count, next));
    if (syncUrl) {
      const url = new URL(window.location.href);
      if (next === "all") url.searchParams.delete("type");
      else url.searchParams.set("type", next);
      window.history.replaceState(window.history.state, "", url);
    }
  }

  return (
    <>
      <div role="group" aria-label={writingPage.filter.label} className="flex flex-wrap gap-1.5">
        {FILTERS.map((value) => {
          const on = filter === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() => choose(value)}
              className={cx(
                "h-8 rounded-[var(--radius-pill)] px-3 text-sm transition-[color,background-color] duration-fast ease-[var(--ease-out)] active:scale-[var(--press-scale)]",
                on ? "bg-ink font-semibold text-white" : "font-medium text-ink hover:bg-[rgb(19_19_22/0.05)]",
              )}
            >
              {writingPage.filter.options[value]}
            </button>
          );
        })}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </>
  );
}
