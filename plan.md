# Proof of Sip — plan

## Goal

A cappuccino-tasting journal for Chicago (and beyond, later): a cross between
Yelp (structured ratings), Google Maps (a map of places), and a blog (a
written entry per visit, with photos). One author (Jamie) posts entries;
anyone can browse, filter, and read.

## Concept

- A **cafe** is a place. A **sip** is one visit/entry at that cafe — a blog
  post with a photo, a short write-up, and ratings. A cafe can have several
  sips over time (revisits), so the site is a running journal, not a single
  static score per place.
- A cafe's list/map rating is the average of its sips' overall scores.

## Assumptions (flag if wrong, easy to change later)

- Single-author: Jamie is the only reviewer. No public sign-up/accounts.
  Writing a new entry requires signing into `/admin` with GitHub OAuth,
  restricted to one GitHub account.
- Primarily Chicago now; the data model is not Chicago-only (city is a field),
  so expanding later needs no schema change.
- "Cost" is a value-for-money thumbs rating, not a running price index — an
  optional literal price field (e.g. "$5.50") can also be logged per sip.

## Recommended stack (rationale)

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Vercel-native, matches your other "Proof of" projects |
| Styling | Plain CSS with design-token custom properties (no Tailwind) | Keeps the monochrome theme centralized in one tokens file; same pattern as `proofofscoop` |
| Database | Neon Postgres + Drizzle ORM | Free tier, serverless driver works on Vercel edge/node, avoids a later JSON→SQL migration |
| Map | Leaflet + CARTO Positron/Dark Matter tiles | Free, no API key, tiles are already clean monochrome and swap for light/dark — fits the theme goal directly, no Google Maps billing setup |
| Photos | Vercel Blob | Native Vercel integration, simplest upload path from an admin form |
| Admin auth | GitHub OAuth (Auth.js/`next-auth` v5), sign-in restricted to one GitHub username | Real GitHub login beats a shared password; no secret to remember or leak, and Auth.js's GitHub provider is a few lines of config |
| Testing | Vitest (design tokens, rating math, API routes) | Matches existing pattern |
| Hosting | Vercel | As requested |

JSON-file storage was the other option on the table; skipping it because the
map/filter/sort/multi-entry-per-cafe requirements are relational from the
start, and Neon's setup cost is low.

## Rating system

Four category ratings per sip, each a 5-step thumbs scale:

```
👎👎  👎  🤷  👍  👍👍
-2    -1   0   +1   +2
```

- **Taste**, **Atmosphere**, **Foam**, **Cost** (value for money) — each
  rated independently.
- **Overall** = average of the four, computed server-side on save, stored
  alongside the raw values so it can be sorted/filtered without recomputing.
- A cafe's aggregate rating = average of its sips' overall scores, computed
  at read time.

## Data model (Drizzle / Postgres)

```
cafes
  id, slug, name, neighborhood, address, lat, lng,
  website, instagram, created_at

sips                                  -- one journal entry / visit
  id, cafe_id (fk), title, body (markdown), visit_date,
  taste, atmosphere, foam, cost   (smallint, -2..2)
  overall                         (numeric, computed on save)
  photos                          (jsonb: [{url, alt}])
  tags                            (text[]: e.g. "oat milk", "wifi", "quiet")
  price_label                     (text, optional, e.g. "$5.50")
  published (bool, default true), created_at, updated_at

-- No sessions/users table needed: Auth.js manages the session (signed
-- JWT cookie); authorization is a single username check, not stored state.
```

Photos and tags are kept as columns (jsonb / array) rather than separate
tables for MVP — normalize later only if it earns its keep.

## Theme

- Monochrome, single hue (coffee-toned neutral ramp: near-black espresso to
  cream white), no rainbow accents — ratings are shown via thumb icon/fill,
  not color-coding.
- Respect `prefers-color-scheme` automatically (no manual toggle required by
  the request); design tokens as CSS custom properties in one file, redefined
  under the dark media query, so components never hardcode a color.
- Map tiles: CARTO Positron (light) / Dark Matter (dark), switched with the
  same theme signal, so the map matches the rest of the UI instead of
  standing out as a colorful embed.

## Delivery order (each numbered item becomes one GitHub issue → one PR)

1. **Foundation** — Next.js + TypeScript scaffold, ESLint, monochrome design
   tokens (light/dark via `prefers-color-scheme`), CI (lint/typecheck/test/
   build), `.env.example`, README setup instructions.
2. **Database schema & seed** — Drizzle schema for `cafes`/`sips`, SQL
   migration, seed script with ~6–8 real Chicago cafes and sample sips so
   every later screen has real data to render against.
3. **Public list view** — `/cafes`: card list, sortable (rating, name,
   newest), filterable (neighborhood, tag), monochrome rating badges.
4. **Map view** — Leaflet + CARTO tiles, pins per cafe, popup preview,
   list/map toggle, theme-matched tile layer.
5. **Cafe detail page** — `/cafes/[slug]`: cafe info + all its sips as a
   journal feed (photo, write-up, rating breakdown per visit).
6. **Rating component** — reusable thumbs input (admin) and thumbs display
   (public), shared by forms and detail/list views.
7. **Admin auth** — GitHub OAuth sign-in (Auth.js) gating `/admin`,
   restricted to one GitHub account, logout.
8. **Entry (sip) creation/edit form** — create a cafe (if new) + write a sip:
   title, markdown body, visit date, four ratings, tags, optional price.
9. **Photo upload** — Vercel Blob integration wired into the sip form.
10. **Search** — text search across cafe name/neighborhood/tags, combined
    with the existing filters.
11. **Home page** — landing view tying it together: recent sips, map teaser,
    quick stats (cafes visited, average rating), matches the theme.
12. **Polish pass** — responsive/mobile check, accessibility (focus states,
    alt text, contrast in both themes), SEO metadata + Open Graph image per
    sip for shareable links.
13. **Deploy** — Vercel project wired to Neon, production env vars,
    `UserToDo.md` checklist, smoke-test the live deploy.

Issues 3–4 and 8–9 can run in parallel once 1–2 land; the rest have real
sequential dependencies (schema → views → admin → polish → deploy).

## Non-goals (for now)

Public sign-up/multi-user accounts, comments, social features, payments,
native mobile app, cities beyond Chicago as a launch requirement, real-time
collaboration. None of these are blocked by the schema — just not building
them yet.

## Definition of done (v1)

Anyone can open the site, see it in their device's light/dark theme
automatically, browse Chicago cafes as a list or a map, open a cafe and read
its sip history with photos and ratings, and Jamie can log in at `/admin` and
publish a new sip end-to-end (photo included) that immediately appears on the
live site.

See [UserToDo.md](./UserToDo.md) for the accounts/setup required to deploy
this.
