import { describe, expect, it } from "vitest";
import { directionsLinks, hasCoordinates, mapTiles } from "../src/lib/map";

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

// Issue #33: link a cafe's address out to a maps app.
describe("directionsLinks", () => {
  it("prefers exact coordinates when available", () => {
    const links = directionsLinks({ name: "Cero Coffee Co.", address: "1543 N Milwaukee Ave", lat: 41.9095, lng: -87.6712 });
    expect(links).toEqual({
      google: "https://www.google.com/maps/search/?api=1&query=41.9095,-87.6712",
      apple: "https://maps.apple.com/?ll=41.9095,-87.6712&q=Cero%20Coffee%20Co.",
    });
  });

  it("falls back to a name + address text search without coordinates", () => {
    const links = directionsLinks({ name: "Cero Coffee Co.", address: "1543 N Milwaukee Ave", lat: null, lng: null });
    expect(links).toEqual({
      google: "https://www.google.com/maps/search/?api=1&query=Cero%20Coffee%20Co.%2C%201543%20N%20Milwaukee%20Ave",
      apple: "https://maps.apple.com/?q=Cero%20Coffee%20Co.%2C%201543%20N%20Milwaukee%20Ave",
    });
  });

  it("returns null when there is neither an address nor coordinates", () => {
    expect(directionsLinks({ name: "Cero Coffee Co.", address: null, lat: null, lng: null })).toBeNull();
  });

  it("prefers coordinates over the address even when both are present and they'd search differently", () => {
    const links = directionsLinks({ name: "Cero Coffee Co.", address: "1543 N Milwaukee Ave", lat: 41.9095, lng: -87.6712 });
    expect(links!.google).not.toContain("Milwaukee");
  });
});
