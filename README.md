# Proof of Sip

Proof of Sip is a cappuccino-tasting journal for Chicago cafes — a cross
between Yelp (structured ratings), Google Maps (a map of places), and a blog
(a written entry per visit, with photos). One author posts entries; anyone
can browse, filter, and read.

## Current status

The foundation, database schema/seed, public cafe list and journal pages,
rating components, and GitHub admin login are implemented. The admin now
supports creating cafes inline, writing sips, editing existing entries, and
saving drafts or publishing. Photo uploads, map, search, and the complete
home page remain tracked in GitHub issues.

## Local development

1. Use Node.js 22 or later.
2. Copy `.env.example` to `.env.local` and fill only the values needed by the
   feature you are working on. Database pages need `DATABASE_URL`; admin
   login also needs the GitHub OAuth and Auth.js variables. Do not commit `.env.local`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`, then open http://localhost:3000.

Useful checks:

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run build      # production build
```

## Writing entries

Sign in at `/admin`, then choose **Write a sip**. Select a cafe or create one
inline, enter your journal text and ratings, and save. Uncheck **Published**
to keep an entry as a draft. The admin lists both drafts and published entries
with edit links. Updating an entry preserves its existing photos. New photo
uploads are tracked separately in issue #9.

## Theme

The whole UI is monochrome — a single coffee-toned neutral ramp from
near-black espresso to cream white, with ratings shown via thumb icon/fill
rather than color-coding. All colors are CSS custom properties defined once
in `src/app/globals.css` and redefined under the `prefers-color-scheme: dark`
media query; components reference the semantic tokens (`--color-bg`,
`--color-fg`, etc.) instead of hardcoding colors.

See [plan.md](./plan.md) for the implementation order and
[UserToDo.md](./UserToDo.md) for the external account setup required when
deploying this project.
