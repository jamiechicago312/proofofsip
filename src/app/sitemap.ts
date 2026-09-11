import type { MetadataRoute } from "next";
import { listCafesWithRatings } from "@/lib/cafes";
import { siteUrl } from "@/lib/site";

// Queries the database at request time, same reasoning as the dynamic
// pages: there is no `DATABASE_URL` in the build environment, so this must
// not run during `next build`.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const cafes = await listCafesWithRatings();

  const cafeEntries: MetadataRoute.Sitemap = cafes.map((cafe) => ({
    url: new URL(`/cafes/${encodeURIComponent(cafe.slug)}`, base).toString(),
    lastModified: cafe.newestSipDate ?? cafe.createdAt,
  }));

  return [
    { url: new URL("/", base).toString(), changeFrequency: "daily", priority: 1 },
    { url: new URL("/cafes", base).toString(), changeFrequency: "daily", priority: 0.9 },
    ...cafeEntries,
  ];
}
