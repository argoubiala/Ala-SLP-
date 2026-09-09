-- ============================================================
-- Ala SLP Activities — Content-hash duplicate detection
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run after supabase-schema-phase4-assets.sql. Idempotent.
-- ============================================================

alter table public.assets
  add column if not exists content_hash text;

-- A unique index (not a table-level UNIQUE constraint) so we can scope it
-- to non-null values only — existing assets uploaded before this migration
-- will have content_hash = NULL, and Postgres already treats multiple NULLs
-- as non-conflicting under a unique index, so this is safe to add without
-- backfilling old rows. New uploads always compute and store a real hash.
create unique index if not exists assets_content_hash_unique_idx
  on public.assets (content_hash)
  where content_hash is not null;
