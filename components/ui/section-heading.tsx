import type { ReactNode } from "react";
import { TextLink } from "./text-link";

/**
 * SectionHeading — the full band header: mono kicker → heading → optional sub →
 * optional forward link (DESIGN §3).
 *
 * The `align` alternation is the point. Light prose bands are left-aligned and
 * dark bands are centred, so the page alternates axis as well as tone — that
 * contrast is what makes a dark band read as a deliberate plate rather than the
 * same section with its colours flipped. Centring every heading (or none) flattens
 * the rhythm the light/dark bands are there to create.
 *
 * The kicker is ALWAYS accent — Clerk's signature: every section eyebrow on
 * clerk.com is set in colour, light band or dark, and it is the one temperature
 * cue that marks "a new section starts here". No `.tone-invert` conditional is
 * needed because `--color-accent` itself re-scopes inside a dark band (the
 * lightened purple, 6.1:1 — AA at any size). On light bands the brand purple
 * measures 4.95:1 on `--color-bg` and 4.57:1 on `--color-bg-subtle` — AA for
 * the 12px kicker. SectionHeading never sits on an `aurora` band (PageHeader
 * owns those, and keeps its secondary kicker precisely because accent fails AA
 * over the violet stop of that gradient).
 *
 * Props:
 * - `kicker` — short mono label above the heading.
 * - `as` — `h2` (default) or `h3`; pick by document outline, not by size.
 * - `id` — anchor target on the heading itself.
 * - `align` — `start` (default) or `center`. Use `center` on dark bands.
 * - `size` — `display` (default) or `compact`. Compact drops an h2 one step
 *   (3xl→4xl instead of 4xl→5xl) and its sub to body size. Use it when two
 *   headers share one band (the Now+Writing two-up) or when the band is a
 *   closing group (the FAQ): Clerk's half-column headings measure ~36px, and two
 *   display headings side by side read as competition, not rhythm.
 * - `sub` — one muted supporting sentence. Left-aligned subs cap near 60ch;
 *   centred (band) subs drop to body size and cap near 48ch — Clerk's measured
 *   ~490px band-sub column — so they break into two balanced lines.
 * - `link` — the band's forward affordance, rendered as the shared `TextLink`.
 * - `children` — the heading text.
 *
 * A11y: renders a real heading element at the level the caller asks for; the
 * kicker is decorative text above it (not a heading), so it never pollutes the
 * outline. Centred text keeps the same tokens as left-aligned text — the ambient
 * wash peaks away from the heading column, and the a11y gate audits contrast on
 * every route in both themes.
 */
export function SectionHeading({
  kicker,
  as: Tag = "h2",
  id,
  align = "start",
  size = "display",
  sub,
  link,
  children,
}: {
  kicker?: string;
  as?: "h2" | "h3";
  id?: string;
  align?: "start" | "center";
  size?: "display" | "compact";
  sub?: ReactNode;
  link?: { href: string; label: string; external?: boolean };
  children: ReactNode;
}) {
  const centered = align === "center";
  // `size` only retunes an h2 — an h3 is already the compact scale, and pushing
  // it lower would collapse the outline's visual hierarchy entirely.
  // A CENTRED h2 (the dark-band header) takes its own scale before `size` is
  // consulted: Clerk's centred band h2 measures 40px/700 where their page h2s
  // reach 48px/600 — smaller but heavier is what makes the band header read as
  // dense and finished rather than merely shrunk (--text-band-title).
  const headingScale =
    Tag === "h2"
      ? centered
        ? "text-4xl font-bold text-ink sm:text-band-title"
        : size === "compact"
          ? "text-3xl text-ink sm:text-4xl"
          : "text-4xl text-ink sm:text-5xl"
      : "text-2xl text-ink sm:text-3xl";
  return (
    <div className={centered ? "flex flex-col items-center text-center" : "flex flex-col"}>
      {kicker ? (
        // Inside a dark band the kicker also steps up to text-sm: Clerk's
        // centred band kickers measure ~15px against ~12px for their in-page
        // labels, and at text-xs ours disappeared into the band.
        <p className="font-mono text-xs uppercase text-accent [.tone-invert_&]:text-sm">
          {kicker}
        </p>
      ) : null}
      <Tag
        id={id}
        className={`${kicker ? "mt-4" : ""} ${headingScale} ${centered ? "max-w-[24ch]" : ""}`}
      >
        {children}
      </Tag>
      {sub ? (
        // Centred subs drop to text-base and hold Clerk's measured ~490px
        // column (two balanced lines): a centred paragraph at 60ch/lg read as
        // a slab rather than a caption.
        <p
          className={`mt-4 ${size === "compact" || centered ? "text-base" : "text-lg"} text-ink-secondary ${
            centered ? "max-w-[48ch]" : "max-w-[62ch]"
          }`}
        >
          {sub}
        </p>
      ) : null}
      {link ? (
        <TextLink href={link.href} external={link.external} className="mt-6">
          {link.label}
        </TextLink>
      ) : null}
    </div>
  );
}
