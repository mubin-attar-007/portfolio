import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import { ButtonGlyph, buttonVariants } from "@/components/ui/button";
import { SplitFeature } from "@/components/sections/split-feature";
import { SystemDiagram } from "@/components/diagrams/system-diagram";
import { HeroTerminal } from "@/components/features/hero-terminal";
import { ProofStrip } from "@/components/features/proof-strip";
import { SkillRotator } from "@/components/features/skill-rotator";
import { CapabilityGrid } from "@/components/features/capability-grid";
import { LiveDemos } from "@/components/features/live-demos";
import { Faq } from "@/components/features/faq";
import { CopyEmail } from "@/components/features/copy-email";
import { AuditLane } from "@/components/features/audit-lane";
import { diagrams } from "@/components/diagrams/data";
import { SITE, STATUS } from "@/config/site";
import { home, trust } from "@/content/site";
import { featuredProject } from "@/content/projects";
import { evals } from "@/content/evals";
import { allWriting } from "@/lib/writing";
import { formatDate } from "@/lib/format";

/**
 * The custom property this page writes for the stagger. Intersecting
 * `CSSProperties` with an explicit `Record` (the repo's `StaggerStyle` pattern)
 * types the key instead of asserting past it: a bare `as CSSProperties` compiles
 * just as happily with a misspelt property name, which then silently does
 * nothing at runtime.
 */
type StaggerStyle = CSSProperties & Record<"--i", number>;
function stagger(i: number): StaggerStyle {
  return { "--i": i };
}

/**
 * Asymmetric band rhythm, measured off clerk.com: a band gets ~128px above its
 * content and ~172px below. The extra weight underneath is what makes a section
 * read as a finished block rather than a floating one, and it stops two adjacent
 * bands from pooling into a single dead gap the way equal paddings do.
 *
 * `Section` sets a symmetric `py`, so these override only the bottom half. The
 * values are tokens (`--space-section-*-end`), so the whole page retunes from
 * tokens.css — nothing here is a length.
 */
const RHYTHM_MD = "!pb-[var(--space-section-md-end)]";
const RHYTHM_LG = "!pb-[var(--space-section-lg-end)]";
/**
 * The bento band INVERTS the asymmetry — Clerk's dark capability band measures
 * ~183px above its centred header and ~126px under the last card row. The extra
 * air above stages the header against the notched edge; the tight close works
 * because the band's CTA sits in its header (Clerk's placement), so nothing
 * follows the grid and padding under it would just be dead band.
 */
const RHYTHM_BENTO = "!pt-[var(--space-section-lg)] !pb-[var(--space-section-md)]";

/**
 * Home — flagship structure (one point per section, no two adjacent sections repeat
 * a subject). hero → proof → marquee → flagship (merged graph + safety rail) →
 * notebook → guarantees bento → products → mid-page hire CTA → exploring+writing →
 * FAQ → contact. Light/dark notched rhythm preserved. Sections below the hero carry
 * `reveal` (scroll-driven fade-up, reduced-motion-safe).
 *
 * Depth: the hero carries `aurora` (the multi-hue gradient spilling in from
 * above); `wash` is spent on the three dark bands only. Alternating lit and flat
 * surfaces is what reads as rhythm — an accent radial on every section is just
 * haze, and the light prose sections are more legible without one.
 *
 * Vertical rhythm: `lg` is reserved for the page's two bookends (hero, contact
 * close). Everything between is `md`, with `sm` on the FAQ because it and the
 * Now+Writing band above it read as one closing group. Two adjacent `lg`
 * sections stacked to 400px+ of empty space, which is what made the page feel
 * unfinished rather than airy. Below the hero each band spends RHYTHM_MD /
 * RHYTHM_LG, so its bottom padding is the larger of the pair (Clerk's asymmetry).
 */
