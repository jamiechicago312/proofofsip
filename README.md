# Proof of Sip

For account setup and launch steps, start with [Jamie's checklist](./to-do.md).

Proof of Sip is a cappuccino-tasting journal for Chicago cafes — a cross
between Yelp (structured ratings), Google Maps (a map of places), and a blog
(a written entry per visit, with photos). One author posts entries; anyone
can browse, filter, and read.

## Current status

This repository currently contains the Issue #1 foundation: the Next.js
scaffold, the monochrome coffee-toned design tokens (light/dark via
`prefers-color-scheme`, no manual toggle), local tooling, CI, and setup
documentation. The database, cafe/sip listings, map, and admin flow are
tracked in the linked GitHub issues and are not implemented yet.

## Local development

1. Use Node.js 22 or later.
2. Copy `.env.example` to `.env.local` and fill only the values needed by the
   issue you are working on — nothing in this foundation issue reads them
   yet. Do not commit `.env.local`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`, then open http://localhost:3000.

Useful checks:

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run build      # production build
```

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
