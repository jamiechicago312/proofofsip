import type { Photo } from "./schema";

export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePhotoFile(file: { type: string; size: number }) {
  if (!PHOTO_TYPES.includes(file.type)) throw new Error("Choose JPEG, PNG, or WebP images.");
  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) throw new Error("Each photo must be between 1 byte and 8 MB.");
}

export function parsePhotos(value: FormDataEntryValue | null): Photo[] | undefined {
  if (value === null) return undefined;
  if (typeof value !== "string" || value.length > 20000) throw new Error("Invalid photos.");
  let photos: unknown;
  try { photos = JSON.parse(value); } catch { throw new Error("Invalid photos."); }
  if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) throw new Error("Use up to 8 photos per sip.");
  return photos.map((photo) => {
    if (!photo || typeof photo.url !== "string" || typeof photo.alt !== "string" || photo.alt.length > 300) throw new Error("Invalid photo or description.");
    let url: URL;
    try { url = new URL(photo.url); } catch { throw new Error("Invalid photo URL."); }
    if (url.protocol !== "https:" || !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname) || url.username || url.password || url.port || !url.pathname.startsWith("/sips/")) throw new Error("Use photos uploaded through this form.");
    return { url: url.href, alt: photo.alt.trim() };
  });
}
