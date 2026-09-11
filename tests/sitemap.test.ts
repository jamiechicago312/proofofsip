import { expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ listCafesWithRatings: vi.fn() }));
vi.mock("@/lib/cafes", () => mocks);

import sitemap from "../src/app/sitemap";

it("lists the home page, the cafe list, and every cafe's own detail page", async () => {
  mocks.listCafesWithRatings.mockResolvedValue([
    {
      slug: "cafe-with-a-sip",
      newestSipDate: new Date("2026-06-01T00:00:00Z"),
      createdAt: new Date("2026-01-01T00:00:00Z"),
    },
    {
      slug: "cafe with spaces",
      newestSipDate: null,
      createdAt: new Date("2026-02-01T00:00:00Z"),
    },
  ]);

  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);

  expect(urls).toContain("http://localhost:3000/");
  expect(urls).toContain("http://localhost:3000/cafes");
  expect(urls).toContain("http://localhost:3000/cafes/cafe-with-a-sip");
  // A cafe with no published sips yet still gets a sitemap entry, dated by
  // its own creation rather than a nonexistent newest-sip date.
  expect(urls).toContain("http://localhost:3000/cafes/cafe%20with%20spaces");
  const undated = entries.find((entry) => entry.url.endsWith("/cafe%20with%20spaces"));
  expect(undated?.lastModified).toEqual(new Date("2026-02-01T00:00:00Z"));
});
