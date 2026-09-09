import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { cafes, sips, type Photo } from "./schema";

/** One cafe row, as returned by `getCafeBySlugWithSips`. */
export type CafeDetail = typeof cafes.$inferSelect;

/**
 * One published sip belonging to a cafe, as returned by
 * `getCafeBySlugWithSips`. Re-exported here (rather than importing
 * `typeof sips.$inferSelect` at each call site) so the detail page and any
 * tests have one shared type for "a sip as shown in the journal feed".
 */
export type SipEntry = typeof sips.$inferSelect;

export interface CafeWithSips extends CafeDetail {
  /** This cafe's published sips, newest visit first. */
  sips: SipEntry[];
}

export type { Photo };

/**
 * Looks up one cafe by its slug, along with all of its **published** sips
 * ordered newest-visit-first, for the `/cafes/[slug]` journal feed.
 *
 * Returns `null` when no cafe matches the slug (the caller should render
 * `notFound()` in that case) rather than throwing, so "unknown slug" is an
 * expected, easily-checked outcome rather than an error path.
 */
export async function getCafeBySlugWithSips(
  slug: string,
): Promise<CafeWithSips | null> {
  const client = db();

  const cafe = await client.query.cafes.findFirst({
    where: eq(cafes.slug, slug),
  });

  if (!cafe) {
    return null;
  }

  const cafeSips = await client.query.sips.findMany({
    where: and(eq(sips.cafeId, cafe.id), eq(sips.published, true)),
    orderBy: desc(sips.visitDate),
  });

  return { ...cafe, sips: cafeSips };
}
