// One-off backfill for issue #29: cafes that already have an address but no
// lat/lng (saved before saveSip() started geocoding on write — see
// src/lib/geocode.ts and src/app/admin/sips/actions.ts) never show up as
// map pins, since Leaflet needs numeric coordinates, not a street address.
// This geocodes every such cafe once and fills in its coordinates.
//
// Usage: DATABASE_URL=... node scripts/backfill-coordinates.mjs
//
// Safe to re-run: it only ever looks at cafes where lat/lng is still null,
// so an already-backfilled (or manually-corrected) cafe is left alone.
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to backfill coordinates.");
}
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

// Duplicated from src/lib/geocode.ts rather than imported — this is a plain
// Node script run outside the Next.js/TS build, same reasoning as
// scripts/seed.mjs's own duplicated rating math.
const USER_AGENT = "ProofOfSip/1.0 (+https://github.com/jamiechicago312/proofofsip)";

async function geocodeAddress(address) {
  const query = address.trim();
  if (!query) return null;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!response.ok) return null;
  const [first] = await response.json();
  if (!first) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cafes = await sql`
  SELECT id, name, address FROM cafes
  WHERE address IS NOT NULL AND (lat IS NULL OR lng IS NULL)
  ORDER BY name
`;

if (cafes.length === 0) {
  console.log("No cafes need backfilling — every address-having cafe already has coordinates.");
  await sql.end();
  process.exit(0);
}

let fixed = 0;
let skipped = 0;

for (const [index, cafe] of cafes.entries()) {
  if (index > 0) await sleep(1100); // Nominatim's usage policy: max ~1 request/second.
  const coordinates = await geocodeAddress(cafe.address);
  if (!coordinates) {
    console.warn(`Could not geocode "${cafe.name}" (${cafe.address}) — leaving it unmapped.`);
    skipped += 1;
    continue;
  }
  await sql`UPDATE cafes SET lat = ${coordinates.lat}, lng = ${coordinates.lng} WHERE id = ${cafe.id}`;
  console.log(`Geocoded "${cafe.name}": ${coordinates.lat}, ${coordinates.lng}`);
  fixed += 1;
}

await sql.end();
console.log(`Backfilled coordinates for ${fixed} cafe${fixed === 1 ? "" : "s"}, could not geocode ${skipped}.`);
