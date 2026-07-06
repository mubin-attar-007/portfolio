import { ImageResponse } from "next/og";

/**
 * Shared Open Graph image renderer — the light brand as a shareable card.
 * Calm paper background, an inset hairline "document" frame, a single accent
 * tick, sentence-case title in ink, mono meta. No glow, no gradient, no dark —
 * matches DESIGN §1/§9 so a shared link looks like the site, not a stock banner.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

// Brand tokens, inlined (satori can't read CSS variables).
const BG = "#FCFCF9";
const INK = "#1C1C1A";
const INK_2 = "#57534e";
const INK_3 = "#8a857e";
const BORDER = "#e7e4de";
const ACCENT = "#1d4ed8";

export function renderOg(opts: {
  /** mono meta line, e.g. "mubin attar · ai/ml engineer" */
  eyebrow: string;
  /** large sentence-case title */
  title: string;
  /** optional supporting line */
  subtitle?: string;
  /** mono bottom-right, e.g. the domain */
  footerRight?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BG,
          padding: 44,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "60px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: ACCENT }} />
            <div style={{ fontFamily: "monospace", fontSize: 25, color: INK_3, letterSpacing: 1 }}>
              {opts.eyebrow}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                fontSize: 74,
                fontWeight: 700,
                color: INK,
                lineHeight: 1.04,
                letterSpacing: -2,
                maxWidth: 1000,
              }}
            >
              {opts.title}
            </div>
            {opts.subtitle ? (
              <div style={{ fontSize: 31, color: INK_2, lineHeight: 1.32, maxWidth: 940 }}>
                {opts.subtitle}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 27, fontWeight: 600, color: INK }}>Mubin Attar</div>
            {opts.footerRight ? (
              <div style={{ fontFamily: "monospace", fontSize: 22, color: INK_3 }}>
                {opts.footerRight}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
