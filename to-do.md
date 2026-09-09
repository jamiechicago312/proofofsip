# Proof of Sip: Jamie's launch checklist

Updated September 9, 2026. Start with the account setup below. Check items
off as you finish; unverified external setup is left unchecked.

Jamie reports that environment variables are configured. The remaining
unchecked setup items should be confirmed during the live smoke test.

## Already handled

- [x] GitHub CLI access works for `jamiechicago312`.
- [x] Commit identity matches the repository owner for Vercel.
- [x] Main requires a pull request and the `checks` CI job to pass against
  an up-to-date branch. This applies to administrators too.
- [x] Required approving reviews is **zero**: you can merge your own PR
  after checks pass and review conversations are resolved.
- [x] Force pushes and deletion of main are blocked.
- [x] Sip creation/editing is pushed in [PR #21](https://github.com/jamiechicago312/proofofsip/pull/21).
- [x] Review and merge PR #21 when checks pass. It adds cafe creation,
  sip editing, drafts, and publishing; photo uploads come separately.

## 1. Connect hosting and the database

- [ ] Create or confirm the Vercel project connected to this repository.
  Record the production domain so you can configure GitHub login below.
- [ ] Create or confirm a Neon Postgres database. Copy its pooled
  connection string into `DATABASE_URL` in Vercel's environment settings.
- [ ] Run `drizzle/0000_create_cafes_and_sips.sql` once using Neon's SQL
  Editor. Deployments do not apply this migration automatically.
- [ ] For local development, copy `.env.example` to `.env.local` and add
  the same variable names. Prefer a separate development database for
  local work and Vercel previews.

Optional development data: after creating the schema, run
`node --env-file=.env.local scripts/seed.mjs`. The seed contains **fictional
cafes and sample reviews**; keep it out of your real production journal.

## 2. Enable your admin login

- [ ] Create a GitHub OAuth App in GitHub Settings → Developer settings →
  OAuth Apps. Use your production website as its homepage and
  `https://YOUR-DOMAIN/api/auth/callback/github` as its callback URL.
- [ ] Save its client ID as `AUTH_GITHUB_ID` and its client secret as
  `AUTH_GITHUB_SECRET` in Vercel.
- [ ] Generate a secret with `openssl rand -hex 32`; save it as
  `AUTH_SECRET` in Vercel.
- [ ] Set `ADMIN_GITHUB_USERNAME=jamiechicago312` in Vercel.
- [ ] If you want local login, use a separate OAuth App with callback
  `http://localhost:3000/api/auth/callback/github` and put its credentials
  in `.env.local`. Preview login also needs a matching callback domain;
  a stable preview domain makes this easier.
- [ ] Redeploy after setting environment variables.

The required variables are `DATABASE_URL`, `AUTH_GITHUB_ID`,
`AUTH_GITHUB_SECRET`, `AUTH_SECRET`, and `ADMIN_GITHUB_USERNAME`.
`ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are not used.
Keep credentials in environment settings, never in this checklist or GitHub.

## 3. Prepare photos

- [ ] Create or connect Vercel Blob storage to the Vercel project.
- [ ] Confirm `BLOB_READ_WRITE_TOKEN` is available to that project; copy
  it to `.env.local` only if you want to test uploads locally.
- [ ] Finish [photo upload issue #9](https://github.com/jamiechicago312/proofofsip/issues/9).
  Creating the storage alone does not add photo uploading to the form.

## 4. Test before calling it launched

After PR #21 is merged and deployed:

- [ ] Open `/cafes` and confirm it loads without a database error.
- [ ] Sign in at `/admin` using your GitHub account.
- [ ] Create a cafe and save a sip with **Published** unchecked. Confirm
  its text is absent from the public cafe page.
- [ ] Edit that sip, publish it, and confirm its text and ratings appear
  publicly. Change a rating and confirm the update appears.
- [ ] Sign out and confirm `/admin/sips/new` sends you to sign-in.
- [ ] After photo uploads land, upload a photo and confirm it appears on
  the public journal entry with suitable alt text.
- [ ] Check the app on your phone in both light and dark mode.

## Remaining build work

These are implementation tasks, not account setup you need to do manually.

- [ ] [#4 — Map view](https://github.com/jamiechicago312/proofofsip/issues/4)
- [ ] [#9 — Photo upload](https://github.com/jamiechicago312/proofofsip/issues/9): implemented in [PR #24](https://github.com/jamiechicago312/proofofsip/pull/24), CI and Vercel preview pass; merge and test an upload.
- [ ] [#10 — Search](https://github.com/jamiechicago312/proofofsip/issues/10): implemented on `agent/cafe-search`; searches name, neighborhood, and tags with existing filters and sorting.
- [ ] [#11 — Home page](https://github.com/jamiechicago312/proofofsip/issues/11): implemented on `agent/journal-home`; merge the map PR #26 first, then the home page PR.
- [ ] [#12 — Mobile, accessibility, and SEO polish](https://github.com/jamiechicago312/proofofsip/issues/12)
- [ ] [#13 — Production deployment and smoke test](https://github.com/jamiechicago312/proofofsip/issues/13)

## How to ship changes as a solo builder

Use a feature branch → open a PR into main → wait for CI → merge the PR
yourself. No second reviewer is required. If main changes, update your
branch and let CI rerun before merging. Direct pushes to main are blocked.
