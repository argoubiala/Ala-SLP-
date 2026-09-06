import { supabase } from "./supabase";
import { fetchProfile } from "./community";
import type { Asset, AssetCategory, AssetType, AssetVisibility } from "./types";

const ASSET_BUCKET = "asset-library";
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

// ───────────────────────── Assets ─────────────────────────

export interface AssetFilters {
  search?: string;
  categoryId?: string; // "All" or a category id
  includeArchived?: boolean;
}

export async function fetchAssets(filters: AssetFilters = {}): Promise<Asset[]> {
  let query = supabase.from("assets").select("*").order("created_at", { ascending: false });
  if (filters.categoryId && filters.categoryId !== "All") {
    query = query.eq("category_id", filters.categoryId);
  }
  if (!filters.includeArchived) {
    query = query.eq("visibility", "active");
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

export interface AssetMetaInput {
  name: string;
  categoryId: string | null;
  tags: string[];
  assetType: AssetType;
  source: string;
  license: string;
  attribution: string;
}

function assetPathFor(filename: string): string {
  const ext = (filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const rand = Math.random().toString(36).slice(2, 9);
  return `${Date.now()}_${rand}.${ext}`;
}

export async function uploadAssetFile(file: File): Promise<string> {
  if (file.size > MAX_ASSET_BYTES) {
    throw new Error("File is too large — please keep asset files under 5MB.");
  }
  const path = assetPathFor(file.name || "upload");
  const { error } = await supabase.storage.from(ASSET_BUCKET).upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return path;
}

export function getPublicAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createAsset(userId: string, file: File, meta: AssetMetaInput): Promise<Asset> {
  const path = await uploadAssetFile(file);
  const { data, error } = await supabase
    .from("assets")
    .insert({
      name: meta.name,
      category_id: meta.categoryId,
      tags: meta.tags,
      asset_type: meta.assetType,
      file_path: path,
      source: meta.source || null,
      license: meta.license || null,
      attribution: meta.attribution || null,
      created_by: userId,
    })
    .select()
    .single();
  if (error) {
    // Don't leave an orphaned file in storage if the DB insert failed.
    await supabase.storage.from(ASSET_BUCKET).remove([path]);
    throw new Error(error.message);
  }
  return data as Asset;
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
  await supabase.storage.from(ASSET_BUCKET).remove([asset.file_path]);
}
