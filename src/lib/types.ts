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
