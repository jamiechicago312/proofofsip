import {
  boolean,
  doublePrecision,
  index,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const cafes = pgTable("cafes", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  neighborhood: text("neighborhood"),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  website: text("website"),
  instagram: text("instagram"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Photo = { url: string; alt: string };

export const sips = pgTable(
  "sips",
  {
    id: text("id").primaryKey(),
    cafeId: text("cafe_id")
      .notNull()
      .references(() => cafes.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    visitDate: timestamp("visit_date", { withTimezone: true, mode: "date" })
      .notNull(),
    taste: smallint("taste").notNull(),
    atmosphere: smallint("atmosphere").notNull(),
    foam: smallint("foam").notNull(),
    cost: smallint("cost").notNull(),
    // Average of taste/atmosphere/foam/cost, computed server-side on save
    // (see computeOverall in src/lib/rating.ts) and stored so it can be
    // sorted/filtered without recomputing at read time.
    overall: numeric("overall", { precision: 3, scale: 2, mode: "number" }).notNull(),
    photos: jsonb("photos").$type<Photo[]>().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    priceLabel: text("price_label"),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sips_cafe_id_idx").on(table.cafeId),
    index("sips_visit_date_idx").on(table.visitDate),
    index("sips_published_idx").on(table.published),
  ],
);
