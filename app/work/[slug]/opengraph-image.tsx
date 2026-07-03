import { ImageResponse } from "next/og";
import { caseStudyMeta, caseStudySlugs } from "@/lib/case-studies";

export const alt = "Case study — Mubin Attar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** One OG image per case study (static, at build time). */
export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

const CATEGORY: Record<string, string> = {
  dbwhisper: "NL → SQL AGENT",
  "llm-studio": "MULTI-USER AI SaaS",
  tradepulse: "QUANT BACKTESTING",
  crownwager: "+EV SPORTS ML",
};

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = caseStudyMeta(slug);
  const name = meta?.name ?? "Case study";
  const tagline = meta?.tagline ?? "";
  const kicker = CATEGORY[slug] ?? "CASE STUDY";
  const stack = meta?.stack.slice(0, 5) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070a0e",
          padding: "72px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* teal glow — top right (the signature) */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 680,
            height: 680,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(53,224,192,0.32), transparent 62%)",
          }}
        />
        {/* cyan secondary */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: 180,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(63,208,255,0.16), transparent 62%)",
          }}
        />
        {/* amber ember — low left */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -120,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,138,76,0.10), transparent 62%)",
          }}
        />

        {/* kicker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#35e0c0",
            fontSize: 26,
            letterSpacing: 2,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: 13,
              background: "#35e0c0",
              boxShadow: "0 0 22px 2px rgba(53,224,192,0.8)",
            }}
          />
          {kicker} · LIVE
        </div>

        {/* name + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "#eef2f7",
              fontSize: 104,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: -3,
            }}
          >
            {name}
          </div>
          <div
            style={{
              color: "#8b96a6",
              fontSize: 38,
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            {tagline}
          </div>
        </div>

        {/* stack chips + attribution */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 760 }}>
            {stack.map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "#8b96a6",
                  border: "1px solid #202a35",
                  borderRadius: 999,
                  padding: "6px 18px",
                }}
              >
                {s}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", color: "#eef2f7", fontSize: 30, fontWeight: 600 }}>
            Mubin Attar
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
