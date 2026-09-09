-- ============================================================
-- Ala SLP Activities — Phase D (Therapist Asset Library / My Media)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run after all previous schema files. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend assets to support personal ("My Media") assets
-- ------------------------------------------------------------
-- owner_id = null      -> platform library asset (admin-managed, as before)
-- owner_id = <user id> -> that user's own private asset ("My Media")
--
-- bucket tells us where the file actually lives:
--   'asset-library' -> your existing public bucket (platform assets)
--   'media'         -> your existing private per-user bucket (personal assets,
--                      reusing the exact same folder-per-user security you
--                      already have for deck card uploads)
alter table public.assets
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists bucket text not null default 'asset-library' check (bucket in ('asset-library', 'media'));

create index if not exists assets_owner_id_idx on public.assets(owner_id);

-- ------------------------------------------------------------
-- 2. Update RLS so a therapist can manage their own personal assets,
--    while platform assets (owner_id is null) stay admin-only, exactly
--    as before.
-- ------------------------------------------------------------
drop policy if exists "Active assets are viewable by any signed-in user" on public.assets;
create policy "Assets are viewable by their owner, or platform assets by anyone"
on public.assets for select
using (
  auth.uid() is not null
  and (
    owner_id = auth.uid()
    or (owner_id is null and (visibility = 'active' or public.is_admin()))
  )
);

drop policy if exists "Only admins can add assets" on public.assets;
create policy "Admins can add platform assets, users can add their own"
on public.assets for insert
with check (
  (owner_id is null and public.is_admin())
  or owner_id = auth.uid()
);

drop policy if exists "Only admins can update assets" on public.assets;
create policy "Admins can update platform assets, users can update their own"
on public.assets for update
using ((owner_id is null and public.is_admin()) or owner_id = auth.uid())
with check ((owner_id is null and public.is_admin()) or owner_id = auth.uid());

drop policy if exists "Only admins can delete assets" on public.assets;
create policy "Admins can delete platform assets, users can delete their own"
on public.assets for delete
using ((owner_id is null and public.is_admin()) or owner_id = auth.uid());

-- Note: no new storage policies needed here. Personal ("My Media") uploads
-- go into your existing 'media' bucket under the same {user_id}/... folder
-- structure your deck card uploads already use — the storage RLS you set
-- up in Phase 1 already covers this correctly.
