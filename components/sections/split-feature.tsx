import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CheckList, type CheckListItem } from "@/components/ui/check-list";
import { TextLink } from "@/components/ui/text-link";

/**
 * SplitFeature — the site's split feature band, measured off clerk.com: a narrow
 * copy rail on one side (kicker → heading → body → checklist → forward link) and
 * a large product surface on the other that BLEEDS out of the container to the
 * viewport edge.
 *
 * Why the bleed is the whole point: a surface that stops at the container reads
 * as an image placed on the page, and a surface that runs off the edge reads as
 * a window onto something bigger than the page. It is the one device that makes
 * a feature band feel like product rather than like a brochure — which is why it
 * is worth the geometry below.
 *
 * Props:
 * - `kicker` — small label above the heading (accent on dark bands, matching
 *   `SectionHeading`, so the two headers are recognisably the same device).
 * - `title` — the band's `<h2>`.
 * - `body` — one supporting paragraph.
 * - `items` — optional checklist of guarantees under the body.
 * - `link` — optional forward affordance, rendered as the shared `TextLink`.
 * - `media` — the surface itself. It brings its OWN frame (radius, border,
 *   shadow): this component supplies position and width only, so a media node
 *   that is already a finished surface — a diagram, a terminal — is never
 *   double-framed.
 * - `side` — which side the media takes at xl+ (default `right`). Alternate it
 *   on repeat use so the page zig-zags rather than marching down one axis.
 * - `tone`, `wash`, `space`, `ariaLabel`, `className` — passed to `Section`.
 *
 * A11y: reading order is copy → media in the DOM at every width; `side="left"`
 * moves the media with explicit grid placement rather than by reordering the
 * source, so a screen-reader or keyboard user always meets the explanation
 * before the thing it explains. The heading is a real `<h2>`.
 *
 * Performance: server component, no client boundary of its own — interactivity
 * belongs to whatever is passed as `media`. Nothing here animates; the entrance
 * fade comes from the caller's `.reveal` on the section.
 */

/**
 * The copy rail's width at xl+. Clerk's is a deliberately narrow ~350px column:
 * narrow enough that the media keeps the majority of the page, wide enough for a
 * ~45-character measure. Everything below is derived from it, so retuning the
 * device is this one value.
 */
const RAIL = "22rem";

/**
 * The gutter `Container` spends at this breakpoint (`md:px-8`). The rail track
 * has to include it, because at xl+ the grid runs edge to edge and takes over
 * the container's own horizontal inset. Restated here rather than tokenised
 * because it is a mirror of Container's padding — if that changes, this is the
 * single place that follows it.
 */
const GUTTER = "2rem";

/**
 * The bleed, without `100vw` — and that omission is the load-bearing decision.
 * `100vw` includes the classic scrollbar, so every `100vw`-based full-bleed is
 * ~15px too wide on Windows and pushes the page into a horizontal scroll (or has
 * to be papered over with `overflow: hidden`, which then breaks sticky and
 * scroll-into-view). A percentage resolves against the containing block — the
 * section, which is exactly the document width, scrollbar already subtracted —
 * so this geometry cannot overflow by construction at any viewport.
 *
 * The rail TRACK is: the gutter outside the container + the rail itself, i.e.
 * everything from the document edge to where the copy ends. The media then takes
 * `1fr` — the entire remainder, all the way to the opposite document edge.
 */
const RAIL_TRACK = `calc(50% - var(--width-container) / 2 + ${RAIL} + ${GUTTER})`;

/**
 * Custom properties are TYPED, never asserted: `CSSProperties` carries no index
 * signature for them, so a bare `as CSSProperties` would happily accept a
 * misspelt property that then silently does nothing at runtime (the repo's
 * `StaggerStyle` pattern).
 */
type RailStyle = CSSProperties & Record<"--split-rail" | "--split-rail-track", string>;
const railStyle: RailStyle = { "--split-rail": RAIL, "--split-rail-track": RAIL_TRACK };

type Side = "left" | "right";

/**
 * The two arrangements. The split engages at xl, not lg, for two reasons that
 * are both arithmetic rather than taste:
 *
 * 1. Below the container measure there is nothing to bleed INTO. The device's
 *    signature is the media running past the container to the viewport edge, and
 *    at 1024px the viewport IS narrower than the 1216px container — so a "split"
 *    there would be an ordinary two-column layout wearing the name.
 * 2. The rail track resolves to `gutter + rail` only once the document is at
 *    least the container measure wide; narrower than that it computes SMALLER
 *    than the rail it has to hold, and the copy would overflow its own column.
 *
 * So below xl the media simply sits under the copy inside the normal container,
 * where it gets the full measure — which for a wide media node (the architecture
 * diagram) is more legible than any column could be.
 */
