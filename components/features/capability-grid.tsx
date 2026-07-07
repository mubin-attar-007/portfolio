"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Container,
  Rewind,
  ScanSearch,
  ShieldCheck,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { home } from "@/content/site";

/**
 * CapabilityGrid — the dark "capabilities" band (adapted from Clerk's auth
 * section): a centred intro over a grid of dark cards, each a real, attributed
 * guarantee. Cards fade+rise in a stagger the first time the grid enters view
 * (IntersectionObserver), then lift subtly on hover. Reduced-motion: the global
 * reduce rule collapses the transition, so cards appear without the fade/rise.
 * A11y: a plain list of headings + descriptions; icons are decorative; the
 * reveal is opacity/transform only.
 */
const ICONS: Record<string, LucideIcon> = {
  validator: ShieldCheck,
  retrieval: ScanSearch,
  lookahead: Rewind,
  metrics: BarChart3,
  fallback: Waypoints,
  infra: Container,
};

export function CapabilityGrid() {
  const { capabilities } = home;
  const ref = useRef<HTMLUListElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reveal on first entry. Under prefers-reduced-motion the global reduce rule
    // collapses the transition to ~0ms, so cards simply appear (no fade/rise).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative z-10 mx-auto w-full max-w-[var(--width-container)]">
      <div className="mx-auto max-w-[46ch] text-center">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-accent">
          {capabilities.eyebrow}
        </p>
        <h2 className="mt-4 text-3xl tracking-[-0.02em] text-ink sm:text-4xl">{capabilities.title}</h2>
        <p className="mt-4 text-lg text-ink-secondary">{capabilities.body}</p>
      </div>

      <ul ref={ref} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.items.map((c, i) => {
          const Icon = ICONS[c.icon] ?? ShieldCheck;
          return (
            <li
              key={c.title}
              className="group rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] hover:border-border-strong hover:shadow-[var(--shadow-md)]"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : "translateY(16px)",
                transition: `opacity 620ms var(--ease-out) ${i * 70}ms, transform 620ms var(--ease-out) ${i * 70}ms, border-color 200ms var(--ease-out), box-shadow 200ms var(--ease-out)`,
              }}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent-subtle text-accent">
                <Icon size={18} strokeWidth={1.6} aria-hidden />
              </span>
              <p className="mt-5 font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                {c.kicker}
              </p>
              <h3 className="mt-1 text-lg text-ink">{c.title}</h3>
              <p className="mt-2 text-sm text-ink-secondary">{c.body}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 text-center">
        <Link
          href={capabilities.cta.href}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
        >
          {capabilities.cta.label}
          <ArrowRight
            size={15}
            strokeWidth={1.5}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
