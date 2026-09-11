/**
 * The site's own canonical origin, used to build absolute URLs for
 * `metadataBase`, `sitemap.xml`, and `robots.txt` (search engines and
 * social-preview scrapers need a fully-qualified URL, not a relative path).
 *
 * No custom domain is configured yet (see UserToDo.md), so this falls back
 * through, in order: an explicit `NEXT_PUBLIC_SITE_URL` (set this once a
 * custom domain is attached), Vercel's own automatic
 * `VERCEL_PROJECT_PRODUCTION_URL` (stable production domain, set by Vercel
 * on every deploy with no setup required), then `VERCEL_URL` (the current
 * deployment's own URL, so preview deploys still get correct absolute
 * URLs), then localhost for local dev.
 */
export function siteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const deploymentHost = process.env.VERCEL_URL;
  const raw =
    configured ||
    (productionHost ? `https://${productionHost}` : undefined) ||
    (deploymentHost ? `https://${deploymentHost}` : undefined) ||
    "http://localhost:3000";
  return new URL(raw);
}
