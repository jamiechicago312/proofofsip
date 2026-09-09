CREATE TABLE "cafes" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "neighborhood" text,
  "address" text,
  "lat" double precision,
  "lng" double precision,
  "website" text,
  "instagram" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "sips" (
  "id" text PRIMARY KEY NOT NULL,
  "cafe_id" text NOT NULL REFERENCES "cafes"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "visit_date" timestamptz NOT NULL,
  "taste" smallint NOT NULL CHECK ("taste" BETWEEN -2 AND 2),
  "atmosphere" smallint NOT NULL CHECK ("atmosphere" BETWEEN -2 AND 2),
  "foam" smallint NOT NULL CHECK ("foam" BETWEEN -2 AND 2),
  "cost" smallint NOT NULL CHECK ("cost" BETWEEN -2 AND 2),
  -- Average of taste/atmosphere/foam/cost, computed server-side on save
  -- (see computeOverall in src/lib/ratings.ts) and stored rather than
  -- generated in SQL, so it can be sorted/filtered without recomputing.
  "overall" numeric(3, 2) NOT NULL CHECK ("overall" BETWEEN -2 AND 2),
  "photos" jsonb NOT NULL DEFAULT '[]',
  "tags" text[] NOT NULL DEFAULT '{}',
  "price_label" text,
  "published" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "sips_cafe_id_idx" ON "sips" ("cafe_id");
CREATE INDEX "sips_visit_date_idx" ON "sips" ("visit_date");
CREATE INDEX "sips_published_idx" ON "sips" ("published");
