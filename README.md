# Ala SLP Activities — V5 (Phase 1 + Phase 2: Community)

Phase 1 (real login, My Decks, Deck Creator, Activity Player) is already
live. This update adds **Phase 2: Community** — Explore, publishing,
ratings, favorites, and public creator profiles.

## ⚠️ Before anything else: run the Phase 2 database schema
This update needs new database tables and updated security rules that
don't exist yet. **Nothing in this update will work until you run this.**

1. Open your Supabase dashboard → **SQL Editor** → **New query**.
2. Open `supabase-schema-phase2.sql` (included alongside this README),
   copy all of it, paste it into the query editor, and click **Run**.
3. You should see "Success. No rows returned." If you see a red error
   instead, copy the exact text and send it to me.

This is safe to run once, after the original `supabase-schema.sql` from
Phase 1 (which you should have already run).

## Getting the updated app files onto GitHub
Same process as before:
1. Copy every file/folder from this project into your repo, overwriting
   the existing ones (folder structure stays the same, including the
   hidden `.github` folder).
2. Commit directly to `main` (or however you did it last time).
3. Check the **Actions** tab — it rebuilds and redeploys automatically,
   same as before. No settings need to change.

## What's new and real in this update

- **Explore** — search, filter by category/age/language/tags, sort by
  Popular / Recent / Highest Rated / Most Used. Shows real published
  activities from any account, not just your own.
- **Publishing** — the Publish button in Deck Creator now works. Set
  Private / Unlisted / Public, age range, language, tags, and whether
  other therapists can copy the activity.
  - **Private**: only you can see it (same as before).
  - **Unlisted**: anyone with a direct link can open it, but it won't
    show up in Explore search results.
  - **Public**: listed in Explore for anyone to find.
- **Ratings & favorites** — rate any public activity 1–5 stars, save it
  as a favorite. Aggregated counts show up on the activity card and
  detail page.
- **"Use This Deck"** — copies someone else's public activity into your
  own My Decks, including its images and audio (re-uploaded into your
  own private storage, not shared with theirs).
- **Creator profiles** — Settings → Public Profile lets you set a display
  name, profession, bio, and an emoji avatar. This is what shows up when
  someone clicks through from one of your published activities.
- **My Decks** now shows a Private / Unlisted / Public badge on each
  activity.

## Still coming later (Phase 3)
Students, Progress tracking, and session history are still "coming soon"
placeholders — those need their own set of database tables (students,
goals, sessions) that we haven't built yet.

## A deliberate simplification worth knowing about
Creator avatars are emoji, not uploaded photos — this avoids needing a
second image-upload flow just for profile pictures. If you'd rather have
real photo avatars later, that's a small addition on top of this.

## Known limitation worth knowing about (same as Phase 1)
I still can't run `npm install` or connect to your live Supabase project
from where I work — no internet access in my environment. What I *did* do
this time:
- Built a simulated Supabase client that mimics real query behavior
  (filtering, sorting, upserts, RPC calls, and a joined "explore" view)
  and ran the actual production code from `lib/community.ts` against it —
  every function (publishing, rating, favoriting, copying a deck with its
  media, creator lookups) passed, including subtle checks like "does a
  copied deck's image end up in the new owner's own storage folder."
- Server-rendered every new/changed page to catch structural errors.

The real first run is still your GitHub Actions build and your actual
Supabase project. If anything errors, paste it back to me exactly as
shown and I'll fix it.
