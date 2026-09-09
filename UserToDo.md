# User setup checklist

Accounts and one-time actions needed to build and deploy Proof of Sip. You can
develop most of the app locally with a dev Neon database before touching
Vercel or Blob storage.

## Required before deployment

- [ ] **GitHub CLI auth (needed before I can push branches, open issues, or
  open PRs from here):** run `gh auth login` (or set a `GH_TOKEN`) with
  `repo` scope for this repository. You can type `! gh auth login` in the
  chat to run it interactively and hand control back when done.
- [ ] **Git identity for commits:** run
  `git config --global user.name "Jamie Chicago"` and
  `git config --global user.email "jamiechicago312@gmail.com"` (or your
  preferred name) if not already set globally.
- [ ] **Neon database:** create a Neon project + database, copy the pooled
  connection string from Neon's **Connect** panel into `.env.local` as
  `DATABASE_URL`. Add the same value to Vercel's Preview and Production
  environment variables later. Never commit it.
- [ ] **Create the schema:** run the checked-in migration
  (`drizzle/0000_*.sql`) once against the Neon database via Neon's SQL Editor
  or `psql "$DATABASE_URL" -f drizzle/0000_*.sql`. Deploys do not run
  migrations automatically.
- [ ] **Admin password:** pick a password and set `ADMIN_PASSWORD` in
  `.env.local` (and later in Vercel). Also set `ADMIN_SESSION_SECRET` to a
  long random string (e.g. `openssl rand -hex 32`) — used to sign the admin
  session cookie.
- [ ] **Vercel:** create/connect a Vercel project, import this repository,
  grant deployer access. Add `DATABASE_URL`, `ADMIN_PASSWORD`, and
  `ADMIN_SESSION_SECRET` there for Preview and Production.
- [ ] **Vercel Blob:** enable Blob storage on the Vercel project (Storage tab
  → Create → Blob) and copy the `BLOB_READ_WRITE_TOKEN` into your env vars
  (Vercel sets this automatically for connected projects; only needed
  manually for local dev if you want to test uploads locally).

## Not required — no key needed

- **Map tiles (CARTO Positron/Dark Matter):** free, no signup, used directly
  by URL. If you'd rather use Mapbox or Google Maps tiles later for a
  different look, that would need its own API key — not needed for v1.

## Safety notes

- Keep all secrets in `.env.local` locally (already gitignored) and in
  Vercel's environment variable settings for deployments — never in a commit,
  issue, or PR.
- Use a dev Neon database while building; point Vercel Production at a
  separate database (or the same one, once you're comfortable — this is a
  single-author app, so the blast radius of sharing dev/prod is low, but a
  separate prod database is still recommended before you rely on this data).
