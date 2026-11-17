import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";
import { ARTICLE_META } from "@/content/article";
import { formatDate } from "@/lib/format";

/**
 * Social preview cards (Open Graph, and X through og:image): one renderer for
 * every route.
 *
 * The card is the site in miniature: the canvas, a white panel whose hairline
 * edges run out to the card's edges like the blueprint frame lines, a faint
 * circuit sketch, the "MA" mark with the name, then a violet kicker naming the
 * kind of page, the title in Geist 700 and one line under it. `/about` and
 * `/evals` are dark pages, so their cards use the dark plate.
 *
 * Every route passes only its words (and, for a dark page, the tone) to
 * `renderOg`; nothing else varies by page, so a shared link always looks like
 * the same site.
 */

/** Pixel size of every card: the 1.91:1 frame Open Graph and X expect. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
/** Media type of every card. */
export const OG_CONTENT_TYPE = "image/png";

/** The light canvas (default) or the dark plate of the dark pages. */
export type OgTone = "light" | "dark";

/** The words on one card. */
export type OgCard = {
  /** The kind of page, set as the violet kicker ("Case study", "Essay"). */
  kicker: string;
  /** The page's headline, read from the same content the page renders. */
  title: string;
  /** One line under the title; longer text is cut with an ellipsis. */
  description?: string;
  /** Light by default; "dark" for the dark pages (/about, /evals). */
  tone?: OgTone;
};

// ---------------------------------------------------------------------------
// Design
// ---------------------------------------------------------------------------

// satori cannot read CSS custom properties, so the card writes its colours as
// literals, each named beside the token in styles/tokens.css it mirrors. A
// palette change updates them in the same change: no gate compares them, as
// the metadata and smoke gates check only that an image comes back.
type Palette = {
  canvas: string;
  surface: string;
  /** The hairline frame: the panel's edge and the guides that extend it. */
  rule: string;
  ink: string;
  ink2: string;
  kicker: string;
  markFill: string;
  markInk: string;
  /** Circuit strokes, drawn faint and faded out toward the words. */
  trace: string;
  traceOpacity: number;
  /** The circuit's one coloured element: the die at its centre, and its glow. */
  signal: string;
  glowOpacity: number;
  panelShadow: string;
};

const PALETTES: Record<OgTone, Palette> = {
  light: {
    canvas: "#f7f7f8", // --color-bg
    surface: "#ffffff", // --color-surface
    rule: "#e6e6ea", // --color-rule
    ink: "#131316", // --color-ink
    ink2: "#5e5f6e", // --color-ink-secondary
    kicker: "#6b4bff", // --color-accent
    markFill: "#131316", // --color-ink
    markInk: "#ffffff", // --color-surface
    trace: "#131316", // --color-ink
    traceOpacity: 0.16,
    signal: "#6b4bff", // --color-accent
    glowOpacity: 0.14,
    panelShadow: "0 1px 2px rgba(19,19,22,0.05), 0 18px 40px -18px rgba(19,19,22,0.14)",
  },
  dark: {
    canvas: "#0f0f12", // --color-plate-deep
    surface: "#131316", // --color-plate
    rule: "#2a2a30", // --color-plate-border
    ink: "#f4f4f6", // --color-plate-ink
    ink2: "#9d9daa", // --color-plate-ink-secondary
    kicker: "#9d8cff", // --color-plate-violet
    markFill: "#ffffff",
    markInk: "#131316", // --color-ink
    trace: "#ffffff",
    traceOpacity: 0.14,
    signal: "#63d2ef", // --color-plate-cyan
    glowOpacity: 0.2,
    panelShadow: "0 1px 2px rgba(0,0,0,0.4), 0 24px 56px -20px rgba(0,0,0,0.7)",
  },
};

/** The site's monogram, as the nav's mark sets it. */
const MONOGRAM = "MA";

