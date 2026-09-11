import { ImageResponse } from "next/og";
import { getCafeBySlugWithSips } from "@/lib/cafe-detail";
import { formatScore, nearestThumb } from "@/lib/rating";

// Per-cafe share-preview image — the practical unit of "per sip" OG image
// the issue asks for, since individual sips don't have their own route
// (they're anchors within this cafe page's journal feed): shows the most
// recent published sip's photo behind the cafe name and its overall rating,
// so a shared cafe link previews with the same photo + rating readers see
// on the page itself.
//
// Reads the database at request time (same reasoning as the page's own
// `generateMetadata`/`dynamic = "force-dynamic"`) — runs on the Node.js
// runtime because `@/lib/db` uses the `postgres` (postgres-js) driver,
// which needs a raw TCP socket that isn't available on the edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Proof of Sip — cafe journal entry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PALETTE = {
  bg: "#1b120c",
  surface: "#241810",
  fg: "#faf3e6",
  muted: "#c8a37c",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cafe = await getCafeBySlugWithSips(slug);

  if (!cafe) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: PALETTE.bg,
            color: PALETTE.fg,
            fontFamily: "sans-serif",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          Proof of Sip
        </div>
      ),
      size,
    );
  }

  const latestSip = cafe.sips[0];
  const photo = latestSip?.photos[0];
  const thumb = latestSip ? nearestThumb(latestSip.overall) : null;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: PALETTE.bg,
          fontFamily: "sans-serif",
        }}
      >
        {photo ? (
          <img
            src={photo.url}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: photo
              ? "linear-gradient(0deg, rgba(27,18,12,0.92) 0%, rgba(27,18,12,0.55) 55%, rgba(27,18,12,0.25) 100%)"
              : PALETTE.bg,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 20,
            width: "100%",
            padding: "72px 88px",
            color: PALETTE.fg,
          }}
        >
          {cafe.neighborhood ? (
            <div style={{ display: "flex", fontSize: 30, color: PALETTE.muted }}>
              {cafe.neighborhood} · Proof of Sip
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 30, color: PALETTE.muted }}>
              Proof of Sip
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {cafe.name}
          </div>
          {thumb ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 36,
                padding: "10px 28px",
                borderRadius: 999,
                background: PALETTE.surface,
                alignSelf: "flex-start",
              }}
            >
              <span style={{ display: "flex" }}>{thumb.emoji}</span>
              <span style={{ display: "flex", color: PALETTE.muted }}>
                {formatScore(latestSip!.overall)} overall
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 32, color: PALETTE.muted }}>
              No sips yet
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
