import { desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { cafes, sips } from "./schema";

export async function getHomeJournal() {
  const database = db();
  const [recent, [stats]] = await Promise.all([
    database.select({ id: sips.id, title: sips.title, visitDate: sips.visitDate, overall: sips.overall, photos: sips.photos, cafeName: cafes.name, slug: cafes.slug, neighborhood: cafes.neighborhood })
      .from(sips).innerJoin(cafes, eq(sips.cafeId, cafes.id))
      .where(eq(sips.published, true)).orderBy(desc(sips.visitDate), desc(sips.createdAt)).limit(4),
    database.select({
      cafesVisited: sql<number>`count(distinct ${sips.cafeId})`.mapWith(Number),
      sipCount: sql<number>`count(*)`.mapWith(Number),
      average: sql<string | null>`avg(${sips.overall})`,
    }).from(sips).where(eq(sips.published, true)),
  ]);
  return { recent, cafesVisited: stats.cafesVisited, sipCount: stats.sipCount, average: stats.average === null ? null : Math.round(Number(stats.average) * 10) / 10 };
}
