import { expect, it } from "vitest";
import { hasCoordinates, mapTiles } from "../src/lib/map";

it("accepts zero coordinates but excludes missing, invalid, and out-of-range locations", () => {
  const cafe = { name: "Cafe", slug: "cafe", averageRating: null, lat: 0, lng: 0 };
  expect(hasCoordinates(cafe)).toBe(true);
  for (const lat of [null, NaN, Infinity, 91]) expect(hasCoordinates({ ...cafe, lat })).toBe(false);
  expect(hasCoordinates({ ...cafe, lng: -181 })).toBe(false);
});

it("selects CARTO theme tiles only with a key and retains attribution", () => {
  expect(mapTiles(false, "key").url).toContain("light_all");
  expect(mapTiles(true, "key").url).toContain("dark_all");
  expect(mapTiles(true, "key").attribution).toContain("CARTO");
  expect(mapTiles(false).url).toBe("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  expect(mapTiles(false).attribution).toContain("OpenStreetMap");
});
