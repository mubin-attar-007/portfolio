"use client";

/**
 * Sticky mini table-of-contents for a case study. Scroll-spy highlights the
 * section currently in view via IntersectionObserver. Purely an enhancement:
 * it's an ordinary anchor list, so it works (and is keyboard-navigable) with
 * JS disabled; the active-state glow is the only thing JS adds.
 */

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/case-studies";

export function CaseStudyToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el != null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the topmost heading currently intersecting the trigger band.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      // A band near the top of the viewport is the "active" zone.
      { rootMargin: "-96px 0px -66% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="cs-toc">
      <span className="eyebrow mb-3 block">On this page</span>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={activeId === it.id ? "true" : undefined}
              className="cs-toc-link"
              data-active={activeId === it.id || undefined}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
