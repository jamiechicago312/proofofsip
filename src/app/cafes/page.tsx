import Link from "next/link";
import {
  CAFE_SORTS,
  filterCafes,
  listCafesWithRatings,
  listNeighborhoods,
  listTags,
  parseCafeSort,
  sortCafes,
  type CafeWithRating,
} from "@/lib/cafes";
import { RatingDisplay } from "@/components/rating-display";
import { FilterSelect } from "./filter-select";
import { SearchInput } from "./search-input";
import styles from "./page.module.css";
import { CafeMap } from "@/components/cafe-map";

// This page queries the database on every request (cafe/sip data changes
// whenever a new sip is published) and there is no `DATABASE_URL` in this
// build environment, so it must not be statically prerendered at build
// time — force dynamic rendering instead of letting `next build` try (and
// fail) to execute the query up front.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cafes — Proof of Sip",
  description:
    "Browse Chicago cafes by rating, neighborhood, or tag, or find them on the map — every cappuccino, rated.",
  alternates: { canonical: "/cafes" },
  openGraph: {
    title: "Cafes — Proof of Sip",
    description: "Browse Chicago cafes by rating, neighborhood, or tag, or find them on the map.",
  },
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CafesPage({
  searchParams,
}: PageProps<"/cafes">) {
  const params = await searchParams;
  const sort = parseCafeSort(firstParam(params?.sort));
  const neighborhood = firstParam(params?.neighborhood) || null;
  const tag = firstParam(params?.tag) || null;
  const query = (firstParam(params?.q) ?? "").trim().slice(0, 200);
  const view = firstParam(params?.view) === "map" ? "map" : "list";
  const viewParams = new URLSearchParams();
  for (const [name, value] of Object.entries({ sort, neighborhood, tag, q: query })) {
    if (value) viewParams.set(name, value);
  }
  const listUrl = `/cafes?${viewParams.toString()}`;
  viewParams.set("view", "map");
  const mapUrl = `/cafes?${viewParams.toString()}`;
  const clearUrl = view === "map" ? "/cafes?view=map" : "/cafes";

  const allCafes = await listCafesWithRatings();
  const neighborhoods = listNeighborhoods(allCafes);
  const tags = listTags(allCafes);
  const cafes = sortCafes(filterCafes(allCafes, { neighborhood, tag, query }), sort);
  const hasFilters = Boolean(neighborhood || tag || query);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cafes</h1>
        <p className={styles.subtitle}>
          {allCafes.length} cafe{allCafes.length === 1 ? "" : "s"} logged so
          far.
        </p>
      </header>
      <nav aria-label="Cafe view" className={styles.controls}>
        <Link href={listUrl} aria-current={view === "list" ? "page" : undefined}>List</Link>
        <Link href={mapUrl} aria-current={view === "map" ? "page" : undefined}>Map</Link>
      </nav>

      {allCafes.length > 0 ? (
        <form className={styles.controls} method="GET">
          <input type="hidden" name="view" value={view} />
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Search cafes</span>
            <SearchInput query={query} className={styles.select} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Sort</span>
            <FilterSelect
              name="sort"
              defaultValue={sort}
              className={styles.select}
            >
              {CAFE_SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Neighborhood</span>
            <FilterSelect
              name="neighborhood"
              defaultValue={neighborhood ?? ""}
              className={styles.select}
            >
              <option value="">All neighborhoods</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </FilterSelect>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Tag</span>
            <FilterSelect
              name="tag"
              defaultValue={tag ?? ""}
              className={styles.select}
            >
              <option value="">All tags</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </FilterSelect>
          </label>

          <button type="submit" className={styles.applyButton}>
            Apply
          </button>
          {hasFilters ? (
            <Link href={clearUrl} className={styles.clearLink}>
              Clear filters
            </Link>
          ) : null}
        </form>
      ) : null}

      {hasFilters && <p role="status">{cafes.length} cafe{cafes.length === 1 ? "" : "s"} found{query ? ` for “${query}”` : ""}.</p>}
      {allCafes.length === 0 ? (
        <p className={styles.empty}>
          No cafes yet — check back soon for the first entry.
        </p>
      ) : cafes.length === 0 ? (
        <p className={styles.empty}>
          No cafes match your filters.{" "}
          <Link href={clearUrl} className={styles.clearLink}>
            Clear filters
          </Link>
        </p>
      ) : view === "map" ? (
        <CafeMap cafes={cafes.map(({ slug, name, lat, lng, averageRating }) => ({ slug, name, lat, lng, averageRating }))} />
      ) : (
        <ul className={styles.grid}>
          {cafes.map((cafe) => (
            <li key={cafe.id}>
              <CafeCard cafe={cafe} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function CafeCard({ cafe }: { cafe: CafeWithRating }) {
  return (
    <Link href={`/cafes/${cafe.slug}`} className={styles.card}>
      {cafe.photo ? (
        // Photo URLs come from Vercel Blob (arbitrary/unknown host at build
        // time), so next/image's remotePatterns allowlist isn't worth
        // configuring yet.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cafe.photo.url}
          alt={cafe.photo.alt}
          className={styles.photo}
          loading="lazy"
        />
      ) : (
        <div className={styles.photoPlaceholder} aria-hidden="true">
          ☕
        </div>
      )}
      <div className={styles.cardBody}>
        <h2 className={styles.cardName}>{cafe.name}</h2>
        {cafe.neighborhood ? (
          <p className={styles.cardNeighborhood}>{cafe.neighborhood}</p>
        ) : null}
        <div className={styles.cardMeta}>
          {cafe.averageRating != null ? (
            <RatingDisplay score={cafe.averageRating} size="sm" />
          ) : (
            <span className={styles.noRating}>No sips yet</span>
          )}
          <span className={styles.sipCount}>
            {cafe.sipCount} sip{cafe.sipCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Link>
  );
}