export default async function Home() {
  const flagship = featuredProject;
  const rawDiagram = flagship.diagram ? diagrams[flagship.diagram] : undefined;
  // The homepage diagram is compact: keep the map + which nodes are explorable
  // (empty `decision` marker → the tick + deep link still render), but strip the
  // why/instead-of/tradeoff essays so they live ONLY on the case study, never in
  // the homepage DOM or its serialized props (fixes V2 airtight).
  const diagram = rawDiagram
    ? { ...rawDiagram, nodes: rawDiagram.nodes.map((n) => (n.decision ? { ...n, decision: {} } : n)) }
    : undefined;
  const posts = (await allWriting()).slice(0, 3);
  // Single-source the flagship eval headline from the registry — never re-typed here (F-07).
  // Pin the end-to-end golden-set row explicitly (its lede describes the live pipeline over
  // Postgres); the Spider row is the recognized-benchmark entry and lives on /evals, not here.
  const measuredEval = evals.find(
    (e) => e.system === "DBWhisper" && e.benchmark === "Custom golden-query set",
  );

  return (
    <>
      {/* Hero — CENTRED (Clerk's structure): meta → headline → one supporting
          line → the action pair → the product surface underneath. The previous
          two-column split put the claim and its evidence side by side competing
          for the same glance; stacked, the fold reads as one argument — what I
          do, what to do about it, then proof you can look at.

          Two decorative layers, deliberately different jobs: `aurora` is the
          light spilling in from above the top edge, `hero-surface` is the faint
          circuit-trace field printed on the ground. `wash` is NOT used — it and
          `aurora` are alternatives (both paint an accent radial from the top
          corners) and stacking them just doubles the same light.

          Entrance choreography: every `.hero-item` derives its delay from
          --stagger-step via `--i` on the `.reveal-stagger` parent (globals.css),
          so the whole hero retunes from one token and no millisecond is ever
          hand-typed here. One group now, running 1 → 5 top to bottom (beat 2 is
          the h1, which never animates — see below). */}
      {/* Padding follows Clerk's measured hero rhythm: 192 top / 128 bottom.
          Top is the `lg` token untouched — the earlier pull-in existed because a
          two-column hero was tall enough to push the h1 out of the fold, and a
          centred hero is not. Bottom stays pulled in to the `md` token: the
          proof strip below is the hero's own evidence and belongs WITH it, and
          Clerk's hero is likewise lighter underneath than above. */}
      <Section space="lg" aurora className="hero-surface !pb-[var(--space-section-md)]">
        {/* Above the aurora: `.aurora::after` is a sibling that paints after the
            container in DOM order, so the content needs its own layer or the
            gradient tints the type instead of the ground behind it. */}
        <div className="reveal-stagger relative z-10 flex flex-col items-center text-center">
          {/* `ink-secondary`, not `ink-tertiary`. The meta line sits at the very
              top of the band, which is where the aurora's violet stop is
              strongest: composited over that tint, tertiary measures ~4.2:1 and
              fails AA for body-size text, while secondary holds ~4.8:1.
              Tertiary only has ~0.3 of headroom on the flat page background, so
              no amount of gradient tuning rescues it here — the text token is
              the thing that has to give. */}
          <p
            className="hero-item font-mono text-xs uppercase tracking-[0.04em] text-ink-secondary"
            style={stagger(1)}
          >
            {home.metaLine}
          </p>
          {/* The LCP element paints immediately (no entrance fade, no `--i`) —
              the surrounding hero elements still fade in around it. Keeps LCP
              fast, and is the reason the stagger skips beat 2.
              Type is Clerk's measured h1: 64px ceiling, weight 700, 1.125
              line-height, -0.025em tracking. SOLID ink across the whole
              sentence — Clerk's headline holds one voice for both lines, and
              the screenshot diff showed our old tertiary tail reading as the
              claim trailing off. 32ch cap + `text-balance` is what breaks the
              62-char sentence into Clerk's two even lines instead of three. */}
          <h1 className="mt-8 max-w-[32ch] text-balance text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.125] tracking-[-0.025em] text-ink">
            {home.headline}
          </h1>
          {/* `text-pretty`, not `text-balance`: at ~62ch this is a two-line
              paragraph, and balancing it would leave a short orphan second line
              under a headline that is already balanced. mt-6 / mt-9 below are
              Clerk's measured fold rhythm: ~24px headline→sub, ~36px sub→CTAs
              — the tighter cluster is what makes the argument read as one
              block instead of three floating rows. */}
          <p
            className="hero-item mt-6 max-w-[62ch] text-pretty text-lg text-ink-secondary"
            style={stagger(3)}
          >
            {home.lede}
          </p>
          {/* dual CTA (fixes V4): flagship case study + a real contact action.
              `md`, not `lg`: Clerk's hero CTA is their compact 36px control with
              a 14px label — the 44px key we shipped first read oversized next
              to theirs in the screenshot diff. */}
          <div
            className="hero-item mt-9 flex flex-wrap items-center justify-center gap-3"
            style={stagger(4)}
          >
            <Link href={`/work/${flagship.slug}`} className={buttonVariants("primary", "md")}>
              {home.ctas.primary}
              {/* Clerk's forward glyph TRAILS the label (every glyphed CTA on
                  clerk.com — "Learn more ►", "Start building ►" — puts it
                  after), and is the shared primitive from
                  components/ui/button.tsx: sized on the spacing scale
                  (`size-2`), filled with currentColor, correct in both tones.
                  Decorative only — the link's name is the label. */}
              <ButtonGlyph />
            </Link>
            <Link href="/hire" className={buttonVariants("secondary", "md")}>
              {home.ctas.secondary}
            </Link>
          </div>
          {/* The evidence, directly under the ask. Full container width and
              centred — this is the hero's only image, and it is a real product
              surface rather than a rendering of one. */}
          <div
            className="hero-item mt-16 w-full text-left sm:mt-20"
            style={stagger(5)}
          >
            <HeroTerminal />
          </div>
        </div>
      </Section>

      {/* Proof strip (fixes V3) — honest credibility anchor, no faked logos/quotes */}
      <ProofStrip />

      <AuditLane
        title="Evidence stack"
        className="mt-8"
        items={[
          ...home.proof.stats.map((stat) => ({ ...stat, href: stat.href })),
          { href: "/trust", label: "trust policy" },
        ]}
      />

      {/* The real stack in Clerk's slot-machine — the engineering take on a logo wall */}
      <SkillRotator />

      {/* Flagship — ONE section (fixes V1), now built as the split feature: the
          copy rail states what the system does and the three guarantees it
          holds, and the architecture graph is the product surface bleeding to
          the viewport edge beside it. Node reveals stay short and deep-link to
          the case study (fixes V2).

          This is the one band on the page whose header is NOT centred despite
          being dark. The rule it breaks is real (dark bands centre their
          headers), and the reason is structural: in this device the header IS
          the left column, and centring a 352px rail against a bleeding media
          would sever the pairing the whole layout depends on. The alternation
          the rule exists to protect still holds — the two remaining dark bands
          (capabilities, contact close) keep their centred headers.

          The steps that used to run as a numbered `<ol>` under the diagram are
          now the checklist inside the rail: same three stages, same sentences
          from content/site.ts, no copy invented or dropped. */}
      {diagram ? (
        <SplitFeature
          tone="invert"
          wash
          ariaLabel="Inside the flagship system"
          className={`reveal ${RHYTHM_MD}`}
          kicker={home.architecture.kicker}
          title={home.architecture.title}
          body={home.showcase.body}
          items={home.showcase.steps.map((s) => ({ label: s.label, body: s.body }))}
          link={{ href: `/work/${flagship.slug}`, label: home.architecture.cta }}
          media={<SystemDiagram spec={diagram} compact deepLink={`/work/${flagship.slug}`} />}
        />
      ) : null}

      {/* Measured — the flagship's honest eval headline, linked to the registry (F-07).
          A compact bordered strip (like the mid-page CTA) so it never disturbs the
          dark/light Section rhythm. Number is single-sourced from content/evals.ts. */}
      {measuredEval ? (
        <div className="relative bg-surface">
          {/* Fading hairlines instead of `border-y`: a hard rule ran the full
              viewport and boxed the strip in. The lip fades out well before the
              edge, so the strip reads as a change of surface rather than a
              pasted-on box. Decorative, non-semantic (an <hr> would announce). */}
          <div className="rule-fade absolute inset-x-0 top-0" aria-hidden />
          <div className="mx-auto flex w-full max-w-[var(--width-container)] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">
                {home.measured.kicker}
              </p>
              <p className="mt-2 max-w-[56ch] text-sm text-ink-secondary">{home.measured.lede}</p>
              <p className="mt-2 font-mono text-lg tabular-nums text-ink sm:text-xl">
                {measuredEval.result}
              </p>
            </div>
            <TextLink href="/evals" className="shrink-0">
              {home.measured.cta}
            </TextLink>
          </div>
          <div className="rule-fade absolute inset-x-0 bottom-0" aria-hidden />
        </div>
      ) : null}

      {/* Trust strip — flagship continuity: one compact surface for governance + delivery signals before the notebook. */}
      <div className="relative bg-surface">
        <div className="rule-fade absolute inset-x-0 top-0" aria-hidden />
        <div className="mx-auto flex w-full max-w-[var(--width-container)] flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">{trust.kicker}</p>
            <p className="mt-2 max-w-[70ch] text-sm text-ink-secondary">
              {trust.body}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TextLink href="/trust">Trust policy</TextLink>
            <TextLink href="/changelog">Changelog</TextLink>
          </div>
        </div>
        <div className="rule-fade absolute inset-x-0 bottom-0" aria-hidden />
      </div>

      {/* From the notebook — how I think, in three real entries */}
      <Section space="md" ariaLabel="Field notes" className={`reveal ${RHYTHM_MD}`}>
        <div id="field-notes" className="scroll-mt-24">
          <SectionHeading kicker={home.notebook.kicker}>{home.notebook.title}</SectionHeading>
        </div>
        {/* Hairline-ruled rows, not floating stacks: Clerk separates every
            repeated row with a rule (pricing add-ons, changelog entries), and
            the rules are what make three entries read as one designed list
            instead of three paragraphs pooling in whitespace. `divide-y` only —
            no border-y — so a rule appears exactly where two entries meet and
            the band is never boxed in. Row rhythm is py-8: 64px + hairline
            between rows, close to the old 56px gap but now structured. */}
        <div className="mt-6 divide-y divide-border">
          {home.fieldNotes.map((note) => (
            <article key={note.n} className="grid gap-x-10 gap-y-3 py-8 md:grid-cols-[7rem_1fr]">
              {/* The index no longer outranks the entry it numbers: at 3xl the
                  pale numeral was the loudest thing in the row. At 2xl it sits
                  level with the title, whose 600 weight now wins the row —
                  Clerk's meta type is always subordinate to its heading. */}
              <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1">
                <span className="font-mono text-2xl tabular-nums text-ink-tertiary">{note.n}</span>
                <span className="font-mono text-xs text-ink-tertiary">{note.kicker}</span>
              </div>
              <div className="max-w-[60ch]">
                <h3 className="text-xl text-ink sm:text-2xl">{note.title}</h3>
                <p className="mt-3 text-ink-secondary">{note.body}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="font-mono text-sm">
                    <span className="tabular-nums text-ink">{note.tag.value}</span>{" "}
                    <span className="text-ink-tertiary">{note.tag.label}</span>
                  </span>
                  <Link href={note.href} className="link-underline text-sm text-ink">
                    {home.notebook.entryCta}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        {/* The forward link stays BELOW the three notes here (unlike the centred
            dark bands): on a left-aligned header the reader is meant to work
            through the entries first, and the link is the exit, not the offer.
            mt-4 + the last row's pb-8 restores the 48px the old mt-12 gave. */}
        <div className="mt-4">
          <TextLink href={home.notebook.href}>{home.notebook.cta}</TextLink>
        </div>
      </Section>

      {/* Guarantees bento — dark card grid */}
      <Section
        space="md"
        tone="invert"
        wash
        ariaLabel="What I build"
        className={`reveal ${RHYTHM_BENTO}`}
      >
        <CapabilityGrid />
      </Section>

      {/* Products — everything is deployed, so make it launchable */}
      <Section space="md" ariaLabel="Live products" className={`reveal ${RHYTHM_MD}`}>
        <LiveDemos />
      </Section>

      {/* Mid-page hire CTA (fixes V4 — the conversion action recurs, not only in the footer).
          Same fading-hairline treatment as the Measured strip, so the page's two
          compact strips read as one recurring device rather than two boxes. */}
      <div className="relative bg-surface">
        <div className="rule-fade absolute inset-x-0 top-0" aria-hidden />
        <div className="mx-auto flex w-full max-w-[var(--width-container)] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="inline-flex items-center gap-2.5 text-ink">
            <span className="h-2 w-2 rounded-full bg-positive" aria-hidden />
            {STATUS.text}
          </p>
          <Link href={STATUS.href} className={buttonVariants("primary", "sm")}>
            {STATUS.cta}
            <ArrowUpRight size={15} strokeWidth={1.8} />
          </Link>
        </div>
        <div className="rule-fade absolute inset-x-0 bottom-0" aria-hidden />
      </div>

      {/* No references band: this site's promise is that nothing on it is invented,
          and a placeholder quote is still an invented quote. It returns only when
          real, named, permissioned references exist. */}

      {/* Now + Writing — merged two-column (shortens the page) */}
      <Section
        space="md"
        tone="subtle"
        ariaLabel="Now and writing"
        className={`reveal ${RHYTHM_MD}`}
      >
        {/* One designed band, not two leftovers. Both columns share EXACTLY one
            header anatomy — kicker → heading → (sub) → link — at the `compact`
            scale, then content below. Two `display` h2s side by side read as
            competition (Clerk's half-column headings measure ~36px, one step
            under their full-width sections), and the writing column's forward
            link moving into its header puts both links on the same optical row
            instead of one at the top and one under the list. */}
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <SectionHeading
              size="compact"
              kicker={home.now.kicker}
              sub={home.now.teaser}
              link={{ href: home.now.href, label: home.now.cta }}
            >
              {home.now.title}
            </SectionHeading>
          </div>
          <div>
            <SectionHeading
              size="compact"
              kicker={home.writing.kicker}
              link={{ href: home.writing.href, label: home.writing.cta }}
            >
              {home.writing.title}
            </SectionHeading>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/writing/${p.slug}`}
                    className="group -mx-4 grid gap-1 rounded-[var(--radius-md)] px-4 py-4 transition-colors duration-fast ease-[var(--ease-out)] hover:bg-surface md:grid-cols-[1fr_auto] md:items-baseline md:gap-6"
                  >
                    <h3 className="text-base text-ink transition-colors group-hover:text-accent">
                      {p.title}
                    </h3>
                    <time dateTime={p.date} className="font-mono text-xs text-ink-tertiary">
                      {formatDate(p.date)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* FAQ — the questions a hiring manager has, in a Clerk accordion (trimmed to 4) */}
      {/* `sm`, not `md`: this and the Now+Writing band above are one closing group,
          so they sit close together and the page's last big breath is saved for
          the contact close below. */}
      <Section space="sm" ariaLabel="Frequently asked questions" className="reveal">
        <Faq />
      </Section>

      {/* Contact — the page's composed close: serif philosophy line → availability
          → the ask → one decisive CTA row. CENTRED, like the hero and the other
          centred dark band (capabilities), so the two bookends mirror each other —
          the left-set version stranded the band's entire right half as dead space,
          which is what made the close read unfinished rather than quiet.
          Hierarchy: the quote is the display moment (serif, 4xl); the ask steps
          DOWN a size so the two lines never compete as twin headlines.
          `tone-notch-b` steps the band's bottom edge the way `tone-notch` steps
          its top: the light surface below rises into the dark plate as a tab, so
          the page hands off to the footer with Clerk's chamfered seam instead of
          a flat colour change. */}
      <Section space="lg" tone="invert" wash className={`reveal tone-notch-b ${RHYTHM_LG}`}>
        <div className="flex flex-col items-center text-center">
          <p className="max-w-[28ch] text-balance font-serif text-3xl italic leading-snug text-ink sm:text-4xl">
            {home.philosophy}
          </p>
          <p className="mt-16 inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.04em] text-ink-tertiary">
            <span className="h-2 w-2 rounded-full bg-positive" aria-hidden />
            {STATUS.text}
          </p>
          <h2 className="mt-5 max-w-[24ch] text-balance text-2xl text-ink sm:text-3xl">
            {home.contactTitle}
          </h2>
          {/* One decisive close: the accent primary is the action, the literal
              email is the quiet alternative. Socials live in the footer below. */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link href={STATUS.href} className={buttonVariants("primary")}>
              {STATUS.cta}
              <ArrowUpRight size={15} strokeWidth={1.8} />
            </Link>
            <a href={`mailto:${SITE.email}`} className="link-underline text-lg text-ink">
              {SITE.email}
            </a>
            <CopyEmail email={SITE.email} />
          </div>
        </div>
      </Section>
    </>
  );
}
