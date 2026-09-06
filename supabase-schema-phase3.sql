-- ============================================================
-- Ala SLP Activities — Phase 3 schema (Students & Progress)
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run after Phase 1 and Phase 2 schemas. Fully idempotent —
-- safe to re-run this file itself if needed.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Students
-- ------------------------------------------------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age integer,
  grade text,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_user_id_idx on public.students(user_id);

alter table public.students enable row level security;

drop policy if exists "Users can view their own students" on public.students;
create policy "Users can view their own students"
on public.students for select
using (auth.uid() = user_id);

drop policy if exists "Users can add their own students" on public.students;
create policy "Users can add their own students"
on public.students for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own students" on public.students;
create policy "Users can update their own students"
on public.students for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own students" on public.students;
create policy "Users can delete their own students"
on public.students for delete
using (auth.uid() = user_id);

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2. Goals (belong to a student)
-- ------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  target integer not null default 100,
  current integer not null default 0,
  unit text not null default '%',
  category text,
  achieved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists goals_student_id_idx on public.goals(student_id);

alter table public.goals enable row level security;

drop policy if exists "Users can view their own goals" on public.goals;
create policy "Users can view their own goals"
on public.goals for select
using (auth.uid() = user_id);

drop policy if exists "Users can add their own goals" on public.goals;
create policy "Users can add their own goals"
on public.goals for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own goals" on public.goals;
create policy "Users can update their own goals"
on public.goals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own goals" on public.goals;
create policy "Users can delete their own goals"
on public.goals for delete
using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. Sessions (a record of a student playing an activity)
-- ------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid references public.decks(id) on delete set null,
  deck_title text not null default 'Untitled Activity',
  score integer not null,
  total integer not null,
  accuracy integer not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_student_id_idx on public.sessions(student_id);
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_created_at_idx on public.sessions(created_at);

alter table public.sessions enable row level security;

drop policy if exists "Users can view their own sessions" on public.sessions;
create policy "Users can view their own sessions"
on public.sessions for select
using (auth.uid() = user_id);

drop policy if exists "Users can add their own sessions" on public.sessions;
create policy "Users can add their own sessions"
on public.sessions for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own sessions" on public.sessions;
create policy "Users can delete their own sessions"
on public.sessions for delete
using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. Assignments (a deck assigned to a student to practice)
-- ------------------------------------------------------------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid references public.decks(id) on delete cascade,
  deck_title text not null default 'Untitled Activity',
  completed boolean not null default false,
  assigned_at timestamptz not null default now()
);

create index if not exists assignments_student_id_idx on public.assignments(student_id);

alter table public.assignments enable row level security;

drop policy if exists "Users can view their own assignments" on public.assignments;
create policy "Users can view their own assignments"
on public.assignments for select
using (auth.uid() = user_id);

drop policy if exists "Users can add their own assignments" on public.assignments;
create policy "Users can add their own assignments"
on public.assignments for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own assignments" on public.assignments;
create policy "Users can update their own assignments"
on public.assignments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own assignments" on public.assignments;
create policy "Users can delete their own assignments"
on public.assignments for delete
using (auth.uid() = user_id);
