# Ala SLP Activities — V5 (Phase 1 + 2 + 3: Complete)

All three phases from the original design brief are now built: core
activities, community/publishing, and student progress tracking.

## ⚠️ Run the Phase 3 database schema first
1. Supabase dashboard → **SQL Editor** → **New query**.
2. Paste all of `supabase-schema-phase3.sql` (included alongside this
   README) and click **Run**.
3. Expect "Success. No rows returned." This is safe to run after Phase 1
   and Phase 2's schemas, and safe to re-run itself if needed.

Then deploy the app files the same way as before: copy everything into
your repo (overwriting existing files), commit to `main`, check the
Actions tab goes green.

## What's new in Phase 3

- **Students** — add students (name, age, grade, notes), see them as cards
  with live accuracy and goal progress at a glance.
- **Student profiles** — three tabs:
  - **Overview**: accuracy trend chart, recent sessions, goals with
    progress bars, assigned activities
  - **Activities**: full list of assigned decks, jump straight into
    playing one
  - **Notes**: free-form notes, saved to the student's record
- **Goals** — add a goal (e.g. "Produce /r/ in initial position", target
  100%), update progress, see it marked achieved automatically.
- **Assigning activities** — assign any of your own decks to a student.
  Playing an assigned activity automatically logs a session against that
  student when you finish it — score, accuracy, and which deck, no manual
  entry required.
- **Progress dashboard** — sessions-per-week and accuracy-trend charts
  across your whole caseload, an activity-performance breakdown (which
  decks get the best/worst results), and a goal-progress table for every
  student at a glance.
- **Home dashboard** — the "Student Progress" and "Community Picks" cards
  now show real data instead of placeholders (Community Picks was
  actually a Phase 2 leftover I'd missed wiring up — fixed here too).

## How session logging works
Start a session from a student's profile (via an assigned activity, or the
"Start Session" button) and the URL carries a `?student=<id>` tag. When
you finish the activity, the score gets saved automatically against that
student — no separate "save" step. Playing an activity *without* going
through a student profile first (e.g. just testing a deck from My Decks)
does **not** log a session, since there's no student to attribute it to.

## A deliberate simplification worth knowing about
"Assigned Activities" is intentionally simple — no due dates or
scheduling, just a list of decks tied to a student that you can mark
complete. If you want scheduling/reminders later, that's a reasonable
follow-up.

## Known limitation worth knowing about (same as before)
Still no internet access in my working environment, so still no real
`npm install` or live Supabase connection on my end. What I did this time:
- Wrote a simulated Supabase client covering every new query pattern
  (students/goals/sessions/assignments CRUD, ordering, limits) and ran the
  actual `lib/students.ts` production code against it — all 14 checks
  passed, including the aggregation math (accuracy averaging, weekly
  bucketing) and goal-achieved logic.
- Caught and fixed one real bug this way: a fragile `.then()` chain that
  would only work correctly if the query builder was a fully spec-compliant
  Promise — rewritten to a plain `async`/`await` helper instead, which is
  both safer and clearer.
- Server-rendered every new/changed page, including building a structural
  stub for `recharts` (not installable in my sandbox either) just to
  verify the chart components receive correctly-shaped data.

The real first run is still your GitHub Actions build and your actual
Supabase project. Paste back anything that errors and I'll fix it.
