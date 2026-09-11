/**
 * Server-only address → coordinates lookup, used as a fallback when a cafe
 * has a street address but no manually-entered lat/lng (see issue #29 —
 * Leaflet needs numeric coordinates, and nothing previously derived them
 * from the address).
 *
 * Uses OpenStreetMap's Nominatim search API: free and keyless, matching the
 * project's existing "no API key" approach for CARTO map tiles
 * (`src/lib/map.ts`). This is the public demo instance, so it's subject to
 * Nominatim's usage policy (nominatim.org/release-docs/latest/api/Search/)
 * — an identifying User-Agent, no bulk/heavy use, ~1 request/second. That's
 * comfortably within what a single-author app doing occasional cafe saves
 * needs; swap in a self-hosted or keyed provider later if that changes.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

// Identifies the app to Nominatim per its usage policy, without sending any
// personal contact info to a third-party service.
const USER_AGENT = "ProofOfSip/1.0 (+https://github.com/jamiechicago312/proofofsip)";

interface NominatimResult {
  lat: string;
  lon: string;
}

/**
 * Resolves a free-text address to coordinates, or `null` if it's blank, no
 * match was found, or the lookup failed for any reason (network error,
 * rate limit, malformed response). Never throws — geocoding is a
 * best-effort enhancement, not something that should ever block saving a
 * sip or cafe.
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const query = address.trim();
  if (!query) return null;

  try {
    const url = new URL(NOMINATIM_SEARCH_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!response.ok) return null;

    const results = (await response.json()) as NominatimResult[];
    const [first] = results;
    if (!first) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return null;
    }
    return { lat, lng };
  } catch {
    return null;
  }
}
