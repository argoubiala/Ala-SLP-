import { useEffect, useRef, useState } from "react";
import { Card, Button, Input, Select, Modal, Tag, Badge } from "../components/ui/index";
import { useAuth } from "../lib/auth";
import {
  fetchCategories, fetchAssets, createAsset, updateAssetMeta, deleteAsset, getPublicAssetUrl,
} from "../lib/assets";
import type { Asset, AssetCategory, AssetType, AssetVisibility } from "../lib/types";

function detectAssetType(file: File): AssetType {
  return file.type.startsWith("audio/") ? "audio" : "image";
}
function nameFromFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim() || "Untitled";
}

interface PendingUpload {
  uid: string;
  file: File;
  name: string;
  assetType: AssetType;
  previewUrl: string | null;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function AdminAssetManager() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showArchived, setShowArchived] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkTags, setBulkTags] = useState("");
  const [bulkSource, setBulkSource] = useState("");
  const [bulkLicense, setBulkLicense] = useState("");
  const [bulkAttribution, setBulkAttribution] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editAttribution, setEditAttribution] = useState("");
  const [editVisibility, setEditVisibility] = useState<AssetVisibility>("active");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(e => setError(e.message));
    load();
    return () => objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, showArchived]);

  function load() {
    setError(null);
    fetchAssets({ search, categoryId: categoryFilter, includeArchived: showArchived })
      .then(setAssets)
      .catch(e => setError(e.message || "Couldn't load the asset library"));
  }

  function categoryName(id: string | null) {
    return categories.find(c => c.id === id)?.name || "Uncategorized";
  }

  // ── Upload flow ──

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next: PendingUpload[] = Array.from(files).map(file => {
      const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      if (url) objectUrlsRef.current.push(url);
      return {
        uid: Math.random().toString(36).slice(2),
        file,
        name: nameFromFilename(file.name),
        assetType: detectAssetType(file),
        previewUrl: url,
        status: "pending",
      };
    });
    setPending(p => [...p, ...next]);
  }

  function updatePendingName(uid: string, name: string) {
    setPending(p => p.map(x => (x.uid === uid ? { ...x, name } : x)));
  }
  function removePending(uid: string) {
    setPending(p => p.filter(x => x.uid !== uid));
  }

  async function handleUploadAll() {
    if (!user || pending.length === 0) return;
    setUploading(true);
    const tags = bulkTags.split(",").map(t => t.trim()).filter(Boolean);
    for (const item of pending) {
      if (item.status === "done") continue;
      setPending(p => p.map(x => (x.uid === item.uid ? { ...x, status: "uploading" } : x)));
      try {
        await createAsset(user.id, item.file, {
          name: item.name.trim() || nameFromFilename(item.file.name),
          categoryId: bulkCategory || null,
          tags,
          assetType: item.assetType,
          source: bulkSource,
          license: bulkLicense,
          attribution: bulkAttribution,
        });
        setPending(p => p.map(x => (x.uid === item.uid ? { ...x, status: "done" } : x)));
      } catch (e: any) {
        setPending(p => p.map(x => (x.uid === item.uid ? { ...x, status: "error", error: e.message || "Upload failed" } : x)));
      }
    }
    setUploading(false);
    load();
  }

  function closeUploadModal() {
    setUploadOpen(false);
    setPending([]);
    setBulkCategory(""); setBulkTags(""); setBulkSource(""); setBulkLicense(""); setBulkAttribution("");
  }

  // ── Edit flow ──

  function openEdit(asset: Asset) {
    setEditingAsset(asset);
    setEditName(asset.name);
    setEditCategory(asset.category_id || "");
    setEditTags(asset.tags.join(", "));
    setEditSource(asset.source || "");
    setEditLicense(asset.license || "");
    setEditAttribution(asset.attribution || "");
    setEditVisibility(asset.visibility);
  }

  async function handleSaveEdit() {
    if (!editingAsset) return;
    setSavingEdit(true);
    try {
      await updateAssetMeta(editingAsset.id, {
        name: editName.trim(),
        categoryId: editCategory || null,
        tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
        source: editSource,
        license: editLicense,
        attribution: editAttribution,
        visibility: editVisibility,
      });
      setEditingAsset(null);
      load();
    } catch (e: any) {
      alert("Couldn't save: " + (e.message || e));
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(asset: Asset) {
    if (!confirm(`Delete "${asset.name}" from the shared library? Any activities already using it will show a broken image.`)) return;
    try {
      await deleteAsset(asset);
      setAssets(a => (a || []).filter(x => x.id !== asset.id));
    } catch (e: any) {
      alert("Couldn't delete: " + (e.message || e));
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1C1B29]">Asset Library</h1>
          <p className="text-[#6B6B80] text-sm mt-1">{assets === null ? "Loading…" : `${assets.length} assets`} · Admin management</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} icon={<span>+</span>}>Upload Assets</Button>
      </div>

      {error && <div className="mb-5 text-sm font-medium text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{error}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-48">
          <Input placeholder="Search by name or tag…" value={search} onChange={e => setSearch(e.target.value)} icon={<span className="text-sm">🔍</span>} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tag active={categoryFilter === "All"} onClick={() => setCategoryFilter("All")}>All</Tag>
          {categories.map(c => (
            <Tag key={c.id} active={categoryFilter === c.id} onClick={() => setCategoryFilter(c.id)}>{c.name}</Tag>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-[#6B6B80] cursor-pointer">
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      {assets === null ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-3 border-[#EAE4FF] border-t-[#7C5CFC] rounded-full animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-5xl mb-4">🗂️</p>
          <h3 className="font-bold text-[#1C1B29] text-lg mb-2">No assets yet</h3>
          <p className="text-[#6B6B80] text-sm mb-6">Upload the first images or audio clips for the shared library.</p>
          <Button onClick={() => setUploadOpen(true)}>+ Upload Assets</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {assets.map(asset => {
            const url = getPublicAssetUrl(asset.file_path);
            return (
              <Card key={asset.id} padding="none" className="overflow-hidden">
                <div className="h-28 bg-[#F7F6F3] flex items-center justify-center relative">
                  {asset.asset_type === "image" && url ? (
                    <img src={url} alt={asset.name} className="max-h-full max-w-full object-contain" />
                  ) : asset.asset_type === "audio" && url ? (
                    <audio controls src={url} className="w-full px-2" />
                  ) : (
                    <span className="text-3xl">🗂️</span>
                  )}
                  {asset.visibility === "archived" && (
                    <span className="absolute top-1.5 right-1.5"><Badge color="neutral">Archived</Badge></span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-[#1C1B29] truncate">{asset.name}</p>
                  <p className="text-xs text-[#9898A8] truncate mb-2">{categoryName(asset.category_id)}</p>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" fullWidth onClick={() => openEdit(asset)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(asset)}>🗑</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload modal */}
      <Modal open={uploadOpen} onClose={closeUploadModal} title="Upload Assets" size="lg">
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*"
            multiple
            className="hidden"
            onChange={e => { handleFilesSelected(e.target.files); e.target.value = ""; }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#D5C9FF] rounded-xl p-6 text-center hover:bg-[#F3F0FF] transition-colors"
          >
            <p className="text-2xl mb-1">📁</p>
            <p className="text-sm font-medium text-[#6B6B80]">Click to choose one or more images/audio files</p>
            <p className="text-xs text-[#9898A8]">Up to 5MB each</p>
          </button>

          {pending.length > 0 && (
            <>
              <div className="border-t border-[#F0EFF9] pt-4">
                <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">Apply to all selected files</p>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Category"
                    value={bulkCategory}
                    onChange={e => setBulkCategory(e.target.value)}
                    options={[{ value: "", label: "Uncategorized" }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                  />
                  <Input label="Tags (comma separated)" placeholder="dog, animal, pet" value={bulkTags} onChange={e => setBulkTags(e.target.value)} />
                  <Input label="Source" placeholder="e.g. OpenMoji" value={bulkSource} onChange={e => setBulkSource(e.target.value)} />
                  <Input label="License" placeholder="e.g. CC BY-SA 4.0" value={bulkLicense} onChange={e => setBulkLicense(e.target.value)} />
                </div>
                <Input label="Attribution" placeholder="e.g. OpenMoji" value={bulkAttribution} onChange={e => setBulkAttribution(e.target.value)} className="mt-3" />
              </div>

              <div className="border-t border-[#F0EFF9] pt-4">
                <p className="text-xs font-semibold text-[#9898A8] uppercase tracking-wider mb-2">{pending.length} file(s) selected</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pending.map(item => (
                    <div key={item.uid} className="flex items-center gap-3 p-2 rounded-xl bg-[#F7F6F3]">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
                        {item.previewUrl ? <img src={item.previewUrl} alt="" className="w-full h-full object-cover" /> : <span>{item.assetType === "audio" ? "🔊" : "🖼️"}</span>}
                      </div>
                      <input
                        value={item.name}
                        onChange={e => updatePendingName(item.uid, e.target.value)}
                        className="flex-1 min-w-0 text-sm bg-transparent outline-none border-b border-transparent focus:border-[#7C5CFC]"
                        disabled={item.status === "uploading" || item.status === "done"}
                      />
                      {item.status === "pending" && <button onClick={() => removePending(item.uid)} className="text-[#C0BFD0] hover:text-red-400 text-xs shrink-0">✕</button>}
                      {item.status === "uploading" && <span className="text-xs text-[#7C5CFC] shrink-0">Uploading…</span>}
                      {item.status === "done" && <span className="text-xs text-[#22C55E] shrink-0">✓ Done</span>}
                      {item.status === "error" && <span className="text-xs text-[#EF4444] shrink-0" title={item.error}>Failed</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeUploadModal}>{pending.some(p => p.status === "done") ? "Done" : "Cancel"}</Button>
            <Button onClick={handleUploadAll} loading={uploading} disabled={pending.length === 0 || pending.every(p => p.status === "done")}>
              Upload {pending.filter(p => p.status === "pending").length || ""}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editingAsset} onClose={() => setEditingAsset(null)} title="Edit Asset" size="md">
        <div className="space-y-4">
          <Input label="Name" value={editName} onChange={e => setEditName(e.target.value)} />
          <Select
            label="Category"
            value={editCategory}
            onChange={e => setEditCategory(e.target.value)}
            options={[{ value: "", label: "Uncategorized" }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
          />
          <Input label="Tags (comma separated)" value={editTags} onChange={e => setEditTags(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Source" value={editSource} onChange={e => setEditSource(e.target.value)} />
            <Input label="License" value={editLicense} onChange={e => setEditLicense(e.target.value)} />
          </div>
          <Input label="Attribution" value={editAttribution} onChange={e => setEditAttribution(e.target.value)} />
          <Select
            label="Status"
            value={editVisibility}
            onChange={e => setEditVisibility(e.target.value as AssetVisibility)}
            options={[{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditingAsset(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} loading={savingEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
