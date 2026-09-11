export interface CafePin {
  slug: string;
  name: string;
  lat: number | null;
  lng: number | null;
  averageRating: number | null;
}

/**
 * Generic over any shape with `lat`/`lng` (not just `CafePin`) — also used
 * by `directionsLinks` below for cafe objects that don't carry a `slug` or
 * `averageRating`.
 */
export function hasCoordinates<T extends { lat: number | null; lng: number | null }>(
  cafe: T,
): cafe is T & { lat: number; lng: number } {
  return typeof cafe.lat === "number" && Number.isFinite(cafe.lat) && Math.abs(cafe.lat) <= 90
    && typeof cafe.lng === "number" && Number.isFinite(cafe.lng) && Math.abs(cafe.lng) <= 180;
}

export function mapTiles(dark: boolean, key?: string) {
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  return key ? {
    url: `https://basemaps.cartocdn.com/rastertiles/${dark ? "dark_all" : "light_all"}/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`,
    attribution: `${attribution} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  } : { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attribution };
}

/**
 * Adds a theme-aware CARTO/OpenStreetMap tile layer to `map` and keeps it
 * in sync with the viewer's OS theme (no manual toggle — see the
 * `prefers-color-scheme` design in globals.css). Shared by `CafeMap`
 * (many pins) and `CafeLocationMap` (one pin) so this logic can't drift
 * between the two.
 *
 * `leaflet` is the already dynamically-imported module — Leaflet touches
 * `window` at import time, so both callers load it client-side inside a
 * `useEffect` rather than as a static import, and pass the result in here
 * instead of this module importing it directly.
 */
export function attachThemedTileLayer(
  leaflet: typeof import("leaflet"),
  map: import("leaflet").Map,
  key: string | undefined,
  onTileError: () => void,
): () => void {
  const theme = window.matchMedia("(prefers-color-scheme: dark)");
  const tiles = mapTiles(theme.matches, key);
  const layer = leaflet.tileLayer(tiles.url, { attribution: tiles.attribution, maxZoom: 19 }).addTo(map);
  layer.on("tileerror", onTileError);
  const changeTheme = () => layer.setUrl(mapTiles(theme.matches, key).url);
  theme.addEventListener("change", changeTheme);
  return () => theme.removeEventListener("change", changeTheme);
}

export interface DirectionsLinks {
  google: string;
  apple: string;
}

/**
 * Builds "get directions" links for a cafe, for both major mobile
 * platforms. A server-rendered page can't reliably detect "this is
 * Safari on iOS/macOS" to pick just one automatically (user-agent
 * sniffing is unreliable and this isn't a client component) — offering
 * both explicit, clearly-labeled links and letting the reader pick is the
 * simplest correct fix (issue #33).
 *
 * Prefers exact coordinates when available (a precise pin); falls back
 * to a text search on the cafe's name + address when there's no
 * coordinates yet. Returns `null` when there's neither to link to.
 */
export function directionsLinks(cafe: {
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}): DirectionsLinks | null {
  if (hasCoordinates(cafe)) {
    const coords = `${cafe.lat},${cafe.lng}`;
    const label = encodeURIComponent(cafe.name);
    return {
      google: `https://www.google.com/maps/search/?api=1&query=${coords}`,
      apple: `https://maps.apple.com/?ll=${coords}&q=${label}`,
    };
  }

  if (!cafe.address) return null;

  const query = encodeURIComponent(`${cafe.name}, ${cafe.address}`);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
    apple: `https://maps.apple.com/?q=${query}`,
  };
}
