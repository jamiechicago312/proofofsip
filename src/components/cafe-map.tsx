"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { attachThemedTileLayer, hasCoordinates, type CafePin } from "@/lib/map";
import { formatScore, nearestRatingStep, toBeanFill } from "@/lib/rating";
import "leaflet/dist/leaflet.css";
import styles from "./cafe-map.module.css";

/** Plain-text stand-in for the four-bean meter, for the Leaflet popup's
 * native (non-React) DOM content — rounded to a whole dot; the word and
 * exact number alongside it carry the precise meaning. */
function ratingDots(score: number): string {
  const filled = Math.round(toBeanFill(score));
  return "●".repeat(filled) + "○".repeat(4 - filled);
}

export function CafeMap({ cafes }: { cafes: CafePin[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const key = process.env.NEXT_PUBLIC_CARTO_API_KEY;

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    let cleanupTheme: (() => void) | undefined;
    let observer: ResizeObserver | undefined;
    async function initialize() {
      const leaflet = await import("leaflet");
      if (disposed || !container.current) return;
      map = leaflet.map(container.current, { scrollWheelZoom: false }).setView([41.8781, -87.6298], 12);
      cleanupTheme = attachThemedTileLayer(leaflet, map, key, () => setFailed(true));
      const pins = cafes.filter(hasCoordinates);
      for (const cafe of pins) {
        const popup = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = cafe.name;
        const rating = document.createElement("p");
        rating.textContent = cafe.averageRating === null ? "No sips yet" : `${ratingDots(cafe.averageRating)} ${nearestRatingStep(cafe.averageRating).label} ${formatScore(cafe.averageRating)}`;
        const link = document.createElement("a");
        link.href = `/cafes/${encodeURIComponent(cafe.slug)}`;
        link.textContent = "Read sip journal";
        popup.append(title, rating, link);
        leaflet.marker([cafe.lat, cafe.lng], {
          title: cafe.name,
          alt: cafe.name,
          icon: leaflet.divIcon({ className: styles.pin, html: "<span aria-hidden=\"true\">●</span>", iconSize: [30, 30], iconAnchor: [15, 15] }),
        }).addTo(map).bindPopup(popup);
      }
      if (pins.length) map.fitBounds(pins.map((cafe) => [cafe.lat, cafe.lng]), { padding: [35, 35], maxZoom: 15 });
      observer = new ResizeObserver(() => map?.invalidateSize());
      observer.observe(container.current);
    }
    void initialize().catch(() => { if (!disposed) setFailed(true); });
    return () => {
      disposed = true;
      observer?.disconnect();
      cleanupTheme?.();
      map?.remove();
    };
  }, [cafes, key]);

  const missing = cafes.filter((cafe) => !hasCoordinates(cafe));
  return <section aria-label="Cafe map" className={styles.wrapper}>
    <p>Explore the pins, or use the cafe links below. Scroll zoom is off so you can scroll the page.</p>
    <div ref={container} className={`${styles.map} ${!key ? styles.fallback : ""}`} aria-label="Interactive cafe map" />
    {failed && <p role="status">Map tiles could not load. You can still use the cafe links below.</p>}
    {missing.length > 0 && <p>{missing.length} cafe{missing.length === 1 ? " is" : "s are"} missing coordinates and cannot appear as pins yet.</p>}
    <ul>{cafes.map((cafe) => <li key={cafe.slug}><a href={`/cafes/${encodeURIComponent(cafe.slug)}`}>{cafe.name}</a>{!hasCoordinates(cafe) ? " — location not mapped" : ""}</li>)}</ul>
  </section>;
}
