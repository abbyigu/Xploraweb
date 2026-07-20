#!/usr/bin/env bash
# Timestamped backup of code, configuration, and CMS/data (Supabase) for goxplora.ca.
# Usage: ./scripts/backup.sh
# Output: backups/<UTC timestamp>/ (git-ignored, never committed)
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="backups/${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"
echo "Backing up into ${BACKUP_DIR}"

# --- 1. Code ---------------------------------------------------------------
git bundle create "${BACKUP_DIR}/code.bundle" --all
git rev-parse HEAD > "${BACKUP_DIR}/code_commit.txt"
git status --porcelain > "${BACKUP_DIR}/code_uncommitted_status.txt" || true
git diff > "${BACKUP_DIR}/code_uncommitted.diff" || true
echo "  [ok] code.bundle (full git history) + HEAD commit + any uncommitted diff"

# --- 2. Configuration --------------------------------------------------------
cp vercel.json "${BACKUP_DIR}/vercel.json" 2>/dev/null || true
cp package.json "${BACKUP_DIR}/package.json" 2>/dev/null || true
cp package-lock.json "${BACKUP_DIR}/package-lock.json" 2>/dev/null || true

if command -v vercel >/dev/null 2>&1; then
  if vercel env pull "${BACKUP_DIR}/vercel_env.txt" --environment=production --yes >/dev/null 2>&1; then
    echo "  [ok] vercel_env.txt (Production env vars, requires 'vercel link' + login)"
  else
    echo "vercel CLI is installed but 'vercel env pull' failed (project not linked or not logged in)." \
      > "${BACKUP_DIR}/vercel_env_ERROR.txt"
    echo "  [skip] vercel env pull failed — see vercel_env_ERROR.txt"
  fi
else
  echo "vercel CLI not found on PATH. Install with 'npm i -g vercel', run 'vercel link', then:" \
    > "${BACKUP_DIR}/vercel_env_INSTRUCTIONS.txt"
  echo "  vercel env pull ${BACKUP_DIR}/vercel_env.txt --environment=production" >> "${BACKUP_DIR}/vercel_env_INSTRUCTIONS.txt"
  echo "  [skip] vercel CLI missing — see vercel_env_INSTRUCTIONS.txt"
fi

# --- 3. CMS / data (Supabase) ------------------------------------------------
# Project ref taken from connect-src in vercel.json (qnalvzgqrfjbuoqsffbs.supabase.co).
#
# Uses pg_dump directly against the SESSION POOLER, not the CLI's dockerized
# `supabase db dump` (that requires Docker Desktop, which isn't installable on
# every Mac — confirmed 2026-07-18) and not the "direct connection" host
# (db.<ref>.supabase.co:5432 is IPv6-only; times out on networks/machines
# without an IPv6 route, confirmed 2026-07-18 on both this environment and the
# developer's own Mac).
#
# Set SUPABASE_DB_URL yourself before running this script — never hardcode the
# password here or paste it into chat:
#   export SUPABASE_DB_URL="postgresql://postgres.qnalvzgqrfjbuoqsffbs:<password>@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
# Get <password> from Supabase Dashboard > Project Settings > Database >
# Reset password if you don't already have it saved (it's not recoverable,
# only resettable — and resetting is safe here since this app only talks to
# Supabase via the REST API, never a direct Postgres connection string).

PG_DUMP_BIN="$(command -v pg_dump || echo /usr/local/opt/libpq/bin/pg_dump)"

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  cat > "${BACKUP_DIR}/supabase_dump_INSTRUCTIONS.txt" <<'EOF'
SUPABASE_DB_URL is not set. Export it first (session pooler, not direct
connection — direct is IPv6-only and will time out):

  export SUPABASE_DB_URL="postgresql://postgres.qnalvzgqrfjbuoqsffbs:<password>@aws-1-us-west-2.pooler.supabase.com:5432/postgres"

Get <password> from Supabase Dashboard > Project Settings > Database >
Reset password (not recoverable once set, only resettable).

If pg_dump isn't on PATH (Homebrew installs it keg-only under
/usr/local/opt/libpq/bin), either add that to PATH or call it directly:

  export SUPABASE_DB_URL="postgresql://postgres.qnalvzgqrfjbuoqsffbs:<password>@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
  /usr/local/opt/libpq/bin/pg_dump "$SUPABASE_DB_URL" --schema=public --schema-only > supabase_schema.sql
  /usr/local/opt/libpq/bin/pg_dump "$SUPABASE_DB_URL" --schema=public --data-only   > supabase_data.sql
EOF
  echo "  [skip] SUPABASE_DB_URL not set — see supabase_dump_INSTRUCTIONS.txt"
elif [ ! -x "${PG_DUMP_BIN}" ]; then
  echo "pg_dump not found. Install with: brew install libpq" > "${BACKUP_DIR}/supabase_dump_ERROR.txt"
  echo "  [skip] pg_dump missing — see supabase_dump_ERROR.txt"
else
  if "${PG_DUMP_BIN}" "${SUPABASE_DB_URL}" --schema=public --schema-only > "${BACKUP_DIR}/supabase_schema.sql" 2>"${BACKUP_DIR}/supabase_dump_ERROR.txt"; then
    "${PG_DUMP_BIN}" "${SUPABASE_DB_URL}" --schema=public --data-only > "${BACKUP_DIR}/supabase_data.sql" 2>>"${BACKUP_DIR}/supabase_dump_ERROR.txt"
    rm -f "${BACKUP_DIR}/supabase_dump_ERROR.txt"
    echo "  [ok] supabase_schema.sql + supabase_data.sql"
  else
    echo "  [skip] pg_dump failed — see supabase_dump_ERROR.txt"
  fi
fi

echo "Backup complete: ${BACKUP_DIR}"
