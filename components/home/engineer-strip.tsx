import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/layout/section";
import { EyebrowChip } from "@/components/ui/eyebrow-chip";
import { TextLink } from "@/components/ui/text-link";
import { LABEL } from "@/constants/page";
import { flagshipHome } from "@/content/home-visual";
import { about, home } from "@/content/site";
import { timeline } from "@/content/timeline";
import { SITE } from "@/config/site";
import profile from "@/content/profile.json";

/**
 * EngineerStrip — the person behind the systems, in one section.
 *
 * Clerk closes on a human note before its CTA ("Trusted around the world");
 * a solo portfolio's equivalent is the engineer. Left: portrait, name, the
 * two-line introduction, and the three principles as compact rows. Right: the
 * career line — period, role, what was built — reduced to one line per phase,
 * with the full mistake-driven timeline a click away on /about.
 *
 * Everything is read from the sources those pages already render (profile.json,
 * about/home in content/site.ts, content/timeline.ts), so the homepage cannot
 * describe the person differently from the About page.
 *
 * A11y: the portrait carries a real description; the principles are a `<dl>`;
 * the timeline is an ordered list in reverse-chronological order, matching the
 * visual.
 */
export function EngineerStrip() {
  const e = flagshipHome.engineer;

  return (
    <Section space="lg" ariaLabelledBy="engineer-title">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-20">
        {/* ---- the person ---- */}
        <div>
          <EyebrowChip>{e.eyebrow}</EyebrowChip>
          <h2 id="engineer-title" className="mt-4 text-balance text-section font-bold text-ink">
            {e.title}
          </h2>

          <div className="mt-6 flex items-start gap-5">
            <Image
              src={profile.headshot}
              alt={`Portrait of ${SITE.name}`}
              width={72}
              height={72}
              sizes="72px"
              className="h-[4.5rem] w-[4.5rem] rounded-[var(--radius-md)] border border-border object-cover shadow-[var(--shadow-sm)]"
            />
            <div className="min-w-0">
              <p className="text-[0.9375rem] font-[550] text-ink">
                {SITE.name} <span className="font-normal text-ink-tertiary">· {SITE.role}</span>
              </p>
              <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-ink-secondary">
                {about.body[0]}
              </p>
            </div>
          </div>

          <p className={`${LABEL} mt-9`}>{e.principlesLabel}</p>
          <dl className="mt-4 border-t border-border">
            {home.principles.map((p) => (
              <div
                key={p.title}
                className="grid gap-1 border-b border-border py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="text-sm font-[550] leading-snug text-ink">{p.title}</dt>
                <dd className="text-sm leading-relaxed text-ink-secondary">{p.body}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <TextLink href={e.ctas.about.href}>{e.ctas.about.label}</TextLink>
            <TextLink href={e.ctas.resume.href} tone="quiet">
              {e.ctas.resume.label}
            </TextLink>
          </div>
        </div>

        {/* ---- the road here ---- */}
        <div>
          <p className={LABEL}>{e.timelineLabel}</p>
          <ol className="mt-4 flex flex-col gap-3">
            {timeline.map((phase) => (
              <li
                key={phase.period}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-[border-color,transform,box-shadow] duration-base ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_32%,var(--color-border))] hover:shadow-[var(--shadow-md)] motion-reduce:hover:translate-y-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-[0.9375rem] font-[550] text-ink">
                    {phase.role}
                    {phase.org ? (
                      <span className="font-normal text-ink-tertiary"> · {phase.org}</span>
                    ) : null}
                  </h3>
                  <span className="font-mono text-xs text-ink-tertiary">{phase.period}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{phase.built}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-ink-tertiary">
            The full timeline — including what went wrong in each phase — is on{" "}
            <Link href="/about" prefetch={false} className="link-underline text-ink-secondary">
              About
            </Link>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}
