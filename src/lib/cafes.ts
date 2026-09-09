/**
 * Read-side queries for the public cafe list/map (issues #3-#5).
 *
 * Per plan.md, a cafe's aggregate rating is the average of its **published**
 * sips' `overall` scores, computed at read time rather than stored — so
 * this module is the one place that math happens, and later screens
 * (map view, cafe detail) can import from here instead of re-deriving it.
 *
 * Approach: fetch all cafes and all published sips in two queries, then
 * reduce/group in JS rather than writing a single aggregating SQL query.
 * The expected dataset is small (dozens of cafes, a few sips each — see
 * `scripts/seed.mjs`), so the simpler approach is preferred: it's much
 * easier to get right by inspection without a live database to test
 * against (there is no `DATABASE_URL` in this build environment).
 */
import { eq } from "drizzle-orm";
import { db } from "./db";
import { cafes, sips, type Photo } from "./schema";

/** A cafe's own columns, plus everything derived from its published sips. */
export interface CafeWithRating {
  id: string;
  slug: string;
  name: string;
  neighborhood: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  website: string | null;
  instagram: string | null;
  createdAt: Date;
  /**
   * Mean of the cafe's published sips' `overall` scores, or `null` if it
   * has no published sips yet. Rounded to one decimal place for display —
   * sip `overall` values are already rounded to the nearest 0.5 (see
   * `computeOverall` in `src/lib/rating.ts`), but an *average* of several
   * such values doesn't land on a clean step, so this keeps one digit of
   * precision instead of showing a long float.
   */
  averageRating: number | null;
  /** Count of published sips (unpublished/draft sips are excluded). */
  sipCount: number;
  /**
   * A representative photo for the card/pin: the first photo of the
   * cafe's most recent published sip (by visit date), or `null` if that
   * sip has no photos or the cafe has no published sips at all.
   */
  photo: Photo | null;
  /** Visit date of the most recent published sip, or `null` if none. */
  newestSipDate: Date | null;
  /**
   * Union of tags across the cafe's published sips, deduped and sorted.
   * Used both to render per-cafe tags and, page-side, to build the set of
   * tags offered in the filter UI.
   */
  tags: string[];
}

/**
 * Loads every cafe joined with an aggregate of its published sips.
 *
 * Two flat queries (all cafes, all published sips) rather than a SQL join,
 * then grouped by `cafeId` in JS — see the module doc comment for why.
 */
export async function listCafesWithRatings(): Promise<CafeWithRating[]> {
  const database = db();

  const [allCafes, publishedSips] = await Promise.all([
    database.select().from(cafes),
    database.select().from(sips).where(eq(sips.published, true)),
  ]);

  const sipsByCafeId = new Map<string, typeof publishedSips>();
  for (const sip of publishedSips) {
    const existing = sipsByCafeId.get(sip.cafeId);
    if (existing) {
      existing.push(sip);
    } else {
      sipsByCafeId.set(sip.cafeId, [sip]);
    }
  }

  return allCafes.map((cafe): CafeWithRating => {
    const cafeSips = sipsByCafeId.get(cafe.id) ?? [];
    const sipCount = cafeSips.length;

    const averageRating =
      sipCount === 0
        ? null
        : Math.round(
            (cafeSips.reduce((sum, sip) => sum + sip.overall, 0) / sipCount) *
              10,
          ) / 10;

    // Most recent sip by visit date (ties broken by createdAt), used for
    // both the representative photo and the "newest sip" sort order.
    const newestSip = cafeSips.reduce<(typeof cafeSips)[number] | null>(
      (newest, sip) => {
        if (!newest) return sip;
        if (sip.visitDate.getTime() !== newest.visitDate.getTime()) {
          return sip.visitDate > newest.visitDate ? sip : newest;
        }
        return sip.createdAt > newest.createdAt ? sip : newest;
      },
      null,
    );

    const tags = Array.from(
      new Set(cafeSips.flatMap((sip) => sip.tags)),
    ).sort((a, b) => a.localeCompare(b));

    return {
      id: cafe.id,
      slug: cafe.slug,
      name: cafe.name,
      neighborhood: cafe.neighborhood,
      address: cafe.address,
      lat: cafe.lat,
      lng: cafe.lng,
      website: cafe.website,
      instagram: cafe.instagram,
      createdAt: cafe.createdAt,
      averageRating,
      sipCount,
      photo: newestSip?.photos[0] ?? null,
      newestSipDate: newestSip?.visitDate ?? null,
      tags,
    };
  });
}

