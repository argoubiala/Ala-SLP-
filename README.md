# Ala SLP Activities — V5 (Phase 1: Core Workflow)

The new design, wired to your real Supabase project. This is **Phase 1** of
the platform described in the design brief: real login, My Decks, Deck
Creator (with image/sound upload), and the Activity Player. Explore,
Students, Progress, and Publishing are visible in the navigation but show
honest "coming soon" screens — they need new database tables we haven't
built yet (that's Phase 2 and 3).

## ⚠️ This is a different kind of project than before
Earlier versions were plain HTML/JS files you could just open. This one is
a **React + TypeScript + Vite** project — it needs a build step. You won't
run this by double-clicking `index.html`.

## Getting it onto your GitHub repo

1. Copy every file and folder in this project into your existing repo
   (keep the folder structure exactly as-is, including the hidden
   `.github` folder — that's what makes automatic deployment work).
2. Commit and push to your repo's `main` branch.
3. In your repo on GitHub: **Settings → Pages → Build and deployment →
   Source**, select **"GitHub Actions"**.
4. Push (or re-push) to `main`. Go to the **Actions** tab in your repo —
   you'll see a "Deploy to GitHub Pages" workflow running. It installs
   dependencies, builds the app, and deploys it automatically. Takes about
   1–2 minutes.
5. Your app will be live at `https://<your-username>.github.io/<your-repo-name>/`.

Every time you (or I) push new changes to `main`, it rebuilds and
redeploys automatically — no manual steps after this first setup.

## Running it locally (optional, for previewing changes yourself)
If you ever want to preview changes on your own computer before pushing:
```
npm install
npm run dev
```
Then open the URL it prints (something like `http://localhost:5173`).

## What's real vs. what's a placeholder

**Fully working, backed by your Supabase project:**
- Sign up / log in / log out
- My Decks — create, edit, delete, play your activities
- Deck Creator — questions, multiple-choice answers, image upload, audio
  upload, category, description
- Activity Player — plays your decks (and the 6 built-in sample decks)
  with images, audio, scoring, and a finish screen

**Visible but intentionally not yet functional (Phase 2/3):**
- Explore, Students, Progress — show a "coming soon" screen instead of
  fake data, so nothing here misleads you into thinking you have students
  or community activity that don't exist yet
- Publishing — the Publish button is disabled with a tooltip
- Card types other than Multiple Choice (Image Choice, Yes/No, Text
  Answer, Listening, Matching) — visible in the Deck Creator's type
  selector as a preview of what's coming, but only Multiple Choice
  actually saves and plays right now

## Known limitation worth knowing about
I built and tested this without being able to run `npm install` or start
a real dev server myself (no internet access in my working environment) —
I unit-tested the entire Supabase data layer against a simulated client,
and server-rendered every page component to catch structural/syntax
errors, but the very first real `npm run dev` or GitHub Actions build is
the first time this code runs against your *actual* live project. If
anything errors, paste it back to me exactly as it appears and I'll fix it.