// Geometry, in card pixels. The panel's edges sit on the guide lines.
const FRAME_INSET = 40;
const PANEL_RADIUS = 20;
const PANEL_WIDTH = OG_SIZE.width - FRAME_INSET * 2;
const PANEL_HEIGHT = OG_SIZE.height - FRAME_INSET * 2;
const PAD_X = 64;
const PAD_Y = 56;
// The title column ends left of the circuit's chip and the traces under it;
// the line below the title runs under the chip, so it may be wider.
const TITLE_MAX_WIDTH = 840;
const LINE_MAX_WIDTH = 960;

// Type, in card pixels: the site's styles at about twice their size, so the
// card still reads at the 500-600px width most feeds show it. Tracking is in
// em, as the styles set it (display -0.035em, the nav's brand -0.02em).
const TYPE = {
  mark: { box: 46, radius: 13, size: 20, tracking: -0.04 },
  brand: { size: 28, tracking: -0.02, gap: 16 },
  kicker: { size: 28, lineHeight: 1.2 },
  title: { lineHeight: 1.06, tracking: -0.035, gap: 18 },
  line: { size: 28, lineHeight: 1.4, gap: 24 },
} as const;

// The title steps down with its length: a project name fills one line at 96,
// and every title the content allows (60 characters at most, test/seo.test.mts)
// sets in two lines, or three for the longest, clear of the brand row.
// Measured against Geist Bold at the display tracking, without kerning (see
// `withoutKerning`).
const TITLE_STEPS = [
  { maxChars: 14, size: 96 },
  { maxChars: 24, size: 80 },
  { maxChars: 39, size: 72 },
  { maxChars: 52, size: 64 },
  { maxChars: 64, size: 60 },
] as const;
const TITLE_MIN_SIZE = 56;

/** Pixels for a tracking value in em at a font size, as satori expects it. */
function tracking(em: number, size: number): number {
  return em * size;
}

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

type FontWeight = 400 | 500 | 700;
type OgFont = { name: string; data: ArrayBuffer; weight: FontWeight; style: "normal" };

const FONT_FAMILY = "Geist";
/** The line, the kicker, and the brand with the title. */
const FONT_WEIGHTS: readonly FontWeight[] = [400, 500, 700];
const GOOGLE_FONTS_CSS = "https://fonts.googleapis.com/css2";
// satori reads TrueType, OpenType and WOFF, not WOFF2. Google Fonts answers a
// client that does not present a browser's user agent, as Node's fetch does
// not, with a TrueType file of the static weight.
const TRUETYPE_SOURCE = /src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/;
// The font file's table directory: a table count at byte 4, then one 16-byte
// record per table from byte 12, each starting with its tag (big-endian).
const TABLE_COUNT_OFFSET = 4;
const TABLE_RECORDS_OFFSET = 12;
const TABLE_RECORD_SIZE = 16;
const GPOS_TAG = 0x47504f53; // "GPOS"
const HIDDEN_GPOS_TAG = 0x5f504f53; // "_POS": a tag no font parser reads

async function fetchOrThrow(url: string): Promise<Response> {
  // force-cache keeps each response in Next's data cache, so a rebuild that
  // restores .next/cache renders the cards without reaching Google again.
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`OG font request failed: ${response.status} ${url}`);
  return response;
}

/**
 * Hide the font's kerning from satori, so the spaces between words come out
 * even.
 *
 * satori places each word at an offset summed from per-character advance
 * widths, which carry no kerning, then draws the word with the font's kerning
 * applied. A kerned word ("Wave") is therefore drawn narrower than the slot
 * it was given, and the space after it widens ("Wave  Form"). Geist
 * keeps its kerning in the GPOS table; renaming that table's tag in the table
 * directory hides it from the parser, so the drawn widths match the measured
 * ones. Ligatures (GSUB) are left alone: none changes the width of this text.
 * GPOS also positions combining marks, so the card's text is NFC-normalised
 * (see `typeset`) and never relies on them.
 */
