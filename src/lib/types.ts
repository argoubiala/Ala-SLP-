// Types matching the real `decks` table + card shape stored in its `cards`
// jsonb column. Kept intentionally close to what the Deck Creator can
// actually produce and the Activity Player can actually play — this is a
// smaller set of fields than the full community-platform design brief
// (no ratings/favorites/publishing yet — that's a later phase).

export type CategoryKey =
  | "articulation"
  | "phonology"
  | "language"
  | "literacy"
  | "cognitive"
  | "aac";

export interface CategoryInfo {
  emoji: string;
  name: string;
  desc: string;
  color: string;
}

export interface DeckCard {
  question: string;
  answers: string[];
  correct: number;
  imagePath?: string | null; // path in Supabase Storage 'media' bucket
  soundPath?: string | null; // path in Supabase Storage 'media' bucket
}

export type Visibility = "private" | "unlisted" | "public";

// A deck the user owns, stored in Supabase.
export interface CustomDeck {
  id: string;
  user_id: string;
  category: CategoryKey;
  title: string;
  description: string;
  cards: DeckCard[];
  created_at: string;
  updated_at?: string;
  visibility: Visibility;
  allow_copy: boolean;
  age_range: string | null;
  language: string;
  tags: string[];
  use_count: number;
}

export interface Profile {
  id: string;
  display_name: string | null;
  bio: string | null;
  profession: string | null;
  avatar_emoji: string;
  created_at?: string;
  updated_at?: string;
}

// A row from the `explore_decks` view — a public deck with creator info and
// aggregated rating/favorite counts pre-joined.
export interface ExploreDeck {
  id: string;
  user_id: string;
  category: CategoryKey;
  title: string;
  description: string;
  cards: DeckCard[];
  visibility: Visibility;
  allow_copy: boolean;
  age_range: string | null;
  language: string;
  tags: string[];
  use_count: number;
  created_at: string;
  creator_name: string | null;
  creator_avatar: string | null;
  avg_rating: number;
  rating_count: number;
  favorite_count: number;
}

export type SortOption = "popular" | "recent" | "rating" | "most_used";

// ───────────────────────── Phase 3: Students & Progress ─────────────────────────

export interface Student {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  grade: string | null;
  notes: string;
  created_at: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  student_id: string;
  user_id: string;
  text: string;
  target: number;
  current: number;
  unit: string;
  category: string | null;
  achieved: boolean;
  created_at: string;
}

export interface PracticeSession {
  id: string;
  student_id: string;
  user_id: string;
  deck_id: string | null;
  deck_title: string;
  score: number;
  total: number;
  accuracy: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  student_id: string;
  user_id: string;
  deck_id: string | null;
  deck_title: string;
  completed: boolean;
  assigned_at: string;
}

// ───────────────────────── Phase A/B: Asset Library ─────────────────────────

export interface AssetCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export type AssetType = "image" | "audio";
export type AssetVisibility = "active" | "archived";

export interface Asset {
  id: string;
  name: string;
  category_id: string | null;
  tags: string[];
  asset_type: AssetType;
  file_path: string;
  thumbnail_path: string | null;
  source: string | null;
  license: string | null;
  attribution: string | null;
  visibility: AssetVisibility;
  created_by: string | null;
  created_at: string;
  updated_at?: string;
}

// A built-in sample deck, hard-coded client-side (no login needed to view).
export interface BuiltinDeck {
  id: string; // e.g. "builtin:articulation:0"
  category: CategoryKey;
  title: string;
  description: string;
  cards: DeckCard[];
  builtin: true;
}

export type AnyDeck = (CustomDeck & { builtin?: false }) | BuiltinDeck;

export function isBuiltin(deck: AnyDeck): deck is BuiltinDeck {
  return "builtin" in deck && deck.builtin === true;
}
