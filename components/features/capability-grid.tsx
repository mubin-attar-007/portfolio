import type { CSSProperties } from "react";
import {
  BarChart3,
  Container,
  Rewind,
  ScanSearch,
  ShieldCheck,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { home } from "@/content/site";
import { SectionHeading } from "@/components/ui/section-heading";
import { Spotlight } from "@/components/features/spotlight";
import { ILLOS } from "./capability-illustrations";

/**
 * CapabilityGrid — the "capabilities" band (adapted from Clerk's auth section):
 * a centred intro over a grid of cards, each a real, attributed guarantee.
 *
 * Props: none — copy comes from `content/site`.
 *
 * Motion: the grid is a `.reveal-stagger`; each wrapper `<li>` carries `.reveal`
 * and an `--i` index, so the shared scroll-reveal fades the cards up in sequence
 * off one token (`--stagger-step`) instead of hand-typed delays. Hover life is
 * the shared `.spotlight` (pointer-follow highlight, one listener for the whole
 * grid via <Spotlight>) plus the card's own SVG illustration, which plays on
 * `.cap-card:hover` (globals.css).
 *
 * These cards are NOT links, so they deliberately do not carry `.lift` —
 * elevation on hover is reserved for surfaces you can actually click. Their
 * resting depth is `--shadow-card-invert`: the surface's own elevation plus
 * Clerk's 1px inset top highlight, which is the whole reason a dark card on a
 * dark band reads as an object rather than a painted rectangle.
 *
 * Layout is a real bento, not a uniform 3-up — see BENTO below.
 *
 * A11y: a plain list of headings + descriptions; icons and illustrations are
 * decorative; every effect is opacity/transform/colour only and the shared
 * utilities are all `prefers-reduced-motion` gated.
 *
 * Performance: a server component — no observer, no state, no client bundle.
 * The only client code involved is the single shared <Spotlight> listener.
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

const ICONS: Record<string, LucideIcon> = {
  validator: ShieldCheck,
  retrieval: ScanSearch,
  lookahead: Rewind,
  metrics: BarChart3,
  fallback: Waypoints,
  infra: Container,
};

/**
 * Bento emphasis, by POSITION rather than by content.
 *
 * A uniform 3-up grid is read row by row and every card is weighted the same,
 * which is the opposite of what a capability wall is for. Clerk's bento mixes
 * THREE moves, not one: cards that span two columns, ONE card that spans two
 * rows (their session-management centrepiece), and cards that flip which of
 * text/illustration comes first. The row-spanner is the piece ours was missing
 * — without it every row still resolved to the same silhouette and the grid
 * read as an alternation, not a mosaic.
 *
 * Over three columns the six cards auto-place exactly: row 1 is (wide + tall),
 * row 2 is (1 + 1 + the tall's second row), row 3 is (wide + 1). The tall slot
 * lets its illustration well grow to fill the doubled height; the wide slots
 * get a taller well; and TEXT_FIRST alternates the card's internal order the
 * way Clerk's does, so adjacent cards never repeat a silhouette.
 *
 * Keyed by index on purpose: this is a LAYOUT rhythm, not a claim about which
 * capability matters most. Content stays reorderable without a card silently
 * inheriting emphasis it wasn't given.
 */
const WIDE_SLOTS: ReadonlySet<number> = new Set([0, 4]);
/** The one double-height card (Clerk's centrepiece move) — slot, not content. */
const TALL_SLOT = 1;
/** Cards whose copy leads and whose illustration fills the space below. */
const TEXT_FIRST: ReadonlySet<number> = new Set([1, 3, 5]);
/** Illustration well heights — the wide slots get room to breathe. */
const WELL_WIDE = "h-44";
const WELL_NARROW = "h-28";

export function CapabilityGrid() {
  const { capabilities } = home;

  return (
    <div className="relative z-10 mx-auto w-full max-w-[var(--width-container)]">
      {/* Dark band ⇒ centred header with an accent kicker (SectionHeading does the
          accent switch off `.tone-invert`, so this call site stays declarative).
          The forward link lives IN the header, Clerk-style — their band CTA sits
          between the sub and the grid, so the offer is made before the evidence
          rather than dangling after it. */}
      <SectionHeading
        kicker={capabilities.eyebrow}
        align="center"
        sub={capabilities.body}
        link={{ href: capabilities.cta.href, label: capabilities.cta.label }}
      >
        {capabilities.title}
      </SectionHeading>

      {/* gap-3, not gap-5: Clerk's bento gutters measure 10–12px. The tight
          gutter against the large card radius is what makes the grid read as
          one carved slab rather than six separate tiles. */}
      <Spotlight>
        <ul className="reveal-stagger mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.items.map((c, i) => {
            const Icon = ICONS[c.icon] ?? ShieldCheck;
            const Illo = ILLOS[c.icon];
            const wide = WIDE_SLOTS.has(i);
            const tall = i === TALL_SLOT;
            const textFirst = TEXT_FIRST.has(i);
            /* The illustration vignette — `.cap-well` (globals.css) is the
               raised, top-lit panel; when the copy leads, the well takes the
               REMAINDER of the card (`flex-1`), which is how the tall slot's
               doubled height becomes illustration air instead of a stretched
               text column. */
            const well = (
              <div
                className={`cap-well relative flex items-center overflow-hidden rounded-[var(--radius-md)] px-4 ${
                  textFirst ? "mt-5 min-h-28 flex-1" : `mb-5 ${wide ? WELL_WIDE : WELL_NARROW}`
                }`}
              >
                {Illo ? (
                  <Illo />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent-subtle text-accent transition-[background-color,color,scale] duration-[var(--motion-slow)] ease-[var(--ease-spring)] group-hover:scale-110 group-hover:bg-accent group-hover:text-on-accent">
                    <Icon size={20} strokeWidth={1.6} aria-hidden />
                  </span>
                )}
              </div>
            );
            /* `relative` keeps content above the .spotlight layer (z-0).
               Title at text-base: Clerk's dark-card titles measure 15–16px —
               at text-lg ours outweighed the band header's own sub. */
            const copy = (
              <div className="relative">
                <p className="font-mono text-xs uppercase tracking-wide text-ink-tertiary">
                  {c.kicker}
                </p>
                <h3 className="mt-1 text-base text-ink transition-colors duration-[var(--motion-slow)] group-hover:text-accent">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm text-ink-secondary">{c.body}</p>
              </div>
            );
            return (
              // The reveal lives on the wrapper, never on the card: the reveal
              // keyframe fills forwards, and on the card it would pin `transform`
              // and out-rank any hover motion inside. The bento spans live here
              // too — it is the grid ITEM, so the spans have to be on the <li>.
              <li
                key={c.title}
                className={`reveal ${wide ? "lg:col-span-2" : "lg:col-span-1"} ${
                  tall ? "lg:row-span-2" : ""
                }`}
                style={stagger(i)}
              >
                <div className="cap-card spotlight group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-card-invert)] transition-colors duration-[var(--motion-base)] ease-[var(--ease-out)] hover:border-border-strong">
                  {textFirst ? copy : well}
                  {textFirst ? well : copy}
                </div>
              </li>
            );
          })}
        </ul>
      </Spotlight>
    </div>
  );
}
