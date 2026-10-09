import { ImageResponse } from "next/og";

export const alt = "MIKASA — Japanese Nikkei Cuisine · Playa Dorada, Puerto Plata";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem Open Graph gerada (substituível por /app/opengraph-image.jpg oficial). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0B",
          color: "#EFE9DF",
          padding: "72px 80px",
          border: "1px solid rgba(198,161,91,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#C6A15B", fontSize: 20, letterSpacing: 8 }}>
          <div style={{ width: 56, height: 1, background: "#C6A15B" }} />
          JAPANESE NIKKEI CUISINE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, letterSpacing: 40, lineHeight: 1 }}>MIKASA</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#B9B3AA" }}>
            Playa Dorada Mall · Puerto Plata · República Dominicana
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#8D8880", letterSpacing: 4 }}>
          <span>RESTAURANT GURU 2023 · 2024 · 2025 · 2026</span>
          <span style={{ color: "#A8322A" }}>●</span>
        </div>
      </div>
    ),
    size,
  );
}
