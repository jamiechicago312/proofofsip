"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { attachThemedTileLayer } from "@/lib/map";
import "leaflet/dist/leaflet.css";
import styles from "./cafe-location-map.module.css";

/**
 * A small, single-pin map preview for one cafe's own detail page (issue
 * #33) — smaller and simpler than `CafeMap`'s shared list/map view:
 * always exactly one pin, centered directly on it rather than fitting
 * many, and no popup (the reader is already on this cafe's page, so
 * "read its sip journal" would just point back here).
 */
export function CafeLocationMap({ name, lat, lng }: { name: string; lat: number; lng: number }) {
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
      map = leaflet
        .map(container.current, { scrollWheelZoom: false, zoomControl: false })
        .setView([lat, lng], 15);
      cleanupTheme = attachThemedTileLayer(leaflet, map, key, () => setFailed(true));
      leaflet
        .marker([lat, lng], {
          title: name,
          alt: name,
          icon: leaflet.divIcon({
            className: styles.pin,
            html: "<span aria-hidden=\"true\">●</span>",
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
        })
        .addTo(map);
      observer = new ResizeObserver(() => map?.invalidateSize());
      observer.observe(container.current);
    }
    void initialize().catch(() => {
      if (!disposed) setFailed(true);
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      cleanupTheme?.();
      map?.remove();
    };
  }, [name, lat, lng, key]);

  return (
    <div className={styles.wrapper}>
      <div
        ref={container}
        className={`${styles.map} ${!key ? styles.fallback : ""}`}
        aria-label={`Map showing ${name}'s location`}
      />
      {failed && (
        <p role="status">Map tiles could not load right now.</p>
      )}
    </div>
  );
}
