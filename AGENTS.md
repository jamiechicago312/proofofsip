# Instructions for agents working in this repo

## Git author identity is required for Vercel deploys — read before committing

This project is on a **Vercel Hobby plan**. Vercel Hobby does not deploy
commits whose author isn't the repo owner's own identity (e.g. a generic
"Claude"/bot author is treated as an untrusted/external author and the
deployment does not trigger). This has bitten this project before — treat it
as a hard rule, not a suggestion.

**Every commit you create in this repo must be authored as:**

```
git config user.name "Jamie Chicago"
git config user.email "87397251+jamiechicago312@users.noreply.github.com"
```

This is already set as local repo config (`.git/config`) in the primary
clone — do not override it with `--global` flags or a different identity. If
you are working from a fresh clone or a git worktree that doesn't inherit it,
set the two `git config` lines above (as local config, not global) before
your first commit there.

Do **not** set the commit author to "Claude", "Claude Code", an
`@anthropic.com` address, or leave it at whatever default the environment
provides — check `git config user.email` before committing if unsure.

The `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` trailer some
sessions append to commit messages is fine to keep in the message *body* —
that's just a trailer, not the commit author, and doesn't affect deploys.
What matters is the actual author field.

## Branch/PR convention

Match the sibling `proofofscoop` project's pattern: one GitHub issue per
task, implemented on a branch named `agent/<short-slug>`, opened as a PR that
references the issue (`Closes #N`), reviewed/merged individually rather than
batched.
