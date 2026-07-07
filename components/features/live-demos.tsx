import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { projects } from "@/content/projects";
import { home } from "@/content/site";
import { buttonVariants } from "@/components/ui/button";

/**
 * LiveDemos — the "try it" band. Every product is deployed, so make it
 * launchable: each card shows a live status, the stack, and links to the
 * running app (new tab) and its case study. Server component (static links).
 * A11y: real links with discernible names; the pulsing dot is decorative and
 * pauses under reduced-motion; hover is transform/colour only.
 */
export function LiveDemos() {
  const { live } = home;
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.06em] text-accent">{live.kicker}</p>
      <h2 className="mt-4 max-w-[22ch] text-3xl tracking-[-0.02em] text-ink sm:text-4xl">
        {live.title}
      </h2>
      <p className="mt-4 max-w-[58ch] text-lg text-ink-secondary">{live.lede}</p>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {projects.map((p) => (
          <li
            key={p.slug}
            className="group relative flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] transition-[transform,border-color,box-shadow] duration-300 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-secondary">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
                </span>
                Live
              </span>
              <span className="font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                {p.systems[0]}
              </span>
            </div>
            <h3 className="mt-5 text-xl text-ink transition-colors duration-300 ease-[var(--ease-out)] group-hover:text-accent">
              {p.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-ink-secondary">{p.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={p.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants("primary", "sm")}
              >
                Launch
                <ArrowUpRight
                  size={15}
                  strokeWidth={1.8}
                  className="transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              <Link
                href={`/work/${p.slug}`}
                className="group/cs inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
              >
                Case study
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover/cs:translate-x-0.5"
                />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 font-mono text-xs text-ink-tertiary">{live.note}</p>
    </div>
  );
}