/**
 * Sort/filter helpers for the `/cafes` list (and, later, the map view in
 * issue #4, which needs the same neighborhood/tag filtering). Kept as pure
 * functions over `CafeWithRating[]` so they're unit-testable without a
 * database and reusable from any page that renders this data.
 */

export type CafeSort = "rating" | "name" | "newest";

/** The sort options offered in the UI, in the order plan.md/issue #3 lists them. */
export const CAFE_SORTS: readonly { value: CafeSort; label: string }[] = [
  { value: "rating", label: "Rating" },
  { value: "name", label: "Name (A-Z)" },
  { value: "newest", label: "Newest sip" },
];

const DEFAULT_CAFE_SORT: CafeSort = "rating";

/** Parses a `?sort=` query value into a valid `CafeSort`, defaulting to "rating". */
export function parseCafeSort(value: string | undefined | null): CafeSort {
  return CAFE_SORTS.some((option) => option.value === value)
    ? (value as CafeSort)
    : DEFAULT_CAFE_SORT;
}

/**
 * Returns a new array sorted per `sort`. Cafes with nothing to rank by
 * (no sips, so `averageRating`/`newestSipDate` are `null`) always sink to
 * the bottom for "rating"/"newest", regardless of direction, since there's
 * no signal to rank them on.
 */
export function sortCafes(
  list: readonly CafeWithRating[],
  sort: CafeSort,
): CafeWithRating[] {
  const sorted = [...list];
  switch (sort) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      sorted.sort((a, b) => {
        if (!a.newestSipDate && !b.newestSipDate) return a.name.localeCompare(b.name);
        if (!a.newestSipDate) return 1;
        if (!b.newestSipDate) return -1;
        return b.newestSipDate.getTime() - a.newestSipDate.getTime();
      });
      break;
    case "rating":
    default:
      sorted.sort((a, b) => {
        if (a.averageRating == null && b.averageRating == null) {
          return a.name.localeCompare(b.name);
        }
        if (a.averageRating == null) return 1;
        if (b.averageRating == null) return -1;
        return b.averageRating - a.averageRating;
      });
      break;
  }
  return sorted;
}

export interface CafeFilters {
  query?: string | null;
  /** Exact `neighborhood` match, or `null`/`undefined` for no filter. */
  neighborhood?: string | null;
  /** Cafe must have at least one published sip tagged with this, or `null`/`undefined` for no filter. */
  tag?: string | null;
}

/** Returns only the cafes matching every provided filter. */
export function filterCafes(
  list: readonly CafeWithRating[],
  filters: CafeFilters,
): CafeWithRating[] {
  const terms = (filters.query ?? "").trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((cafe) => {
    const searchable = [cafe.name, cafe.neighborhood ?? "", ...cafe.tags].join(" ").toLocaleLowerCase();
    if (!terms.every((term) => searchable.includes(term))) return false;
    if (filters.neighborhood && cafe.neighborhood !== filters.neighborhood) {
      return false;
    }
    if (filters.tag && !cafe.tags.includes(filters.tag)) {
      return false;
    }
    return true;
  });
}

/** Distinct, sorted neighborhoods present in `list` — drives the filter UI's options. */
export function listNeighborhoods(list: readonly CafeWithRating[]): string[] {
  return Array.from(
    new Set(
      list
        .map((cafe) => cafe.neighborhood)
        .filter((n): n is string => Boolean(n)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

/** Distinct, sorted tags present across `list` — drives the filter UI's options. */
export function listTags(list: readonly CafeWithRating[]): string[] {
  return Array.from(new Set(list.flatMap((cafe) => cafe.tags))).sort((a, b) =>
    a.localeCompare(b),
  );
}