function withoutKerning(font: ArrayBuffer): ArrayBuffer {
  const view = new DataView(font);
  const tableCount = view.getUint16(TABLE_COUNT_OFFSET);
  for (let table = 0; table < tableCount; table++) {
    const record = TABLE_RECORDS_OFFSET + table * TABLE_RECORD_SIZE;
    if (view.getUint32(record) === GPOS_TAG) view.setUint32(record, HIDDEN_GPOS_TAG);
  }
  return font;
}

async function fetchFont(weight: FontWeight): Promise<OgFont> {
  const cssUrl = `${GOOGLE_FONTS_CSS}?family=${FONT_FAMILY}:wght@${weight}`;
  const css = await (await fetchOrThrow(cssUrl)).text();
  const source = TRUETYPE_SOURCE.exec(css)?.[1];
  if (!source) throw new Error(`Google Fonts returned no TrueType file for ${FONT_FAMILY} ${weight}`);
  const data = withoutKerning(await (await fetchOrThrow(source)).arrayBuffer());
  return { name: FONT_FAMILY, data, weight, style: "normal" };
}

let fontsLoading: Promise<OgFont[]> | undefined;

/**
 * Geist in the three weights the card sets. `next/og` bundles only Geist
 * Regular, and passing any font replaces it, so all three are supplied.
 *
 * Loaded on the first render and memoised, never at module scope: each page's
 * metadata imports its card module for `alt` and `size`, and a top-level fetch
 * would hold up (or fail) the page itself. Cards prerender at build, where
 * `next/font/google` already fetches the same family from the same host. A
 * failed load is not memoised, so the next render retries it.
 */
