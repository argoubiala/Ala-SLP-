-- ============================================================
-- Ala SLP Activities — Phase A (Asset Library foundation)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run after Phase 1, 2, and 3 schemas. Fully idempotent —
-- safe to re-run this file itself if needed.
--
-- This is foundation only: database tables, storage bucket, and
-- permissions. No app screens use this yet — that's Phase B.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Admin concept — one new column on the existing profiles table
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Small reusable helper so every admin-only policy below can just say
-- "using (public.is_admin())" instead of repeating a subquery everywhere.
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ------------------------------------------------------------
-- 2. Asset categories (admin-editable, expandable — unlike the fixed
--    6 deck categories, this is a real table you can add rows to)
-- ------------------------------------------------------------
create table if not exists public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.asset_categories enable row level security;

drop policy if exists "Categories are viewable by any signed-in user" on public.asset_categories;
create policy "Categories are viewable by any signed-in user"
on public.asset_categories for select
using (auth.uid() is not null);

drop policy if exists "Only admins can add categories" on public.asset_categories;
create policy "Only admins can add categories"
on public.asset_categories for insert
with check (public.is_admin());

drop policy if exists "Only admins can update categories" on public.asset_categories;
create policy "Only admins can update categories"
on public.asset_categories for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Only admins can delete categories" on public.asset_categories;
create policy "Only admins can delete categories"
on public.asset_categories for delete
using (public.is_admin());

-- Seed the starting category list from your brief. Safe to re-run —
-- won't create duplicates.
insert into public.asset_categories (name, slug, sort_order)
values
  ('Animals', 'animals', 1),
  ('Food', 'food', 2),
  ('Actions', 'actions', 3),
  ('Objects', 'objects', 4),
  ('People', 'people', 5),
  ('Body Parts', 'body-parts', 6),
  ('Emotions', 'emotions', 7),
  ('Clothing', 'clothing', 8),
  ('Transport', 'transport', 9),
  ('School', 'school', 10),
  ('Household', 'household', 11),
  ('Nature', 'nature', 12),
  ('Places', 'places', 13),
  ('Toys', 'toys', 14),
  ('Shapes', 'shapes', 15),
  ('Colors', 'colors', 16),
  ('Numbers', 'numbers', 17),
  ('Letters', 'letters', 18),
  ('Other', 'other', 99)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 3. Assets — the platform-owned library, referenced by ID
--    (never duplicated when used across activities/decks)
-- ------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.asset_categories(id) on delete set null,
  tags text[] not null default '{}',
  asset_type text not null default 'image' check (asset_type in ('image', 'audio')),
  file_path text not null,
  thumbnail_path text,
  source text,
  license text,
  attribution text,
  visibility text not null default 'active' check (visibility in ('active', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assets_category_id_idx on public.assets(category_id);
create index if not exists assets_visibility_idx on public.assets(visibility);
create index if not exists assets_tags_idx on public.assets using gin(tags);

alter table public.assets enable row level security;

drop policy if exists "Active assets are viewable by any signed-in user" on public.assets;
create policy "Active assets are viewable by any signed-in user"
on public.assets for select
using (auth.uid() is not null and (visibility = 'active' or public.is_admin()));

drop policy if exists "Only admins can add assets" on public.assets;
create policy "Only admins can add assets"
on public.assets for insert
with check (public.is_admin());

drop policy if exists "Only admins can update assets" on public.assets;
create policy "Only admins can update assets"
on public.assets for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Only admins can delete assets" on public.assets;
create policy "Only admins can delete assets"
on public.assets for delete
using (public.is_admin());

drop trigger if exists trg_assets_updated_at on public.assets;
create trigger trg_assets_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 4. Storage bucket for the asset library — PUBLIC read (these are
--    shared platform assets, meant to be broadly cacheable), admin-only
--    write. This is a separate bucket from your private 'media' bucket
--    used for personal deck uploads — that one is untouched.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('asset-library', 'asset-library', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can read the asset library bucket" on storage.objects;
create policy "Anyone can read the asset library bucket"
on storage.objects for select
using (bucket_id = 'asset-library');

drop policy if exists "Only admins can upload to the asset library" on storage.objects;
create policy "Only admins can upload to the asset library"
on storage.objects for insert
with check (bucket_id = 'asset-library' and public.is_admin());

drop policy if exists "Only admins can update asset library files" on storage.objects;
create policy "Only admins can update asset library files"
on storage.objects for update
using (bucket_id = 'asset-library' and public.is_admin());

drop policy if exists "Only admins can delete asset library files" on storage.objects;
create policy "Only admins can delete asset library files"
on storage.objects for delete
using (bucket_id = 'asset-library' and public.is_admin());

-- ------------------------------------------------------------
-- 5. Make yourself an admin
-- ------------------------------------------------------------
-- Run this separately, after the above, with your real account email.
-- This is the ONLY account that will be able to manage the asset
-- library once this runs — everyone else gets read-only access.
--
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'argoubiala@gmail.com');
