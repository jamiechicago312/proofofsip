import { ImageResponse } from "next/og";

// Branded share-preview image for the `/cafes` list/map. Static, same
// reasoning and palette as the home page's `opengraph-image.tsx`.
export const alt = "Cafes — Proof of Sip";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          padding: "80px 96px",
          background: "#1b120c",
          color: "#faf3e6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#c8a37c" }}>
          Proof of Sip
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -4 }}>
          Chicago cafes
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#efdfc4", maxWidth: 900 }}>
          Browse the journal by neighborhood, tag, or the map — every
          cappuccino, rated.
        </div>
      </div>
    ),
    size,
  );
}