function loadFonts(): Promise<OgFont[]> {
  fontsLoading ??= Promise.all(FONT_WEIGHTS.map(fetchFont)).catch((error: unknown) => {
    fontsLoading = undefined;
    throw error;
  });
  return fontsLoading;
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/**
 * Text as the card sets it: trimmed, and NFC-normalised so an accent is one
 * precomposed character ("é"), never a letter plus a combining mark that
 * would need the mark positioning `withoutKerning` hides.
 */
function typeset(text: string): string {
  return text.normalize("NFC").trim();
}

/**
 * A title as the redesigned pages set a display line: no closing full stop.
 * Content written as a sentence ("From healthcare workflows to AI products.")
 * keeps its stop where it is a sentence; on a card it reads as a headline.
 */
function displayTitle(title: string): string {
  return typeset(title).replace(/\.$/, "");
}

function titleSize(title: string): number {
  return TITLE_STEPS.find((step) => title.length <= step.maxChars)?.size ?? TITLE_MIN_SIZE;
}

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

/** The full-bleed hairlines that continue the panel's edges to the card's edges. */
function Guides({ color }: { color: string }) {
  const line = { position: "absolute", background: color } as const;
  const right = OG_SIZE.width - FRAME_INSET - 1;
  const bottom = OG_SIZE.height - FRAME_INSET - 1;
  return (
    <>
      <div style={{ ...line, left: 0, top: FRAME_INSET, width: OG_SIZE.width, height: 1 }} />
      <div style={{ ...line, left: 0, top: bottom, width: OG_SIZE.width, height: 1 }} />
      <div style={{ ...line, left: FRAME_INSET, top: 0, width: 1, height: OG_SIZE.height }} />
      <div style={{ ...line, left: right, top: 0, width: 1, height: OG_SIZE.height }} />
    </>
  );
}

// The circuit sketch, in panel coordinates: one chip with four pins a side,
// right-angled traces that end in open vias or run out to the frame, and one
// resistor. Drawn for this card in the language of the site's circuit art
// (hairline strokes, rounded packages, open vias), not traced from any
// reference. Nothing is drawn left of x=904 below the chip, where the title
// column (PAD_X + TITLE_MAX_WIDTH) can reach; no two traces cross.
const CHIP = { x: 870, y: 64, size: 112, radius: 16 } as const;
const DIE = { x: 898, y: 92, size: 56, radius: 9 } as const;
const DIE_CENTER = { x: DIE.x + DIE.size / 2, y: DIE.y + DIE.size / 2 } as const;
const PIN_OFFSETS = [26, 46, 66, 86] as const;
const PIN_LENGTH = 10;
const TRACES = [
  "M916 54V0",
  "M956 54V30H1120",
  "M896 54V36H800V0",
  "M992 90H1040M1068 90H1120",
  "M992 130H1060V230H1120",
  "M992 150H1024V290",
  "M956 186V210H1000V340",
  "M936 186V250",
  "M860 110H760V48",
  "M860 150H720",
] as const;
const VIAS = [
  { cx: 760, cy: 42 },
  { cx: 714, cy: 150 },
  { cx: 1024, cy: 296 },
  { cx: 1000, cy: 346 },
  { cx: 936, cy: 256 },
] as const;
const VIA_RADIUS = 5;
const RESISTOR = { x: 1040, y: 84, width: 28, height: 12, radius: 3 } as const;
const STROKE_WIDTH = 1.25;
const DIE_FILL_OPACITY = 0.08;
const DIE_STROKE_OPACITY = 0.45;
/** The sketch fades out with distance from the die, so it never competes with the words. */
const FADE_RADIUS = 400;
/** A soft light behind the die, in the tone's signal colour. */
const GLOW_RADIUS = 120;
// In an SVG mask, white keeps what it covers and transparency hides it.
const MASK_WHITE = "#fff";

function pinPath(): string {
  const { x, y, size } = CHIP;
  return PIN_OFFSETS.flatMap((offset) => [
    `M${x + offset} ${y}v-${PIN_LENGTH}`,
    `M${x + offset} ${y + size}v${PIN_LENGTH}`,
    `M${x} ${y + offset}h-${PIN_LENGTH}`,
    `M${x + size} ${y + offset}h${PIN_LENGTH}`,
  ]).join("");
}

function Circuit({ palette }: { palette: Palette }) {
  return (
    <svg
      width={PANEL_WIDTH}
      height={PANEL_HEIGHT}
      viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <defs>
        <radialGradient
          id="fade"
          cx={DIE_CENTER.x}
          cy={DIE_CENTER.y}
          r={FADE_RADIUS}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={MASK_WHITE} stopOpacity="1" />
          <stop offset="0.3" stopColor={MASK_WHITE} stopOpacity="0.9" />
          <stop offset="1" stopColor={MASK_WHITE} stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="glow"
          cx={DIE_CENTER.x}
          cy={DIE_CENTER.y}
          r={GLOW_RADIUS}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={palette.signal} stopOpacity={palette.glowOpacity} />
          <stop offset="1" stopColor={palette.signal} stopOpacity="0" />
        </radialGradient>
        <mask id="fade-mask">
          <rect width={PANEL_WIDTH} height={PANEL_HEIGHT} fill="url(#fade)" />
        </mask>
      </defs>
      <circle cx={DIE_CENTER.x} cy={DIE_CENTER.y} r={GLOW_RADIUS} fill="url(#glow)" />
      <g
        mask="url(#fade-mask)"
        fill="none"
        stroke={palette.trace}
        strokeOpacity={palette.traceOpacity}
        strokeWidth={STROKE_WIDTH}
      >
        {TRACES.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d={pinPath()} />
        <rect x={CHIP.x} y={CHIP.y} width={CHIP.size} height={CHIP.size} rx={CHIP.radius} />
        <rect {...RESISTOR} rx={RESISTOR.radius} />
        {VIAS.map((via) => (
          <circle key={`${via.cx}-${via.cy}`} {...via} r={VIA_RADIUS} />
        ))}
      </g>
      <rect
        x={DIE.x}
        y={DIE.y}
        width={DIE.size}
        height={DIE.size}
        rx={DIE.radius}
        fill={palette.signal}
        fillOpacity={DIE_FILL_OPACITY}
        stroke={palette.signal}
        strokeOpacity={DIE_STROKE_OPACITY}
        strokeWidth={STROKE_WIDTH}
      />
    </svg>
  );
}

/** The site's mark and name, as the nav sets them. */
function Brand({ palette }: { palette: Palette }) {
  const { mark, brand } = TYPE;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: brand.gap }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: mark.box,
          height: mark.box,
          borderRadius: mark.radius,
          background: palette.markFill,
          color: palette.markInk,
          fontSize: mark.size,
          fontWeight: 700,
          letterSpacing: tracking(mark.tracking, mark.size),
        }}
      >
        {MONOGRAM}
      </div>
      <div
        style={{
          fontSize: brand.size,
          fontWeight: 700,
          letterSpacing: tracking(brand.tracking, brand.size),
          color: palette.ink,
        }}
      >
        {SITE.name}
      </div>
    </div>
  );
}

