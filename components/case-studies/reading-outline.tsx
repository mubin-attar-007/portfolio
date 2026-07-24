"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseStudySection } from "@/components/case-studies/section";
import { emitAnalyticsEvent } from "@/lib/analytics";

/**
 * Reading-outline behavior for case-study pages.
 *
 * Responsibilities:
 * - Progress indicator (2px ink/20%-tint bar at the viewport top)
 * - Sticky section TOC (xl breakpoint and above)
 * - Section activation from scroll position
 * - Case-study read-depth analytics events at 25/50/75/100
 *
 * Performance note:
 * All scroll work is requestAnimationFrame-throttled and scoped to the visible
 * article root to avoid measuring the whole document every frame.
 */
const MILESTONES = [25, 50, 75, 100] as const;

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function CaseStudyReadingOutline({
  slug,
  sections,
  contentId = "work-case-study-content",
}: {
  slug: string;
  sections: readonly CaseStudySection[];
  contentId?: string;
}) {
  const first = sections[0]?.id ?? "";
  const [active, setActive] = useState(first);
  const activeRef = useRef(first);
  const progressRef = useRef<HTMLDivElement>(null);
  const firedMilestonesRef = useRef<Set<number>>(new Set<number>());

  useEffect(() => {
    if (sections.length === 0) return;

    const root = document.getElementById(contentId);
    if (!root) return;

    let frame = 0;
    const tocQuery = window.matchMedia("(min-width: 80rem)");

    const onScroll = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rootTop = root.getBoundingClientRect().top + window.scrollY;
        const rootHeight = root.getBoundingClientRect().height;
        const viewportHeight = window.innerHeight;
        const range = rootHeight - viewportHeight;
        const scrollY = window.scrollY;
        const rawProgress = range > 0 ? ((scrollY - rootTop) / range) * 100 : 100;
        const nextProgress = Math.round(clamp(rawProgress, 0, 100));

        // The bar is visual-only and updates on every scroll frame. Writing its
        // compositor-friendly transform directly avoids reconciling this whole
        // client component for every percentage point.
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${nextProgress / 100})`;
        }
        for (const milestone of MILESTONES) {
          if (nextProgress >= milestone && !firedMilestonesRef.current.has(milestone)) {
            firedMilestonesRef.current.add(milestone);
            emitAnalyticsEvent("case_study_read_depth", {
              slug,
              milestone: String(milestone),
            });
          }
        }

        // The section outline is hidden below Tailwind's xl breakpoint. Avoid
        // forcing layout for every heading on phones and tablets, where only
        // the inexpensive progress calculation is visible.
        if (tocQuery.matches) {
          let nextActive = sections[0]?.id;
          for (const section of sections) {
            const node = document.getElementById(section.id);
            if (!node) continue;
            const offset = node.getBoundingClientRect().top;
            if (offset <= 120) {
              nextActive = section.id;
            } else {
              break;
            }
          }
          if (nextActive && nextActive !== activeRef.current) {
            activeRef.current = nextActive;
            setActive(nextActive);
          }
        }
      });
    };

    // At the document top both initial values are already correct: zero
    // progress and the first section active. Skipping the mount-time read keeps
    // this enhancement off the first-paint path while preserving scroll
    // restoration and deep-link behavior.
    if (window.scrollY > 0) onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    tocQuery.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      tocQuery.removeEventListener("change", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [slug, sections, contentId]);

  return (
    <>
      <div
        aria-hidden
        className="progress-track pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px]"
      >
        <div
          ref={progressRef}
          className="progress-fill h-full origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <aside className="hidden xl:block">
        <nav
          aria-label="On this page"
          className="mt-10 min-w-0 xl:sticky xl:top-32 xl:pl-2"
        >
          <p className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">On this page</p>
          <ul className="mt-4 border-l border-border">
            {sections.map((section) => {
              const isActive = section.id === active;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={`group/link inline-flex w-full items-center gap-3 py-2 pl-4 pr-3 text-sm transition-colors duration-fast ease-[var(--ease-out)] ${
                      isActive ? "text-ink" : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-fast ease-[var(--ease-out)] ${
                        isActive ? "bg-accent" : "bg-border group-hover/link:bg-ink-tertiary"
                      }`}
                    />
                    {section.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
