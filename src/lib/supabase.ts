import { createClient } from "@supabase/supabase-js";

// Ala SLP Activities — Supabase project connection.
//
// The anon/public key below is designed to be used in client-side code —
// it is NOT the secret/service_role key, and it's fine for it to live here
// and be committed to a public repo. Your database's Row Level Security
// policies are what actually keep each user's data private.
//
// To point this app at a different Supabase project, replace these two
// values with the new project's values from Settings → Data API (URL) and
// Settings → API Keys (anon/publishable key).
const SUPABASE_URL = "https://wqxxsfrnmcazdsxkuhmm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LEh3ec_tRx-swKm2Yh_f-g_i8PkS3SU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const MEDIA_BUCKET = "media";
