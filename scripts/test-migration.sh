#!/usr/bin/env bash
# Applies the migration to a scratch database and runs the RLS smoke test.
#   PGHOST=… PGPORT=… PGUSER=postgres ./scripts/test-migration.sh
# Works on plain Postgres: Supabase's auth schema/roles are stubbed, and if pgvector is not
# installed the vector column is replaced by float8[] (retrieval then runs on full text only).
set -euo pipefail
cd "$(dirname "$0")/.."
DB=nextme_migration_test
psql -qc "drop database if exists $DB" -c "create database $DB" postgres
SQL=$(cat supabase/migrations/0001_init.sql)
if ! psql -qtAc "select 1 from pg_available_extensions where name='vector'" postgres | grep -q 1; then
  echo "pgvector not installed: stubbing vector column"
  SQL=$(printf '%s' "$SQL" | sed -e '/create extension if not exists vector;/d' -e 's/vector(384)/float8[]/g' -e '/using hnsw/d')
  STUB="create function public.vdist(float8[], float8[]) returns float8 language sql immutable as 'select 0::float8'; create operator public.<=> (leftarg = float8[], rightarg = float8[], function = public.vdist);"
fi
psql -q -v ON_ERROR_STOP=1 "$DB" <<SQL_EOF
do \$\$ begin
  if not exists (select from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end \$\$;
-- Supabase's defaults: anon and authenticated get ALL on every new table; RLS does the protecting.
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;
create schema auth;
grant usage on schema auth to anon, authenticated;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as \$\$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid \$\$;
${STUB:-}
$SQL
SQL_EOF
psql -q "$DB" -f scripts/test-migration.sql 2>&1 | grep -E "PASS|FAIL|ERROR" || true
psql -qc "drop database $DB" postgres
