import { ImageResponse } from "next/og";

export const alt = "Mubin Attar — AI/ML Engineer who ships real, honest AI products";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090c",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -80,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(31,138,112,0.55), transparent 62%)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -60,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(46,107,230,0.45), transparent 62%)",
            filter: "blur(20px)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#3ddc97", fontSize: 24 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#3ddc97" }} />
          GENAI / ML ENGINEER · SHIPS IN PRODUCTION
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#e8eaed", fontSize: 78, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
            I build AI products
          </div>
          <div style={{ color: "#e8eaed", fontSize: 78, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
            that are actually live —
          </div>
          <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2, color: "#3ddc97" }}>
            and every number is real.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#e8eaed", fontSize: 34, fontWeight: 600 }}>Mubin Attar</div>
          <div style={{ color: "#9ba1ac", fontSize: 22 }}>4 apps live · 0 faked metrics</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
