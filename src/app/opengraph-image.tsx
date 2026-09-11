import { ImageResponse } from "next/og";

// Branded share-preview image for the home page. Static (no database
// read) so it renders the same at build or request time — the coffee
// palette is hardcoded here rather than read from `globals.css`'s custom
// properties, since the image is rendered outside a browser and always
// uses the dark side of the theme for a consistent, legible preview
// regardless of the viewer's own color scheme.
export const alt = "Proof of Sip — a cappuccino-tasting journal for Chicago cafes";
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
          Chicago, one cappuccino at a time
        </div>
        <div style={{ display: "flex", fontSize: 116, fontWeight: 700, letterSpacing: -4 }}>
          Proof of Sip
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#efdfc4", maxWidth: 900 }}>
          A cappuccino-tasting journal for Chicago cafes.
        </div>
      </div>
    ),
    size,
  );
}
