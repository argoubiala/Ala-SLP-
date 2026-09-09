import { supabase } from "./supabase";
import { fetchProfile } from "./community";
import { getSignedMediaUrl } from "./decks";
import type { Asset, AssetCategory, AssetType, AssetVisibility } from "./types";

const LIBRARY_BUCKET = "asset-library";
const MY_MEDIA_BUCKET = "media";
const MAX_ASSET_BYTES = 5 * 1024 * 1024; // 5MB — keep the shared library lean

// ───────────────────────── Admin check ─────────────────────────

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const profile = await fetchProfile(userId);
  return !!profile?.is_admin;
}

// ───────────────────────── Categories ─────────────────────────

export async function fetchCategories(): Promise<AssetCategory[]> {
  const { data, error } = await supabase.from("asset_categories").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as AssetCategory[];
}

// Matches a dropped folder's name (e.g. "animals", "Body Parts", "body-parts")
// against an existing category's name or slug, case- and separator-insensitive.
// Returns null rather than guessing when nothing matches — the admin can
// always set it manually, per the brief's "remain editable" requirement.
export function matchCategoryByFolderName(folderName: string, categories: AssetCategory[]): AssetCategory | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[-_\s]+/g, " ").trim();
  const target = normalize(folderName);
  return categories.find(c => normalize(c.name) === target || normalize(c.slug) === target) || null;
}

// ───────────────────────── Content hashing (duplicate detection) ─────────────────────────

// SHA-256 of the actual file bytes — catches the same file uploaded under a
// different name. Uses the browser's/Node's built-in Web Crypto API, so no
// extra library or external service is needed.
export async function computeFileHash(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function findAssetByHash(hash: string): Promise<Asset | null> {
  const { data, error } = await supabase.from("assets").select("*").eq("content_hash", hash).single();
  if (error || !data) return null;
  return data as Asset;
}

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "23505" || /duplicate key value|unique constraint/i.test(error.message || "");
}

// ───────────────────────── Assets ─────────────────────────

export interface AssetFilters {
  search?: string;
  categoryId?: string; // "All" or a category id
  includeArchived?: boolean;
  assetType?: AssetType; // only load what's actually needed for the current picker
}

// Platform library only — a therapist's own "My Media" never mixes in here,
// even though RLS would technically let them see both if we didn't filter.
export async function fetchAssets(filters: AssetFilters = {}): Promise<Asset[]> {
  let query = supabase.from("assets").select("*").is("owner_id", null).order("created_at", { ascending: false });
  if (filters.categoryId && filters.categoryId !== "All") {
    query = query.eq("category_id", filters.categoryId);
  }
  if (!filters.includeArchived) {
    query = query.eq("visibility", "active");
  }
  if (filters.assetType) {
    query = query.eq("asset_type", filters.assetType);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let rows = (data || []) as Asset[];
  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter(a => a.name.toLowerCase().includes(s) || a.tags.some(t => t.toLowerCase().includes(s)));
  }
  return rows;
}

// A therapist's own personal uploads — private to them, stored in the
// existing private 'media' bucket rather than the public library one.
export async function fetchMyMedia(userId: string, filters: AssetFilters = {}): Promise<Asset[]> {
  let query = supabase.from("assets").select("*").eq("owner_id", userId).order("created_at", { ascending: false });
  if (filters.categoryId && filters.categoryId !== "All") {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.assetType) {
    query = query.eq("asset_type", filters.assetType);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let rows = (data || []) as Asset[];
  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter(a => a.name.toLowerCase().includes(s) || a.tags.some(t => t.toLowerCase().includes(s)));
  }
  return rows;
}

// Resolves the actual URL to display/play an asset, regardless of which
// bucket it lives in. Library assets are public (instant, no network call).
// My Media assets are private, so this needs a signed URL (async).
export async function getAssetUrl(asset: Pick<Asset, "bucket" | "file_path">): Promise<string | null> {
  if (asset.bucket === "media") {
    return getSignedMediaUrl(asset.file_path);
  }
  return getPublicAssetUrl(asset.file_path);
}

