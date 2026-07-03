import { ImageResponse } from "next/og";
import { projectMeta } from "@/lib/content";

export const alt = "Work — 4 live AI systems, deep-dived · Mubin Attar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY: Record<string, string> = {
  dbwhisper: "NL → SQL AGENT",
  "llm-studio": "MULTI-USER AI SaaS",
  tradepulse: "QUANT BACKTESTING",
  crownwager: "+EV SPORTS ML",
};

/** OG card for the /work index — the four case studies, on-brand. */
export default function OG() {
  const items = [...projectMeta].sort((a, b) => a.order - b.order);

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
        {/* teal glow — the signature */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 680,
            height: 680,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(53,224,192,0.30), transparent 62%)",
          }}
        />
        {/* cyan secondary */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: -140,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(63,208,255,0.14), transparent 62%)",
          }}
        />
        {/* amber ember — low right */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 520,
            height: 520,
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
          CASE STUDIES · SHIPPED · VERIFIABLE
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              color: "#eef2f7",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: -3,
            }}
          >
            Four systems, taken apart
          </div>
          <div
            style={{
              color: "#35e0c0",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: -3,
            }}
          >
            at the seams.
          </div>
        </div>

        {/* project row + attribution */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 820 }}>
            {items.map((p) => (
              <div
                key={p.slug}
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#8b96a6",
                  border: "1px solid #202a35",
                  borderRadius: 999,
                  padding: "7px 18px",
                }}
              >
                {CATEGORY[p.slug] ?? p.name}
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
