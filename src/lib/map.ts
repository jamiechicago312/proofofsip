export interface CafePin {
  slug: string;
  name: string;
  lat: number | null;
  lng: number | null;
  averageRating: number | null;
}

export function hasCoordinates(cafe: CafePin): cafe is CafePin & { lat: number; lng: number } {
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
