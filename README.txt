# Ala SLP Activities — Version 4 (Online / Synced)

A Boom Cards-style SLP activity player, now backed by a free Supabase
account so your custom decks sync across every device you sign into.

## ⚠️ What changed from earlier versions
Earlier versions ran entirely offline with no account. **This version
requires an internet connection and a free account**, because that's what
makes syncing across devices possible. If you ever want the old fully
offline, no-account version back, just ask — it's simpler but stays on one
device/browser.

## Run it
Open `index.html` in a browser (or host the four files online — see
below). You'll be asked to sign in or create a free account the first time.

## What's included
- Email/password accounts (via Supabase Auth) — your decks are private to
  your account
- Category browsing, built-in sample decks, one-card-at-a-time gameplay
  with score, progress, and a finish screen (unchanged)
- **Deck Creator** with image & sound upload per card
- **Edit / Delete** your own decks — changes save to your account instantly
- **Export / Import** decks as a `.json` file (still works, images/sounds
  embedded as before) — handy for backups or moving decks between accounts
- **Customizable colors** via the 🎨 Theme button — this one preference
  stays on-device (each browser can have its own look) rather than syncing
- Sync: sign into the same account on your phone, tablet, or another
  computer and your decks are right there

## The four files
- `index.html`
- `style.css`
- `app.js`
- `config.js` — holds your Supabase Project URL and **anon/public** key.
  This key is safe to be in client-side code (that's what it's designed
  for) — it is *not* the same as the secret `service_role` key, which
  should never appear anywhere in this app.

## Hosting it online
These are still plain static files — no build step. Upload all four to any
static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.) and
you'll have a real URL you can open from any device.

## Your Supabase project
- **Database**: a `decks` table stores your custom decks (built-in sample
  decks still live in `app.js` and don't need the database).
- **Storage**: an `media` bucket stores uploaded images and sounds,
  organized into a private folder per account.
- **Row Level Security**: every rule is written so a signed-in user can
  only ever see and edit their *own* decks and media — nobody else's.
- **Free tier limits**: fine for personal or small-clinic use. If you ever
  outgrow it, Supabase's pricing page has the current numbers.

## Troubleshooting
- **"Invalid login credentials"** — double check the email/password, or
  use "Create an account" if you haven't signed up yet.
- **Decks not showing after import/create** — check your internet
  connection; every save now requires reaching Supabase.
- **A table/media error in the Supabase dashboard** — see the setup guide
  from earlier in our conversation, or re-run `supabase-schema.sql`
  (it's safe to run more than once).
