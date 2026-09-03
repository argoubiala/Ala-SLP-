import { supabase, MEDIA_BUCKET } from "./supabase";
import type { CustomDeck, DeckCard, CategoryKey } from "./types";

// ───────────────────────── Decks (Postgres) ─────────────────────────

export async function fetchCustomDecks(): Promise<CustomDeck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return (data || []) as CustomDeck[];
}

export async function fetchCustomDeckById(id: string): Promise<CustomDeck | null> {
  const { data, error } = await supabase.from("decks").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as CustomDeck;
}

export interface SaveDeckInput {
  userId: string;
  category: CategoryKey;
  title: string;
  description: string;
  cards: DeckCard[];
}

export async function createDeck(input: SaveDeckInput): Promise<CustomDeck> {
  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: input.userId,
      category: input.category,
      title: input.title,
      description: input.description,
      cards: input.cards,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as CustomDeck;
}

export async function updateDeck(id: string, input: Omit<SaveDeckInput, "userId">): Promise<void> {
  const { error } = await supabase
    .from("decks")
    .update({
      category: input.category,
      title: input.title,
      description: input.description,
      cards: input.cards,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteDeck(id: string): Promise<void> {
  const { error } = await supabase.from("decks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ───────────────────────── Media (Storage) ─────────────────────────

function mediaPathFor(userId: string, filename: string): string {
  const ext = (filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const rand = Math.random().toString(36).slice(2, 9);
  return `${userId}/${Date.now()}_${rand}.${ext}`;
}

export async function uploadMediaFile(userId: string, file: File): Promise<string> {
  const path = mediaPathFor(userId, file.name || "upload");
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function deleteMediaFile(path: string | null | undefined): Promise<void> {
  if (!path) return;
  try {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  } catch (e) {
    console.error(e);
  }
}

export async function getSignedMediaUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 3600);
    if (error) {
      console.error(error);
      return null;
    }
    return data.signedUrl;
  } catch (e) {
    console.error(e);
    return null;
  }
}