export interface AssetMetaInput {
  name: string;
  categoryId: string | null;
  tags: string[];
  assetType: AssetType;
  source: string;
  license: string;
  attribution: string;
}

function assetPathFor(userId: string | null, filename: string): string {
  const ext = (filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const rand = Math.random().toString(36).slice(2, 9);
  const base = `${Date.now()}_${rand}.${ext}`;
  // My Media files use the same {user_id}/... folder convention your
  // private media bucket already relies on for its security.
  return userId ? `${userId}/${base}` : base;
}

async function uploadToBucket(bucket: string, userId: string | null, file: File): Promise<string> {
  if (file.size > MAX_ASSET_BYTES) {
    throw new Error("File is too large — please keep asset files under 5MB.");
  }
  const path = assetPathFor(userId, file.name || "upload");
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return path;
}

// Kept for any existing callers expecting the old platform-only helper name.
export async function uploadAssetFile(file: File): Promise<string> {
  return uploadToBucket(LIBRARY_BUCKET, null, file);
}

export function getPublicAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(LIBRARY_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export type CreateAssetResult =
  | { status: "created"; asset: Asset }
  | { status: "duplicate"; existing: Asset };

interface InternalCreateInput {
  bucket: "asset-library" | "media";
  ownerId: string | null; // null = platform asset
  createdBy: string;
  file: File;
  meta: AssetMetaInput;
  precomputedHash?: string;
}

// Shared by both the admin "add to library" flow and the therapist
// "My Media" flow — same duplicate-detection, same race handling, same
// orphaned-file cleanup, just pointed at a different bucket/owner.
async function createAssetInternal(input: InternalCreateInput): Promise<CreateAssetResult> {
  const hash = input.precomputedHash || (await computeFileHash(input.file));

  const existing = await findAssetByHash(hash);
  if (existing) {
    return { status: "duplicate", existing };
  }

  const path = await uploadToBucket(input.bucket, input.ownerId, input.file);
  const { data, error } = await supabase
    .from("assets")
    .insert({
      name: input.meta.name,
      category_id: input.meta.categoryId,
      tags: input.meta.tags,
      asset_type: input.meta.assetType,
      file_path: path,
      content_hash: hash,
      source: input.meta.source || null,
      license: input.meta.license || null,
      attribution: input.meta.attribution || null,
      created_by: input.createdBy,
      owner_id: input.ownerId,
      bucket: input.bucket,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(input.bucket).remove([path]);
    if (isUniqueViolation(error)) {
      const raceExisting = await findAssetByHash(hash);
      if (raceExisting) return { status: "duplicate", existing: raceExisting };
    }
    throw new Error(error.message);
  }
  return { status: "created", asset: data as Asset };
}

// Admin-only: adds to the shared platform library.
export async function createAsset(
  userId: string,
  file: File,
  meta: AssetMetaInput,
  precomputedHash?: string
): Promise<CreateAssetResult> {
  return createAssetInternal({ bucket: LIBRARY_BUCKET, ownerId: null, createdBy: userId, file, meta, precomputedHash });
}

// Any signed-in therapist: adds to their own private "My Media".
export async function createMyMediaAsset(
  userId: string,
  file: File,
  meta: AssetMetaInput,
  precomputedHash?: string
): Promise<CreateAssetResult> {
  return createAssetInternal({ bucket: MY_MEDIA_BUCKET, ownerId: userId, createdBy: userId, file, meta, precomputedHash });
}

export interface AssetUpdateInput {
  name: string;
  categoryId: string | null;
  tags: string[];
  source: string;
  license: string;
  attribution: string;
  visibility: AssetVisibility;
}

export async function updateAssetMeta(id: string, input: AssetUpdateInput): Promise<void> {
  const { error } = await supabase
    .from("assets")
    .update({
      name: input.name,
      category_id: input.categoryId,
      tags: input.tags,
      source: input.source || null,
      license: input.license || null,
      attribution: input.attribution || null,
      visibility: input.visibility,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteAsset(asset: Asset): Promise<void> {
  const { error } = await supabase.from("assets").delete().eq("id", asset.id);
  if (error) throw new Error(error.message);
  await supabase.storage.from(asset.bucket).remove([asset.file_path]);
}
