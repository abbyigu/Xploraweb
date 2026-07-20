# Backup & rollback runbook — goxplora.ca (Xplora)

## Decision owner

**Ariel Blouin** is the sole decision owner: the only person authorized to
declare an incident and approve/trigger a rollback of code, configuration,
or data on production.

## Creating a backup

```
cd Xploraweb-main
./scripts/backup.sh
```

Produces `backups/<UTC timestamp>/` (git-ignored, never committed — contains
production secrets once Vercel/Supabase steps succeed) with:

| File | Contents |
|---|---|
| `code.bundle` | Full git history (`git bundle create --all`) |
| `code_commit.txt` | HEAD commit SHA at backup time |
| `code_uncommitted.diff` / `code_uncommitted_status.txt` | Any uncommitted local changes |
| `vercel.json`, `package.json`, `package-lock.json` | Configuration snapshot |
| `vercel_env.txt` | Production env vars, via `vercel env pull --environment=production` (requires `vercel link` + login — confirmed working 2026-07-18) |
| `supabase_schema.sql` / `supabase_data.sql` | Full CMS/data dump (`xplora_spots`, `xplora_experiences`, `site_content`, `profiles`, `business_perks`, etc.) via `pg_dump` against the Supabase **session pooler** — requires `SUPABASE_DB_URL` to be exported first (see below); otherwise the script writes `supabase_dump_INSTRUCTIONS.txt` |

**Before running**, export the DB connection string yourself (never hardcode
the password in the script or paste it into chat/tickets):
```
export SUPABASE_DB_URL="postgresql://postgres.qnalvzgqrfjbuoqsffbs:<password>@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
```
Get `<password>` from **Supabase Dashboard → Project Settings → Database →
Reset password** (it's not recoverable once set, only resettable — safe to
reset here since this app only talks to Supabase via the REST API, never a
direct Postgres connection string, so nothing production-facing depends on
the old value).

**Two non-obvious gotchas, hit and resolved 2026-07-18:**
1. **Use the session pooler host, not "direct connection."** `db.<ref>.supabase.co:5432` is IPv6-only and times out on networks without an IPv6 route (confirmed on two separate machines/networks). The session pooler (`aws-1-us-west-2.pooler.supabase.com:5432`, username `postgres.<project-ref>`, from Dashboard → Connect → Direct → Session pooler) works over IPv4.
2. **The Supabase dashboard's "Reset password" dialog has a `Generate a password` step and a separate `Reset password` confirm button** — copying the generated value does *not* apply it. The new password only takes effect once you click confirm (verify via Network tab: `PATCH .../db-password` returns 200). Copying-but-not-confirming, or confirming-a-different-generation-than-what-you-copied, both look identical from the outside and both produce a silent, persistent "password authentication failed" — this cost significant back-and-forth before being caught.

**Verified 2026-07-18**: `code.bundle` creation + `git bundle verify`, `vercel env pull --environment=production` (real Stripe/Supabase/Resend secrets confirmed present), and the full `pg_dump` schema+data path (30KB schema, ~870KB data) all confirmed working end-to-end via the session pooler.

Also note: the CLI's `supabase db dump` requires Docker Desktop running locally — not a reasonable dependency for a quick backup, and Docker Desktop isn't installable on every Mac (confirmed unsupported on this developer's machine). `pg_dump` directly against the pooler avoids that dependency entirely and is what this script uses.

Storage bucket assets (`perks-images`) are **not** included in the dump above; back them up separately if ever needed (requires the Supabase CLI):
```
supabase storage cp -r ss:///perks-images ./storage_backup
```

## Rollback commands

### 1. Code

Roll back the deployed app to a previous commit:
```
git revert <bad-commit-sha>          # preferred — keeps history, safe on shared branches
git push origin main
```
Or, to restore an exact prior state from a backup bundle:
```
git clone backups/<timestamp>/code.bundle restored-repo
```

### 2. Deployment (Vercel)

Fastest rollback — re-promote a previous known-good deployment without
touching git at all:
```
vercel ls xplora                                   # list recent deployments
vercel rollback <deployment-url-or-id>              # instantly re-promotes it to production
```

### 3. Configuration (env vars)

Restore production env vars from a backup:
```
vercel env pull backups/<timestamp>/vercel_env.txt --environment=production   # (already the backup itself)
# to push a variable back:
vercel env add <KEY> production < value
```
Re-apply `vercel.json` from the backup by copying it back and redeploying
(`git checkout backups/<timestamp>/vercel.json -- vercel.json` then commit/deploy).

### 4. Data / CMS (Supabase)

Restore the CMS/data snapshot into the project's Postgres DB (set
`SUPABASE_DB_URL` to the session pooler connection string first, as above):
```
psql "$SUPABASE_DB_URL" -f backups/<timestamp>/supabase_schema.sql
psql "$SUPABASE_DB_URL" -f backups/<timestamp>/supabase_data.sql
```
**This is destructive to current data — get explicit sign-off from the
decision owner before running it against production**, and take a fresh
backup of current-state data first (`./scripts/backup.sh`) so the
pre-rollback state isn't lost.

## When to roll back

Any decision to run a rollback against production (steps 2–4 above) requires
sign-off from the decision owner above. Code reverts on a non-production
branch don't require sign-off.