/** The kicker, the title and the line under it, set from the bottom of the panel. */
function Words({ card, palette }: { card: OgCard; palette: Palette }) {
  const { kicker, title, line } = TYPE;
  const text = displayTitle(card.title);
  const size = titleSize(text);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          fontSize: kicker.size,
          fontWeight: 500,
          lineHeight: kicker.lineHeight,
          color: palette.kicker,
        }}
      >
        {typeset(card.kicker)}
      </div>
      <div
        style={{
          maxWidth: TITLE_MAX_WIDTH,
          marginTop: title.gap,
          fontSize: size,
          fontWeight: 700,
          lineHeight: title.lineHeight,
          letterSpacing: tracking(title.tracking, size),
          color: palette.ink,
          // No lineClamp here: satori balances lines by searching for the
          // narrowest width that keeps the height, and a clamped height never
          // grows, so the search shrinks the box until the clamp cuts words.
          // TITLE_STEPS keeps every title the content allows within three lines.
          textWrap: "balance",
        }}
      >
        {text}
      </div>
      {card.description ? (
        <div
          style={{
            // satori clamps lines only on a block box.
            display: "block",
            lineClamp: 1,
            maxWidth: LINE_MAX_WIDTH,
            marginTop: line.gap,
            fontSize: line.size,
            fontWeight: 400,
            lineHeight: line.lineHeight,
            color: palette.ink2,
          }}
        >
          {typeset(card.description)}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Render one social card.
 *
 * @param card The words and tone (see `OgCard`). Titles and lines must come
 *             from the content the page itself renders, never new claims.
 * @returns A 1200×630 PNG response for an `opengraph-image` route.
 */
export async function renderOg(card: OgCard): Promise<ImageResponse> {
  const palette = PALETTES[card.tone ?? "light"];
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          background: palette.canvas,
          fontFamily: FONT_FAMILY,
        }}
      >
        <Guides color={palette.rule} />
        <div
          style={{
            position: "absolute",
            left: FRAME_INSET,
            top: FRAME_INSET,
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: `${PAD_Y}px ${PAD_X}px`,
            background: palette.surface,
            border: `1px solid ${palette.rule}`,
            borderRadius: PANEL_RADIUS,
            boxShadow: palette.panelShadow,
            overflow: "hidden",
          }}
        >
          <Circuit palette={palette} />
          <Brand palette={palette} />
          <Words card={card} palette={palette} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}

/**
 * Alt text for a card, read in the order the card reads: the site, the kind of
 * page, then the title. A dynamic route's `alt` is one static string for all
 * its cards, so those routes describe the card's parts instead.
 */
export function ogAlt(card: Pick<OgCard, "kicker" | "title">): string {
  return `${SITE.name} · ${typeset(card.kicker)}: ${displayTitle(card.title)}`;
}

/**
 * The line under an essay's or a note's title: its month and its reading time,
 * worded as the article header words them. A body with no prose has no reading
 * time, so the line is then the month alone.
 *
 * @param date ISO publication date from the front-matter ("2026-06-20").
 * @param readingMinutes The estimate from lib/reading-time.ts.
 */
export function articleLine(date: string, readingMinutes: number): string {
  const month = formatDate(date);
  return readingMinutes > 0 ? `${month} · ${ARTICLE_META.readingTime(readingMinutes)}` : month;
}
