import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/content/projects";
import { home } from "@/content/site";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import { Spotlight } from "@/components/features/spotlight";
import { formatDateFull } from "@/lib/format";

/**
 * LiveDemos — the "try it" band. Every product is deployed, so make it
 * launchable: each card shows a live status, the stack, and links to the
 * running app (new tab) and its case study.
 *
 * Props: none — copy comes from `content/site` and `content/projects`.
 *
 * Motion: the grid is a `.reveal-stagger`; each wrapper `<li>` carries `.reveal`
 * plus an `--i` index, so cards fade up in sequence off the shared
 * `--stagger-step` token. Hover life is the shared `.spotlight` only.
 *
 * The card surface is NOT itself a link — it holds two distinct destinations
 * (launch the app, read the case study) — so it does not carry `.lift`. The
 * previous bespoke `hover:-translate-y-1 hover:shadow-lg` was removed for that
 * reason: lift is the site-wide signal for "this whole surface is clickable",
 * and spending it here would make the real link cards say less.
 *
 * Elevation is `--shadow-md` — Clerk's real card shadow. The wide 15px/35px
 * layer in it is the load-bearing part: without it a bordered white card is
 * drawn ONTO the page, and with it the card sits above the page.
 *
 * Geometry is Clerk's white FEATURE card, not the control scale: `--radius-lg`
 * (12px — their light-section cards and testimonials all read at the figure
 * radius; 6px made these look like widgets), padding stepping 24→28px, and a
 * tight internal hierarchy — 18px title over 14px body — because a 20px title
 * in a card outranked the band's own subheading.
 *
 * A11y: real links with discernible names; the live dot is a static marker; all
 * hover effects are opacity/transform/colour and reduced-motion gated.
 */
/**
 * Entrance-stagger index for `.reveal-stagger > *` (globals.css), which derives
 * the delay as --i x --stagger-step. Typed as an intersection rather than cast,
 * because React's CSSProperties carries no index signature for custom props — an
 * `as CSSProperties` assertion here would silently accept a misspelt key.
 */
type StaggerStyle = CSSProperties & Record<"--i", number>;
function stagger(i: number): StaggerStyle {
  return { "--i": i };
}

export function LiveDemos() {
  const { live } = home;
  return (
    <div>
      {/* Light band ⇒ left-aligned header, the counterpart to the centred one on
          the dark bands. The alternation is the page's rhythm, not a preference. */}
      <SectionHeading kicker={live.kicker} sub={live.lede}>
        {live.title}
      </SectionHeading>

      <Spotlight>
        {/* mt-12 + gap-6: Clerk gives its header block ~56px of air before the
            cards and ~24px between them — mt-10/gap-5 read one notch too tight
            next to the reference. */}
        <ul className="reveal-stagger mt-12 grid gap-6 sm:grid-cols-2">
          {projects.map((p, i) => (
            // The reveal lives on the wrapper, not the card — its keyframe fills
            // forwards and would otherwise pin the card's transform.
            <li key={p.slug} className="reveal" style={stagger(i)}>
              <div className="spotlight group flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-md)] transition-colors duration-[var(--motion-base)] ease-[var(--ease-out)] hover:border-border-strong sm:p-7">
                {/* `relative` lifts the content above the .spotlight layer (z-0) */}
                <div className="relative flex flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-secondary">
                      <span className="h-2 w-2 rounded-full bg-positive" aria-hidden />
                      Live
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                      {p.systems[0]}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg text-ink transition-colors duration-[var(--motion-slow)] group-hover:text-accent">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-secondary">{p.summary}</p>
                  {p.changelog.length > 0 ? (
                    <p className="mt-4 flex-1 font-mono text-xs text-ink-tertiary">
                      Updated {formatDateFull(p.changelog[0]!.date)}
                    </p>
                  ) : (
                    <span className="flex-1" />
                  )}
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
                        className="transition-transform duration-[var(--motion-slow)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                    {/* `quiet`: the accent in this card is already spent on the
                        Launch button, and the case study is the secondary path. */}
                    <TextLink href={`/work/${p.slug}`} tone="quiet">
                      Case study
                    </TextLink>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Spotlight>
      <p className="mt-6 font-mono text-xs text-ink-tertiary">{live.note}</p>
    </div>
  );
}