const TRACKS: Record<Side, string> = {
  right: "xl:grid-cols-[var(--split-rail-track)_minmax(0,1fr)]",
  left: "xl:grid-cols-[minmax(0,1fr)_var(--split-rail-track)]",
};

/** Copy placement: the rail hugs the container's inner edge on its own side. */
const COPY: Record<Side, string> = {
  right: "xl:col-start-1 xl:row-start-1 xl:ml-auto",
  left: "xl:col-start-2 xl:row-start-1 xl:mr-auto",
};

/** Media placement — explicit, so DOM order stays copy-first in both variants. */
const MEDIA: Record<Side, string> = {
  right: "xl:col-start-2 xl:row-start-1",
  left: "xl:col-start-1 xl:row-start-1",
};

export function SplitFeature({
  kicker,
  title,
  body,
  items,
  link,
  media,
  side = "right",
  tone = "page",
  wash = false,
  space = "md",
  ariaLabel,
  className = "",
}: {
  kicker?: string;
  title: string;
  body: string;
  items?: readonly CheckListItem[];
  link?: { href: string; label: string; external?: boolean };
  media: ReactNode;
  side?: Side;
  tone?: "page" | "subtle" | "invert";
  wash?: boolean;
  space?: "sm" | "md" | "lg";
  ariaLabel?: string;
  className?: string;
}) {
  return (
    // `overflow-x-clip` is belt-and-braces, not the mechanism: the geometry above
    // cannot overflow, and this only absorbs sub-pixel rounding in the `calc`.
    // `clip` rather than `hidden` on purpose — `hidden` would make this a scroll
    // container and change how focus and anchor jumps behave inside it.
    <Section
      space={space}
      tone={tone}
      wash={wash}
      bleed
      ariaLabel={ariaLabel}
      className={`overflow-x-clip ${className}`}
    >
      {/* The rail measurements ride on a plain wrapper because custom properties
          INHERIT — `Container` is the shared primitive and takes className only,
          so this keeps the geometry local to this device without widening a
          primitive's API for one caller. */}
      <div style={railStyle}>
        {/* At xl+ the container stops constraining and becomes the full-bleed
            grid itself (`max-w-none`, `px-0`); its inset is folded into the rail
            track, so the copy still lines up with every other section on the page
            while the media runs past where the container used to end. */}
        <Container
          className={`relative grid gap-y-12 xl:max-w-none xl:items-center xl:gap-x-12 xl:gap-y-0 xl:px-0 2xl:gap-x-16 ${TRACKS[side]}`}
        >
          <div className={`${COPY[side]} xl:w-[var(--split-rail)]`}>
            {kicker ? (
              // Same treatment as SectionHeading's kicker, including the automatic
              // accent switch on dark bands — one header idiom, two components.
              // On a dark band it also steps up to text-sm (Clerk's band kickers
              // measure ~15px; at text-xs ours disappeared into the band).
              <p className="font-mono text-xs uppercase text-ink-tertiary [.tone-invert_&]:text-sm [.tone-invert_&]:text-accent">
                {kicker}
              </p>
            ) : null}
            {/* text-4xl, not the 5xl a centred band header spends: this heading
                lives in a 352px rail, where 48px type would break into three
                ragged lines. Clerk's split headings measure 36–40px for the same
                reason. */}
            <h2 className={`${kicker ? "mt-4" : ""} max-w-[18ch] text-3xl text-ink sm:text-4xl`}>
              {title}
            </h2>
            <p className="mt-5 text-ink-secondary">{body}</p>
            {items ? <CheckList items={items} className="mt-8" /> : null}
            {link ? (
              <TextLink href={link.href} external={link.external} className="mt-8">
                {link.label}
              </TextLink>
            ) : null}
          </div>
          {/* `min-w-0`: the media is frequently something with a large intrinsic
              width (a diagram, a code surface). Without this the grid item's
              automatic minimum size would let that intrinsic width push the track
              wider than its `1fr` share. */}
          <div className={`${MEDIA[side]} min-w-0`}>{media}</div>
        </Container>
      </div>
    </Section>
  );
}
