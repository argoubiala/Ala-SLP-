-- ============================================================
-- Ala SLP Activities — Phase 2 schema (Community features)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run after (and only after) supabase-schema.sql from Phase 1.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend decks with publishing fields
-- ------------------------------------------------------------
alter table public.decks
  add column if not exists visibility text not null default 'private'
    check (visibility in ('private','unlisted','public')),
  add column if not exists allow_copy boolean not null default true,
  add column if not exists age_range text,
  add column if not exists language text not null default 'English',
  add column if not exists tags text[] not null default '{}',
  add column if not exists use_count integer not null default 0;

create index if not exists decks_visibility_idx on public.decks(visibility);

-- Replace the Phase 1 "own decks only" policy with one that also allows
-- any signed-in user to read public/unlisted decks (needed for Explore,
-- deck detail pages, and previewing/playing someone else's activity).
drop policy if exists "Users can view their own decks" on public.decks;
create policy "Users can view own decks or publicly visible decks"
on public.decks for select
using (auth.uid() = user_id or visibility in ('public','unlisted'));

-- ------------------------------------------------------------
-- 2. Public creator profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  profession text,
  avatar_emoji text not null default '🧑‍⚕️',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by any signed-in user"
on public.profiles for select
using (auth.uid() is not null);

create policy "Users can create their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 3. Ratings (1 rating per user per deck)
-- ------------------------------------------------------------
create table if not exists public.deck_ratings (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (deck_id, user_id)
);

alter table public.deck_ratings enable row level security;

create policy "Ratings are viewable by any signed-in user"
on public.deck_ratings for select
using (auth.uid() is not null);

create policy "Users can rate decks"
on public.deck_ratings for insert
with check (auth.uid() = user_id);

create policy "Users can change their own rating"
on public.deck_ratings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can remove their own rating"
on public.deck_ratings for delete
using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. Favorites (1 favorite per user per deck)
-- ------------------------------------------------------------
create table if not exists public.deck_favorites (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (deck_id, user_id)
);

alter table public.deck_favorites enable row level security;

create policy "Favorites are viewable by any signed-in user"
on public.deck_favorites for select
using (auth.uid() is not null);

create policy "Users can favorite decks"
on public.deck_favorites for insert
with check (auth.uid() = user_id);

create policy "Users can remove their own favorite"
on public.deck_favorites for delete
using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. "Use This Deck" counter
-- ------------------------------------------------------------
-- A plain UPDATE policy would let any signed-in user edit any public deck's
-- row directly, which is more access than we want. This function bumps
-- just the counter, safely, regardless of who calls it.
create or replace function public.increment_deck_use_count(deck_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.decks set use_count = use_count + 1 where id = deck_id_input;
end;
$$;

grant execute on function public.increment_deck_use_count(uuid) to authenticated;

-- ------------------------------------------------------------
-- 6. Explore feed view (pre-joins creator name + rating/favorite counts)
-- ------------------------------------------------------------
create or replace view public.explore_decks
with (security_invoker = true) as
select
  d.id,
  d.user_id,
  d.category,
  d.title,
  d.description,
  d.cards,
  d.visibility,
  d.allow_copy,
  d.age_range,
  d.language,
  d.tags,
  d.use_count,
  d.created_at,
  p.display_name as creator_name,
  p.avatar_emoji as creator_avatar,
  coalesce(avg(r.rating), 0)::numeric(3,2) as avg_rating,
  count(distinct r.id) as rating_count,
  count(distinct f.id) as favorite_count
from public.decks d
left join public.profiles p on p.id = d.user_id
left join public.deck_ratings r on r.deck_id = d.id
left join public.deck_favorites f on f.deck_id = d.id
where d.visibility = 'public'
group by d.id, p.display_name, p.avatar_emoji;

grant select on public.explore_decks to authenticated;

-- ------------------------------------------------------------
-- 7. Storage: allow reading media that belongs to a public/unlisted deck
-- ------------------------------------------------------------
-- Phase 1 only let a user read files in their own folder. Explore preview,
-- deck detail pages, and "Use This Deck" all need to read another user's
-- uploaded images/audio — but only when that specific file is actually
-- attached to a deck that's been published as public or unlisted.
create policy "Public deck media is readable by any signed-in user"
on storage.objects for select
using (
  bucket_id = 'media'
  and exists (
    select 1
    from public.decks d, jsonb_array_elements(d.cards) as card
    where d.visibility in ('public', 'unlisted')
      and (card->>'imagePath' = storage.objects.name or card->>'soundPath' = storage.objects.name)
  )
);
