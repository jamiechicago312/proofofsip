import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// `/admin` is the single-author sign-in/editing area and `/dev` is a
// component preview route (see its own page doc comment) — neither is
// meant to appear in search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dev"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
