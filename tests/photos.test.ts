import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, parsePhotos, validatePhotoFile } from "../src/lib/photos";

const photo = { url: "https://example.public.blob.vercel-storage.com/sips/test.jpg", alt: " Foam " };

describe("photo validation", () => {
  it("preserves omitted photos and accepts explicit removal", () => {
    expect(parsePhotos(null)).toBeUndefined();
    expect(parsePhotos("[]")).toEqual([]);
    expect(parsePhotos(JSON.stringify([photo]))).toEqual([{ ...photo, alt: "Foam" }]);
  });
  it.each(["javascript:alert(1)", "https://evil.com/sips/a.jpg", "https://example.public.blob.vercel-storage.com.evil.com/sips/a.jpg", "http://example.public.blob.vercel-storage.com/sips/a.jpg"])("rejects unsafe URL %s", (url) => {
    expect(() => parsePhotos(JSON.stringify([{ ...photo, url }]))).toThrow();
  });
  it("limits counts and description length", () => {
    expect(() => parsePhotos(JSON.stringify(Array(9).fill(photo)))).toThrow();
    expect(() => parsePhotos(JSON.stringify([{ ...photo, alt: "a".repeat(301) }]))).toThrow();
  });
  it("rejects malformed data", () => {
    for (const value of ["null", "{}", "broken", "[null]"]) expect(() => parsePhotos(value)).toThrow();
  });
  it("limits image type and size", () => {
    expect(() => validatePhotoFile({ type: "image/jpeg", size: MAX_PHOTO_BYTES })).not.toThrow();
    expect(() => validatePhotoFile({ type: "image/svg+xml", size: 100 })).toThrow();
    expect(() => validatePhotoFile({ type: "image/png", size: MAX_PHOTO_BYTES + 1 })).toThrow();
    expect(() => validatePhotoFile({ type: "image/png", size: 0 })).toThrow();
  });
});
