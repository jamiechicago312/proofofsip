import { describe, expect, it } from "vitest";
import {
  filterCafes,
  listNeighborhoods,
  listTags,
  parseCafeSort,
  sortCafes,
  type CafeWithRating,
} from "@/lib/cafes";

/**
 * `listCafesWithRatings()` itself needs a live database and isn't
 * exercised here (no `DATABASE_URL` in this environment — see the PR
 * description). These tests cover the pure sort/filter/derive helpers
 * that `src/app/cafes/page.tsx` (and, later, the map view) build on top
 * of it, using hand-built fixtures shaped like its real return type.
 */
function cafe(overrides: Partial<CafeWithRating>): CafeWithRating {
  return {
    id: "cafe_1",
    slug: "cafe-1",
    name: "Cafe One",
    neighborhood: "Wicker Park",
    address: "1 Main St",
    lat: 41.9,
    lng: -87.6,
    website: null,
    instagram: null,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    averageRating: 1,
    sipCount: 1,
    photo: null,
    newestSipDate: new Date("2025-01-01T00:00:00Z"),
    tags: [],
    ...overrides,
  };
}

describe("parseCafeSort", () => {
  it("accepts a valid sort value", () => {
    expect(parseCafeSort("name")).toBe("name");
    expect(parseCafeSort("newest")).toBe("newest");
    expect(parseCafeSort("rating")).toBe("rating");
  });

  it("defaults to rating for missing/invalid values", () => {
    expect(parseCafeSort(undefined)).toBe("rating");
    expect(parseCafeSort(null)).toBe("rating");
    expect(parseCafeSort("bogus")).toBe("rating");
  });
});

describe("sortCafes", () => {
  const high = cafe({ id: "a", name: "Zebra Cafe", averageRating: 2 });
  const low = cafe({ id: "b", name: "Alpha Cafe", averageRating: -1 });
  const none = cafe({ id: "c", name: "Mid Cafe", averageRating: null, sipCount: 0 });

  it("sorts by rating descending, with un-rated cafes sinking to the bottom", () => {
    const result = sortCafes([low, none, high], "rating");
    expect(result.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts by name A-Z", () => {
    const result = sortCafes([high, low, none], "name");
    expect(result.map((c) => c.name)).toEqual([
      "Alpha Cafe",
      "Mid Cafe",
      "Zebra Cafe",
    ]);
  });

  it("sorts by newest sip date descending, with sip-less cafes sinking to the bottom", () => {
    const newer = cafe({
      id: "newer",
      newestSipDate: new Date("2025-06-01T00:00:00Z"),
    });
    const older = cafe({
      id: "older",
      newestSipDate: new Date("2025-01-01T00:00:00Z"),
    });
    const noSips = cafe({ id: "none", newestSipDate: null, sipCount: 0 });

    const result = sortCafes([older, noSips, newer], "newest");
    expect(result.map((c) => c.id)).toEqual(["newer", "older", "none"]);
  });

  it("does not mutate the input array", () => {
    const input = [low, high];
    const copy = [...input];
    sortCafes(input, "rating");
    expect(input).toEqual(copy);
  });
});

describe("filterCafes", () => {
  const wickerPark = cafe({ id: "a", neighborhood: "Wicker Park", tags: ["wifi", "quiet"] });
  const loganSquare = cafe({ id: "b", neighborhood: "Logan Square", tags: ["oat milk"] });

  it("filters by exact neighborhood match", () => {
    const result = filterCafes([wickerPark, loganSquare], {
      neighborhood: "Wicker Park",
    });
    expect(result.map((c) => c.id)).toEqual(["a"]);
  });

  it("filters by tag membership", () => {
    const result = filterCafes([wickerPark, loganSquare], { tag: "oat milk" });
    expect(result.map((c) => c.id)).toEqual(["b"]);
  });

  it("combines neighborhood and tag filters", () => {
    const result = filterCafes([wickerPark, loganSquare], {
      neighborhood: "Wicker Park",
      tag: "oat milk",
    });
    expect(result).toEqual([]);
  });

  it("returns everything when no filters are given", () => {
    const result = filterCafes([wickerPark, loganSquare], {});
    expect(result).toHaveLength(2);
  });
});

describe("listNeighborhoods", () => {
  it("returns distinct, sorted, non-null neighborhoods", () => {
    const result = listNeighborhoods([
      cafe({ id: "a", neighborhood: "Wicker Park" }),
      cafe({ id: "b", neighborhood: "Logan Square" }),
      cafe({ id: "c", neighborhood: "Wicker Park" }),
      cafe({ id: "d", neighborhood: null }),
    ]);
    expect(result).toEqual(["Logan Square", "Wicker Park"]);
  });
});

describe("listTags", () => {
  it("returns distinct, sorted tags across all cafes", () => {
    const result = listTags([
      cafe({ id: "a", tags: ["wifi", "quiet"] }),
      cafe({ id: "b", tags: ["oat milk", "wifi"] }),
    ]);
    expect(result).toEqual(["oat milk", "quiet", "wifi"]);
  });
});
