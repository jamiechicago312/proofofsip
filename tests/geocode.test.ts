import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { geocodeAddress } from "../src/lib/geocode";

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

it("returns null without a network call for a blank address", async () => {
  const result = await geocodeAddress("   ");
  expect(result).toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();
});

it("resolves the first match's coordinates and identifies itself with a User-Agent", async () => {
  const fetchMock = vi.mocked(global.fetch);
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify([{ lat: "41.9095", lon: "-87.6712" }]), { status: 200 }),
  );

  const result = await geocodeAddress("1543 N Milwaukee Ave, Chicago, IL");

  expect(result).toEqual({ lat: 41.9095, lng: -87.6712 });
  const [url, init] = fetchMock.mock.calls[0];
  expect(String(url)).toContain("nominatim.openstreetmap.org/search");
  expect(String(url)).toContain("Milwaukee");
  expect((init?.headers as Record<string, string>)["User-Agent"]).toContain("ProofOfSip");
});

it("returns null when nothing matches", async () => {
  vi.mocked(global.fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
  expect(await geocodeAddress("Nowhere at all")).toBeNull();
});

it("returns null instead of throwing on a network failure", async () => {
  vi.mocked(global.fetch).mockRejectedValue(new Error("network down"));
  expect(await geocodeAddress("1543 N Milwaukee Ave")).toBeNull();
});

it("returns null instead of throwing on a non-OK response", async () => {
  vi.mocked(global.fetch).mockResolvedValue(new Response("rate limited", { status: 429 }));
  expect(await geocodeAddress("1543 N Milwaukee Ave")).toBeNull();
});

it("discards an out-of-range result rather than saving bad coordinates", async () => {
  vi.mocked(global.fetch).mockResolvedValue(
    new Response(JSON.stringify([{ lat: "999", lon: "-87.6712" }]), { status: 200 }),
  );
  expect(await geocodeAddress("Somewhere")).toBeNull();
});
