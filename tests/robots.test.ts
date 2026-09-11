import { expect, it } from "vitest";
import robots from "../src/app/robots";

it("disallows the private admin area and the dev component-preview area, and points to the sitemap", () => {
  const result = robots();
  expect(result.rules).toEqual({ userAgent: "*", allow: "/", disallow: ["/admin", "/dev"] });
  expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
});
