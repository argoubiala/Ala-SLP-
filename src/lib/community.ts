import { supabase, MEDIA_BUCKET } from "./supabase";
import { uploadMediaFile } from "./decks";
import type { CustomDeck, DeckCard, ExploreDeck, Profile, SortOption, Visibility } from "./types";

// ───────────────────────── Profiles ─────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  return data as Profile;
}

export interface ProfileInput {
  display_name: string;
  bio: string;
  profession: string;
  avatar_emoji: string;
}

export async function upsertProfile(userId: string, input: ProfileInput): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...input }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

// ───────────────────────── Publishing ─────────────────────────

export interface PublishInput {
  visibility: Visibility;
  allow_copy: boolean;
  age_range: string;
  language: string;
  tags: string[];
}

export async function updateDeckPublishing(deckId: string, input: PublishInput): Promise<void> {
  const { error } = await supabase
    .from("decks")
    .update({
      visibility: input.visibility,
      allow_copy: input.allow_copy,
      age_range: input.age_range || null,
      language: input.language || "English",
      tags: input.tags,
    })
    .eq("id", deckId);
  if (error) throw new Error(error.message);
}

// ───────────────────────── Explore feed ─────────────────────────

export interface ExploreFilters {
  search?: string;
  category?: string; // "All" or a CategoryKey
  ageRange?: string; // "All" or exact match
  language?: string; // "All" or exact match
  tag?: string; // "All" or exact match
  sort?: SortOption;
}

export async function fetchExploreDecks(filters: ExploreFilters): Promise<ExploreDeck[]> {
  let query = supabase.from("explore_decks").select("*");

  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }
  if (filters.ageRange && filters.ageRange !== "All") {
    query = query.eq("age_range", filters.ageRange);
  }
  if (filters.language && filters.language !== "All") {
    query = query.eq("language", filters.language);
  }
  if (filters.tag && filters.tag !== "All") {
    query = query.contains("tags", [filters.tag]);
  }

  switch (filters.sort) {
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    case "most_used":
      query = query.order("use_count", { ascending: false });
      break;
    case "recent":
      query = query.order("created_at", { ascending: false });
      break;
    case "popular":
    default:
      query = query.order("favorite_count", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let rows = (data || []) as ExploreDeck[];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter(
      d =>
        d.title.toLowerCase().includes(s) ||
        d.description.toLowerCase().includes(s) ||
        d.tags.some(t => t.toLowerCase().includes(s))
    );
  }

  return rows;
}

export async function fetchCreatorPublicDecks(userId: string, excludeDeckId?: string): Promise<ExploreDeck[]> {
  let query = supabase.from("explore_decks").select("*").eq("user_id", userId);
  if (excludeDeckId) query = query.neq("id", excludeDeckId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as ExploreDeck[];
}

// ───────────────────────── Deck detail (works for public, unlisted, or own) ─────────────────────────

export interface DeckDetail {
  deck: CustomDeck;
  creator: Profile | null;
  avgRating: number;
  ratingCount: number;
  favoriteCount: number;
}

export async function fetchDeckDetail(id: string): Promise<DeckDetail | null> {
  // Fast path: public decks are pre-aggregated in the explore_decks view.
  const { data: viewRow } = await supabase.from("explore_decks").select("*").eq("id", id).single();
  if (viewRow) {
    const row = viewRow as ExploreDeck;
    return {
      deck: { ...row, updated_at: undefined } as unknown as CustomDeck,
      creator: row.creator_name
        ? ({ id: row.user_id, display_name: row.creator_name, avatar_emoji: row.creator_avatar || "🧑‍⚕️", bio: null, profession: null } as Profile)
        : null,
      avgRating: Number(row.avg_rating) || 0,
      ratingCount: row.rating_count,
      favoriteCount: row.favorite_count,
    };
  }

  // Fallback: unlisted (or the caller's own) deck, not in the public view.
  const { data: deck, error } = await supabase.from("decks").select("*").eq("id", id).single();
  if (error || !deck) return null;

  const [{ data: ratings }, { data: favorites }, creator] = await Promise.all([
    supabase.from("deck_ratings").select("rating").eq("deck_id", id),
    supabase.from("deck_favorites").select("id").eq("deck_id", id),
    fetchProfile(deck.user_id),
  ]);
  const ratingList = ratings || [];
  const avgRating = ratingList.length ? ratingList.reduce((s: number, r: any) => s + r.rating, 0) / ratingList.length : 0;

  return {
    deck: deck as CustomDeck,
    creator,
    avgRating,
    ratingCount: ratingList.length,
    favoriteCount: (favorites || []).length,
  };
}

// ───────────────────────── Ratings & favorites ─────────────────────────

export async function fetchMyInteraction(deckId: string, userId: string): Promise<{ myRating: number | null; isFavorited: boolean }> {
  const [{ data: rating }, { data: fav }] = await Promise.all([
    supabase.from("deck_ratings").select("rating").eq("deck_id", deckId).eq("user_id", userId).single(),
    supabase.from("deck_favorites").select("id").eq("deck_id", deckId).eq("user_id", userId).single(),
  ]);
  return { myRating: rating ? rating.rating : null, isFavorited: !!fav };
}

export async function rateDeck(deckId: string, userId: string, rating: number): Promise<void> {
  const { error } = await supabase.from("deck_ratings").upsert({ deck_id: deckId, user_id: userId, rating }, { onConflict: "deck_id,user_id" });
  if (error) throw new Error(error.message);
}

export async function setFavorite(deckId: string, userId: string, favorited: boolean): Promise<void> {
  if (favorited) {
    const { error } = await supabase.from("deck_favorites").insert({ deck_id: deckId, user_id: userId });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("deck_favorites").delete().eq("deck_id", deckId).eq("user_id", userId);
    if (error) throw new Error(error.message);
  }
}

// ───────────────────────── "Use This Deck" (copy into my library) ─────────────────────────

export async function useThisDeck(source: CustomDeck | ExploreDeck, newOwnerId: string): Promise<string> {
  const cards: DeckCard[] = [];
  for (const c of source.cards) {
    let imagePath: string | null | undefined = null;
    let soundPath: string | null | undefined = null;

    if (c.imagePath) imagePath = await duplicateMedia(c.imagePath, newOwnerId);
    if (c.soundPath) soundPath = await duplicateMedia(c.soundPath, newOwnerId);

    cards.push({ question: c.question, answers: c.answers, correct: c.correct, imagePath, soundPath });
  }

  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: newOwnerId,
      category: source.category,
      title: source.title,
      description: source.description,
      cards,
      visibility: "private",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await supabase.rpc("increment_deck_use_count", { deck_id_input: source.id });

  return data.id as string;
}

async function duplicateMedia(originalPath: string, newOwnerId: string): Promise<string | null> {
  const { data: blob, error } = await supabase.storage.from(MEDIA_BUCKET).download(originalPath);
  if (error || !blob) return null;
  const filename = originalPath.split("/").pop() || "file";
  const file = new File([blob], filename, { type: (blob as Blob).type || undefined });
  return uploadMediaFile(newOwnerId, file);
}
