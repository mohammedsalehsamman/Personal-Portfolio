import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name.en} — ${profile.role.en}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin-only text: the default OG font has no Arabic glyphs, so both locales share this card.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#eef1f6",
          background: "radial-gradient(circle at 78% 40%, #134a45 0%, transparent 45%), radial-gradient(circle at 92% 85%, #2a2163 0%, transparent 40%), #05060a",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
          MS<span style={{ color: "#7cf2d4" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>{profile.name.en}</div>
          <div style={{ marginTop: 24, fontSize: 40, color: "#7cf2d4" }}>{profile.role.en}</div>
          <div style={{ marginTop: 18, fontSize: 26, color: "#8a93a3" }}>
            Fine-tuned NLP · Leakage-safe ML · Django · NestJS · PostgreSQL
          </div>
        </div>
      </div>
    ),
    size,
  );
}
