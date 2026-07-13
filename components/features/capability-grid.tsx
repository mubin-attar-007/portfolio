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
import { ILLOS } from "./capability-illustrations";

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
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-ink-tertiary">
          {capabilities.eyebrow}
        </p>
        <h2 className="mt-4 text-4xl tracking-[-0.02em] text-ink sm:text-5xl">{capabilities.title}</h2>
        <p className="mt-4 text-lg text-ink-secondary">{capabilities.body}</p>
      </div>

      <ul ref={ref} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.items.map((c, i) => {
          const Icon = ICONS[c.icon] ?? ShieldCheck;
          const Illo = ILLOS[c.icon];
          return (
            <li
              key={c.title}
              className="cap-card group relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-lg)]"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : "translateY(16px)",
                transition: `opacity var(--motion-reveal) var(--ease-out) ${i * 70}ms, transform var(--motion-reveal) var(--ease-out) ${i * 70}ms, translate var(--motion-base) var(--ease-out), border-color var(--motion-base) var(--ease-out), box-shadow var(--motion-base) var(--ease-out)`,
              }}
            >
              {/* soft accent wash from the top-left, revealed on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-accent opacity-0 blur-2xl transition-opacity duration-500 ease-[var(--ease-out)] group-hover:opacity-[0.10]"
              />
              {/* illustration well: an animated SVG scene, or the icon tile */}
              <div className="relative mb-5 flex h-24 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg-subtle px-5">
                {Illo ? (
                  <Illo />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent-subtle text-accent transition-[background-color,color,scale] duration-[var(--motion-slow)] ease-[var(--ease-spring)] group-hover:scale-110 group-hover:bg-accent group-hover:text-on-accent">
                    <Icon size={20} strokeWidth={1.6} aria-hidden />
                  </span>
                )}
              </div>
              <p className="relative font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                {c.kicker}
              </p>
              <h3 className="relative mt-1 text-lg text-ink transition-colors duration-[var(--motion-slow)] group-hover:text-accent">
                {c.title}
              </h3>
              <p className="relative mt-2 text-sm text-ink-secondary">{c.body}</p>
              {/* accent underline that grows across the base on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-[var(--motion-slow)] group-hover:scale-x-100"
              />
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
